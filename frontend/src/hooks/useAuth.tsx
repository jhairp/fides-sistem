import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser } from '../domain/types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password_hash: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (username: string, password_hash: string) => {
    const data = await apiService.login(username, password_hash);
    const accessToken = data.access;
    setToken(accessToken);
    localStorage.setItem('token', accessToken);

    const currentUser: AuthUser = {
      username: username,
      email: `${username.toLowerCase()}@fidessystem.org`,
      is_staff: true,
      is_superuser: username.toLowerCase() === 'superadmin'
    };
    setUser(currentUser);
    localStorage.setItem('user', JSON.stringify(currentUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
