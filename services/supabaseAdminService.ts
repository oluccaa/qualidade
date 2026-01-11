
import { IAdminService } from './interfaces.ts';
import { supabase } from './supabaseClient.ts';
import { SupportTicket, SystemStatus, ClientOrganization, NetworkPort, FirewallRule, MaintenanceEvent, UserRole } from '../types.ts';

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
        return data as any;
    },

    subscribeToSystemStatus: (listener) => {
        const channel = supabase
            .channel('system_changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_settings' }, payload => {
                listener(payload.new as any);
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    },

    getClients: async () => {
        const { data } = await supabase.from('organizations').select('*').order('name');
        return (data || []).map(c => ({
            id: c.id,
            name: c.name,
            cnpj: c.cnpj,
            status: c.status as any,
            contractDate: c.contract_date
        }));
    },

    saveClient: async (user, data) => {
        const { data: client, error } = await supabase.from('organizations').upsert({
            id: data.id,
            name: data.name,
            cnpj: data.cnpj,
            status: data.status,
            contract_date: data.contractDate
        }).select().single();
        if (error) throw error;
        return client as any;
    },

    deleteClient: async (user, id) => {
        await supabase.from('organizations').delete().eq('id', id);
    },

    getTickets: async () => {
        const { data } = await supabase.from('tickets').select('*, profiles(full_name)').order('created_at', { ascending: false });
        return (data || []).map(t => ({
            ...t,
            userName: t.profiles?.full_name,
            createdAt: new Date(t.created_at).toLocaleString()
        })) as any;
    },

    getMyTickets: async (user) => {
        const { data } = await supabase.from('tickets').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        return (data || []).map(t => ({ ...t, createdAt: new Date(t.created_at).toLocaleString() })) as any;
    },

    getUserTickets: async (userId) => {
        const { data } = await supabase.from('tickets').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        return (data || []).map(t => ({ ...t, createdAt: new Date(t.created_at).toLocaleString() })) as any;
    },

    getQualityInbox: async () => {
        const { data } = await supabase.from('tickets').select('*').eq('flow', 'CLIENT_TO_QUALITY').order('created_at', { ascending: false });
        return (data || []).map(t => ({ ...t, createdAt: new Date(t.created_at).toLocaleString() })) as any;
    },

    getAdminInbox: async () => {
        const { data } = await supabase.from('tickets').select('*').eq('flow', 'QUALITY_TO_ADMIN').order('created_at', { ascending: false });
        return (data || []).map(t => ({ ...t, createdAt: new Date(t.created_at).toLocaleString() })) as any;
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
        return ticket as any;
    },

    resolveTicket: async (user, id, status, note) => {
        await supabase.from('tickets').update({ status, resolution_note: note, updated_at: new Date().toISOString() }).eq('id', id);
    },

    updateTicketStatus: async (user, id, status) => {
        await supabase.from('tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    },

    // Mocks para áreas de infraestrutura não implementadas no DB ainda
    getFirewallRules: async () => [],
    getPorts: async () => [],
    getMaintenanceEvents: async () => [],
    scheduleMaintenance: async (user, event) => ({} as any),
    cancelMaintenance: async (user, id) => {},
    requestInfrastructureSupport: async (user, data) => `EXT-${Date.now()}`
};
