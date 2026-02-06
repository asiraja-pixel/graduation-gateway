import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useClearance } from '@/contexts/ClearanceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { getDepartmentLabel } from '@/types';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function StaffHistory() {
  const { user } = useAuth();
  const { requests } = useClearance();
  
  const department = user?.department;
  
  // Get requests where this staff member has processed
  const processedRequests = requests.filter(req => {
    const deptClearance = req.departmentClearances.find(d => d.department === department);
    return deptClearance && deptClearance.status !== 'pending';
  });

  return (
    <DashboardLayout title="Processing History">
      <div className="space-y-6 animate-fade-in">
        <Link to="/staff" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>

        <div>
          <h2 className="text-2xl font-bold">Processing History</h2>
          <p className="text-muted-foreground">
            {department && getDepartmentLabel(department)} Department • {processedRequests.length} processed
          </p>
        </div>

        {processedRequests.length > 0 ? (
          <div className="space-y-4">
            {processedRequests.map((request) => {
              const deptClearance = request.departmentClearances.find(d => d.department === department);
              return (
                <Card key={request.id} className="card-elevated">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{request.studentName}</h3>
                          <StatusBadge status={deptClearance?.status || 'pending'} size="sm" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.studentIdNumber} • {request.program}
                        </p>
                        {deptClearance?.comment && (
                          <p className="text-sm mt-2 p-2 bg-muted rounded">
                            Comment: {deptClearance.comment}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground text-right">
                        <p>Processed by {deptClearance?.staffName}</p>
                        {deptClearance?.processedAt && (
                          <p>{new Date(deptClearance.processedAt).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="card-elevated">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                  <FileText className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No History Yet</h3>
                <p className="text-muted-foreground">
                  You haven't processed any clearance requests yet.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
