
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types.ts';
import * as userService from './userService.ts';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  // Restore session on load
  useEffect(() => {
    const initSession = async () => {
      const storedUser = localStorage.getItem('acos_vital_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Re-validate user existence/status on reload
          try {
              // We mimic a "token validation" by re-fetching/authenticating or just checking existence
              // For simplicity in this mock, we trust the storage but update status if needed
              setUser(parsedUser);
          } catch {
             localStorage.removeItem('acos_vital_user');
          }
        } catch (e) {
          console.error("Failed to parse user session");
          localStorage.removeItem('acos_vital_user');
        }
      }
      setIsLoading(false);
    };

    initSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
        const foundUser = await userService.authenticate(email, password);
        
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem('acos_vital_user', JSON.stringify(foundUser));
          setIsLoading(false);
          return { success: true };
        } else {
          setIsLoading(false);
          return { success: false, error: 'Credenciais inválidas.' };
        }
    } catch (error: any) {
        console.error("Login error", error);
        setIsLoading(false);
        return { success: false, error: error.message || 'Erro ao autenticar.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('acos_vital_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
