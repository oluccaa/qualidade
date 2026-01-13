
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.ts';
import { userService } from '../lib/services/index.ts';
import { User } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await userService.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error("[AuthContext] Erro ao sincronizar perfil:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
            await refreshUser();
        }
        if (mounted) setIsLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Quando loga, sincronizamos o perfil. 
      // Removido o logout automático agressivo do observer para evitar loops de latência.
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (mounted) {
            const profile = await refreshUser();
            setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
            setUser(null);
            setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await userService.authenticate(email, password);
      
      if (!result.success) {
        setIsLoading(false);
        return result;
      }

      // Após sucesso no Auth, forçamos a busca do perfil
      const profile = await refreshUser();
      
      if (!profile) {
        // Se após o login bem sucedido o perfil não vier, aí sim limpamos a sessão
        await userService.logout();
        setIsLoading(false);
        return { success: false, error: "Seu perfil de acesso não foi localizado. Verifique com a TI." };
      }
      
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: "Falha na comunicação com o servidor de segurança." };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await userService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshProfile: refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
