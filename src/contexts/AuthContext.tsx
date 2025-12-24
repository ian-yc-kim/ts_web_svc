import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { LoginCredentials } from '../types/auth';
import { login as authLogin, getToken, clearToken } from '../services/auth-service';

export type AuthContextValue = {
  isAuthenticated: boolean;
  login: (creds: LoginCredentials) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Initialize authentication state from persisted token
  useEffect(() => {
    try {
      const token = getToken();
      if (token) setIsAuthenticated(true);
    } catch (error) {
      console.error('AuthContext:init', error);
    }
  }, []);

  const login = async (creds: LoginCredentials) => {
    try {
      await authLogin(creds.email, creds.password);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('AuthContext:', error);
      throw error;
    }
  };

  const logout = () => {
    try {
      clearToken();
    } catch (error) {
      console.error('AuthContext:logout', error);
    }
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
