
import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './services/authContext.tsx';
import { AppRoutes } from './routes.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
