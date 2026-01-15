import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext.tsx';
import { PageLoader } from '../routes.tsx'; // Importe o Loader que exportamos acima

export const AuthMiddleware: React.FC = () => {
  // 1. Busque também o isLoading
  const { user, isLoading } = useAuth();
  
  // 2. SE estiver carregando, segure a renderização aqui.
  // Isso impede que o código de baixo (redirecionamento) execute prematuramente.
  if (isLoading) {
    return <PageLoader message="Verificando credenciais..." />;
  }

  // 3. Agora é seguro verificar se o usuário existe
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};