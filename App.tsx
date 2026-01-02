import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './services/authContext.tsx';
import { AppRoutes } from './routes.tsx';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;