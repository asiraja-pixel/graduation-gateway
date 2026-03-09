import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

import { User } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface AuthContextType {

  user: User | null;

  token: string | null;

  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<boolean>;

  signup: (name: string, email: string, registrationNumber: string, password: string, accountType: 'student' | 'staff', program?: string, department?: string) => Promise<boolean>;

  logout: () => void;

}



const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(() => {

    const stored = localStorage.getItem('clearance_user');

    if (stored) {

      try {

        return JSON.parse(stored);

      } catch {

        return null;

      }

    }

    return null;

  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('clearance_token');
  });



  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.accountType,
          accountType: data.user.accountType,
          registrationNumber: data.user.registrationNumber,
          studentId: data.user.registrationNumber,
          program: data.user.program,
          department: data.user.department,
        };

        // Extract token from response if available
        const token = data.token || data.user.token;
        
        setUser(user);
        setToken(token);
        localStorage.setItem('clearance_user', JSON.stringify(user));
        if (token) {
          localStorage.setItem('clearance_token', token);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const signup = useCallback(async (
    name: string, 
    email: string, 
    registrationNumber: string, 
    password: string, 
    accountType: 'student' | 'staff',
    program?: string,
    department?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          registrationNumber, 
          password, 
          accountType,
          program: accountType === 'student' ? program : undefined,
          department: accountType === 'staff' ? department : undefined
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.accountType,
          accountType: data.user.accountType,
          registrationNumber: data.user.registrationNumber,
          studentId: data.user.registrationNumber,
          program: data.user.program,
          department: data.user.department,
        };

        setUser(user);
        setToken(data.token || data.user.token);
        localStorage.setItem('clearance_user', JSON.stringify(user));
        if (data.token || data.user.token) {
          localStorage.setItem('clearance_token', data.token || data.user.token);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  }, []);



  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('clearance_user');
    localStorage.removeItem('clearance_token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, signup, logout }}>
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

