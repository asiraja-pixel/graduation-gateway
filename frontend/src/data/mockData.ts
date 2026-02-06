import { User, ClearanceRequest, Department } from '@/types';



export const mockUsers: User[] = [

  {

    id: 'student-1',

    email: 'john.doe@university.edu',

    name: 'John Doe',

    role: 'student',

    studentId: 'STU2024001',

    program: 'Computer Science',

  },

  {

    id: 'student-2',

    email: 'jane.smith@university.edu',

    name: 'Jane Smith',

    role: 'student',

    studentId: 'STU2024002',

    program: 'Business Administration',

  },

  {

    id: 'student-3',

    email: 'mike.johnson@university.edu',

    name: 'Mike Johnson',

    role: 'student',

    studentId: 'STU2024003',

    program: 'Electrical Engineering',

  },

  {

    id: 'staff-library',

    email: 'library.staff@university.edu',

    name: 'Sarah Wilson',

    role: 'staff',

    department: 'library',

  },

  {

    id: 'staff-finance',

    email: 'finance.staff@university.edu',

    name: 'Robert Brown',

    role: 'staff',

    department: 'finance',

  },

  {

    id: 'staff-accommodation',

    email: 'accommodation.staff@university.edu',

    name: 'Emily Davis',

    role: 'staff',

    department: 'accommodation',

  },

  {

    id: 'staff-it',

    email: 'it.staff@university.edu',

    name: 'David Lee',

    role: 'staff',

    department: 'it',

  },

  {

    id: 'staff-academic',

    email: 'academic.staff@university.edu',

    name: 'Lisa Martinez',

    role: 'staff',

    department: 'academic',

  },

  {

    id: 'admin-1',

    email: 'admin@university.edu',

    name: 'Admin User',

    role: 'admin',

  },

];



export const mockClearanceRequests: ClearanceRequest[] = [

  {

    id: 'req-1',

    studentId: 'student-1',

    studentName: 'John Doe',

    studentIdNumber: 'STU2024001',

    program: 'Computer Science',

    email: 'john.doe@university.edu',

    submittedAt: '2024-01-15T10:30:00Z',

    overallStatus: 'pending',

    departmentClearances: [

      { department: 'library', status: 'approved', staffId: 'staff-library', staffName: 'Sarah Wilson', processedAt: '2024-01-16T09:00:00Z' },

      { department: 'finance', status: 'approved', staffId: 'staff-finance', staffName: 'Robert Brown', processedAt: '2024-01-16T11:00:00Z' },

      { department: 'accommodation', status: 'pending' },

      { department: 'it', status: 'pending' },

      { department: 'academic', status: 'pending' },

    ],

  },

  {

    id: 'req-2',

    studentId: 'student-2',

    studentName: 'Jane Smith',

    studentIdNumber: 'STU2024002',

    program: 'Business Administration',

    email: 'jane.smith@university.edu',

    submittedAt: '2024-01-14T14:20:00Z',

    overallStatus: 'approved',

    completedAt: '2024-01-18T16:00:00Z',

    departmentClearances: [

      { department: 'library', status: 'approved', staffId: 'staff-library', staffName: 'Sarah Wilson', processedAt: '2024-01-15T09:00:00Z' },

      { department: 'finance', status: 'approved', staffId: 'staff-finance', staffName: 'Robert Brown', processedAt: '2024-01-15T11:00:00Z' },

      { department: 'accommodation', status: 'approved', staffId: 'staff-accommodation', staffName: 'Emily Davis', processedAt: '2024-01-16T10:00:00Z' },

      { department: 'it', status: 'approved', staffId: 'staff-it', staffName: 'David Lee', processedAt: '2024-01-17T14:00:00Z' },

      { department: 'academic', status: 'approved', staffId: 'staff-academic', staffName: 'Lisa Martinez', processedAt: '2024-01-18T16:00:00Z' },

    ],

  },

  {

    id: 'req-3',

    studentId: 'student-3',

    studentName: 'Mike Johnson',

    studentIdNumber: 'STU2024003',

    program: 'Electrical Engineering',

    email: 'mike.johnson@university.edu',

    submittedAt: '2024-01-16T08:45:00Z',

    overallStatus: 'rejected',

    departmentClearances: [

      { department: 'library', status: 'approved', staffId: 'staff-library', staffName: 'Sarah Wilson', processedAt: '2024-01-17T09:00:00Z' },

      { department: 'finance', status: 'rejected', staffId: 'staff-finance', staffName: 'Robert Brown', comment: 'Outstanding tuition fees of $2,500. Please clear balance before resubmitting.', processedAt: '2024-01-17T11:00:00Z' },

      { department: 'accommodation', status: 'pending' },

      { department: 'it', status: 'pending' },

      { department: 'academic', status: 'pending' },

    ],

  },

];



// Demo credentials for easy testing

export const demoCredentials = {

  student: { email: 'john.doe@university.edu', password: 'password123' },

  staff: { email: 'library.staff@university.edu', password: 'password123' },

  admin: { email: 'admin@university.edu', password: 'password123' },

};

