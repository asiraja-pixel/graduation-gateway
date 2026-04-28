import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/LanguageSelector';
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
  const data = await res.json();
  // Normalize MongoDB `_id` to `id` for UI consistency
  return (data as UserType[]).map(u => ({
    ...u,
    id: u.id || u._id || ''
  }));
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
  const data = await res.json();
  return {
    ...data,
    id: data.id || data._id || ''
  };
};

const deleteUser = async (token: string, userId: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete user');
};

const updateUser = async (token: string, userId: string, userData: UserFormState): Promise<UserType> => {
  const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to update user');
  }
  const data = await res.json();
  return {
    ...data,
    id: data.id || data._id || ''
  };
};

export default function AdminUsers() {
  const { t } = useTranslation();
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
      setNewUser({
        name: '',
        email: '',
        password: '',
        accountType: 'student',
        department: undefined,
        program: undefined,
        registrationNumber: '',
        nationality: '',
        gender: 'male',
        phoneNumber: '',
        address: '',
        startYear: '',
        endYear: ''
      });
    },
  });

  const deleteUserMutation = useMutation<void, Error, string>({
    mutationFn: (userId) => deleteUser(token!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const editUserMutation = useMutation<UserType, Error, { id: string, data: UserFormState }>({
    mutationFn: ({ id, data }) => updateUser(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowEditDialog(false);
      setEditingUser(null);
    },
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editForm, setEditForm] = useState<UserFormState>({});
  const [newUser, setNewUser] = useState<UserFormState>({
    name: '',
    email: '',
    password: '',
    accountType: 'student',
    department: undefined,
    program: undefined,
    registrationNumber: '',
    nationality: '',
    gender: 'male',
    phoneNumber: '',
    address: '',
    startYear: '',
    endYear: ''
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

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      registrationNumber: user.registrationNumber,
      program: user.program,
      department: user.department,
      nationality: user.nationality,
      gender: user.gender,
      phoneNumber: user.phoneNumber,
      address: user.address,
      startYear: user.startYear,
      endYear: user.endYear
    });
    setShowEditDialog(true);
  };

  const confirmEditUser = () => {
    if (editingUser) {
      editUserMutation.mutate({ id: editingUser.id, data: editForm });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm(t('dashboard.delete_confirm'))) {
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
      <DashboardLayout title={t('dashboard.manage_users')}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">{t('dashboard.loading_users')}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title={t('dashboard.manage_users')}>
        <div className="flex flex-col items-center justify-center h-64 bg-destructive/10 rounded-lg">
          <AlertTriangle className="w-10 h-10 text-destructive mb-4" />
          <h3 className="text-xl font-semibold text-destructive">{t('dashboard.failed_load_users')}</h3>
          <p className="text-muted-foreground mt-2">{error.message}</p>
          <Button variant="destructive" className="mt-4" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('dashboard.manage_users')}>
      <div className="space-y-6 animate-fade-in">
        <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t('common.back_to_dashboard')}
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{t('dashboard.manage_users')}</h2>
            <p className="text-muted-foreground">
              {t('dashboard.users_count', { count: filteredUsers.length, total: users.length })}
            </p>
          </div>
          <Button className="gradient-primary" onClick={() => setShowCreateDialog(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            {t('dashboard.add_user')}
          </Button>
        </div>

        {/* Filters */}
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('dashboard.search_users')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t('dashboard.filter_by_role')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('dashboard.all_roles')}</SelectItem>
                  <SelectItem value="student">{t('dashboard.students')}</SelectItem>
                  <SelectItem value="staff">{t('dashboard.staff')}</SelectItem>
                  <SelectItem value="admin">{t('dashboard.admins')}</SelectItem>
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
                      {t(`auth.${user.accountType}`)}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    {user.accountType === 'student' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('auth.registration_number')}</span>
                          <span>{user.registrationNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('auth.program')}</span>
                          <span>{user.program && t(`programs.${user.program}`)}</span>
                        </div>
                      </>
                    )}
                    {user.accountType === 'staff' && user.department && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('auth.department')}</span>
                        <span>{t(`departments.${user.department}`)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1" 
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      {t('common.edit')}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deleteUserMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      {t('common.delete')}
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
                <p className="text-muted-foreground">{t('dashboard.no_requests_found')}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create User Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('dashboard.add_user')}</DialogTitle>
              <DialogDescription>
                {t('dashboard.create_new_user_desc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('auth.full_name')}</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john@university.edu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">{t('auth.account_type')}</Label>
                <Select
                  value={newUser.accountType}
                  onValueChange={(value: UserRole) => setNewUser({ ...newUser, accountType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">{t('auth.student')}</SelectItem>
                    <SelectItem value="staff">{t('auth.staff')}</SelectItem>
                    <SelectItem value="admin">{t('auth.admin')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newUser.accountType === 'student' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">{t('auth.registration_number')}</Label>
                    <Input
                      id="studentId"
                      value={newUser.registrationNumber}
                      onChange={(e) => setNewUser({ ...newUser, registrationNumber: e.target.value })}
                      placeholder="STU2024001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program">{t('auth.program')}</Label>
                    <Select 
                      value={newUser.program} 
                      onValueChange={(val) => setNewUser({...newUser, program: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('auth.select_program')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(t('programs', { returnObjects: true })).map(([key, value]) => (
                          <SelectItem key={key} value={key}>{value as string}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">{t('auth.nationality')}</Label>
                    <Input
                      id="nationality"
                      value={newUser.nationality}
                      onChange={(e) => setNewUser({ ...newUser, nationality: e.target.value })}
                      placeholder="e.g. Kenyan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">{t('auth.gender')}</Label>
                    <Select
                      value={newUser.gender}
                      onValueChange={(value) => setNewUser({ ...newUser, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('auth.select_gender')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t('auth.male')}</SelectItem>
                        <SelectItem value="female">{t('auth.female')}</SelectItem>
                        <SelectItem value="other">{t('auth.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('auth.phone_number')}</Label>
                    <Input
                      id="phone"
                      value={newUser.phoneNumber}
                      onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                      placeholder="+254..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">{t('auth.address')}</Label>
                    <Input
                      id="address"
                      value={newUser.address}
                      onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                      placeholder="Street, City"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startYear">{t('auth.start_year')}</Label>
                      <Input
                        id="startYear"
                        value={newUser.startYear}
                        onChange={(e) => setNewUser({ ...newUser, startYear: e.target.value })}
                        placeholder="2020"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endYear">{t('auth.end_year')}</Label>
                      <Input
                        id="endYear"
                        value={newUser.endYear}
                        onChange={(e) => setNewUser({ ...newUser, endYear: e.target.value })}
                        placeholder="2024"
                      />
                    </div>
                  </div>
                </>
              )}

              {newUser.accountType === 'staff' && (
                <div className="space-y-2">
                  <Label htmlFor="department">{t('auth.department')}</Label>
                  <Select
                    value={newUser.department}
                    onValueChange={(value: Department) => setNewUser({ ...newUser, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('auth.select_department_placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {t(`departments.${dept.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button 
                className="gradient-primary" 
                onClick={handleCreateUser}
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('dashboard.add_user')
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('dashboard.edit_user')}</DialogTitle>
              <DialogDescription>
                {t('dashboard.edit_user_desc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">{t('auth.full_name')}</Label>
                <Input
                  id="edit-name"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">{t('auth.email')}</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">{t('auth.new_password_optional')}</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editForm.password || ''}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder={t('auth.leave_blank_keep_current')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">{t('auth.account_type')}</Label>
                <Select
                  value={editForm.accountType}
                  onValueChange={(value: UserRole) => setEditForm({ ...editForm, accountType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">{t('auth.student')}</SelectItem>
                    <SelectItem value="staff">{t('auth.staff')}</SelectItem>
                    <SelectItem value="admin">{t('auth.admin')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editForm.accountType === 'student' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-studentId">{t('auth.registration_number')}</Label>
                    <Input
                      id="edit-studentId"
                      value={editForm.registrationNumber || ''}
                      onChange={(e) => setEditForm({ ...editForm, registrationNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-program">{t('auth.program')}</Label>
                    <Select 
                      value={editForm.program} 
                      onValueChange={(val) => setEditForm({...editForm, program: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('auth.select_program')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(t('programs', { returnObjects: true })).map(([key, value]) => (
                          <SelectItem key={key} value={key}>{value as string}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-nationality">{t('auth.nationality')}</Label>
                    <Input
                      id="edit-nationality"
                      value={editForm.nationality || ''}
                      onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-gender">{t('auth.gender')}</Label>
                    <Select
                      value={editForm.gender}
                      onValueChange={(value) => setEditForm({ ...editForm, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('auth.select_gender')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t('auth.male')}</SelectItem>
                        <SelectItem value="female">{t('auth.female')}</SelectItem>
                        <SelectItem value="other">{t('auth.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">{t('auth.phone_number')}</Label>
                    <Input
                      id="edit-phone"
                      value={editForm.phoneNumber || ''}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-address">{t('auth.address')}</Label>
                    <Input
                      id="edit-address"
                      value={editForm.address || ''}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-startYear">{t('auth.start_year')}</Label>
                      <Input
                        id="edit-startYear"
                        value={editForm.startYear || ''}
                        onChange={(e) => setEditForm({ ...editForm, startYear: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-endYear">{t('auth.end_year')}</Label>
                      <Input
                        id="edit-endYear"
                        value={editForm.endYear || ''}
                        onChange={(e) => setEditForm({ ...editForm, endYear: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {editForm.accountType === 'staff' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-department">{t('auth.department')}</Label>
                  <Select
                    value={editForm.department}
                    onValueChange={(value: Department) => setEditForm({ ...editForm, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('auth.select_department_placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {t(`departments.${dept.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button 
                className="gradient-primary" 
                onClick={confirmEditUser}
                disabled={editUserMutation.isPending}
              >
                {editUserMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('common.save')
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
