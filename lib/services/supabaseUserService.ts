
import { User, UserRole } from '../../types/auth.ts';
import { IUserService } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { logAction } from './loggingService.ts';
import { normalizeRole } from '../../types/index.ts';

export const SupabaseUserService: IUserService = {
    authenticate: async (email, password): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
                email: email.trim().toLowerCase(), 
                password 
            });

            if (authError) throw authError;

            // Verifica se existe perfil na tabela public.profiles
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, status')
                .eq('id', authData.user.id)
                .single();

            if (profileError || !profile) {
                return { success: false, error: "Usuário autenticado, mas perfil não encontrado no sistema." };
            }

            if (profile.status === 'BLOCKED') {
                return { success: false, error: "Este acesso está bloqueado por políticas de segurança." };
            }

            // Update do last login
            await supabase.from('profiles').update({ 
                last_login: new Date().toISOString() 
            }).eq('id', authData.user.id);

            return { success: true };
        } catch (err: any) {
            const msg = err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message;
            return { success: false, error: msg };
        }
    },

    signUp: async (email, password, fullName, organizationId, department): Promise<void> => {
        const { data, error: authError } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
        });

        if (authError) throw authError;
        if (!data.user) throw new Error("Falha na criação do usuário.");

        const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: fullName,
            email: email.trim().toLowerCase(),
            role: 'CLIENT', 
            organization_id: organizationId || null,
            department: department || null,
            status: 'ACTIVE'
        });

        if (profileError) throw profileError;
    },

    getCurrentUser: async (): Promise<User | null> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return null;

        // Buscamos o perfil. O join com organizations deve ser opcional (nullable)
        const { data: profile, error } = await supabase
            .from('profiles')
            .select(`
                id, 
                full_name, 
                email, 
                role, 
                status, 
                organization_id, 
                department, 
                last_login,
                organizations ( name )
            `)
            .eq('id', session.user.id)
            .single();

        if (error || !profile) {
            console.warn("[UserService] Perfil não localizado para o ID:", session.user.id);
            return null;
        }

        return {
            id: profile.id,
            name: profile.full_name,
            email: profile.email || session.user.email || '',
            role: normalizeRole(profile.role),
            organizationId: profile.organization_id,
            organizationName: (profile.organizations as any)?.name || 'Aços Vital',
            status: profile.status,
            department: profile.department,
            lastLogin: profile.last_login ? new Date(profile.last_login).toLocaleString('pt-BR') : 'Primeiro acesso'
        };
    },

    logout: async () => {
        await supabase.auth.signOut();
    },

    getUsers: async () => {
        const { data, error } = await supabase.from('profiles').select('*, organizations(name)').order('full_name');
        if (error) throw error;
        return data.map(p => ({
            id: p.id,
            name: p.full_name,
            email: p.email,
            role: normalizeRole(p.role),
            organizationId: p.organization_id,
            organizationName: (p.organizations as any)?.name,
            status: p.status,
            department: p.department,
            lastLogin: p.last_login
        }));
    },

    getUsersByRole: async (role) => {
        const { data, error } = await supabase.from('profiles').select('*').eq('role', role);
        if (error) throw error;
        return data.map(p => ({ id: p.id, name: p.full_name, email: p.email, role: normalizeRole(p.role) } as User));
    },

    saveUser: async (u) => {
        const { error } = await supabase.from('profiles').update({
            full_name: u.name,
            role: u.role,
            organization_id: u.organizationId,
            status: u.status,
            department: u.department,
            updated_at: new Date().toISOString()
        }).eq('id', u.id);
        if (error) throw error;
    },

    changePassword: async (userId, current, newPass) => {
        const { error } = await supabase.auth.updateUser({ password: newPass });
        return !error;
    },

    deleteUser: async (id) => {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) throw error;
    },

    blockUserById: async (admin, target, reason) => {
        await supabase.from('profiles').update({ status: 'BLOCKED' }).eq('id', target);
    },

    getUserStats: async () => {
        const { count: total } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: active } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE');
        const { count: clients } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'CLIENT');
        return { total: total || 0, active: active || 0, clients: clients || 0 };
    },

    generateRandomPassword: () => Math.random().toString(36).slice(-10)
};
