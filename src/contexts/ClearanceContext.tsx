import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { ClearanceRequest, ClearanceStatus, Department, User } from '@/types';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface ClearanceContextType {
  requests: ClearanceRequest[];
  getStudentRequest: (studentId: string) => ClearanceRequest | undefined;
  getDepartmentRequests: (department: Department) => ClearanceRequest[];
  submitRequest: (request: Omit<ClearanceRequest, 'id' | 'submittedAt' | 'overallStatus' | 'departmentClearances'>) => void;
  processRequest: (requestId: string, department: Department, status: ClearanceStatus, staffId: string, staffName: string, comment?: string) => void;
  overrideStatus: (requestId: string, department: Department, status: ClearanceStatus) => void;
}

const ClearanceContext = createContext<ClearanceContextType | undefined>(undefined);

export function ClearanceProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const { token, user } = useAuth();

  // Fetch requests from backend when authenticated
  useEffect(() => {
    const fetchRequests = async () => {
      if (!token || !user) return;
      try {
        // Staff fetches all requests; students fetch only theirs
        const endpoint = user.accountType === 'staff' 
          ? '/api/clearance-requests'
          : '/api/clearance-requests/my';
        
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          console.log(`[ClearanceContext] Fetched ${data.length} requests for ${user.accountType}`);
          // Normalize backend documents: map MongoDB `_id` to `id` used in the UI
          const normalized = (data as any[]).map(d => ({ ...(d || {}), id: d._id || d.id }));
          setRequests(normalized as any);
        } else {
          console.warn(`[ClearanceContext] Failed to fetch requests: ${res.status}`);
        }
      } catch (e) {
        console.error('[ClearanceContext] Fetch error:', e);
      }
    };

    // Initial fetch
    fetchRequests();

    // Refetch every 15 seconds as a safety net for synchronization
    const interval = setInterval(fetchRequests, 15000);
    return () => clearInterval(interval);
  }, [token, user]);

  const { socket } = useSocket();

  // Listen for real-time updates via Socket.IO
  useEffect(() => {
    if (!socket || !token || !user) return;

    // Listen for new requests
    socket.on('new_request', (newRequest: ClearanceRequest) => {
      try {
        const normalized = { ...(newRequest as any), id: (newRequest as any)._id || (newRequest as any).id };
        console.log('[ClearanceContext] Received new_request event:', normalized.studentName);
        setRequests(prev => {
          // Check if request already exists to avoid duplicates
          if (prev.some(req => (req.id || (req as any)._id) === normalized.id)) {
            return prev;
          }
          return [normalized as any, ...prev];
        });
      } catch (e) {
        console.error('[ClearanceContext] Error handling new_request:', e);
      }
    });

    // Listen for status changes
    socket.on('status_changed', (update: { requestId: string; updatedRequest: ClearanceRequest }) => {
      try {
        const updated = { ...(update.updatedRequest as any), id: (update.updatedRequest as any)._id || (update.updatedRequest as any).id };
        console.log('[ClearanceContext] Received status_changed event');
        setRequests(prev => prev.map(req => 
          (req.id || (req as any)._id) === (update.requestId || (update.updatedRequest as any)._id) ? updated : req
        ));
      } catch (e) {
        console.error('[ClearanceContext] Error handling status_changed:', e);
      }
    });

    // Listen for user's request updates
    socket.on('your_request_updated', (updatedRequest: ClearanceRequest) => {
      try {
        const normalized = { ...(updatedRequest as any), id: (updatedRequest as any)._id || (updatedRequest as any).id };
        console.log('[ClearanceContext] Received your_request_updated event');
        setRequests(prev => {
          const exists = prev.some(req => (req.id || (req as any)._id) === normalized.id);
          if (exists) {
            return prev.map(req => (req.id || (req as any)._id) === normalized.id ? normalized : req);
          } else {
            return [normalized, ...prev];
          }
        });
      } catch (e) {
        console.error('[ClearanceContext] Error handling your_request_updated:', e);
      }
    });

    return () => {
      socket.off('new_request');
      socket.off('status_changed');
      socket.off('your_request_updated');
    };
  }, [socket, token, user]);

  const getStudentRequest = useCallback((studentId: string) => {
    return requests.find(r => r.studentId === studentId);
  }, [requests]);

  const getDepartmentRequests = useCallback((department: Department) => {
    const deptKey = typeof department === 'string' ? department.toLowerCase() : department;
    return requests.filter(r => {
      // Handle both array and object formats for departmentClearances
      if (Array.isArray(r.departmentClearances)) {
        return r.departmentClearances.some(dc => (dc.department as string).toLowerCase() === deptKey && dc.status === 'pending');
      } else if (typeof r.departmentClearances === 'object') {
        const deptData = (r.departmentClearances as any)[deptKey];
        return deptData && deptData.status === 'pending';
      }
      return false;
    });
  }, [requests]);

  const calculateOverallStatus = (clearances: ClearanceRequest['departmentClearances']): ClearanceStatus => {
    // Handle both array and object formats
    const clearanceArray = Array.isArray(clearances)
      ? clearances
      : Object.entries(clearances as any).map(([dept, data]) => ({
          department: dept as any,
          ...(typeof data === 'object' ? data : { status: 'pending' })
        }));

    if (clearanceArray.some(c => c.status === 'rejected')) return 'rejected';
    if (clearanceArray.every(c => c.status === 'approved')) return 'approved';
    return 'pending';
  };

  const submitRequest = useCallback((request: Omit<ClearanceRequest, 'id' | 'submittedAt' | 'overallStatus' | 'departmentClearances'>) => {
    // If backend is available and user is authenticated, POST to server
    (async () => {
      try {
        if (token) {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/clearance-requests`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(request)
          });
          if (res.ok) {
            const created = await res.json();
            const normalizedCreated = { ...(created as any), id: (created as any)._id || (created as any).id };
            setRequests(prev => [normalizedCreated as any, ...prev]);
            return;
          }
        }
      } catch (e) {
        // ignore and fall back to mock
      }

      const newRequest: ClearanceRequest = {
        ...request,
        id: `req-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        overallStatus: 'pending',
        departmentClearances: {
          library: { status: 'pending' },
          finance: { status: 'pending' },
          accommodation: { status: 'pending' },
          it: { status: 'pending' },
          academic: { status: 'pending' },
          registrar: { status: 'pending' },
        },
      };
      setRequests(prev => [...prev, newRequest]);
    })();
  }, [token]);

  const processRequest = useCallback((
    requestId: string, 
    department: Department, 
    status: ClearanceStatus, 
    staffId: string, 
    staffName: string, 
    comment?: string
  ) => {
    // Send update to backend first
    (async () => {
      try {
        if (token) {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/clearance-requests/${requestId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              department: typeof department === 'string' ? department.toLowerCase() : department,
              status,
              comment
            })
          });
          if (res.ok) {
            const updated = await res.json();
            const normalizedUpdated = { ...(updated as any), id: (updated as any)._id || (updated as any).id };
            setRequests(prev => prev.map(r => (r.id || (r as any)._id) === (requestId || (updated as any)._id) ? normalizedUpdated as any : r));
            return;
          }
        }
      } catch (e) {
        // fall back to local update
      }
    })();

    // Fallback: update local state
    setRequests(prev => prev.map(request => {
      if (request.id !== requestId) return request;
      
      let updatedClearances: ClearanceRequest['departmentClearances'];

      if (Array.isArray(request.departmentClearances)) {
        updatedClearances = request.departmentClearances.map(dc => {
          if (dc.department !== department) return dc;
          return {
            ...dc,
            status,
            staffId,
            staffName,
            comment,
            processedAt: new Date().toISOString(),
          };
        }) as any;
      } else {
        const deptKey = (typeof department === 'string' ? department.toLowerCase() : department) as keyof ClearanceRequest['departmentClearances'];
        updatedClearances = {
          ...request.departmentClearances,
          [deptKey]: {
            ...request.departmentClearances[deptKey],
            status,
            staffId,
            staffName,
            comment,
            processedAt: new Date().toISOString(),
          }
        };
      }

      const overallStatus = calculateOverallStatus(updatedClearances);
      
      return {
        ...request,
        departmentClearances: updatedClearances,
        overallStatus,
        completedAt: overallStatus !== 'pending' ? new Date().toISOString() : undefined,
      };
    }));
  }, [token]);

  const overrideStatus = useCallback((requestId: string, department: Department, status: ClearanceStatus) => {
    setRequests(prev => prev.map(request => {
      if (request.id !== requestId) return request;
      
      let updatedClearances: ClearanceRequest['departmentClearances'];

      if (Array.isArray(request.departmentClearances)) {
        updatedClearances = request.departmentClearances.map(dc => {
          if (dc.department !== department) return dc;
          return {
            ...dc,
            status,
            comment: dc.comment ? `${dc.comment} [Admin Override]` : '[Admin Override]',
            processedAt: new Date().toISOString(),
          };
        }) as any;
      } else {
        const deptKey = (typeof department === 'string' ? department.toLowerCase() : department) as keyof ClearanceRequest['departmentClearances'];
        updatedClearances = {
          ...request.departmentClearances,
          [deptKey]: {
            ...request.departmentClearances[deptKey],
            status,
            comment: request.departmentClearances[deptKey]?.comment ? `${request.departmentClearances[deptKey].comment} [Admin Override]` : '[Admin Override]',
            processedAt: new Date().toISOString(),
          }
        };
      }

      const overallStatus = calculateOverallStatus(updatedClearances);
      
      return {
        ...request,
        departmentClearances: updatedClearances,
        overallStatus,
        completedAt: overallStatus !== 'pending' ? new Date().toISOString() : undefined,
      };
    }));
  }, []);

  return (
    <ClearanceContext.Provider value={{
      requests,
      getStudentRequest,
      getDepartmentRequests,
      submitRequest,
      processRequest,
      overrideStatus,
    }}>
      {children}
    </ClearanceContext.Provider>
  );
}

export function useClearance() {
  const context = useContext(ClearanceContext);
  if (context === undefined) {
    throw new Error('useClearance must be used within a ClearanceProvider');
  }
  return context;
}
