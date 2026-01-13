
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { AuthMiddleware } from './middlewares/AuthMiddleware.tsx';
import { RoleMiddleware } from './middlewares/RoleMiddleware.tsx';
import { MaintenanceMiddleware } from './middlewares/MaintenanceMiddleware.tsx';
import { useAuth } from './context/authContext.tsx';
import { UserRole, normalizeRole } from './types/index.ts';

// Lazy pages
const Login = React.lazy(() => import('./pages/Login.tsx'));
const SignUp = React.lazy(() => import('./pages/SignUp.tsx'));
const ClientDashboard = React.lazy(() => import('./pages/dashboards/ClientDashboard.tsx'));
const AdminDashboard = React.lazy(() => import('./pages/dashboards/AdminDashboard.tsx'));
const QualityDashboard = React.lazy(() => import('./pages/dashboards/QualityDashboard.tsx'));
const QualityPage = React.lazy(() => import('./pages/QualityPage.tsx'));
const AdminPage = React.lazy(() => import('./pages/AdminPage.tsx'));
const FileInspection = React.lazy(() => import('./features/quality/views/FileInspection.tsx').then(m => ({ default: m.FileInspection })));
const NotFound = React.lazy(() => import('./pages/NotFound.tsx'));

const GlobalLoader = ({ message = "Vital Link" }: { message?: string }) => (
  <div className="h-screen w-screen bg-[#081437] flex flex-col items-center justify-center text-white">
      <Loader2 size={40} className="animate-spin text-[#62A5FA] mb-6" />
      <p className="text-[10px] font-black text-slate-400 tracking-[6px] uppercase animate-pulse">{message}</p>
  </div>
);

const RootRedirect = () => {
    const { user, isLoading } = useAuth();
    
    if (isLoading) return <GlobalLoader message="Sincronizando Sessão" />;
    if (!user) return <Navigate to="/login" replace />;
    
    const role = normalizeRole(user.role);
    
    if (role === UserRole.ADMIN) return <Navigate to="/admin/dashboard" replace />;
    if (role === UserRole.QUALITY) return <Navigate to="/quality/dashboard" replace />;
    return <Navigate to="/client/dashboard" replace />;
};

export const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <GlobalLoader message="Preparando Sistema" />;

  return (
    <Suspense fallback={<GlobalLoader message="Injetando Módulo" />}>
      <Routes>
        <Route path="/login" element={user ? <RootRedirect /> : <Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route element={<MaintenanceMiddleware />}> 
            <Route element={<AuthMiddleware />}>
                
                <Route path="/" element={<RootRedirect />} />
                <Route path="/dashboard" element={<RootRedirect />} />

                {/* ÁREA ADMIN */}
                <Route element={<RoleMiddleware allowedRoles={[UserRole.ADMIN]} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin" element={<AdminPage />} /> 
                </Route>

                {/* ÁREA QUALIDADE */}
                <Route element={<RoleMiddleware allowedRoles={[UserRole.QUALITY, UserRole.ADMIN]} />}>
                    <Route path="/quality/dashboard" element={<QualityDashboard />} />
                    <Route path="/quality" element={<QualityPage />} />
                    <Route path="/quality/inspect/:fileId" element={<FileInspection />} />
                </Route>

                {/* ÁREA CLIENTE - PROTEGIDA POR ROLE */}
                <Route element={<RoleMiddleware allowedRoles={[UserRole.CLIENT, UserRole.QUALITY, UserRole.ADMIN]} />}>
                    <Route path="/client/dashboard" element={<ClientDashboard />} />
                </Route>

            </Route>
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};
