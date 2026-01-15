
import { supabase } from '../supabaseClient.ts';
import { normalizeRole } from '../mappers/roleMapper.ts';

export const SupabaseAppService = {
  getInitialData: async () => {
    try {
      // Tenta buscar dados do banco
      const { data, error } = await supabase.rpc('get_initial_app_data');
      
      if (error) {
        console.warn("Aviso RPC (usando modo segurança):", error.message);
      }

      const rawUser = data?.user;
      const rawSystem = data?.systemStatus;

      // Mapeia o usuário (pode ser null se não logado)
      const domainUser = rawUser ? {
        id: rawUser.id,
        name: rawUser.full_name || 'Usuário',
        email: rawUser.email || '',
        role: normalizeRole(rawUser.role),
        organizationId: rawUser.organization_id,
        organizationName: rawUser.organization_name || 'Aços Vital',
        status: rawUser.status || 'ACTIVE',
        department: rawUser.department,
        lastLogin: rawUser.last_login
      } : null;

      // Se rawSystem vier nulo (banco vazio/erro), forçamos um objeto 'ONLINE'
      const domainSystem = rawSystem ? {
        mode: rawSystem.mode,
        message: rawSystem.message,
        scheduledStart: rawSystem.scheduled_start,
        scheduledEnd: rawSystem.scheduled_end,
        updatedBy: rawSystem.updated_by
      } : { mode: 'ONLINE' };

      return { user: domainUser, systemStatus: domainSystem };

    } catch (err) {
      console.error("Falha Crítica AppService:", err);
      return { user: null, systemStatus: { mode: 'ONLINE' } as any };
    }
  }
};
