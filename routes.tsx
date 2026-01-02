import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Quality from './pages/Quality.tsx';
import Admin from './pages/Admin.tsx';
import { AuthMiddleware } from './middlewares/AuthMiddleware.tsx';
import { RoleMiddleware } from './middlewares/RoleMiddleware.tsx';
import { UserRole } from './types.ts';
import { useAuth } from './services/authContext.tsx';

export const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
        {/* Public Route - Redirects if already logged in */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === UserRole.CLIENT ? "/dashboard" : "/quality"} />} />

        {/* Protected Zone */}
        <Route element={<AuthMiddleware />}>
            
            {/* Client Access */}
            <Route element={<RoleMiddleware allowedRoles={[UserRole.CLIENT, UserRole.QUALITY, UserRole.ADMIN]} />}>
                <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Quality Dept Access (Read/Write) */}
            <Route element={<RoleMiddleware allowedRoles={[UserRole.QUALITY, UserRole.ADMIN]} />}>
                <Route path="/quality" element={<Quality />} />
            </Route>

            {/* Admin Access (System Management) */}
            <Route element={<RoleMiddleware allowedRoles={[UserRole.ADMIN]} />}>
                <Route path="/admin" element={<Admin />} />
            </Route>

        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};