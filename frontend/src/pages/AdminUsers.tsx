import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Search,
  UserPlus,
  User,
  Briefcase,
  Shield,
  Trash2,
  Edit
} from 'lucide-react';
import { User as UserType, DEPARTMENTS, getDepartmentLabel, UserRole, Department } from '@/types';
import { mockUsers } from '@/data/mockData';
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

export default function AdminUsers() {
  const [users, setUsers] = useState<UserType[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student' as UserRole,
    department: '' as Department | '',
    studentId: '',
    program: '',
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = () => {
    const user: UserType = {
      id: `user-${Date.now()}`,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      ...(newUser.role === 'staff' && newUser.department ? { department: newUser.department as Department } : {}),
      ...(newUser.role === 'student' ? { 
        studentId: newUser.studentId,
        program: newUser.program,
      } : {}),
    };
    setUsers(prev => [...prev, user]);
    setShowCreateDialog(false);
    setNewUser({
      name: '',
      email: '',
      role: 'student',
      department: '',
      studentId: '',
      program: '',
    });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'student': return User;
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
            const RoleIcon = getRoleIcon(user.role);
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
                    <Badge className={getRoleBadgeClass(user.role)}>
                      {user.role}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    {user.role === 'student' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Student ID</span>
                          <span>{user.studentId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Program</span>
                          <span>{user.program}</span>
                        </div>
                      </>
                    )}
                    {user.role === 'staff' && user.department && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Department</span>
                        <span>{getDepartmentLabel(user.department)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="flex-1" disabled>
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="w-3 h-3" />
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account for the clearance system.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@university.edu"
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value: UserRole) => setNewUser(prev => ({ ...prev, role: value }))}
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

              {newUser.role === 'student' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      value={newUser.studentId}
                      onChange={(e) => setNewUser(prev => ({ ...prev, studentId: e.target.value }))}
                      placeholder="STU2024XXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program">Program</Label>
                    <Input
                      id="program"
                      value={newUser.program}
                      onChange={(e) => setNewUser(prev => ({ ...prev, program: e.target.value }))}
                      placeholder="Computer Science"
                    />
                  </div>
                </>
              )}

              {newUser.role === 'staff' && (
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select 
                    value={newUser.department} 
                    onValueChange={(value: Department) => setNewUser(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(dept => (
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
                onClick={handleCreateUser}
                disabled={!newUser.name || !newUser.email}
                className="gradient-primary"
              >
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
