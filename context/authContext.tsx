import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabaseClient'; 
import { userService } from '../lib/services/index'; 
// Assumindo que você exportou SupabaseAppService corretamente no arquivo appService
import { SupabaseAppService } from '../lib/services/appService'; 
import { User, SystemStatus } from '../types/index';

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
  // Adicionados para compatibilidade com routes.tsx e prevenção de loops
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

  // Flag crucial para o routes.tsx saber que a verificação inicial terminou
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
    // Não redirecionamos com window.location aqui; deixamos o estado atualizar.
  };

  const initializeApp = async () => {
    // Resetamos erro ao tentar novamente, mas mantemos isLoading true se for o primeiro load
    if (mounted.current) {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
    }

    try {
      // Verifica se existe sessão antes de tentar buscar dados
      const { data: { session } } = await supabase.auth.getSession();

      // Busca dados via RPC (Seu novo método blindado)
      const { user, systemStatus } = await SupabaseAppService.getInitialData();

      // DETECÇÃO DE SESSÃO ZUMBI:
      if (session && !user) {
        throw new Error("Sessão corrompida: Token existe mas usuário não encontrado.");
      }

      if (mounted.current) {
        // Fallback de segurança para status ONLINE
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
        // Se o erro for grave e não for apenas falta de internet, considere o logout
        // Aqui assumimos que se falhou o RPC, talvez seja melhor limpar se tivermos sessão
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await forceLogout();
        }

        setState({ 
          user: null, 
          isLoading: false, 
          error: "Não foi possível conectar ao servidor. " + (error.message || ""),
          systemStatus: { mode: 'ONLINE' } // Libera o sistema para mostrar erro ou login
        });
      }
    } finally {
        if (mounted.current) {
            setIsInitialSyncComplete(true);
        }
    }
  };

  useEffect(() => {
    mounted.current = true;
    initializeApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      // Só reage a mudanças reais para evitar loops de renderização
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
    // O onAuthStateChange cuidará de atualizar o estado após o login
    return { success: true };
  };

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await userService.logout();
      // Opcional: window.location.href = '/'; 
      // É melhor deixar o AuthMiddleware redirecionar, mas o force reload garante limpeza de memória
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