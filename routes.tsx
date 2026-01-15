
import React, { Suspense, useMemo, useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AuthMiddleware } from './middlewares/AuthMiddleware.tsx';
import { RoleMiddleware } from './middlewares/RoleMiddleware.tsx';
import { MaintenanceMiddleware } from './middlewares/MaintenanceMiddleware.tsx';
import { useAuth } from './context/authContext.tsx';
import { UserRole, normalizeRole } from './types/index.ts';
import { ClientLayout } from './components/layout/ClientLayout.tsx'; // Importa ClientLayout

// Lazy loading das páginas
const ClientLoginPage = React.lazy(() => import('./pages/ClientLoginPage.tsx'));

const AdminDashboard = React.lazy(() => import('./pages/dashboards/AdminDashboard.tsx'));
const QualityDashboard = React.lazy(() => import('./pages/dashboards/QualityDashboard.tsx'));
const ClientPage = React.lazy(() => import('./pages/ClientPage.tsx'));
const QualityPage = React.lazy(() => import('./pages/QualityPage.tsx'));
const AdminPage = React.lazy(() => import('./pages/AdminPage.tsx'));
const ConfigPage = React.lazy(() => import('./pages/ConfigPage.tsx')); // Lazy load ConfigPage
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage.tsx'));
const FileInspection = React.lazy(() => import('./components/features/quality/views/FileInspection.tsx').then(m => ({ default: m.FileInspection })));

/**
 * Loader minimalista para transições de módulos, agora com opção de retry.
 */
const PageLoader = ({ message = "Carregando...", onRetry }: { message?: string; onRetry?: () => void }) => (
  <div className="h-screen w-screen bg-white flex flex-col items-center justify-center text-[#081437]">
      <Loader2 size={32} className="animate-spin text-blue-500 mb-6" />
      <p className="text-[10px] font-black text-slate-400 tracking-[6px] uppercase animate-pulse mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
        >
          <RefreshCw size={16} /> Tentar Novamente
        </button>
      )}
  </div>
);

/**
 * Componente que lida com a lógica inicial de autenticação, carregamento, erros e redirecionamentos.
 */
const InitialAuthRedirect = () => {
    const { user, systemStatus, isLoading, error: authError, isInitialSyncComplete, retryInitialSync } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();

    if (isLoading) {
        return <PageLoader message="Conectando ao sistema Vital" />;
    }

    if (isInitialSyncComplete && authError) {
        console.error("Erro no AuthContext após sincronização inicial:", authError);
        // Resolve a chave de erro através do i18n
        return <PageLoader message={`${t('auth.errors.unexpected')}: ${t(authError)}`} onRetry={retryInitialSync} />;
    }
    
    if (user && !systemStatus) {
        return <PageLoader message="Verificando a segurança do sistema" />;
    }

    if (user) {
        if (location.pathname === '/') {
            const role = normalizeRole(user.role);
            const roleRoutes: Record<UserRole, string> = {
                [UserRole.ADMIN]: '/admin/dashboard',
                [UserRole.QUALITY]: '/quality/dashboard',
                [UserRole.CLIENT]: '/client/dashboard'
            };
            return <Navigate to={roleRoutes[role] || '/'} replace />;
        }
        return null;
    }

    if (!user && location.pathname === '/') {
      return <Navigate to="/login" replace />;
    }

    return null;
};

export const AppRoutes: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  return (
    <Suspense fallback={<PageLoader message="Finalizando carregamento" />}>
      <Routes>
        <Route path="/" element={<InitialAuthRedirect />} />
        <Route path="/login" element={<ClientLoginPage />} />

        <Route element={<MaintenanceMiddleware />}> 
            <Route element={<AuthMiddleware />}>
                <Route path="/settings" element={<ConfigPage />} /> 

                <Route element={<RoleMiddleware allowedRoles={[UserRole.ADMIN]} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin" element={<AdminPage />} /> 
                </Route>

                <Route element={<RoleMiddleware allowedRoles={[UserRole.QUALITY, UserRole.ADMIN]} />}>
                    <Route path="/quality/dashboard" element={<QualityDashboard />} />
                    <Route path="/quality" element={<QualityPage />} />
                    <Route path="/quality/files/:fileId" element={<FileInspection />} />
                </Route>

                <Route element={<RoleMiddleware allowedRoles={[UserRole.CLIENT, UserRole.ADMIN]} />}>
                    <Route 
                      path="/client/dashboard" 
                      element={<ClientPage />} 
                    />
                </Route>
            </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};
