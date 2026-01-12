
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
        // Clean and validate metadata before sending to Supabase Auth
        // This prevents the common 'Database error saving new user' which happens
        // when the Postgres trigger fails to cast invalid strings to UUID.
        
        const metadata: Record<string, any> = {
            full_name: fullName.trim(),
            department: department?.trim() || 'Geral'
        };

        // Ensure organization_id is either a valid UUID string or null.
        // Never send empty strings or 'NEW' to the auth metadata if the trigger expects a UUID.
        if (organizationId && organizationId.trim() !== '' && organizationId !== 'NEW') {
            metadata.organization_id = organizationId.trim();
        } else {
            metadata.organization_id = null;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });

        if (error) {
            console.error("Supabase Auth SignUp Error:", error.message, error.status);
            // If the error is 'Database error', it's the trigger failing.
            if (error.message.includes('Database error')) {
                throw new Error("Erro no banco de dados ao salvar perfil. Verifique se os dados da empresa são válidos ou se o usuário já existe.");
            }
            throw error;
        }
        
        if (!data.user) throw new Error("Não foi possível criar a conta no momento.");
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

        if (error || !profile) {
            console.warn("Perfil não encontrado para o usuário logado.");
            return null;
        }

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

    saveUser: async (user, initialPassword) => {
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
