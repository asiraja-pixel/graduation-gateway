import { createContext } from 'react';
import { 
  ClearanceRequest, 
  Department, 
  ClearanceStatus
} from '@/types';

export interface ClearanceContextType {
  requests: ClearanceRequest[];
  getStudentRequest: (studentId: string) => ClearanceRequest | undefined;
  getDepartmentRequests: (department: Department) => ClearanceRequest[];
  submitRequest: (request: Omit<ClearanceRequest, 'id' | 'submittedAt' | 'overallStatus' | 'departmentClearances'>) => void;
  processRequest: (requestId: string, department: Department, status: ClearanceStatus, staffId: string, staffName: string, staffSignature?: string, comment?: string) => void;
  overrideStatus: (requestId: string, department: Department, status: ClearanceStatus) => void;
}

export const ClearanceContext = createContext<ClearanceContextType | undefined>(undefined);
