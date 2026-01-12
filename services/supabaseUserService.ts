
import { User, UserRole } from '../types.ts';
import { IUserService } from './interfaces.ts';
import { supabase } from './supabaseClient.ts';

const handleSupabaseError = (error: any, customMessage: string) => {
    // Erro 42501 é o código padrão do Postgres para "Insufficient Privilege" (RLS bloqueando)
    if (error.code === '42501') {
        throw new Error(`Erro de Permissão (RLS): O banco de dados bloqueou a leitura do seu perfil. Verifique se as Policies de SELECT estão configuradas na tabela 'profiles'.`);
    }
    if (error.message?.includes('JSON object requested, multiple (or no) rows returned')) {
        throw new Error(`Perfil não encontrado: Sua conta existe no Auth, mas não há um registro correspondente na tabela 'public.profiles'. O Trigger de criação automática pode ter falhado.`);
    }
    throw new Error(error.message || customMessage);
};

export const SupabaseUserService: IUserService = {
    authenticate: async (email, password): Promise<boolean> => {
        // Limpa qualquer resquício de sessão anterior
        await supabase.auth.signOut();

        const { data, error } = await supabase.auth.signInWithPassword({ 
            email: email.trim().toLowerCase(), 
            password 
        });
        
        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                throw new Error("E-mail ou senha incorretos.");
            }
            throw error;
        }

        if (!data.user) throw new Error("Falha na autenticação: Usuário não retornado.");

        try {
            // Tenta buscar o perfil na tabela pública
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, role')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                handleSupabaseError(profileError, "Erro ao carregar dados do perfil.");
            }

            if (!profile) {
                await supabase.auth.signOut();
                throw new Error("Perfil não encontrado: Entre em contato com o suporte para vincular seu acesso.");
            }

            return true;
        } catch (err: any) {
            // Se falhar ao buscar o perfil, desloga o usuário do Auth para não ficar em estado inconsistente
            await supabase.auth.signOut();
            throw err;
        }
    },

    signUp: async (email, password, fullName, organizationId, department): Promise<void> => {
        const normalizedEmail = email.trim().toLowerCase();
        
        const metadata: Record<string, any> = {
            full_name: fullName.trim(),
            department: department?.trim() || 'Geral',
            organization_id: (organizationId && organizationId !== 'NEW') ? organizationId : null
        };

        const { error } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
                data: metadata
            }
        });

        if (error) throw error;
    },

    getCurrentUser: async (): Promise<User | null> => {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) return null;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select(`id, full_name, role, organization_id, department, status`)
            .eq('id', authUser.id)
            .maybeSingle();

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
        if (error) return [];
        return (data || []).map(p => ({
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
            organization_id: user.clientId || null,
            status: user.status || 'ACTIVE',
            department: user.department || 'Geral',
            updated_at: new Date().toISOString()
        });
        
        if (error) handleSupabaseError(error, "Erro ao salvar perfil do usuário");
    },

    changePassword: async (userId, current, newPass): Promise<boolean> => {
        const { error } = await supabase.auth.updateUser({ password: newPass });
        if (error) throw error;
        return true;
    },

    deleteUser: async (userId): Promise<void> => {
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) handleSupabaseError(error, "Erro ao excluir usuário");
    },

    blockUserById: async (adminUser, targetUserId, reason): Promise<void> => {
        const { error } = await supabase.from('profiles').update({ status: 'BLOCKED' }).eq('id', targetUserId);
        if (error) handleSupabaseError(error, "Erro ao bloquear usuário");
    },

    getUserStats: async () => {
        const { count: total } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: clients } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'CLIENT');
        return { total: total || 0, active: total || 0, clients: clients || 0 };
    },

    generateRandomPassword: () => Math.random().toString(36).slice(-10)
};
