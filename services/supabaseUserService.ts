import { User, UserRole } from '../types.ts';
import { IUserService } from './interfaces.ts';
import { supabase } from './supabaseClient.ts';

export const SupabaseUserService: IUserService = {
    authenticate: async (email, password): Promise<boolean> => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return true;
    },

    signUp: async (email, password, fullName, organizationId, department): Promise<void> => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });

        if (error) throw error;
        if (!data.user) throw new Error("Erro ao criar usuário.");

        // O trigger no DB geralmente cria o profile, mas para garantir via código caso o trigger não exista:
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: data.user.id,
                full_name: fullName,
                role: UserRole.CLIENT, // Padrão para auto-cadastro
                organization_id: organizationId || null,
                department: department || 'Geral',
                status: 'ACTIVE',
                updated_at: new Date().toISOString()
            });

        if (profileError) throw profileError;
    },

    getCurrentUser: async (): Promise<User | null> => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return null;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select(`
                id, 
                full_name, 
                role, 
                organization_id, 
                department, 
                status
            `)
            .eq('id', authUser.id)
            .single();

        if (error || !profile) return null;

        return {
            id: authUser.id,
            name: profile.full_name,
            email: authUser.email!,
            role: profile.role as UserRole,
            clientId: profile.organization_id,
            status: profile.status as any,
            department: profile.department
        };
    },

    logout: async (): Promise<void> => {
        await supabase.auth.signOut();
    },

    getUsers: async (): Promise<User[]> => {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw error;
        return data.map(p => ({
            id: p.id,
            name: p.full_name,
            email: '', 
            role: p.role as UserRole,
            clientId: p.organization_id,
            status: p.status as any,
            department: p.department
        }));
    },

    saveUser: async (user, initialPassword): Promise<void> => {
        const { error } = await supabase.from('profiles').upsert({
            id: user.id,
            full_name: user.name,
            role: user.role,
            organization_id: user.clientId,
            status: user.status,
            department: user.department,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
    },

    changePassword: async (userId, current, newPass): Promise<boolean> => {
        const { error } = await supabase.auth.updateUser({ password: newPass });
        if (error) throw error;
        return true;
    },

    deleteUser: async (userId): Promise<void> => {
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) throw error;
    },

    blockUserById: async (adminUser, targetUserId, reason): Promise<void> => {
        const { error } = await supabase.from('profiles').update({ status: 'BLOCKED' }).eq('id', targetUserId);
        if (error) throw error;
    },

    getUserStats: async () => {
        const { count: total } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: clients } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'CLIENT');
        return { total: total || 0, active: total || 0, clients: clients || 0 };
    },

    generateRandomPassword: () => Math.random().toString(36).slice(-10)
};