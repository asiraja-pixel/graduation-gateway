import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ClearanceRequest, ClearanceStatus, Department, User } from '@/types';
import { mockClearanceRequests } from '@/data/mockData';

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
  const [requests, setRequests] = useState<ClearanceRequest[]>(mockClearanceRequests);

  const getStudentRequest = useCallback((studentId: string) => {
    return requests.find(r => r.studentId === studentId);
  }, [requests]);

  const getDepartmentRequests = useCallback((department: Department) => {
    return requests.filter(r => 
      r.departmentClearances.some(dc => dc.department === department && dc.status === 'pending')
    );
  }, [requests]);

  const calculateOverallStatus = (clearances: ClearanceRequest['departmentClearances']): ClearanceStatus => {
    if (clearances.some(c => c.status === 'rejected')) return 'rejected';
    if (clearances.every(c => c.status === 'approved')) return 'approved';
    return 'pending';
  };

  const submitRequest = useCallback((request: Omit<ClearanceRequest, 'id' | 'submittedAt' | 'overallStatus' | 'departmentClearances'>) => {
    const newRequest: ClearanceRequest = {
      ...request,
      id: `req-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      overallStatus: 'pending',
      departmentClearances: [
        { department: 'library', status: 'pending' },
        { department: 'finance', status: 'pending' },
        { department: 'accommodation', status: 'pending' },
        { department: 'it', status: 'pending' },
        { department: 'academic', status: 'pending' },
      ],
    };
    setRequests(prev => [...prev, newRequest]);
  }, []);

  const processRequest = useCallback((
    requestId: string, 
    department: Department, 
    status: ClearanceStatus, 
    staffId: string, 
    staffName: string, 
    comment?: string
  ) => {
    setRequests(prev => prev.map(request => {
      if (request.id !== requestId) return request;
      
      const updatedClearances = request.departmentClearances.map(dc => {
        if (dc.department !== department) return dc;
        return {
          ...dc,
          status,
          staffId,
          staffName,
          comment,
          processedAt: new Date().toISOString(),
        };
      });

      const overallStatus = calculateOverallStatus(updatedClearances);
      
      return {
        ...request,
        departmentClearances: updatedClearances,
        overallStatus,
        completedAt: overallStatus !== 'pending' ? new Date().toISOString() : undefined,
      };
    }));
  }, []);

  const overrideStatus = useCallback((requestId: string, department: Department, status: ClearanceStatus) => {
    setRequests(prev => prev.map(request => {
      if (request.id !== requestId) return request;
      
      const updatedClearances = request.departmentClearances.map(dc => {
        if (dc.department !== department) return dc;
        return {
          ...dc,
          status,
          comment: dc.comment ? `${dc.comment} [Admin Override]` : '[Admin Override]',
          processedAt: new Date().toISOString(),
        };
      });

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
