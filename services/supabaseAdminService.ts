
import { IAdminService, AdminStatsData } from './interfaces.ts';
import { supabase } from './supabaseClient.ts';
import { SupportTicket, SystemStatus, ClientOrganization, UserRole } from '../types.ts';

const handleSupabaseError = (error: any, customMessage: string) => {
    if (error.code === '42501') {
        throw new Error(`Erro de Permissão: Você não tem autorização para realizar esta operação. Verifique as políticas de RLS no Supabase.`);
    }
    throw new Error(error.message || customMessage);
};

export const SupabaseAdminService: IAdminService = {
    getSystemStatus: async () => {
        try {
            const { data, error } = await supabase.from('system_settings').select('*').single();
            if (error || !data) return { mode: 'ONLINE' };
            return {
                mode: data.mode,
                message: data.message,
                scheduledStart: data.scheduled_start,
                scheduledEnd: data.scheduled_end
            };
        } catch (e) {
            return { mode: 'ONLINE' };
        }
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
        
        if (error) handleSupabaseError(error, "Erro ao atualizar status do sistema");
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
        // Tenta buscar de uma view de estatísticas ou calcula manualmente
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: activeClients } = await supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE');
        const { count: openTickets } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).neq('status', 'RESOLVED');
        
        return {
            totalUsers: usersCount || 0,
            activeUsers: usersCount || 0,
            activeClients: activeClients || 0,
            openTickets: openTickets || 0,
            logsLast24h: 0,
            systemHealthStatus: 'HEALTHY'
        };
    },

    getClients: async () => {
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .order('name');
        
        if (error) {
            console.error("Erro ao buscar empresas:", error);
            return [];
        }

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

        let result;
        if (data.id) {
            const { data: updated, error } = await supabase.from('organizations').update(payload).eq('id', data.id).select().single();
            if (error) handleSupabaseError(error, "Erro ao atualizar organização");
            result = updated;
        } else {
            const { data: inserted, error } = await supabase.from('organizations').insert(payload).select().single();
            if (error) handleSupabaseError(error, "Erro ao criar organização");
            result = inserted;
        }

        return {
            id: result.id,
            name: result.name,
            cnpj: result.cnpj,
            status: result.status as any,
            contractDate: result.contract_date
        };
    },

    deleteClient: async (user, id) => {
        const { error } = await supabase.from('organizations').delete().eq('id', id);
        if (error) handleSupabaseError(error, "Erro ao excluir organização");
    },

    getTickets: async () => {
        const { data, error } = await supabase
            .from('tickets')
            .select(`*, profiles(full_name)`)
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
            createdAt: new Date(t.created_at).toLocaleString()
        }));
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
        }));
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
        }));
    },

    getQualityInbox: async () => {
        const { data, error } = await supabase
            .from('tickets')
            .select(`*, profiles(full_name)`)
            .eq('flow', 'CLIENT_TO_QUALITY')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return (data || []).map(t => ({ 
            ...t, 
            userName: t.profiles?.full_name,
            createdAt: new Date(t.created_at).toLocaleString() 
        }));
    },

    getAdminInbox: async () => {
        const { data, error } = await supabase
            .from('tickets')
            .select(`*, profiles(full_name)`)
            .eq('flow', 'QUALITY_TO_ADMIN')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return (data || []).map(t => ({ 
            ...t, 
            userName: t.profiles?.full_name,
            createdAt: new Date(t.created_at).toLocaleString() 
        }));
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
        
        if (error) handleSupabaseError(error, "Erro ao criar chamado");
        return {
            ...ticket,
            userName: user.name,
            createdAt: new Date(ticket.created_at).toLocaleString()
        };
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
        if (error) handleSupabaseError(error, "Erro ao resolver chamado");
    },

    updateTicketStatus: async (user, id, status) => {
        const { error } = await supabase
            .from('tickets')
            .update({ 
                status, 
                updated_at: new Date().toISOString() 
            })
            .eq('id', id);
        if (error) handleSupabaseError(error, "Erro ao atualizar chamado");
    },

    getFirewallRules: async () => [],
    getPorts: async () => [],
    getMaintenanceEvents: async () => [],
    scheduleMaintenance: async (user, event) => ({ ...event, id: `m-${Date.now()}` } as any),
    cancelMaintenance: async (user, id) => {},
    requestInfrastructureSupport: async (user, data) => `REQ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
};
