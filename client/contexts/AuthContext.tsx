import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User, AuthResponse, ErrorResponse } from '@shared/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, captcha: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, captcha: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Validate token and get user info
      fetchUserInfo(token);
    }
  }, []);

  const fetchUserInfo = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, captcha: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, captcha }),
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        toast.success('Login realizado com sucesso!');
        return true;
      } else {
        const error: ErrorResponse = await response.json();
        toast.error(error.message || 'Erro ao fazer login');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erro de conexão. Tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, captcha: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, captcha }),
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        toast.success('Conta criada com sucesso!');
        return true;
      } else {
        const error: ErrorResponse = await response.json();
        toast.error(error.message || 'Erro ao criar conta');
        return false;
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Erro de conexão. Tente novamente.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    toast.success('Logout realizado com sucesso!');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
