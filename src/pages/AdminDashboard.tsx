import { DashboardLayout } from '@/components/DashboardLayout';
import { useClearance } from '@/contexts/ClearanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  TrendingUp,
  FileText,
  Settings,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { User, ClearanceRequest } from '@/types';
import { useTranslation } from 'react-i18next';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Fetch functions
const fetchUsers = async (token: string): Promise<User[]> => {
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

const fetchRequests = async (token: string): Promise<ClearanceRequest[]> => {
  const res = await fetch(`${API_BASE_URL}/api/clearance-requests`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch clearance requests');
  const data = await res.json();
  // Normalize MongoDB _id to id for unique keys
  return (data as (ClearanceRequest & { _id?: string })[]).map(d => ({
    ...d,
    id: d.id || d._id || Math.random().toString(36).slice(2, 11)
  })) as ClearanceRequest[];
};

export default function AdminDashboard() {
  const { token } = useAuth();
  const { t } = useTranslation();

  const { data: users = [], isLoading: isLoadingUsers, error: usersError } = useQuery<User[], Error>({
    queryKey: ['users'], 
    queryFn: () => fetchUsers(token!),
    enabled: !!token
  });

  const { data: requests = [], isLoading: isLoadingRequests, error: requestsError } = useQuery<ClearanceRequest[], Error>({
    queryKey: ['requests'], 
    queryFn: () => fetchRequests(token!),
    enabled: !!token
  });

  const isLoading = isLoadingUsers || isLoadingRequests;
  const error = usersError || requestsError;

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.overallStatus === 'pending').length,
    approved: requests.filter(r => r.overallStatus === 'approved' || r.overallStatus === 'completed').length,
    rejected: requests.filter(r => r.overallStatus === 'rejected').length,
    totalUsers: users.length,
    students: users.filter(u => u.accountType === 'student').length,
    staff: users.filter(u => u.accountType === 'staff').length,
    admins: users.filter(u => u.accountType === 'admin').length,
  };

  const approvalRate = stats.total > 0 
    ? Math.round((stats.approved / (stats.approved + stats.rejected || 1)) * 100) 
    : 0;

  if (isLoading) {
    return (
      <DashboardLayout title={t('dashboard.admin_dashboard')}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">{t('dashboard.loading_data')}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title={t('dashboard.admin_dashboard')}>
        <div className="flex flex-col items-center justify-center h-64 bg-destructive/10 rounded-lg">
          <AlertTriangle className="w-10 h-10 text-destructive mb-4" />
          <h3 className="text-xl font-semibold text-destructive">{t('dashboard.failed_load_data')}</h3>
          <p className="text-muted-foreground mt-2">{error.message}</p>
          <Button variant="destructive" className="mt-4" onClick={() => window.location.reload()}>
            {t('common.retry')}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('dashboard.admin_dashboard')}>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{t('dashboard.system_overview')}</h2>
            <p className="text-muted-foreground">
              {t('dashboard.manage_clearance_requests')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link to="/admin/requests">
              <Button variant="outline" className="w-full sm:w-auto">
                <ClipboardCheck className="w-4 h-4 mr-2" />
                {t('dashboard.all_requests')}
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button className="gradient-primary w-full sm:w-auto">
                <Users className="w-4 h-4 mr-2" />
                {t('dashboard.manage_users')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.total_requests')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-status-pending/10 rounded-lg">
                  <Clock className="w-6 h-6 text-status-pending" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.pending')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-status-approved/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-status-approved" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.approved')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-status-rejected/10 rounded-lg">
                  <XCircle className="w-6 h-6 text-status-rejected" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.rejected')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics and Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analytics Card */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {t('dashboard.analytics')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.system_performance')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{t('dashboard.approval_rate')}</span>
                    <span className="text-sm text-muted-foreground">{approvalRate}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-status-approved transition-all duration-500"
                      style={{ width: `${approvalRate}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-status-approved">{stats.approved}</p>
                    <p className="text-xs text-muted-foreground">{t('dashboard.approved')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-status-pending">{stats.pending}</p>
                    <p className="text-xs text-muted-foreground">{t('dashboard.pending')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-status-rejected">{stats.rejected}</p>
                    <p className="text-xs text-muted-foreground">{t('dashboard.rejected')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Card */}
          <Card className="card-elevated">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {t('dashboard.users')}
                  </CardTitle>
                  <CardDescription>
                    {t('dashboard.user_distribution')}
                  </CardDescription>
                </div>
                <Link to="/admin/users">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">{t('dashboard.manage')}</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span>{t('auth.student')}</span>
                  </div>
                  <span className="font-semibold">{stats.students}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-accent" />
                    <span>{t('auth.staff')}</span>
                  </div>
                  <span className="font-semibold">{stats.staff}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span>{t('auth.admin')}</span>
                  </div>
                  <span className="font-semibold">{stats.admins}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('dashboard.recent_requests')}</CardTitle>
                <CardDescription>{t('dashboard.latest_submissions')}</CardDescription>
              </div>
              <Link to="/admin/requests">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">{t('dashboard.view_all')}</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requests.slice(0, 5).map((request) => (
                <div 
                  key={request.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-3"
                >
                  <div>
                    <p className="font-medium">{request.studentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.registrationNumber || request.studentIdNumber} • {t(`programs.${request.program}`)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {new Date(request.submittedAt).toLocaleDateString()}
                    </span>
                    <StatusBadge status={request.overallStatus} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
