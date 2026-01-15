
import { User, UserRole, AccountStatus } from '../../types/auth.ts';
import { IUserService, RawProfile } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { logAction } from './loggingService.ts';
import { normalizeRole } from '../mappers/roleMapper.ts';
import { withTimeout } from '../utils/apiUtils.ts';
import { withAuditLog } from '../utils/auditLogWrapper.ts';
import { AuthError, Session, UserResponse, PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';

const API_TIMEOUT = 8000;

/**
 * Normaliza erros do provedor de autenticação para chaves i18n controladas.
 */
const normalizeAuthError = (error: AuthError): string => {
  const msg = error.message.toLowerCase();
  if (msg.includes("invalid login credentials")) return "auth.errors.invalidCredentials";
  if (msg.includes("should be different from the old password")) return "auth.errors.samePassword";
  if (msg.includes("too many requests")) return "auth.errors.tooManyRequests";
  if (msg.includes("password should be at least")) return "auth.errors.weakPassword";
  return "auth.errors.unexpected";
};

const toDomainUser = (row: RawProfile | null, sessionEmail?: string): User | null => {
  if (!row) return null;
  const orgData = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;

  return {
    id: row.id,
    name: row.full_name || 'Usuário Sem Nome',
    email: row.email || sessionEmail || '',
    role: normalizeRole(row.role),
    organizationId: row.organization_id || undefined,
    organizationName: orgData?.name || 'Aços Vital (Interno)',
    status: (row.status as AccountStatus) || AccountStatus.ACTIVE,
    department: row.department || undefined,
    lastLogin: row.last_login || undefined
  };
};

export const SupabaseUserService: IUserService = {
  authenticate: async (email, password) => {
    try {
      const authPromise = supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      const result: { data: { session: Session | null }; error: AuthError | null } = await withTimeout(
        authPromise as any,
        API_TIMEOUT,
        "Tempo esgotado ao autenticar. Verifique sua conexão."
      );
      const { data, error } = result;

      if (error) {
        await logAction(null, 'LOGIN_ATTEMPT_FAILED', email, 'AUTH', 'WARNING', 'FAILURE', { reason: error.message });
        return { 
          success: false, 
          error: normalizeAuthError(error)
        };
      }
      
      return { success: true };
    } catch (e: any) {
      return { success: false, error: "auth.errors.unexpected" };
    }
  },

  signUp: async (email, password, fullName, organizationId, department, role = UserRole.QUALITY) => {
    const authPromise = supabase.auth.signUp({ 
        email: email.trim().toLowerCase(), 
        password 
      });
    // Fix: Properly typed authResult as UserResponse
    const authResult: UserResponse = await withTimeout( 
      authPromise as any,
      API_TIMEOUT,
      "Tempo esgotado ao registrar usuário."
    );
    const { data, error: authError } = authResult;
    
    if (authError) throw new Error(normalizeAuthError(authError));

    // Fix: access user from data property of UserResponse
    if (data.user) {
      const profilePromise = Promise.resolve(supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          organization_id: organizationId || null,
          department: department || null,
          role: role,
          status: 'ACTIVE'
        }));
      const profileResult = await withTimeout( 
        profilePromise as any,
        API_TIMEOUT,
        "Tempo esgotado ao criar perfil."
      );
      const { error: profileError } = profileResult as PostgrestResponse<null>;

      if (profileError) {
        throw new Error("Usuário criado, mas houve um erro ao configurar o perfil.");
      }

      await logAction(null, 'USER_SIGNUP', email, 'AUTH', 'INFO', 'SUCCESS', { fullName, role });
    }
  },

  getCurrentUser: async () => {
    try {
      const sessionResult: { data: { session: Session | null }; error: AuthError | null } = await withTimeout( 
        supabase.auth.getSession() as any,
        API_TIMEOUT,
        "Tempo esgotado ao buscar sessão de usuário."
      );
      const { data: { session } } = sessionResult;
      if (!session?.user) return null;

      const profileQuery = supabase
        .from('profiles')
        .select('*, organizations!organization_id(name)')
        .eq('id', session.user.id)
        .maybeSingle();

      // Fix: Wrapped query in Promise.resolve to satisfy withTimeout typing
      const profileFetchResult = await withTimeout( 
        Promise.resolve(profileQuery) as any,
        API_TIMEOUT,
        "Tempo esgotado ao buscar perfil do usuário."
      );
      const { data: profile, error } = profileFetchResult as PostgrestSingleResponse<RawProfile>;

      if (error || !profile) return null;

      return toDomainUser(profile, session.user.email);
    } catch (e: any) {
      return null;
    }
  },

  logout: async () => {
    const result: { error: AuthError | null } = await withTimeout( 
      supabase.auth.signOut() as any,
      API_TIMEOUT,
      "Tempo esgotado ao fazer logout."
    );
    const { error } = result;
    if (error) throw error;
    localStorage.clear();
  },

  getUsers: async () => {
    const usersPromise = Promise.resolve(supabase
        .from('profiles')
        .select('*, organizations!organization_id(name)')
        .order('full_name'));
    const result = await withTimeout( 
      usersPromise as any,
      API_TIMEOUT,
      "Tempo esgotado ao buscar usuários."
    );
    const { data, error } = result as PostgrestResponse<RawProfile>;
    if (error) throw error;
    return (data || []).map(p => toDomainUser(p) as User);
  },

  getUsersByRole: async (role) => {
    const usersByRolePromise = Promise.resolve(supabase
        .from('profiles')
        .select('*, organizations!organization_id(name)')
        .eq('role', role));
    const result = await withTimeout( 
      usersByRolePromise as any,
      API_TIMEOUT,
      `Tempo esgotado ao buscar usuários por role (${role}).`
    );
    const { data, error } = result as PostgrestResponse<RawProfile>;
    if (error) throw error;
    return (data || []).map(p => toDomainUser(p) as User);
  },

  saveUser: async (u) => {
    const action = async () => {
      const { error } = await supabase.from('profiles').update({
          full_name: u.name,
          role: u.role,
          organization_id: u.organizationId || null,
          status: u.status,
          department: u.department || null,
          updated_at: new Date().toISOString()
      }).eq('id', u.id);
      
      if (error) throw error;
    };

    await withAuditLog(null, 'USER_PROFILE_UPDATE', { 
        target: u.id, 
        category: 'DATA', 
        metadata: { email: u.email, newRole: u.role } 
    }, action);
  },

  changePassword: async (userId, current, newPass) => {
    const action = async () => {
        const { error } = await supabase.auth.updateUser({ password: newPass });
        if (error) throw new Error(normalizeAuthError(error));
        return true;
    };

    return await withAuditLog(null, 'USER_PASSWORD_CHANGE', { 
        target: userId, 
        category: 'SECURITY', 
        initialSeverity: 'WARNING' 
    }, action);
  },

  deleteUser: async (id) => {
    const action = async () => {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
    };
    
    await withAuditLog(null, 'USER_DELETION', { 
        target: id, 
        category: 'DATA', 
        initialSeverity: 'CRITICAL' 
    }, action);
  },

  blockUserById: async (admin, target, reason) => {
    const blockUserPromise = Promise.resolve(supabase.from('profiles').update({ status: 'BLOCKED' }).eq('id', target));
    const result = await withTimeout( 
      blockUserPromise as any,
      API_TIMEOUT,
      "Tempo esgotado ao bloquear usuário."
    );
    const { error } = result as PostgrestResponse<null>;
    if (error) throw error;
    await logAction(admin, 'SEC_USER_BLOCKED', target, 'SECURITY', 'CRITICAL', 'SUCCESS', { reason });
  },

  getUserStats: async () => {
    // Fix: Explicit typing for stats results and wrapping in Promise.resolve
    const statsPromises = Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE')
    ]);
    const [totalResult, activeResult] = await withTimeout( 
      statsPromises,
      API_TIMEOUT,
      "Tempo esgotado ao buscar estatísticas de usuário."
    );
    return { total: totalResult.count || 0, active: activeResult.count || 0, clients: 0 };
  },

  generateRandomPassword: () => Math.random().toString(36).slice(-10)
};
