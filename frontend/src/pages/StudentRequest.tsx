import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <DashboardLayout title="Clearance Request">
        <Card className="card-elevated max-w-2xl mx-auto">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Request Already Submitted</h3>
              <p className="text-muted-foreground mb-6">
                You have already submitted a clearance request. You can track its progress on your dashboard.
              </p>
              <Link to="/student">
                <Button className="gradient-primary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
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
      <DashboardLayout title="Clearance Request">
        <Card className="card-elevated max-w-2xl mx-auto animate-fade-in">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="p-4 bg-status-approved/10 rounded-full w-fit mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-status-approved" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Request Submitted Successfully!</h3>
              <p className="text-muted-foreground mb-6">
                Your clearance request has been submitted to all departments. You will receive notifications as each department processes your request.
              </p>
              <Link to="/student">
                <Button className="gradient-primary">
                  View My Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Submit Clearance Request">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <Link to="/student" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>New Clearance Request</CardTitle>
            <CardDescription>
              Submit your graduation clearance request. This will be sent to all departments for approval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="font-medium">Student Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={user?.name || ''} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ''} disabled className="bg-muted" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID Number</Label>
                    <Input
                      id="studentId"
                      value={formData.studentIdNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, studentIdNumber: e.target.value }))}
                      placeholder="e.g., STU2024001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program">Program/Course</Label>
                    <Input
                      id="program"
                      value={formData.program}
                      onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value }))}
                      placeholder="e.g., Computer Science"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Departments */}
              <div className="space-y-4">
                <h3 className="font-medium">Departments to Clear</h3>
                <p className="text-sm text-muted-foreground">
                  Your request will be sent to the following departments for approval:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DEPARTMENTS.map((dept) => (
                    <div 
                      key={dept.value}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-status-pending rounded-full" />
                      <span className="text-sm">{dept.label}</span>
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
                    I confirm that all the information provided is accurate and I understand that my request will be reviewed by each department. Any pending dues or issues must be resolved before approval.
                  </Label>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-4 bg-status-pending/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-status-pending flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Important Notice</p>
                  <p className="text-muted-foreground">
                    Once submitted, you cannot modify this request. Ensure all your information is correct before proceeding.
                  </p>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full gradient-primary"
                disabled={!formData.confirmDetails || isSubmitting}
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Clearance Request
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
