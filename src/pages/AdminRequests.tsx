import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
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
    // Ensure departmentClearances is always an object
    departmentClearances: Array.isArray(d.departmentClearances) 
      ? (d.departmentClearances as { department: string }[]).reduce((acc: Record<string, unknown>, dc: { department: string }) => {
          if (dc.department) acc[dc.department.toLowerCase()] = dc;
          return acc;
        }, {})
      : d.departmentClearances
  })) as ClearanceRequest[];
};

const overrideRequestStatus = async (token: string, requestId: string, department: Department, status: ClearanceStatus) => {
  const res = await fetch(`${API_BASE_URL}/api/clearance-requests/${requestId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ department, status, comment: 'Overridden by admin' }),
  });
  if (!res.ok) throw new Error('Failed to override status');
  return res.json();
};

export default function AdminRequests() {
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
      <DashboardLayout title="All Requests">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading requests...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="All Requests">
        <div className="flex flex-col items-center justify-center h-64 bg-destructive/10 rounded-lg">
          <AlertTriangle className="w-10 h-10 text-destructive mb-4" />
          <h3 className="text-xl font-semibold text-destructive">Failed to Load Requests</h3>
          <p className="text-muted-foreground mt-2">{error.message}</p>
          <Button variant="destructive" className="mt-4" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="All Requests">
      <div className="space-y-6 animate-fade-in">
        <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">All Clearance Requests</h2>
            <p className="text-muted-foreground">
              {filteredRequests.length} of {requests.length} requests
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
                  placeholder="Search by name, ID, or program..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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
                      {request.registrationNumber || request.studentIdNumber} • {request.program} • {request.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted: {new Date(request.submittedAt).toLocaleString()}
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
                          title={`${getDepartmentLabel(dept as Department)}: ${clearance.status}`}
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
                    <h4 className="font-medium text-sm">Department Clearances</h4>
                    {Object.entries(request.departmentClearances).map(([deptKey, dept]) => (
                      <div 
                        key={deptKey}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-background rounded-lg gap-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{getDepartmentLabel(deptKey as Department)}</span>
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
                              Override
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
                              Override
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
                <p className="text-muted-foreground">No requests match your search criteria.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Override Confirmation Dialog */}
        <Dialog open={!!overrideDialog} onOpenChange={() => setOverrideDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Override Clearance Status</DialogTitle>
              <DialogDescription>
                Are you sure you want to override the {overrideDialog?.department && getDepartmentLabel(overrideDialog.department)} clearance for {overrideDialog?.request.studentName} to "{overrideDialog?.newStatus}"?
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                This action will be marked as an admin override and cannot be undone automatically.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOverrideDialog(null)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmOverride}
                className={overrideDialog?.newStatus === 'approved' 
                  ? 'bg-status-approved hover:bg-status-approved/90' 
                  : 'bg-status-rejected hover:bg-status-rejected/90'
                }
              >
                Confirm Override
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
