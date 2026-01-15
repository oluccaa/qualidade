
import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { userService, appService } from '../lib/services/index.ts'; 
import { User, SystemStatus } from '../types/index.ts';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  systemStatus: SystemStatus | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  // Fix: Added missing properties required by routes.tsx
  isInitialSyncComplete: boolean;
  retryInitialSync: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    systemStatus: null,
  });

  // Fix: Added tracking for initial sync completion
  const [isInitialSyncComplete, setIsInitialSyncComplete] = useState(false);
  const mounted = useRef(true);

  // Função de Emergência para limpar tudo
  const forceLogout = async () => {
    console.warn("[Auth] Sessão inválida detectada. Realizando limpeza automática.");
    try {
      await supabase.auth.signOut();
      localStorage.clear();
    } catch (e) {
      console.error("Erro ao limpar sessão:", e);
    }
  };

  const initializeApp = async () => {
    // Fix: Ensure we reset the error state when retrying
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Busca dados via RPC utilizando o serviço injetado do barrel
      const { user, systemStatus } = await appService.getInitialData();

      if (session && !user) {
        throw new Error("Sessão corrompida: Token existe mas usuário não encontrado.");
      }

      if (mounted.current) {
        const safeSystemStatus: SystemStatus = systemStatus || { mode: 'ONLINE' };

        setState({
          user,
          systemStatus: safeSystemStatus,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: any) {
      console.error("[Auth] Erro na inicialização:", error);
      
      if (mounted.current) {
        await forceLogout();

        setState({ 
          user: null,
          isLoading: false, 
          error: "Sessão expirada. Faça login novamente.",
          systemStatus: { mode: 'ONLINE' }
        });
      }
    } finally {
      // Fix: Mark sync as complete even on failure
      if (mounted.current) {
        setIsInitialSyncComplete(true);
      }
    }
  };

  useEffect(() => {
    mounted.current = true;
    initializeApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        await initializeApp();
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const result = await userService.authenticate(email, password);
    if (!result.success) {
      setState(prev => ({ ...prev, isLoading: false, error: result.error }));
      return result;
    }
    return { success: true };
  };

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await userService.logout();
      window.location.href = '/'; 
    } catch (error) {
       console.error("Erro ao sair", error);
       setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const refreshProfile = async () => {
    await initializeApp();
  };

  const contextValue = useMemo(() => ({
    ...state,
    login,
    logout,
    refreshProfile,
    // Fix: Expose initial sync status and retry method
    isInitialSyncComplete,
    retryInitialSync: initializeApp
  }), [state, isInitialSyncComplete]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
