import { IAdminService, AdminStatsData } from './interfaces.ts';
import { supabase } from './supabaseClient.ts';
import { SupportTicket, SystemStatus, ClientOrganization, UserRole } from '../types.ts';

export const SupabaseAdminService: IAdminService = {
    getSystemStatus: async () => {
        const { data, error } = await supabase.from('system_settings').select('*').single();
        if (error || !data) return { mode: 'ONLINE' };
        return {
            mode: data.mode,
            message: data.message,
            scheduledStart: data.scheduled_start,
            scheduledEnd: data.scheduled_end
        };
    },

    updateSystemStatus: async (user, newStatus) => {
        const { data, error } = await supabase.from('system_settings').update({
            mode: newStatus.mode,
            message: newStatus.message,
            scheduled_start: newStatus.scheduledStart,
            scheduled_end: newStatus.scheduledEnd,
            updated_by: user.id,
            updated_at: new Date().toISOString()
        }).eq('id', 1).select().single();
        
        if (error) throw error;
        return {
            mode: data.mode,
            message: data.message,
            scheduledStart: data.scheduled_start,
            scheduledEnd: data.scheduled_end
        } as SystemStatus;
    },

    subscribeToSystemStatus: (listener) => {
        const channel = supabase
            .channel('system_changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_settings' }, payload => {
                const s = payload.new;
                listener({
                    mode: s.mode,
                    message: s.message,
                    scheduledStart: s.scheduled_start,
                    scheduledEnd: s.scheduled_end
                } as SystemStatus);
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    },

    getAdminStats: async (): Promise<AdminStatsData> => {
        const { data, error } = await supabase.from('v_admin_stats').select('*').single();
        if (error || !data) {
            return {
                totalUsers: 0,
                activeUsers: 0,
                activeClients: 0,
                openTickets: 0,
                logsLast24h: 0,
                systemHealthStatus: 'HEALTHY'
            };
        }
        return {
            totalUsers: data.total_users,
            activeUsers: data.active_users,
            activeClients: data.active_clients,
            openTickets: data.open_tickets,
            logsLast24h: data.logs_last_24h,
            systemHealthStatus: data.system_health_status
        };
    },

    getClients: async () => {
        const { data, error } = await supabase.from('organizations').select('*').order('name');
        if (error) throw error;
        return (data || []).map(c => ({
            id: c.id,
            name: c.name,
            cnpj: c.cnpj,
            status: c.status as any,
            contractDate: c.contract_date
        }));
    },

    saveClient: async (user, data) => {
        const payload = {
            name: data.name,
            cnpj: data.cnpj,
            status: data.status,
            contract_date: data.contractDate
        };

        let query;
        if (data.id) {
            query = supabase.from('organizations').update(payload).eq('id', data.id);
        } else {
            query = supabase.from('organizations').insert(payload);
        }

        const { data: client, error } = await query.select().single();
        if (error) throw error;
        
        return {
            id: client.id,
            name: client.name,
            cnpj: client.cnpj,
            status: client.status as any,
            contractDate: client.contract_date
        };
    },

    deleteClient: async (user, id) => {
        const { error } = await supabase.from('organizations').delete().eq('id', id);
        if (error) throw error;
    },

    getTickets: async () => {
        const { data, error } = await supabase
            .from('tickets')
            .select(`
                *,
                profiles:user_id (full_name)
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;

        return (data || []).map(t => ({
            id: t.id,
            flow: t.flow,
            userId: t.user_id,
            userName: t.profiles?.full_name || 'Usuário Desconhecido',
            clientId: t.organization_id,
            subject: t.subject,
            description: t.description,
            priority: t.priority,
            status: t.status,
            resolutionNote: t.resolution_note,
            createdAt: new Date(t.created_at).toLocaleString(),
            updatedAt: t.updated_at ? new Date(t.updated_at).toLocaleString() : undefined
        })) as any;
    },

    getMyTickets: async (user) => {
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return (data || []).map(t => ({ 
            ...t, 
            userName: user.name,
            createdAt: new Date(t.created_at).toLocaleString() 
        })) as any;
    },

    getUserTickets: async (userId) => {
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return (data || []).map(t => ({ 
            ...t, 
            createdAt: new Date(t.created_at).toLocaleString() 
        })) as any;
    },

    getQualityInbox: async () => {
        const { data, error } = await supabase
            .from('tickets')
            .select(`
                *,
                profiles:user_id (full_name)
            `)
            .eq('flow', 'CLIENT_TO_QUALITY')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return (data || []).map(t => ({ 
            ...t, 
            userName: t.profiles?.full_name,
            createdAt: new Date(t.created_at).toLocaleString() 
        })) as any;
    },

    getAdminInbox: async () => {
        const { data, error } = await supabase
            .from('tickets')
            .select(`
                *,
                profiles:user_id (full_name)
            `)
            .eq('flow', 'QUALITY_TO_ADMIN')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return (data || []).map(t => ({ 
            ...t, 
            userName: t.profiles?.full_name,
            createdAt: new Date(t.created_at).toLocaleString() 
        })) as any;
    },

    createTicket: async (user, data) => {
        const flow = user.role === UserRole.QUALITY ? 'QUALITY_TO_ADMIN' : 'CLIENT_TO_QUALITY';
        const { data: ticket, error } = await supabase.from('tickets').insert({
            user_id: user.id,
            organization_id: user.clientId,
            subject: data.subject,
            description: data.description,
            priority: data.priority,
            status: 'OPEN',
            flow
        }).select().single();
        
        if (error) throw error;
        return {
            ...ticket,
            userName: user.name,
            createdAt: new Date(ticket.created_at).toLocaleString()
        } as any;
    },

    resolveTicket: async (user, id, status, note) => {
        const { error } = await supabase
            .from('tickets')
            .update({ 
                status, 
                resolution_note: note, 
                updated_at: new Date().toISOString() 
            })
            .eq('id', id);
        if (error) throw error;
    },

    updateTicketStatus: async (user, id, status) => {
        const { error } = await supabase
            .from('tickets')
            .update({ 
                status, 
                updated_at: new Date().toISOString() 
            })
            .eq('id', id);
        if (error) throw error;
    },

    getFirewallRules: async () => {
        // Mocked or separate table if needed
        return [];
    },

    getPorts: async () => {
        // Mocked or separate table if needed
        return [];
    },

    getMaintenanceEvents: async () => {
        // Mocked or separate table if needed
        return [];
    },

    scheduleMaintenance: async (user, event) => {
        // Mock implementation
        return { ...event, id: `m-${Date.now()}` } as any;
    },

    cancelMaintenance: async (user, id) => {
        // Mock implementation
    },

    requestInfrastructureSupport: async (user, data) => {
        // Simulates an external API call to a support system
        return `REQ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
};