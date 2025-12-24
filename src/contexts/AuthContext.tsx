import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { LoginCredentials } from '../types/auth';
import { login as authLogin } from '../services/auth-service';

export type AuthContextValue = {
  isAuthenticated: boolean;
  login: (creds: LoginCredentials) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (creds: LoginCredentials) => {
    try {
      await authLogin(creds.email, creds.password);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('AuthContext:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
