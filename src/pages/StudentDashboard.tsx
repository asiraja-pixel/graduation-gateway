import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useClearance } from '@/hooks/useClearance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Download,
  Send,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDepartmentLabel, Department, ClearanceStatus } from '@/types';
import { getProgramKey } from '@/utils/clearanceUtils';
import { generateClearancePDF } from '@/utils/generateClearancePDF';
import confetti from 'canvas-confetti';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { getStudentRequest } = useClearance();
  const { t } = useTranslation();

  const [pdfStage, setPdfStage] = useState<string | null>(null);
  const [showPhotoDialog, setShowShowPhotoDialog] = useState(false);
  const [studentPhoto, setStudentPhoto] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const request = user ? getStudentRequest(user.id) : undefined;

  // Convert departmentClearances object to array for rendering
  const departmentClearancesArray = request
    ? Object.entries(request.departmentClearances).map(([dept, data]) => ({
        department: dept as Department,
        ...(typeof data === 'object' ? data : { 
          status: 'pending' as ClearanceStatus,
          processedAt: undefined,
          staffName: undefined,
          comment: undefined,
          staffId: undefined,
          staffSignature: undefined
        }),
      }))
    : undefined;

  const stats = departmentClearancesArray
    ? {
        approved: departmentClearancesArray.filter((d) => d.status === 'approved' || d.status === 'completed').length,
        pending: departmentClearancesArray.filter((d) => d.status === 'pending').length,
        rejected: departmentClearancesArray.filter((d) => d.status === 'rejected').length,
        total: departmentClearancesArray.length,
      }
    : null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ── PDF download handler ──────────────────────────────────────────────────
  const handleGenerateCertificate = async () => {
    if (!user || !request) return;
    
    setShowShowPhotoDialog(false);
    setPdfStage('Initializing...');
    
    try {
      await generateClearancePDF(
        {
          name: user.name,
          email: user.email,
          registrationNumber: user.registrationNumber || user.studentId || '',
          program: user.program,
          nationality: user.nationality,
          gender: user.gender,
          phoneNumber: user.phoneNumber,
          address: user.address,
          startYear: user.startYear,
          endYear: user.endYear,
        },
        request,
        (stage) => setPdfStage(stage),
        studentPhoto || undefined
      );

      // Trigger confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2e7d32', '#1565c0', '#ffd700']
      });

      setShowSuccessDialog(true);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setPdfStage(null);
    }
  };

  return (
    <DashboardLayout title={t('dashboard.student_dashboard')}>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{t('dashboard.welcome_user', { name: user?.name })}</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              {t('dashboard.student_id')}: {user?.studentId} • {user?.program && t(`programs.${getProgramKey(user.program)}`)}
            </p>
          </div>
          {!request && (
            <Link to="/student/request">
              <Button className="gradient-primary w-full md:w-auto">
                <Send className="w-4 h-4 mr-2" />
                {t('dashboard.submit_clearance_request')}
              </Button>
            </Link>
          )}
        </div>

        {request ? (
          <>
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="card-elevated">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('dashboard.overall_status')}</p>
                      <StatusBadge status={request.overallStatus} />
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
                      <p className="text-2xl font-bold">
                        {stats?.approved}/{stats?.total}
                      </p>
                      <p className="text-sm text-muted-foreground">{t('dashboard.approved')}</p>
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
                      <p className="text-2xl font-bold">{stats?.pending}</p>
                      <p className="text-sm text-muted-foreground">{t('dashboard.pending')}</p>
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
                      <p className="text-2xl font-bold">{stats?.rejected}</p>
                      <p className="text-sm text-muted-foreground">{t('dashboard.rejected')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department Clearances */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>{t('dashboard.department_clearances')}</CardTitle>
                <CardDescription>
                  {t('dashboard.track_approval_status')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentClearancesArray?.map((dept) => (
                    <div
                      key={dept.department}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            dept.status === 'approved'
                              ? 'bg-status-approved'
                              : dept.status === 'rejected'
                              ? 'bg-status-rejected'
                              : 'bg-status-pending'
                          }`}
                        />
                        <div>
                          <p className="font-medium">
                            {getDepartmentLabel(dept.department)}
                          </p>
                          {dept.processedAt && (
                            <p className="text-xs text-muted-foreground">
                              {t('dashboard.processed')}:{' '}
                              {new Date(dept.processedAt).toLocaleDateString()}
                              {dept.staffName && ` ${t('dashboard.by')} ${dept.staffName}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={dept.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>

                {departmentClearancesArray?.some(
                  (d) => d.status === 'rejected' && d.comment
                ) && (
                  <div className="mt-6 p-4 bg-destructive/10 rounded-lg">
                    <h4 className="font-medium text-destructive mb-2">
                      {t('dashboard.rejection_comments')}
                    </h4>
                    {departmentClearancesArray
                      .filter((d) => d.status === 'rejected' && d.comment)
                      .map((d) => (
                        <div key={d.department} className="text-sm">
                          <span className="font-medium">
                            {getDepartmentLabel(d.department)}:
                          </span>{' '}
                          {d.comment}
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Download Certificate (shown when fully approved) ── */}
            {(request.overallStatus === 'approved' ||
              request.overallStatus === 'completed') && (
              <Card className="card-elevated border-status-approved/30 bg-status-approved/5">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-status-approved/20 rounded-full">
                        <CheckCircle className="w-8 h-8 text-status-approved" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{t('dashboard.congratulations')}</h3>
                        <p className="text-muted-foreground">
                          {t('dashboard.all_approved_desc')}
                          {pdfStage && (
                            <span className="ml-2 text-primary font-medium">
                              {pdfStage}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <Button
                      className="bg-status-approved hover:bg-status-approved/90 min-w-[200px]"
                      onClick={() => setShowShowPhotoDialog(true)}
                      disabled={!!pdfStage}
                    >
                      {pdfStage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {pdfStage}
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 mr-2" />
                          {t('dashboard.generate_certificate')}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Photo Upload Dialog ── */}
            <Dialog open={showPhotoDialog} onOpenChange={setShowShowPhotoDialog}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('dashboard.upload_photo_title')}</DialogTitle>
                  <DialogDescription>
                    {t('dashboard.upload_photo_desc')}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-6 py-4">
                  <div className="w-32 h-40 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden relative group">
                    {studentPhoto ? (
                      <img src={studentPhoto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-xs text-muted-foreground">{t('dashboard.passport_photo')}</p>
                      </div>
                    )}
                    <Label 
                      htmlFor="photo-upload" 
                      className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium"
                    >
                      {t('dashboard.change_photo')}
                    </Label>
                    <Input 
                      id="photo-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoChange} 
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground px-6">
                    {t('dashboard.photo_privacy_note')}
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowShowPhotoDialog(false)}>
                    {t('dashboard.cancel')}
                  </Button>
                  <Button 
                    className="gradient-primary" 
                    onClick={handleGenerateCertificate}
                    disabled={!studentPhoto}
                  >
                    {t('dashboard.generate_download')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* ── Success Dialog ── */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
              <DialogContent className="sm:max-w-md text-center">
                <div className="py-6 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-status-approved/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-status-approved" />
                  </div>
                  <div className="space-y-2">
                    <DialogTitle className="text-2xl font-bold">{t('dashboard.success_title')}</DialogTitle>
                    <DialogDescription className="text-base">
                      {t('dashboard.success_desc')}
                    </DialogDescription>
                  </div>
                  <p className="text-muted-foreground">
                    {t('dashboard.success_message')}
                  </p>
                </div>
                <DialogFooter className="sm:justify-center">
                  <Button className="gradient-primary px-8" onClick={() => setShowSuccessDialog(false)}>
                    {t('dashboard.close')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          /* No Request State */
          <Card className="card-elevated">
            <CardContent className="py-12">
              <div className="text-center max-w-md mx-auto">
                <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                  <FileText className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('dashboard.no_request_title')}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t('dashboard.no_request_desc')}
                </p>
                <Link to="/student/request">
                  <Button className="gradient-primary">
                    {t('dashboard.submit_new_request')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}