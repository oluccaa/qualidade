
import { User, UserRole } from '../types.ts';
import { MOCK_USERS } from './mockData.ts';
import { logAction } from './fileService.ts';

// In-memory store initialized with MOCK_USERS
let currentUsers = [...MOCK_USERS];

// In-Memory Password Store (mocking a DB table)
// Initialize with default password for all existing mocks
const userPasswords: Record<string, string> = {};
MOCK_USERS.forEach(u => {
    userPasswords[u.id] = '123456'; // Default password for demo users
});
// Specific Override for Admin
userPasswords['u1'] = 'Admin@123';

// RATE LIMITING STORE (In-Memory for MVP)
const loginAttempts: Record<string, { count: number, lockUntil: number }> = {};

export const generateRandomPassword = (): string => {
    // Generate a simple alphanumeric password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let result = '';
    for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const getUsers = async (): Promise<User[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...currentUsers];
};

export const saveUser = async (user: User, initialPassword?: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const idx = currentUsers.findIndex(u => u.id === user.id);
    
    if (idx >= 0) {
        currentUsers[idx] = user;
    } else {
        currentUsers.push(user);
        // Set initial password for new users
        if (initialPassword) {
            userPasswords[user.id] = initialPassword;
        } else {
            userPasswords[user.id] = '123456'; // Fallback
        }
    }
};

export const changePassword = async (userId: string, current: string, newPass: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate hashing
    
    const stored = userPasswords[userId];
    if (stored !== current) {
        throw new Error("Senha atual incorreta.");
    }

    if (newPass.length < 6) {
        throw new Error("A nova senha deve ter no mínimo 6 caracteres.");
    }

    userPasswords[userId] = newPass;
    
    // Log the change
    const user = currentUsers.find(u => u.id === userId);
    if(user) await logAction(user, 'PASSWORD_CHANGE', 'Alteração de senha realizada com sucesso.', 'INFO');

    return true;
};

export const deleteUser = async (userId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    currentUsers = currentUsers.filter(u => u.id !== userId);
    delete userPasswords[userId]; // Clean up password store
};

// NEW: Block User explicitly (for Admin Investigations)
export const blockUserById = async (adminUser: User, targetUserId: string, reason: string): Promise<void> => {
    if (adminUser.role !== UserRole.ADMIN) throw new Error("Acesso negado");
    
    const targetIdx = currentUsers.findIndex(u => u.id === targetUserId);
    if (targetIdx === -1) throw new Error("Usuário não encontrado.");

    if (currentUsers[targetIdx].status === 'BLOCKED') throw new Error("Usuário já está bloqueado.");

    currentUsers[targetIdx] = {
        ...currentUsers[targetIdx],
        status: 'BLOCKED'
    };

    await logAction(
        adminUser, 
        'SECURITY_BLOCK_USER', 
        `Bloqueou usuário ${currentUsers[targetIdx].email}. Motivo: ${reason}`, 
        'CRITICAL'
    );
};

export const authenticate = async (email: string, password: string): Promise<User | null> => {
    const normalizedEmail = email.toLowerCase().trim();
    const now = Date.now();

    const getLoggableUser = (foundUser?: User): User => {
        if (foundUser) return foundUser;
        return {
            id: 'unknown',
            name: `Anônimo (${normalizedEmail})`,
            email: normalizedEmail,
            role: UserRole.CLIENT,
            status: 'ACTIVE'
        };
    };

    // 1. CHECK RATE LIMIT
    if (loginAttempts[normalizedEmail]) {
        const { lockUntil } = loginAttempts[normalizedEmail];
        if (lockUntil > now) {
            const remainingSeconds = Math.ceil((lockUntil - now) / 1000);
            await logAction(
                getLoggableUser(currentUsers.find(u => u.email === normalizedEmail)), 
                'LOGIN_BLOCKED', 
                `Tentativa bloqueada por rate-limit. (${remainingSeconds}s restantes)`, 
                'WARNING'
            );
            throw new Error(`Muitas tentativas. Aguarde ${remainingSeconds} segundos.`);
        }
    }

    await new Promise(resolve => setTimeout(resolve, 800)); 
    
    const user = currentUsers.find(u => u.email.toLowerCase() === normalizedEmail);
    
    // 2. VALIDATE CREDENTIALS
    // Now checking against dynamic store
    const storedPassword = user ? userPasswords[user.id] : null;
    const isValidPassword = storedPassword === password;
    
    // 3. HANDLE FAILURE
    if (!user || !isValidPassword) {
        if (!loginAttempts[normalizedEmail]) {
            loginAttempts[normalizedEmail] = { count: 0, lockUntil: 0 };
        }
        if (loginAttempts[normalizedEmail].lockUntil !== 0 && loginAttempts[normalizedEmail].lockUntil < now) {
             loginAttempts[normalizedEmail].count = 0;
        }
        
        loginAttempts[normalizedEmail].count++;
        const currentCount = loginAttempts[normalizedEmail].count;

        if (currentCount >= 3) {
            loginAttempts[normalizedEmail].lockUntil = now + (30 * 1000); 
            await logAction(
                getLoggableUser(user), 
                'ACCOUNT_LOCKED', 
                `Conta travada temporariamente após ${currentCount} falhas consecutivas.`, 
                'CRITICAL'
            );
            throw new Error("Muitas tentativas falhas. Acesso bloqueado por 30 segundos.");
        } else {
            await logAction(
                getLoggableUser(user), 
                'LOGIN_FAILED', 
                `Senha incorreta ou usuário inexistente (Tentativa ${currentCount}/3)`, 
                'WARNING'
            );
        }
        return null;
    }

    // 4. CHECK ACCOUNT STATUS
    if (user.status === 'BLOCKED') {
        await logAction(user, 'LOGIN_DENIED', 'Tentativa de login em conta inativa/bloqueada pelo admin.', 'ERROR');
        throw new Error("CONTA BLOQUEADA: Contate o administrador do sistema.");
    }

    // 5. HANDLE SUCCESS
    if (loginAttempts[normalizedEmail]) {
        delete loginAttempts[normalizedEmail];
    }

    await logAction(user, 'LOGIN_SUCCESS', 'Autenticação realizada com sucesso via Web.', 'INFO');
    
    return user;
};

// Helper for Admin Dashboard stats
export const getUserStats = async () => {
    return {
        total: currentUsers.length,
        active: currentUsers.filter(u => u.status === 'ACTIVE').length,
        clients: currentUsers.filter(u => u.role === UserRole.CLIENT).length
    };
};
