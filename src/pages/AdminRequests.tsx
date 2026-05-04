import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  ArrowLeft, 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { getDepartmentLabel, ClearanceRequest, ClearanceStatus, Department } from '@/types';
import { Link } from 'react-router-dom';
import { normalizeClearances } from '@/utils/clearanceUtils';
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

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const fetchRequests = async (token: string): Promise<ClearanceRequest[]> => {
  const res = await fetch(`${API_BASE_URL}/api/clearance-requests`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch clearance requests');
  const data = await res.json();
  
  // Normalize data to ensure 'id' is present (map from MongoDB _id if needed)
  return (data as (ClearanceRequest & { _id?: string })[]).map(d => ({
    ...d,
    id: d.id || d._id || '',
    studentId: d.studentId || d.registrationNumber || '',
    departmentClearances: normalizeClearances(d.departmentClearances)
  })) as ClearanceRequest[];
};

const overrideRequestStatus = async (token: string, requestId: string, department: Department, status: ClearanceStatus) => {
  const res = await fetch(`${API_BASE_URL}/api/clearance-requests/${requestId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ department, status }),
  });
  if (!res.ok) throw new Error('Failed to override status');
  return res.json();
};

export default function AdminRequests() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { data: requests = [], isLoading, error, refetch } = useQuery<ClearanceRequest[], Error>({
    queryKey: ['admin-requests'],
    queryFn: () => fetchRequests(token!),
    enabled: !!token,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [overrideDialog, setOverrideDialog] = useState<{
    request: ClearanceRequest;
    department: Department;
    newStatus: ClearanceStatus;
  } | null>(null);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.registrationNumber && request.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (request.studentIdNumber && request.studentIdNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (request.program && request.program.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || request.overallStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleOverride = (request: ClearanceRequest, department: Department, newStatus: ClearanceStatus) => {
    setOverrideDialog({ request, department, newStatus });
  };

  const confirmOverride = async () => {
    if (!overrideDialog || !token) return;
    try {
      await overrideRequestStatus(token, overrideDialog.request.id, overrideDialog.department, overrideDialog.newStatus);
      refetch(); // Refetch data to show the update
    } catch (e) {
      console.error("Override failed", e);
      // You might want to show an error toast here
    }
    setOverrideDialog(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout title={t('dashboard.all_requests')}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">{t('dashboard.loading_data')}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title={t('dashboard.all_requests')}>
        <div className="flex flex-col items-center justify-center h-64 bg-destructive/10 rounded-lg">
          <AlertTriangle className="w-10 h-10 text-destructive mb-4" />
          <h3 className="text-xl font-semibold text-destructive">{t('dashboard.failed_load_data')}</h3>
          <p className="text-muted-foreground mt-2">{error.message}</p>
          <Button variant="destructive" className="mt-4" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('dashboard.all_requests')}>
      <div className="space-y-6 animate-fade-in">
        <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t('common.back_to_dashboard')}
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{t('dashboard.all_clearance_requests')}</h2>
            <p className="text-muted-foreground">
              {t('dashboard.requests_count', { count: filteredRequests.length, total: requests.length })}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('dashboard.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t('dashboard.filter_by_status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('dashboard.all_statuses')}</SelectItem>
                  <SelectItem value="pending">{t('common.pending')}</SelectItem>
                  <SelectItem value="approved">{t('common.approved')}</SelectItem>
                  <SelectItem value="rejected">{t('common.rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="card-elevated overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{request.studentName}</h3>
                      <StatusBadge status={request.overallStatus} size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.registrationNumber || request.studentIdNumber} • {t(`programs.${request.program}`)} • {request.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('dashboard.submitted_at_label', { date: new Date(request.submittedAt).toLocaleString() })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {Object.entries(request.departmentClearances).map(([dept, clearance]) => (
                        <div 
                          key={dept}
                          className={`w-2 h-2 rounded-full ${
                            clearance.status === 'approved' ? 'bg-status-approved' :
                            clearance.status === 'rejected' ? 'bg-status-rejected' : 'bg-status-pending'
                          }`}
                          title={`${t(`departments.${dept}`)}: ${t(`common.${clearance.status}`)}`}
                        />
                      ))}
                    </div>
                    {expandedRequest === request.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedRequest === request.id && (
                <div className="px-6 pb-6 border-t bg-muted/30 animate-fade-in">
                  <div className="pt-4 space-y-3">
                    <h4 className="font-medium text-sm">{t('dashboard.department_clearances')}</h4>
                    {Object.entries(request.departmentClearances).map(([deptKey, dept]) => (
                      <div 
                        key={deptKey}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-background rounded-lg gap-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{t(`departments.${deptKey}`)}</span>
                            <StatusBadge status={dept.status} size="sm" />
                          </div>
                          {dept.processedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {dept.staffName ? `${dept.staffName} • ` : ''}
                              {new Date(dept.processedAt).toLocaleString()}
                            </p>
                          )}
                          {dept.comment && (
                            <p className="text-sm mt-1 text-muted-foreground">
                              "{dept.comment}"
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {dept.status !== 'approved' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-status-approved border-status-approved hover:bg-status-approved/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOverride(request, deptKey as Department, 'approved');
                              }}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {t('dashboard.override')}
                            </Button>
                          )}
                          {dept.status !== 'rejected' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-status-rejected border-status-rejected hover:bg-status-rejected/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOverride(request, deptKey as Department, 'rejected');
                              }}
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              {t('dashboard.override')}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <Card className="card-elevated">
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-muted-foreground">{t('dashboard.no_requests_found')}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Override Confirmation Dialog */}
        <Dialog open={!!overrideDialog} onOpenChange={() => setOverrideDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('dashboard.override_title')}</DialogTitle>
              <DialogDescription>
                {t('dashboard.override_desc', { 
                  department: overrideDialog?.department && t(`departments.${overrideDialog.department}`),
                  name: overrideDialog?.request.studentName,
                  status: overrideDialog?.newStatus && t(`common.${overrideDialog.newStatus}`)
                })}
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {t('dashboard.override_note')}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOverrideDialog(null)}>
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={confirmOverride}
                className={overrideDialog?.newStatus === 'approved' 
                  ? 'bg-status-approved hover:bg-status-approved/90' 
                  : 'bg-status-rejected hover:bg-status-rejected/90'
                }
              >
                {t('dashboard.confirm_override')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
