import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useClearance } from '@/contexts/ClearanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  ChevronUp
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

export default function AdminRequests() {
  const { requests, overrideStatus } = useClearance();
  
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
      request.studentIdNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.program.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.overallStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleOverride = (request: ClearanceRequest, department: Department, newStatus: ClearanceStatus) => {
    setOverrideDialog({ request, department, newStatus });
  };

  const confirmOverride = () => {
    if (!overrideDialog) return;
    overrideStatus(overrideDialog.request.id, overrideDialog.department, overrideDialog.newStatus);
    setOverrideDialog(null);
  };

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
                      {request.studentIdNumber} • {request.program} • {request.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted: {new Date(request.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {request.departmentClearances.map(d => (
                        <div 
                          key={d.department}
                          className={`w-2 h-2 rounded-full ${
                            d.status === 'approved' ? 'bg-status-approved' :
                            d.status === 'rejected' ? 'bg-status-rejected' : 'bg-status-pending'
                          }`}
                          title={`${getDepartmentLabel(d.department)}: ${d.status}`}
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
                    {request.departmentClearances.map((dept) => (
                      <div 
                        key={dept.department}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-background rounded-lg gap-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{getDepartmentLabel(dept.department)}</span>
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
                                handleOverride(request, dept.department, 'approved');
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
                                handleOverride(request, dept.department, 'rejected');
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
