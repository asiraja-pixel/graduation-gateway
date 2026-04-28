import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useClearance } from '@/contexts/ClearanceContext';
import { useSocket } from '@/contexts/SocketContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  User,
  Mail,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { getDepartmentLabel, ClearanceRequest, Department, DepartmentClearance } from '@/types';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

export default function StaffPending() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { getDepartmentRequests, processRequest } = useClearance();
  const { updateDepartmentStatus } = useSocket();
  
  const department = user?.department as Department | undefined;
  const pendingRequests = department ? getDepartmentRequests(department) : [];
  
  const [selectedRequest, setSelectedRequest] = useState<ClearanceRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = (request: ClearanceRequest, type: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(type);
    setComment('');
  };

  const confirmAction = async () => {
    if (!selectedRequest || !actionType || !department || !user) return;
    
    setIsProcessing(true);
    
    // Send via Socket.IO for real-time updates
    updateDepartmentStatus(
      selectedRequest.id,
      department,
      actionType === 'approve' ? 'approved' : 'rejected',
      comment || undefined
    );
    
    // Also update local state as fallback
    await new Promise(resolve => setTimeout(resolve, 500));
    processRequest(
      selectedRequest.id,
      department,
      actionType === 'approve' ? 'approved' : 'rejected',
      user.id,
      user.name,
      user.signature,
      comment || undefined
    );
    
    setIsProcessing(false);
    setSelectedRequest(null);
    setActionType(null);
    setComment('');
  };

  return (
    <DashboardLayout title={t('dashboard.pending_requests')}>
      <div className="space-y-6 animate-fade-in">
        <Link to="/staff" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t('common.back_to_dashboard')}
        </Link>

        <div>
          <h2 className="text-2xl font-bold">{t('dashboard.pending_requests')}</h2>
          <p className="text-muted-foreground">
            {department && getDepartmentLabel(department)} {t('dashboard.department')} • {pendingRequests.length} {t('common.pending').toLowerCase()}
          </p>
        </div>

        {pendingRequests.length > 0 ? (
          <div className="grid gap-4">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="card-elevated">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Student Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{request.studentName}</h3>
                          <p className="text-muted-foreground">{request.studentIdNumber}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <GraduationCap className="w-4 h-4" />
                          <span>{t(`programs.${request.program}`)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{request.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{t('dashboard.submitted_date')} {new Date(request.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Other Departments Status */}
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-2">{t('dashboard.other_departments')}</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(request.departmentClearances as Record<string, DepartmentClearance>)
                            .map(([dept, data]) => ({
                                department: dept as Department,
                                status: data.status
                            }))
                            .filter(d => d.department !== department)
                            .map(d => (
                              <div 
                                key={d.department}
                                className="flex items-center gap-2 px-2 py-1 bg-muted rounded text-xs"
                              >
                                <span>{getDepartmentLabel(d.department)}</span>
                                <StatusBadge status={d.status} size="sm" />
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col gap-2 lg:w-40">
                      <Button 
                        className="flex-1 bg-status-approved hover:bg-status-approved/90"
                        onClick={() => handleAction(request, 'approve')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t('common.approve')}
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1 border-status-rejected text-status-rejected hover:bg-status-rejected/10"
                        onClick={() => handleAction(request, 'reject')}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {t('common.reject')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-elevated">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="p-4 bg-status-approved/10 rounded-full w-fit mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-status-approved" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('dashboard.all_caught_up')}</h3>
                <p className="text-muted-foreground">
                  {t('dashboard.no_pending_requests')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={!!selectedRequest && !!actionType} onOpenChange={() => {
          setSelectedRequest(null);
          setActionType(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? t('dashboard.approve_request_title') : t('dashboard.reject_request_title')}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'approve' 
                  ? t('dashboard.approve_request_desc', { name: selectedRequest?.studentName })
                  : t('dashboard.reject_request_desc', { name: selectedRequest?.studentName })
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedRequest?.studentName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest?.studentIdNumber} • {selectedRequest?.program && t(`programs.${selectedRequest.program}`)}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('dashboard.comment')} {actionType === 'reject' ? `(${t('dashboard.recommended')})` : `(${t('dashboard.optional')})`}
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    actionType === 'reject' 
                      ? t('dashboard.rejection_reason_placeholder')
                      : t('dashboard.notes_placeholder')
                  }
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={confirmAction}
                disabled={isProcessing}
                className={actionType === 'approve' 
                  ? 'bg-status-approved hover:bg-status-approved/90' 
                  : 'bg-status-rejected hover:bg-status-rejected/90'
                }
              >
                {isProcessing ? t('common.processing') : actionType === 'approve' ? t('dashboard.confirm_approval') : t('dashboard.confirm_rejection')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
