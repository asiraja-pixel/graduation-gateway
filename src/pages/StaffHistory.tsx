import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useClearance } from '@/contexts/ClearanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/LanguageSelector';
import { getDepartmentLabel, DepartmentClearance } from '@/types';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function StaffHistory() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { requests } = useClearance();
  
  const department = user?.department;
  
  // Get requests where this staff member has processed
  const processedRequests = requests.filter(req => {
    let deptClearance: DepartmentClearance | undefined;
    if (Array.isArray(req.departmentClearances)) {
      deptClearance = (req.departmentClearances as DepartmentClearance[]).find(d => d.department === department);
    } else if (typeof req.departmentClearances === 'object') {
      deptClearance = (req.departmentClearances as Record<string, DepartmentClearance>)[department as string];
    }
    return deptClearance && deptClearance.status !== 'pending';
  });

  return (
    <DashboardLayout title={t('dashboard.processing_history')}>
      <div className="space-y-6 animate-fade-in">
        <Link to="/staff" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t('common.back_to_dashboard')}
        </Link>

        <div>
          <h2 className="text-2xl font-bold">{t('dashboard.processing_history')}</h2>
          <p className="text-muted-foreground">
            {department && t(`departments.${department}`)} {t('dashboard.department')} • {t('dashboard.processed_count', { count: processedRequests.length })}
          </p>
        </div>

        {processedRequests.length > 0 ? (
          <div className="space-y-4">
            {processedRequests.map((request) => {
              let deptClearance: DepartmentClearance | undefined;
              if (Array.isArray(request.departmentClearances)) {
                deptClearance = (request.departmentClearances as DepartmentClearance[]).find(d => d.department === department);
              } else if (typeof request.departmentClearances === 'object') {
                deptClearance = (request.departmentClearances as Record<string, DepartmentClearance>)[department as string];
              }
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
                          {request.studentIdNumber} • {t(`programs.${request.program}`)}
                        </p>
                        {deptClearance?.comment && (
                          <p className="text-sm mt-2 p-2 bg-muted rounded">
                            {t('dashboard.comment_label', { comment: deptClearance.comment })}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground text-right">
                        <p>{t('dashboard.processed_by', { name: deptClearance?.staffName })}</p>
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
                <h3 className="text-xl font-semibold mb-2">{t('dashboard.no_history_yet')}</h3>
                <p className="text-muted-foreground">
                  {t('dashboard.no_history_desc')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
