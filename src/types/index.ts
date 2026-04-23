export type UserRole = 'student' | 'staff' | 'admin';

export type ClearanceStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export type Department = 
  | 'library' 
  | 'finance' 
  | 'accommodation' 
  | 'dean'
  | 'registrar'
  | 'department';

export interface User {
  id: string;
  _id?: string; // MongoDB compatibility
  email: string;
  name: string;
  role: UserRole;
  accountType: UserRole; // For API compatibility
  registrationNumber: string; // For API compatibility
  department?: Department; // For staff members
  studentId?: string; // For students
  program?: string; // For students
  nationality?: string;
  gender?: string;
  phoneNumber?: string;
  address?: string;
  startYear?: string;
  endYear?: string;
  signature?: string; // For staff
}

export interface DepartmentClearance {
  department: Department;
  status: ClearanceStatus;
  staffId?: string;
  staffName?: string;
  staffSignature?: string;
  comment?: string;
  processedAt?: string;
  timestamp?: string | Date;
}

export interface ClearanceRequest {
  id: string;
  _id?: string; // MongoDB compatibility
  studentId: string;
  studentName: string;
  registrationNumber: string; // Matches backend field name
  studentIdNumber?: string; // Kept for frontend legacy support
  program: string;
  email: string;
  departmentClearances: {
    library: DepartmentClearance;
    finance: DepartmentClearance;
    accommodation: DepartmentClearance;
    dean: DepartmentClearance;
    registrar: DepartmentClearance;
    department: DepartmentClearance;
  };
  overallStatus: ClearanceStatus;
  submittedAt: string;
  completedAt?: string;
}

export const DEPARTMENTS: { value: Department; label: string }[] = [
  { value: 'library', label: 'Library' },
  { value: 'finance', label: 'Finance' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'dean', label: 'Dean of Students' },
  { value: 'registrar', label: 'Registrar' },
  { value: 'department', label: 'Head of Department (HoD)' },
];

export const getDepartmentLabel = (dept: Department): string => {
  return DEPARTMENTS.find(d => d.value === dept)?.label || dept;
};
