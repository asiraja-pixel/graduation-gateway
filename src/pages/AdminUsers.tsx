import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Search,
  UserPlus,
  User as UserIcon,
  Briefcase,
  Shield,
  Trash2,
  Edit,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { User as UserType, DEPARTMENTS, getDepartmentLabel, UserRole, Department } from '@/types';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface UserFormState extends Partial<UserType> {
  password?: string;
}

// API Functions
const fetchUsers = async (token: string): Promise<UserType[]> => {
  const res = await fetch(`${API_BASE_URL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

const createUser = async (token: string, userData: UserFormState): Promise<UserType> => {
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to create user');
  }
  return res.json();
};

const deleteUser = async (token: string, userId: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete user');
};

export default function AdminUsers() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error, refetch } = useQuery<UserType[], Error>({
    queryKey: ['admin-users'],
    queryFn: () => fetchUsers(token!),
    enabled: !!token,
  });

  const createUserMutation = useMutation<UserType, Error, UserFormState>({
    mutationFn: (newUser) => createUser(token!, newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowCreateDialog(false);
    },
  });

  const deleteUserMutation = useMutation<void, Error, string>({
    mutationFn: (userId) => deleteUser(token!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newUser, setNewUser] = useState<UserFormState>({
    name: '',
    email: '',
    password: '',
    accountType: 'student',
    department: undefined,
    program: undefined,
    registrationNumber: ''
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.accountType === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = () => {
    createUserMutation.mutate(newUser);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'student': return UserIcon;
      case 'staff': return Briefcase;
      case 'admin': return Shield;
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'student': return 'bg-primary/10 text-primary';
      case 'staff': return 'bg-accent/10 text-accent';
      case 'admin': return 'bg-status-approved/10 text-status-approved';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Manage Users">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading users...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Manage Users">
        <div className="flex flex-col items-center justify-center h-64 bg-destructive/10 rounded-lg">
          <AlertTriangle className="w-10 h-10 text-destructive mb-4" />
          <h3 className="text-xl font-semibold text-destructive">Failed to Load Users</h3>
          <p className="text-muted-foreground mt-2">{error.message}</p>
          <Button variant="destructive" className="mt-4" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manage Users">
      <div className="space-y-6 animate-fade-in">
        <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Manage Users</h2>
            <p className="text-muted-foreground">
              {filteredUsers.length} of {users.length} users
            </p>
          </div>
          <Button className="gradient-primary" onClick={() => setShowCreateDialog(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Filters */}
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => {
            const RoleIcon = getRoleIcon(user.accountType);
            return (
              <Card key={user.id} className="card-elevated">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <RoleIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge className={getRoleBadgeClass(user.accountType)}>
                      {user.accountType}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    {user.accountType === 'student' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Registration No.</span>
                          <span>{user.registrationNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Program</span>
                          <span>{user.program}</span>
                        </div>
                      </>
                    )}
                    {user.accountType === 'staff' && user.department && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Department</span>
                        <span>{getDepartmentLabel(user.department as Department)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="flex-1" disabled>
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deleteUserMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="card-elevated">
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-muted-foreground">No users match your search criteria.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create User Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account. They will receive an email with their login credentials.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john@university.edu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.accountType}
                  onValueChange={(value: UserRole) => setNewUser({ ...newUser, accountType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newUser.accountType === 'student' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Registration Number</Label>
                    <Input
                      id="studentId"
                      value={newUser.registrationNumber}
                      onChange={(e) => setNewUser({ ...newUser, registrationNumber: e.target.value })}
                      placeholder="STU2024001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program">Program</Label>
                    <Input
                      id="program"
                      value={newUser.program}
                      onChange={(e) => setNewUser({ ...newUser, program: e.target.value })}
                      placeholder="Computer Science"
                    />
                  </div>
                </>
              )}

              {newUser.accountType === 'staff' && (
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={newUser.department}
                    onValueChange={(value: Department) => setNewUser({ ...newUser, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                className="gradient-primary" 
                onClick={handleCreateUser}
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
