import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Quality from './pages/Quality.tsx';
import Admin from './pages/Admin.tsx';
import { AuthMiddleware } from './middlewares/AuthMiddleware.tsx';
import { RoleMiddleware } from './middlewares/RoleMiddleware.tsx';
import { UserRole } from './types.ts';
import { useAuth } from './services/authContext.tsx';
import { ShieldCheck, Loader2 } from 'lucide-react';

// --- Internal Components for Routing Logic ---

const LoadingScreen = () => (
  <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
        <ShieldCheck size={64} className="text-blue-500 relative z-10 mb-6" />
      </div>
      <Loader2 size={32} className="animate-spin text-blue-400" />
      <p className="mt-4 text-sm font-medium text-slate-400 tracking-wider uppercase">Carregando Portal</p>
  </div>
);

/**
 * PublicRoute:
 * If user is NOT logged in, render the component (Login).
 * If user IS logged in, redirect them immediately to their dashboard.
 * This prevents logged-in users from seeing the login screen.
 */
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user } = useAuth();
    
    if (user) {
        // Smart Redirect based on Role
        if (user.role === UserRole.QUALITY) return <Navigate to="/quality" replace />;
        if (user.role === UserRole.ADMIN) return <Navigate to="/admin" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// --- Main Routes Definition ---

export const AppRoutes: React.FC = () => {
  const { isLoading } = useAuth();

  // 1. GLOBAL LOADING STATE
  // While checking localStorage, show a native-like splash screen.
  // This prevents the "Flash of Unauthenticated Content" or flickering redirects.
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
        {/* 2. ROOT PATH REDIRECT */}
        {/* Force root to go to login. PublicRoute will handle if they are already logged in */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 3. PUBLIC ROUTES */}
        <Route 
            path="/login" 
            element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } 
        />

        {/* 4. PROTECTED ZONES */}
        <Route element={<AuthMiddleware />}>
            
            {/* Client Access */}
            <Route element={<RoleMiddleware allowedRoles={[UserRole.CLIENT, UserRole.QUALITY, UserRole.ADMIN]} />}>
                <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Quality Dept Access */}
            <Route element={<RoleMiddleware allowedRoles={[UserRole.QUALITY, UserRole.ADMIN]} />}>
                <Route path="/quality" element={<Quality />} />
            </Route>

            {/* Admin Access */}
            <Route element={<RoleMiddleware allowedRoles={[UserRole.ADMIN]} />}>
                <Route path="/admin" element={<Admin />} />
            </Route>

        </Route>

        {/* 5. CATCH ALL */}
        {/* Any unknown route redirects to root (which redirects to login/dashboard) */}
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};