import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext.tsx';
import { UserRole, normalizeRole } from '../types/index.ts';

interface RoleMiddlewareProps {
  allowedRoles: UserRole[];
}

export const RoleMiddleware: React.FC<RoleMiddlewareProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();
  
  // Se ainda estiver carregando o perfil, não decide nada
  if (isLoading) return null;

  if (!user) return <Navigate to="/login" replace />;

  const userRole = normalizeRole(user.role);
  const isAllowed = allowedRoles.includes(userRole);

  if (!isAllowed) {
    console.warn(`[Security] Acesso negado para role: ${userRole}. Redirecionando para área segura.`);
    
    // Fallback inteligente baseado na role real
    if (userRole === UserRole.ADMIN) return <Navigate to="/admin/dashboard" replace />;
    if (userRole === UserRole.QUALITY) return <Navigate to="/quality/dashboard" replace />;
    return <Navigate to="/client/dashboard" replace />;
  }

  return <Outlet />;
};