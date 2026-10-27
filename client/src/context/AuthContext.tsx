import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { authApi, profileApi } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  quickDemoLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('scholar_track_token')
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Re-verify session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('scholar_track_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.user);
        } catch (e) {
          console.warn('Session expired or invalid, clearing stored token.');
          localStorage.removeItem('scholar_track_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Continue cleanup regardless
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('scholar_track_token');
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    const res = await profileApi.update(data);
    setUser(res.profile);
  };

  // 1-Click Demo Login for quick testing & evaluation
  const quickDemoLogin = async () => {
    try {
      await login({
        email: 'alex.student@example.com',
        password: 'Password123!',
      });
    } catch (e) {
      // If demo user does not exist yet, register it automatically!
      await register({
        name: 'Alex Sharma',
        email: 'alex.student@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        educationLevel: 'Undergraduate',
        academicPercentage: 84.5,
        annualIncome: 350000,
        state: 'Maharashtra',
        category: 'General',
        gender: 'Female',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
