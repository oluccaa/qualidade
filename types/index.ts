export * from './auth.ts';
export * from './file.ts';
export * from './system.ts';

import { UserRole } from './auth.ts';

/**
 * Normalização centralizada para ENUMs do PostgreSQL.
 * Alinhado estritamente com: ADMIN, QUALITY, CLIENT.
 */
export const normalizeRole = (role: any): UserRole => {
    if (!role) return UserRole.CLIENT;
    
    const normalized = String(role).trim().toUpperCase();
    
    if (normalized === 'ADMIN' || normalized === 'ROOT') {
        return UserRole.ADMIN;
    }
    if (normalized === 'QUALITY' || normalized === 'QUALIDADE') {
        return UserRole.QUALITY;
    }
    if (normalized === 'CLIENT' || normalized === 'CLIENTE') {
        return UserRole.CLIENT;
    }
    
    return UserRole.CLIENT; // Fallback de segurança (menor privilégio)
};