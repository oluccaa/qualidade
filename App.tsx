import React, { Suspense } from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/authContext.tsx';
import { AppRoutes } from './routes.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import { NotificationProvider } from './context/notificationContext.tsx';
import { Loader2 } from 'lucide-react';
import './lib/i18n.ts';

const GlobalLoading = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-slate-900">
    <Loader2 className="animate-spin text-blue-500" size={32} />
  </div>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<GlobalLoading />}>
        <HashRouter>
          <NotificationProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </NotificationProvider>
        </HashRouter>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;