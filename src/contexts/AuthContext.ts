import { createContext } from 'react';
import { User } from '@/types';

export interface AuthContextType {
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
