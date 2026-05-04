import { createContext } from 'react';
import { Socket } from 'socket.io-client';
import { ClearanceRequest } from '@/types';

export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  requests: ClearanceRequest[];
  notifications: unknown[];
  submitClearanceRequest: (payload?: {
    studentId?: string;
    studentName?: string;
    registrationNumber?: string;
    program?: string;
    email?: string;
  }) => void;
  updateDepartmentStatus: (requestId: string, department: string, status: string, comment?: string) => void;
  clearNotifications: () => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);
