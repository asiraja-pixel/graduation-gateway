import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

import { User } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface AuthContextType {

  user: User | null;

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
          studentId: data.user.registrationNumber,
          program: data.user.program,
          department: data.user.department,
        };

        setUser(user);
        localStorage.setItem('clearance_user', JSON.stringify(user));
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
          studentId: data.user.registrationNumber,
          program: data.user.program,
          department: data.user.department,
        };

        setUser(user);
        localStorage.setItem('clearance_user', JSON.stringify(user));
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

    localStorage.removeItem('clearance_user');

  }, []);



  return (

    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>

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

