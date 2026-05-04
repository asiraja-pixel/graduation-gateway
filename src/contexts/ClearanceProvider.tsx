import { useState, useCallback, ReactNode, useEffect } from 'react';
import { 
  ClearanceRequest, 
  Department, 
  ClearanceStatus, 
  DepartmentClearance 
} from '../types';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { normalizeClearances } from '../utils/clearanceUtils';
import { ClearanceContext } from './ClearanceContext';

const API_BASE_URL = ((import.meta as unknown) as { env: Record<string, string> }).env.VITE_API_URL || '';

interface SystemSettings {
  staffDefaultComment?: string;
  adminDefaultComment?: string;
  [key: string]: unknown;
}

export function ClearanceProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    staffDefaultComment: 'Cleared successfully.',
    adminDefaultComment: 'Clearance approved by administrative override.'
  });
  const { token, user } = useAuth();

  // Fetch system settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSystemSettings(data);
        }
      } catch (error) {
        console.error('Failed to fetch settings in ClearanceContext:', error);
      }
    };
    fetchSettings();
  }, [token]);

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
          const normalized = (data as ClearanceRequest[]).map(d => ({ 
            ...d, 
            id: d.id || d._id || '',
            studentId: d.studentId || d.registrationNumber || '',
            studentIdNumber: d.registrationNumber || d.studentIdNumber || '',
            departmentClearances: normalizeClearances(d.departmentClearances)
          }));
          setRequests(normalized);
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
        const normalized = { 
          ...newRequest, 
          id: newRequest.id || newRequest._id || '',
          studentIdNumber: newRequest.registrationNumber || newRequest.studentIdNumber || '',
          departmentClearances: normalizeClearances(newRequest.departmentClearances)
        };
        console.log('[ClearanceContext] Received new_request event:', normalized.studentName);
        setRequests(prev => {
          // Check if request already exists to avoid duplicates
          if (prev.some(req => req.id === normalized.id)) {
            return prev;
          }
          return [normalized, ...prev];
        });
      } catch (e) {
        console.error('[ClearanceContext] Error handling new_request:', e);
      }
    });

    // Listen for status changes
    socket.on('status_changed', (update: { requestId: string; updatedRequest: ClearanceRequest }) => {
      try {
        const updated = { 
          ...update.updatedRequest, 
          id: update.updatedRequest.id || update.updatedRequest._id || '',
          studentIdNumber: update.updatedRequest.registrationNumber || update.updatedRequest.studentIdNumber || '',
          departmentClearances: normalizeClearances(update.updatedRequest.departmentClearances)
        };
        console.log('[ClearanceContext] Received status_changed event');
        setRequests(prev => prev.map(req => 
          req.id === (update.requestId || update.updatedRequest.id) ? updated : req
        ));
      } catch (e) {
        console.error('[ClearanceContext] Error handling status_changed:', e);
      }
    });

    // Listen for user's request updates
    socket.on('your_request_updated', (updatedRequest: ClearanceRequest) => {
      try {
        const normalized = { 
          ...updatedRequest, 
          id: updatedRequest.id || updatedRequest._id || '',
          departmentClearances: normalizeClearances(updatedRequest.departmentClearances)
        };
        console.log('[ClearanceContext] Received your_request_updated event');
        setRequests(prev => {
          const exists = prev.some(req => req.id === normalized.id);
          if (exists) {
            return prev.map(req => req.id === normalized.id ? normalized : req);
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
      const clearances = r.departmentClearances as Record<string, DepartmentClearance>;
      const deptData = clearances[deptKey];
      return deptData && deptData.status === 'pending';
    });
  }, [requests]);

  const calculateOverallStatus = useCallback((clearances: ClearanceRequest['departmentClearances']): ClearanceStatus => {
    const clearanceArray = Object.values(clearances) as DepartmentClearance[];

    if (clearanceArray.some(c => c.status === 'rejected')) return 'rejected';
    if (clearanceArray.every(c => c.status === 'approved')) return 'completed';
    return 'pending';
  }, []);

  const submitRequest = useCallback((request: Omit<ClearanceRequest, 'id' | 'submittedAt' | 'overallStatus' | 'departmentClearances'>) => {
    // If backend is available and user is authenticated, POST to server
    (async () => {
      try {
        if (token) {
          const res = await fetch(`${((import.meta as unknown) as { env: Record<string, string> }).env.VITE_API_URL || 'http://localhost:4000'}/api/clearance-requests`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(request)
          });
          if (res.ok) {
            const created = await res.json();
            const normalizedCreated = { 
              ...created, 
              id: created.id || created._id,
              departmentClearances: normalizeClearances(created.departmentClearances)
            };
            setRequests(prev => [normalizedCreated, ...prev]);
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
          library: { department: 'library', status: 'pending' },
          finance: { department: 'finance', status: 'pending' },
          accommodation: { department: 'accommodation', status: 'pending' },
          dean: { department: 'dean', status: 'pending' },
          registrar: { department: 'registrar', status: 'pending' },
          department: { department: 'department', status: 'pending' },
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
    staffSignature?: string,
    comment?: string
  ) => {
    const finalComment = (comment && comment.trim() !== '') 
      ? comment 
      : (status === 'approved' ? (systemSettings.staffDefaultComment || 'Cleared successfully.') : comment);

    // Send update to backend first
    (async () => {
      try {
        if (token) {
          const res = await fetch(`${((import.meta as unknown) as { env: Record<string, string> }).env.VITE_API_URL || 'http://localhost:4000'}/api/clearance-requests/${requestId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              department: typeof department === 'string' ? department.toLowerCase() : department,
              status,
              comment: finalComment
            })
          });
          if (res.ok) {
            const updated = await res.json();
            const normalizedUpdated = { 
              ...updated, 
              id: updated.id || updated._id,
              departmentClearances: normalizeClearances(updated.departmentClearances)
            };
            setRequests(prev => prev.map(r => r.id === (requestId || normalizedUpdated.id) ? normalizedUpdated : r));
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
      
      const deptKey = (typeof department === 'string' ? department.toLowerCase() : department) as string;
      const clearances = request.departmentClearances as Record<string, DepartmentClearance>;
      
      const updatedClearances = {
        ...clearances,
        [deptKey]: {
          ...clearances[deptKey],
          status,
          staffId,
          staffName,
          staffSignature,
          comment: finalComment,
          processedAt: new Date().toISOString(),
        }
      } as unknown as ClearanceRequest['departmentClearances'];

      const overallStatus = calculateOverallStatus(updatedClearances);
      
      return {
        ...request,
        departmentClearances: updatedClearances,
        overallStatus,
        completedAt: overallStatus !== 'pending' ? new Date().toISOString() : undefined,
      };
    }));
  }, [token, calculateOverallStatus, systemSettings.staffDefaultComment]);

  const overrideStatus = useCallback((requestId: string, department: Department, status: ClearanceStatus) => {
    setRequests(prev => prev.map(request => {
      if (request.id !== requestId) return request;
      
      const deptKey = (typeof department === 'string' ? department.toLowerCase() : department) as string;
      const clearances = request.departmentClearances as Record<string, DepartmentClearance>;
      
      const updatedClearances = {
        ...clearances,
        [deptKey]: {
          ...clearances[deptKey],
          status,
          comment: systemSettings.adminDefaultComment || 'Clearance approved by administrative override.',
          processedAt: new Date().toISOString(),
        }
      } as unknown as ClearanceRequest['departmentClearances'];

      const overallStatus = calculateOverallStatus(updatedClearances);
      
      return {
        ...request,
        departmentClearances: updatedClearances,
        overallStatus,
        completedAt: overallStatus !== 'pending' ? new Date().toISOString() : undefined,
      };
    }));
  }, [calculateOverallStatus, systemSettings.adminDefaultComment]);

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
