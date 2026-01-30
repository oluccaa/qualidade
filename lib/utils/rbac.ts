
import { User, UserRole } from '../../types/index.ts';
import { normalizeRole } from '../mappers/roleMapper.ts';

/**
 * RBAC Engine - Aços Vital
 * Centraliza a autorização baseada na hierarquia Staff -> Partner.
 * REGRA MASTER: ADMIN (ROOT) POSSUI ACESSO IRRESTRITO A TODAS AS CAMADAS.
 */
export const RBAC = {
  isStaff: (user: User | null): boolean => {
    if (!user) return false;
    const role = normalizeRole(user.role);
    return role === UserRole.ADMIN || role === UserRole.QUALITY;
  },

  isAdmin: (user: User | null): boolean => {
    if (!user) return false;
    return normalizeRole(user.role) === UserRole.ADMIN;
  },

  /**
   * Validador de acesso universal.
   * ADMIN tem override total sobre qualquer array de permissões.
   */
  hasAccess: (user: User | null, allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    const userRole = normalizeRole(user.role);
    
    // 1. ADMIN é o superusuário (Soberania Root)
    if (userRole === UserRole.ADMIN) return true;

    // 2. QUALITY tem herança sobre rotas de QUALITY
    if (userRole === UserRole.QUALITY && allowedRoles.includes(UserRole.QUALITY)) return true;

    // 3. Validação direta para CLIENT
    return allowedRoles.includes(userRole);
  }
};
