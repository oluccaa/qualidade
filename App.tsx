
import React, { Suspense } from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/authContext.tsx';
import { AppRoutes } from './routes.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import { NotificationProvider } from './context/notificationContext.tsx';
import { ScrollToTop } from './components/common/ScrollToTop.tsx';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './lib/i18n.ts';

const GlobalSuspenseFallback = () => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#132659] z-[9999]">
      {/* Background decorativo Full Screen */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-400/5 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-8">
          <Loader2 className="animate-spin text-blue-400" size={64} />
          <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20" size={24} />
        </div>
        <p className="text-[11px] font-black text-blue-100/40 uppercase tracking-[8px] animate-pulse">{t('loaders.preparingPortal')}</p>
      </div>
    </div>
  );
};

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<GlobalSuspenseFallback />}>
      <HashRouter>
        <ScrollToTop />
        <NotificationProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NotificationProvider>
      </HashRouter>
    </Suspense>
  </ErrorBoundary>
);

const App: React.FC = () => {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
};

export default App;
