export type UserRole = 'student' | 'staff' | 'admin';

export type ClearanceStatus = 'pending' | 'approved' | 'rejected';

export type Department = 
  | 'library' 
  | 'finance' 
  | 'accommodation' 
  | 'it' 
  | 'academic';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: Department; // For staff members
  studentId?: string; // For students
  program?: string; // For students
}

export interface DepartmentClearance {
  department: Department;
  status: ClearanceStatus;
  staffId?: string;
  staffName?: string;
  comment?: string;
  processedAt?: string;
}

export interface ClearanceRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  program: string;
  email: string;
  departmentClearances: DepartmentClearance[];
  overallStatus: ClearanceStatus;
  submittedAt: string;
  completedAt?: string;
}

export const DEPARTMENTS: { value: Department; label: string }[] = [
  { value: 'library', label: 'Library' },
  { value: 'finance', label: 'Finance' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'it', label: 'IT Department' },
  { value: 'academic', label: 'Academic Office' },
];

export const getDepartmentLabel = (dept: Department): string => {
  return DEPARTMENTS.find(d => d.value === dept)?.label || dept;
};
