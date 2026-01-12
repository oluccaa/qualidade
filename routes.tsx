
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthMiddleware } from './middlewares/AuthMiddleware.tsx';
import { RoleMiddleware } from './middlewares/RoleMiddleware.tsx';
import { MaintenanceMiddleware } from './middlewares/MaintenanceMiddleware.tsx';
import { UserRole } from './types.ts';
import { useAuth } from './services/authContext.tsx';
import { ShieldCheck, Loader2 } from 'lucide-react';

// --- Lazy Load Pages ---
const Login = React.lazy(() => import('./pages/Login.tsx'));
const SignUp = React.lazy(() => import('./pages/SignUp.tsx'));
const Dashboard = React.lazy(() => import('./pages/Dashboard.tsx'));
const Quality = React.lazy(() => import('./pages/Quality.tsx'));
const Admin = React.lazy(() => import('./pages/Admin.tsx'));
const NotFound = React.lazy(() => import('./pages/NotFound.tsx'));

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";

// --- Internal Components for Routing Logic ---

const LoadingScreen = ({ message = "Carregando Portal" }: { message?: string }) => (
  <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center text-white relative">
      {/* Texture for Premium Loading */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse"></div>
        <img src={LOGO_URL} alt="Loading Logo" className="h-32 relative z-10 drop-shadow-2xl" />
      </div>
      <Loader2 size={32} className="animate-spin text-blue-400 mb-4" />
      <p className="text-[10px] font-black text-slate-500 tracking-[4px] uppercase animate-pulse">{message}</p>
  </div>
);

const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user } = useAuth();
    
    if (user) {
        if (user.role === UserRole.QUALITY) return <Navigate to="/quality" replace />;
        if (user.role === UserRole.ADMIN) return <Navigate to="/admin" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// --- Main Routes Definition ---

export const AppRoutes: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
        
        {/* Maintenance Middleware wraps all protected routes */}
        <Route element={<MaintenanceMiddleware />}> 
            <Route element={<AuthMiddleware />}>
                {/* Dashboard (Client) */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Quality (Internal) */}
                <Route element={<RoleMiddleware allowedRoles={[UserRole.QUALITY, UserRole.ADMIN]} />}>
                    <Route path="/quality" element={<Quality />} />
                </Route>

                {/* Admin */}
                <Route element={<RoleMiddleware allowedRoles={[UserRole.ADMIN]} />}>
                    <Route path="/admin" element={<Admin />} />
                </Route>

                {/* Root Redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};
