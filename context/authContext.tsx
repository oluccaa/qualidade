
import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { userService } from '../lib/services';
import { appService } from '../lib/services/appService.tsx';
import { logAction } from '../lib/services/loggingService.ts';
import { User, SystemStatus } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  systemStatus: SystemStatus | null;
  error: string | null;
  isInitialSyncComplete: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  retryInitialSync: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    systemStatus: null,
    error: null,
    isInitialSyncComplete: false,
  });

  const mounted = useRef(true);

  const refreshAuth = async () => {
    try {
      const { user, systemStatus } = await appService.getInitialData();
      
      if (mounted.current) {
        setState({
          user,
          systemStatus,
          isLoading: false,
          error: null,
          isInitialSyncComplete: true,
        });
      }
    } catch (error) {
      if (mounted.current) setState(s => ({ ...s, isLoading: false, error: "Erro de conexão", isInitialSyncComplete: true }));
    }
  };

  const retryInitialSync = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true, error: null, isInitialSyncComplete: false }));
    await refreshAuth();
  }, []);

  useEffect(() => {
    mounted.current = true;
    refreshAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
          // Log de login bem-sucedido
          // Nota: Como o refreshAuth é assíncrono, pegamos dados básicos da sessão
          await logAction(null, 'USER_LOGIN', session.user.email || 'unknown', 'AUTH', 'INFO', 'SUCCESS', {
              userId: session.user.id,
              authEvent: event
          });
          setState(s => ({ ...s, isLoading: true, isInitialSyncComplete: false }));
          refreshAuth();
      }
      
      if (event === 'SIGNED_OUT') {
          setState(s => ({ ...s, user: null, isLoading: true, isInitialSyncComplete: false }));
          refreshAuth();
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setState(s => ({ ...s, isLoading: true }));
    const result = await userService.authenticate(email, password);
    
    if (!result.success) {
      setState(s => ({ ...s, isLoading: false, error: result.error || 'Erro' }));
    }
    return result;
  };

  const logout = async () => {
    // Log de logout antes de destruir a sessão
    if (state.user) {
        await logAction(state.user, 'USER_LOGOUT', state.user.email, 'AUTH', 'INFO', 'SUCCESS');
    }
    
    await userService.logout();
    window.location.href = '/'; 
  };

  const value = useMemo(() => ({ ...state, login, logout, retryInitialSync }), [state, retryInitialSync]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};
