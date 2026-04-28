import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useClearance } from '@/contexts/ClearanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users
} from 'lucide-react';
import { getDepartmentLabel, Department, DepartmentClearance } from '@/types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function StaffDashboard() {
  const { user } = useAuth();
  const { getDepartmentRequests, requests } = useClearance();
  const { t } = useTranslation();
  
  const department = user?.department as Department | undefined;
  const pendingRequests = department ? getDepartmentRequests(department) : [];
  
  // Calculate stats for this department
  const departmentStats = requests.reduce((acc, req) => {
    const clearances = req.departmentClearances as Record<string, DepartmentClearance>;
    const deptClearance = department ? clearances[department] : null;
    
    if (deptClearance) {
      acc.total++;
      if (deptClearance.status === 'approved') acc.approved++;
      if (deptClearance.status === 'pending') acc.pending++;
      if (deptClearance.status === 'rejected') acc.rejected++;
    }
    return acc;
  }, { total: 0, approved: 0, pending: 0, rejected: 0 });

  return (
    <DashboardLayout title={t('dashboard.staff_dashboard')}>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{t('dashboard.welcome_user', { name: user?.name })}</h2>
            <p className="text-muted-foreground">
              {department && getDepartmentLabel(department)} {t('dashboard.department')}
            </p>
          </div>
          <Link to="/staff/pending">
            <Button className="gradient-primary w-full sm:w-auto">
              <ClipboardCheck className="w-4 h-4 mr-2" />
              {t('dashboard.process_pending_requests')}
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{departmentStats.total}</p>
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
                  <p className="text-2xl font-bold">{departmentStats.pending}</p>
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
                  <p className="text-2xl font-bold">{departmentStats.approved}</p>
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
                  <p className="text-2xl font-bold">{departmentStats.rejected}</p>
                  <p className="text-sm text-muted-foreground">{t('dashboard.rejected')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests Preview */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle>{t('dashboard.pending_requests')}</CardTitle>
                <CardDescription>
                  {t('dashboard.requests_awaiting_review')}
                </CardDescription>
              </div>
              <Link to="/staff/pending">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">{t('common.view_all')}</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingRequests.length > 0 ? (
              <div className="space-y-3">
                {pendingRequests.slice(0, 5).map((request) => (
                  <div 
                    key={request.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-3"
                  >
                    <div>
                      <p className="font-medium">{request.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.studentIdNumber} • {t(`programs.${request.program}`)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {t('dashboard.submitted')} {new Date(request.submittedAt).toLocaleDateString()}
                      </span>
                      <StatusBadge status="pending" size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-3 bg-status-approved/10 rounded-full w-fit mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-status-approved" />
                </div>
                <p className="font-medium">{t('dashboard.all_caught_up')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.no_pending_requests')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
