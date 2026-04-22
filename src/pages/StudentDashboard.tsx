import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useClearance } from '@/contexts/ClearanceContext';
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
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDepartmentLabel, Department, ClearanceStatus } from '@/types';
import { generateClearancePDF } from '@/utils/generateClearancePDF';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { getStudentRequest } = useClearance();

  const [pdfStage, setPdfStage] = useState<string | null>(null);

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
          staffId: undefined
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

  // ── PDF download handler ──────────────────────────────────────────────────
  const handleDownloadCertificate = async () => {
    if (!user || !request) return;
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
        (stage) => setPdfStage(stage)
      );
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setPdfStage(null);
    }
  };

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Welcome, {user?.name}</h2>
            <p className="text-muted-foreground">
              Student ID: {user?.studentId} • {user?.program}
            </p>
          </div>
          {!request && (
            <Link to="/student/request">
              <Button className="gradient-primary">
                <Send className="w-4 h-4 mr-2" />
                Submit Clearance Request
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
                      <p className="text-sm text-muted-foreground">Overall Status</p>
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
                      <p className="text-sm text-muted-foreground">Approved</p>
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
                      <p className="text-sm text-muted-foreground">Pending</p>
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
                      <p className="text-sm text-muted-foreground">Rejected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department Clearances */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Department Clearances</CardTitle>
                <CardDescription>
                  Track the approval status of each department
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
                              Processed:{' '}
                              {new Date(dept.processedAt).toLocaleDateString()}
                              {dept.staffName && ` by ${dept.staffName}`}
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
                      Rejection Comments
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
                        <h3 className="text-lg font-semibold">Congratulations!</h3>
                        <p className="text-muted-foreground">
                          All departments have approved your clearance request.
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
                      onClick={handleDownloadCertificate}
                      disabled={!!pdfStage}
                    >
                      {pdfStage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {pdfStage}
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download Certificate
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
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
                  No Clearance Request Found
                </h3>
                <p className="text-muted-foreground mb-6">
                  You haven't submitted a clearance request yet. Start your
                  graduation clearance process by submitting a new request.
                </p>
                <Link to="/student/request">
                  <Button className="gradient-primary">
                    Submit New Request
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