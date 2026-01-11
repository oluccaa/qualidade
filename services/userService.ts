
import { User, UserRole } from '../types.ts';
import { MOCK_USERS } from './mockData.ts';
import { IUserService } from './interfaces.ts';

// In-memory store
let currentUsers = [...MOCK_USERS];
const userPasswords: Record<string, string> = {};
MOCK_USERS.forEach(u => { userPasswords[u.id] = u.id === 'u1' ? 'Admin@123' : '123456'; });

// Helper para gerenciar "token" via Cookie simulado
const setAuthCookie = (userId: string) => {
    // Simulando expiração de 1 dia
    const date = new Date();
    date.setTime(date.getTime() + (24 * 60 * 60 * 1000));
    document.cookie = `acos_session_id=${userId}; expires=${date.toUTCString()}; path=/; SameSite=Strict`;
};

const getAuthCookie = () => {
    const name = "acos_session_id=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
};

const clearAuthCookie = () => {
    document.cookie = "acos_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

export const MockUserService: IUserService = {
    generateRandomPassword: (): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let result = '';
        for (let i = 0; i < 10; i++) { result += chars.charAt(Math.floor(Math.random() * chars.length)); }
        return result;
    },

    // Fix: Implement missing signUp method required by IUserService
    signUp: async (email: string, password: string, fullName: string, organizationId?: string, department?: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const id = `u${Date.now()}`;
        const newUser: User = {
            id,
            name: fullName,
            email,
            role: UserRole.CLIENT, // Padrão para auto-cadastro
            clientId: organizationId,
            status: 'ACTIVE',
            department: department || 'Geral'
        };
        currentUsers.push(newUser);
        userPasswords[id] = password;
    },

    getUsers: async (): Promise<User[]> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        return [...currentUsers];
    },

    saveUser: async (user: User, initialPassword?: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        const idx = currentUsers.findIndex(u => u.id === user.id);
        if (idx >= 0) {
            currentUsers[idx] = user;
        } else {
            currentUsers.push(user);
            userPasswords[user.id] = initialPassword || '123456';
        }
    },

    changePassword: async (userId: string, current: string, newPass: string): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        if (userPasswords[userId] !== current) throw new Error("Senha atual incorreta.");
        if (newPass.length < 6) throw new Error("A nova senha deve ter no mínimo 6 caracteres.");
        userPasswords[userId] = newPass;
        return true;
    },

    deleteUser: async (userId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        currentUsers = currentUsers.filter(u => u.id !== userId);
        delete userPasswords[userId];
    },

    blockUserById: async (adminUser: User, targetUserId: string, reason: string): Promise<void> => {
        const targetIdx = currentUsers.findIndex(u => u.id === targetUserId);
        if (targetIdx === -1) throw new Error("Usuário não encontrado.");
        currentUsers[targetIdx] = { ...currentUsers[targetIdx], status: 'BLOCKED' };
    },

    getUserStats: async () => {
        return {
            total: currentUsers.length,
            active: currentUsers.filter(u => u.status === 'ACTIVE').length,
            clients: currentUsers.filter(u => u.role === UserRole.CLIENT).length
        };
    },

    authenticate: async (email: string, password: string): Promise<boolean> => {
        const normalizedEmail = email.toLowerCase().trim();
        await new Promise(resolve => setTimeout(resolve, 800)); 
        const user = currentUsers.find(u => u.email.toLowerCase() === normalizedEmail);
        const isValid = user && userPasswords[user.id] === password;
        
        if (!isValid) return false;
        if (user.status === 'BLOCKED') throw new Error("CONTA BLOQUEADA.");
        
        // Em vez de retornar o objeto, define o Cookie de sessão (Simulando JWT)
        setAuthCookie(user.id);
        return true;
    },

    getCurrentUser: async (): Promise<User | null> => {
        const userId = getAuthCookie();
        if (!userId) return null;
        
        // Simula latência de API
        await new Promise(resolve => setTimeout(resolve, 300));
        const user = currentUsers.find(u => u.id === userId);
        return user || null;
    },

    logout: async (): Promise<void> => {
        clearAuthCookie();
        await new Promise(resolve => setTimeout(resolve, 100));
    }
};
