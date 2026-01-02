import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../services/authContext.tsx';
import { UserRole } from '../types.ts';

interface RoleMiddlewareProps {
  allowedRoles: UserRole[];
}

export const RoleMiddleware: React.FC<RoleMiddlewareProps> = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    // Smart Redirect Strategy based on Role
    if (user?.role === UserRole.CLIENT) {
        return <Navigate to="/dashboard" replace />;
    }
    if (user?.role === UserRole.QUALITY) {
        return <Navigate to="/quality" replace />;
    }
    // Fallback for unauthorized access attempts
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};