import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useClearance } from '@/contexts/ClearanceContext';
import { useSocket } from '@/contexts/SocketContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DEPARTMENTS, getDepartmentLabel } from '@/types';
import { AlertCircle, Send, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentRequest() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { getStudentRequest, submitRequest } = useClearance();
  const { submitClearanceRequest } = useSocket();
  const navigate = useNavigate();
  
  const existingRequest = user ? getStudentRequest(user.id) : undefined;
  
  const [formData, setFormData] = useState({
    studentIdNumber: user?.studentId || '',
    program: user?.program || '',
    confirmDetails: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.confirmDetails) return;

    setIsSubmitting(true);
    
    // Emit to server via Socket.IO (server will persist)
    submitClearanceRequest({
      studentId: user.id,
      studentName: user.name,
      registrationNumber: formData.studentIdNumber,
      program: formData.program,
      email: user.email,
    });
    
    setSubmitted(true);
    setIsSubmitting(false);
  };

  if (existingRequest) {
    return (
      <DashboardLayout title={t('dashboard.submit_clearance_request')}>
        <Card className="card-elevated max-w-2xl mx-auto">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('dashboard.request_already_submitted')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('dashboard.request_already_submitted_desc')}
              </p>
              <Link to="/student">
                <Button className="gradient-primary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('common.back_to_dashboard')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (submitted) {
    return (
      <DashboardLayout title={t('dashboard.submit_clearance_request')}>
        <Card className="card-elevated max-w-2xl mx-auto animate-fade-in">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="p-4 bg-status-approved/10 rounded-full w-fit mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-status-approved" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('dashboard.request_submitted_success')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('dashboard.request_submitted_success_desc')}
              </p>
              <Link to="/student">
                <Button className="gradient-primary">
                  {t('common.view_all')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('dashboard.submit_clearance_request')}>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <Link to="/student" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t('common.back_to_dashboard')}
        </Link>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>{t('dashboard.new_clearance_request')}</CardTitle>
            <CardDescription>
              {t('dashboard.new_clearance_request_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="font-medium">{t('dashboard.student_information')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('auth.full_name')}</Label>
                    <Input value={user?.name || ''} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('auth.email')}</Label>
                    <Input value={user?.email || ''} disabled className="bg-muted" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">{t('dashboard.student_id_label')}</Label>
                    <Input
                      id="studentId"
                      value={formData.studentIdNumber}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program">{t('dashboard.program_label')}</Label>
                    <Input
                      id="program"
                      value={formData.program}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>

              {/* Departments */}
              <div className="space-y-4">
                <h3 className="font-medium">{t('dashboard.departments_to_clear')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.departments_to_clear_desc')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DEPARTMENTS.map((dept) => (
                    <div 
                      key={dept.value}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-status-pending rounded-full" />
                      <span className="text-sm">{t(`departments.${dept.value}`)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirmation */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="confirm"
                    checked={formData.confirmDetails}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, confirmDetails: checked === true }))
                    }
                  />
                  <Label htmlFor="confirm" className="text-sm leading-relaxed cursor-pointer">
                    {t('dashboard.confirm_details')}
                  </Label>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-4 bg-status-pending/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-status-pending flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">{t('dashboard.important_notice')}</p>
                  <p className="text-muted-foreground">
                    {t('dashboard.important_notice_desc')}
                  </p>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full gradient-primary"
                disabled={!formData.confirmDetails || isSubmitting}
              >
                {isSubmitting ? (
                  t('common.submitting')
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {t('dashboard.submit_clearance_request')}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
