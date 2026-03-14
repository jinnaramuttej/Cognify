'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDataStore } from '@/lib/data';

interface User {
  id: string;
  name: string;
  email: string;
  stream: string;
  class: string;
  role: 'student' | 'teacher' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication on mount
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('cognify_token');
      const userDataStr = localStorage.getItem('cognify_user');

      if (token && userDataStr) {
        const userData = JSON.parse(userDataStr) as User;
        setUser(userData);
        setIsLoading(false);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);

      // Simulate API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const userData = data.user as User;

      // Save token and user data
      localStorage.setItem('cognify_token', data.token);
      localStorage.setItem('cognify_user', JSON.stringify(userData));

      setUser(userData);
      setIsLoading(false);

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      // Simulate API call
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      // Clear all auth data
      localStorage.removeItem('cognify_token');
      localStorage.removeItem('cognify_user');

      setUser(null);
      setIsLoading(false);

      // Redirect to auth
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
      // Still clear storage even on error
      localStorage.removeItem('cognify_token');
      localStorage.removeItem('cognify_user');
      setUser(null);
      setIsLoading(false);
    }
  }, [router, user?.id]);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
