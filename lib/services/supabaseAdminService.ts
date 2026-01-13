import { IAdminService, AdminStatsData, PaginatedResponse } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { SystemStatus, MaintenanceEvent } from '../../types/system.ts';
import { ClientOrganization, UserRole } from '../../types/auth.ts';
import { withAuditLog } from '../utils/auditLogWrapper.ts';
import { logAction } from './loggingService.ts';

export const SupabaseAdminService: IAdminService = {
    getSystemStatus: async () => {
        try {
            const { data, error } = await supabase.from('system_settings').select('*').single();
            if (error || !data) return { mode: 'ONLINE' };
            return {
                mode: data.mode,
                message: data.message,
                scheduledStart: data.scheduled_start,
                scheduledEnd: data.scheduled_end,
                updatedBy: data.updated_by
            };
        } catch (e) {
            console.error("Erro ao buscar status do sistema:", e);
            return { mode: 'ONLINE' };
        }
    },

    updateSystemStatus: async (user, newStatus) => {
        const serviceCall = async () => {
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
                scheduledEnd: data.scheduled_end,
                updatedBy: data.updated_by
            } as SystemStatus;
        };

        return await withAuditLog(user, 'SYSTEM_STATUS_UPDATE', { 
            target: `Mode: ${newStatus.mode}`, 
            category: 'SYSTEM', 
            initialSeverity: 'WARNING', 
            metadata: { newMode: newStatus.mode }
        }, serviceCall);
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
                    scheduledEnd: s.scheduled_end,
                    updatedBy: s.updated_by
                } as SystemStatus);
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    },

    getAdminStats: async (): Promise<AdminStatsData> => {
        // Implementação simplificada de agregação para o Dashboard Admin
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: activeUsersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE');
        const { count: clientsCount } = await supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE');
        
        const simulatedInfra = {
            cpuUsage: 12 + Math.floor(Math.random() * 8),
            memoryUsage: 38 + Math.floor(Math.random() * 5),
            dbConnections: 4 + Math.floor(Math.random() * 4),
            dbMaxConnections: 60
        };

        return {
            totalUsers: usersCount || 0,
            activeUsers: activeUsersCount || 0,
            activeClients: clientsCount || 0,
            logsLast24h: 42, // Placeholder
            systemHealthStatus: 'HEALTHY',
            ...simulatedInfra
        };
    },

    getClients: async (filters, page = 1, pageSize = 20): Promise<PaginatedResponse<ClientOrganization>> => {
        let query = supabase.from('organizations').select(`*, quality_analyst_profile:profiles!quality_analyst_id(full_name)`, { count: 'exact' });
        if (filters?.search) query = query.or(`name.ilike.%${filters.search}%,cnpj.ilike.%${filters.search}%`);
        if (filters?.status && filters.status !== 'ALL') query = query.eq('status', filters.status);

        const from = (page - 1) * pageSize;
        const { data: orgsData, count, error } = await query.range(from, from + pageSize - 1).order('name');
        if (error) throw error;

        return {
            items: (orgsData || []).map(c => ({
                id: c.id, name: c.name, cnpj: c.cnpj, status: c.status as any, contractDate: c.contract_date,
                qualityAnalystId: c.quality_analyst_id,
                qualityAnalystName: c.quality_analyst_profile?.full_name
            })),
            total: count || 0, hasMore: (count || 0) > from + pageSize
        };
    },

    saveClient: async (user, data) => {
        const payload = {
            name: data.name, cnpj: data.cnpj, status: data.status,
            contract_date: data.contractDate, quality_analyst_id: data.qualityAnalystId || null,
        };
        const serviceCall = async () => {
            let query = data.id ? supabase.from('organizations').update(payload).eq('id', data.id) : supabase.from('organizations').insert(payload);
            const { data: client, error } = await query.select().single();
            if (error) throw error;
            return { ...data, id: client.id } as ClientOrganization;
        };
        return await withAuditLog(user, data.id ? 'CLIENT_UPDATED' : 'CLIENT_CREATED', { target: data.name, category: 'DATA' }, serviceCall);
    },

    deleteClient: async (user, id) => {
        const serviceCall = async () => {
            const { error } = await supabase.from('organizations').delete().eq('id', id);
            if (error) throw error;
        };
        await withAuditLog(user, 'CLIENT_DELETE', { target: id, category: 'DATA' }, serviceCall);
    },

    getFirewallRules: async () => [],
    getPorts: async () => [],
    getMaintenanceEvents: async () => {
        const { data } = await supabase.from('maintenance_events').select('*').order('scheduled_date', { ascending: false });
        return (data || []).map(e => ({ id: e.id, title: e.title, scheduledDate: e.scheduled_date, durationMinutes: e.duration_minutes, description: e.description, status: e.status, createdBy: e.created_by }));
    },

    scheduleMaintenance: async (user, event) => {
        const serviceCall = async () => {
            const { data, error } = await supabase.from('maintenance_events').insert({ 
                title: event.title, 
                scheduled_date: event.scheduledDate, 
                duration_minutes: event.durationMinutes, 
                description: event.description, 
                status: 'SCHEDULED', 
                created_by: user.id 
            }).select().single();
            if (error) throw error;
            return data as MaintenanceEvent;
        };
        return await withAuditLog(user, 'MAINTENANCE_SCHEDULE', { target: event.title, category: 'SYSTEM' }, serviceCall);
    },

    cancelMaintenance: async (user, id) => {
        await withAuditLog(user, 'MAINTENANCE_CANCEL', { target: id, category: 'SYSTEM' }, () => supabase.from('maintenance_events').update({ status: 'CANCELLED' }).eq('id', id));
    },
};