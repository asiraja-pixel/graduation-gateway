import { useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { ClearanceRequest } from '../types';
import { SocketContext } from './SocketContext';

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [notifications, setNotifications] = useState<unknown[]>([]);
  const { user, token } = useAuth();

  useEffect(() => {
    if (token && user) {
      const apiUrl = (import.meta as unknown as { env: { VITE_API_URL: string } }).env.VITE_API_URL || '';
      const newSocket = io(apiUrl, {
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

      newSocket.on('new_request', (request: ClearanceRequest) => {
        setRequests(prev => [request, ...prev]);
        setNotifications(prev => [
          {
            id: Math.random().toString(),
            type: 'new_request',
            message: `New clearance request from ${request.studentName}`,
            timestamp: new Date()
          },
          ...prev
        ]);
      });

      newSocket.on('status_changed', (data: { requestId: string; department: string; status: string; updatedRequest: ClearanceRequest; updatedBy: string }) => {
        const { updatedRequest, updatedBy, status } = data;
        setRequests(prev => prev.map(req => req._id === updatedRequest._id ? updatedRequest : req));
        setNotifications(prev => [
          {
            id: Math.random().toString(),
            type: 'status_update',
            message: `${updatedBy} updated a request to ${status}`,
            timestamp: new Date()
          },
          ...prev
        ]);
      });

      newSocket.on('your_request_updated', (updatedRequest: ClearanceRequest) => {
        setRequests(prev => prev.map(req => req._id === updatedRequest._id ? updatedRequest : req));
      });

      newSocket.on('department_request_updated', (updatedRequest: ClearanceRequest) => {
        setRequests(prev => prev.map(req => req._id === updatedRequest._id ? updatedRequest : req));
      });

      // Listen for system notifications
      newSocket.on('system_notification', (notification: { type: string; message: string }) => {
        setNotifications(prev => [{
          id: Date.now().toString(),
          ...notification,
          timestamp: new Date()
        }, ...prev]);
      });

      // Listen for errors
      newSocket.on('error', (error: { message: string }) => {
        console.error('Socket error:', error);
        setNotifications(prev => [{
          id: Date.now().toString(),
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
