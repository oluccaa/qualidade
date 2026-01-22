
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AuthMiddleware } from './middlewares/AuthMiddleware.tsx';
import { RoleMiddleware } from './middlewares/RoleMiddleware.tsx';
import { MaintenanceMiddleware } from './middlewares/MaintenanceMiddleware.tsx';
import { useAuth } from './context/authContext.tsx';
import { UserRole, normalizeRole } from './types/index.ts';
import { safeLazy } from './lib/utils/safeLazy.ts';

// Autenticação
const ClientLoginPage = safeLazy(() => import('./pages/auth/ClientLoginPage.tsx'));
const StaffLoginPage = safeLazy(() => import('./pages/auth/StaffLoginPage.tsx'));

// Domínio Administrador
const AdminDashboard = safeLazy(() => import('./pages/admin/AdminDashboard.tsx'));
const AdminConsole = safeLazy(() => import('./pages/admin/AdminConsole.tsx'));

// Domínio Qualidade
const QualityDashboard = safeLazy(() => import('./pages/quality/QualityDashboard.tsx'));
const QualityMonitor = safeLazy(() => import('./pages/quality/QualityMonitor.tsx'));
const QualityPortfolio = safeLazy(() => import('./pages/quality/QualityPortfolio.tsx'));
const QualityAuditHistory = safeLazy(() => import('./pages/quality/QualityAuditHistory.tsx'));
const QualityUserManagement = safeLazy(() => import('./pages/quality/QualityUserManagement.tsx'));
const QualityExplorer = safeLazy(() => import('./pages/quality/QualityExplorer.tsx'));
const FileInspection = safeLazy(() => import('./components/features/quality/views/FileInspection.tsx').then(m => ({ default: m.FileInspection })));

// Domínio Cliente
const ClientPortal = safeLazy(() => import('./pages/client/ClientPortal.tsx'));

// Domínio Compartilhado
const FilePreviewPage = safeLazy(() => import('./pages/shared/FilePreviewPage.tsx'));
const SettingsPage = safeLazy(() => import('./pages/shared/SettingsPage.tsx'));
const NotFoundPage = safeLazy(() => import('./pages/shared/NotFoundPage.tsx'));

const PageLoader = ({ message, onRetry }: { message?: string; onRetry?: () => void }) => {
  const { t } = useTranslation();
  const defaultMessage = t('common.syncing');
  
  return (
    <div className="flex-1 w-full h-full bg-slate-50/50 flex flex-col items-center justify-center text-slate-600 font-sans min-h-screen lg:min-h-0">
        <div className="relative mb-12">
          <Loader2 size={64} className="animate-spin text-blue-600" />
          <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full animate-pulse scale-150" />
        </div>
        <div className="text-center space-y-6 px-6 max-w-lg relative z-10">
            <p className="text-[11px] font-black text-slate-400 tracking-[8px] uppercase animate-pulse">{message || defaultMessage}</p>
            {onRetry && (
              <button onClick={onRetry} className="flex items-center gap-3 px-10 py-4 bg-white border-2 border-slate-200 text-[#132659] rounded-2xl text-xs font-black uppercase tracking-widest hover:border-blue-500 transition-all active:scale-95 shadow-xl mx-auto">
                <RefreshCw size={18} /> {t('common.retry')}
              </button>
            )}
        </div>
    </div>
  );
};

const InitialAuthRedirect = () => {
    const { user, isLoading, error, isInitialSyncComplete, retryInitialSync } = useAuth();
    const { t } = useTranslation();
    if (isLoading || !isInitialSyncComplete) return <PageLoader message={t('loaders.validatingProtocols')} />;
    if (error) return <PageLoader message={t('loaders.syncFailure')} onRetry={retryInitialSync} />;
    if (user) {
        const role = normalizeRole(user.role);
        if (role === UserRole.ADMIN) return <Navigate to="/admin/dashboard" replace />;
        if (role === UserRole.QUALITY) return <Navigate to="/quality/dashboard" replace />;
        if (role === UserRole.CLIENT) return <Navigate to="/client/portal" replace />;
    }
    return <Navigate to="/login" replace />;
};

export const AppRoutes: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<PageLoader message={t('loaders.preparingInterface')} />}>
      <Routes>
        <Route path="/" element={<InitialAuthRedirect />} />
        <Route path="/login" element={<ClientLoginPage />} />
        <Route path="/staff/login" element={<StaffLoginPage />} />

        <Route element={<MaintenanceMiddleware />}> 
            <Route element={<AuthMiddleware />}>
                <Route path="/settings" element={<SettingsPage />} /> 
                <Route path="/preview/:fileId" element={<FilePreviewPage />} />
                
                <Route element={<RoleMiddleware allowedRoles={[UserRole.QUALITY, UserRole.CLIENT]} />}>
                    <Route path="/quality/inspection/:fileId" element={<FileInspection />} />
                </Route>

                <Route element={<RoleMiddleware allowedRoles={[UserRole.ADMIN]} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/console" element={<AdminConsole />} /> 
                </Route>

                <Route element={<RoleMiddleware allowedRoles={[UserRole.QUALITY]} />}>
                    <Route path="/quality/dashboard" element={<QualityDashboard />} />
                    <Route path="/quality/monitor" element={<QualityMonitor />} />
                    <Route path="/quality/portfolio" element={<QualityPortfolio />} />
                    <Route path="/quality/users" element={<QualityUserManagement />} />
                    <Route path="/quality/explorer" element={<QualityExplorer />} />
                    <Route path="/quality/audit" element={<QualityAuditHistory />} />
                </Route>

                <Route element={<RoleMiddleware allowedRoles={[UserRole.CLIENT]} />}>
                    <Route path="/client/portal" element={<ClientPortal />} />
                </Route>
            </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};
