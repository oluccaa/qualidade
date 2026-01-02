
import { User, UserRole } from '../types.ts';
import { MOCK_USERS } from './mockData.ts';

// In-memory store initialized with MOCK_USERS
let currentUsers = [...MOCK_USERS];

export const getUsers = async (): Promise<User[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...currentUsers];
};

export const saveUser = async (user: User): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const idx = currentUsers.findIndex(u => u.id === user.id);
    if (idx >= 0) {
        currentUsers[idx] = user;
    } else {
        currentUsers.push(user);
    }
};

export const deleteUser = async (userId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    currentUsers = currentUsers.filter(u => u.id !== userId);
};

export const authenticate = async (email: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const user = currentUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user && user.status === 'BLOCKED') {
        throw new Error("Conta bloqueada pelo administrador.");
    }
    
    return user || null;
};

// Helper for Admin Dashboard stats
export const getUserStats = async () => {
    return {
        total: currentUsers.length,
        active: currentUsers.filter(u => u.status === 'ACTIVE').length,
        clients: currentUsers.filter(u => u.role === UserRole.CLIENT).length
    };
};
