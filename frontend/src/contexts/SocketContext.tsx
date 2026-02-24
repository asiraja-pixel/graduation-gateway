import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  requests: any[];
  notifications: any[];
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

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user, token } = useAuth();

  useEffect(() => {
    if (token && user) {
      const newSocket = io((import.meta as any).env.VITE_API_URL || 'http://localhost:4000', {
        auth: {
          token: token
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to Socket.IO server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
        setIsConnected(false);
      });

      newSocket.on('connected', (data) => {
        console.log('Socket connected:', data);
      });

      // Listen for new requests (staff)
      newSocket.on('new_request', (request) => {
        setRequests(prev => [request, ...prev]);
        setNotifications(prev => [{
          id: Date.now(),
          type: 'info',
          message: `New clearance request from ${request.studentName}`,
          timestamp: new Date()
        }, ...prev]);
      });

      // Listen for status changes
      newSocket.on('status_changed', (update) => {
        setRequests(prev => prev.map(req => 
          req._id === update.requestId ? update.updatedRequest : req
        ));
        setNotifications(prev => [{
          id: Date.now(),
          type: update.status === 'approved' ? 'success' : 'warning',
          message: `Department ${update.department} ${update.status} request for ${update.updatedRequest.studentName}`,
          timestamp: new Date()
        }, ...prev]);
      });

      // Listen for user's request updates
      newSocket.on('your_request_updated', (updatedRequest) => {
        setRequests(prev => prev.map(req => 
          req._id === updatedRequest._id ? updatedRequest : req
        ));
      });

      // Listen for system notifications
      newSocket.on('system_notification', (notification) => {
        setNotifications(prev => [{
          id: Date.now(),
          ...notification
        }, ...prev]);
      });

      // Listen for errors
      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        setNotifications(prev => [{
          id: Date.now(),
          type: 'error',
          message: error.message || 'An error occurred',
          timestamp: new Date()
        }, ...prev]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [token, user]);

  const submitClearanceRequest = (payload?: {
    studentId?: string;
    studentName?: string;
    registrationNumber?: string;
    program?: string;
    email?: string;
  }) => {
    if (socket && user?.accountType === 'student') {
      socket.emit('clearance_request', {
        studentId: payload?.studentId || user.id,
        studentName: payload?.studentName || user.name,
        registrationNumber: payload?.registrationNumber || user.registrationNumber,
        program: payload?.program || user.program,
        email: payload?.email || user.email,
      });
    }
  };

  const updateDepartmentStatus = (requestId: string, department: string, status: string, comment?: string) => {
    const deptKey = department ? department.toLowerCase() : department;
    if (socket && user?.accountType === 'staff' && (user.department || '').toLowerCase() === deptKey) {
      socket.emit('status_update', {
        requestId,
        department: deptKey,
        status,
        comment
      });
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      requests,
      notifications,
      submitClearanceRequest,
      updateDepartmentStatus,
      clearNotifications
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
