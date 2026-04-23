import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

import { User } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string, 
    email: string, 
    registrationNumber: string, 
    password: string, 
    accountType: string, 
    program?: string, 
    department?: string,
    nationality?: string,
    gender?: string,
    phoneNumber?: string,
    address?: string,
    startYear?: string,
    endYear?: string,
    signature?: string
  ) => Promise<{ success: boolean; error?: string }>;
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



  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = data.user;
        const user: User = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.accountType,
          accountType: userData.accountType,
          registrationNumber: userData.registrationNumber,
          studentId: userData.registrationNumber,
          program: userData.program,
          department: userData.department,
          nationality: userData.nationality,
          gender: userData.gender,
          phoneNumber: userData.phoneNumber,
          address: userData.address,
          startYear: userData.startYear,
          endYear: userData.endYear,
          signature: userData.signature,
        };

        // Extract token from response if available
        const token = (data.token || userData.token) as string;
        
        setUser(user);
        setToken(token);
        localStorage.setItem('clearance_user', JSON.stringify(user));
        if (token) {
          localStorage.setItem('clearance_token', token);
        }
        return { success: true };
      }
      
      return { success: false, error: data.error || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error or server unavailable' };
    }
  }, []);

  const signup = useCallback(async (
    name: string, 
    email: string, 
    registrationNumber: string, 
    password: string, 
    accountType: string,
    program?: string,
    department?: string,
    nationality?: string,
    gender?: string,
    phoneNumber?: string,
    address?: string,
    startYear?: string,
    endYear?: string,
    signature?: string
  ): Promise<{ success: boolean; error?: string }> => {
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
          program,
          department,
          nationality,
          gender,
          phoneNumber,
          address,
          startYear,
          endYear,
          signature
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = data.user;
        const user: User = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.accountType,
          accountType: userData.accountType,
          registrationNumber: userData.registrationNumber,
          studentId: userData.registrationNumber,
          program: userData.program,
          department: userData.department,
          nationality: userData.nationality,
          gender: userData.gender,
          phoneNumber: userData.phoneNumber,
          address: userData.address,
          startYear: userData.startYear,
          endYear: userData.endYear,
          signature: userData.signature,
        };

        setUser(user);
        const token = (data.token || userData.token) as string;
        setToken(token);
        localStorage.setItem('clearance_user', JSON.stringify(user));
        if (token) {
          localStorage.setItem('clearance_token', token);
        }
        return { success: true };
      }
      
      return { success: false, error: data.error || 'Signup failed' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error or server unavailable' };
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

