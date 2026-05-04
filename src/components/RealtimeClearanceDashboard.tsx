import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { Department, ClearanceStatus, ClearanceRequest, DepartmentClearance } from '@/types';
import { getStatusBadge } from '@/utils/statusUtils';
import { getProgramKey } from '@/utils/clearanceUtils';
import { useTranslation } from 'react-i18next';

export default function RealtimeClearanceDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { requests, updateDepartmentStatus, isConnected } = useSocket();

  const handleStatusUpdate = (requestId: string, department: Department, status: ClearanceStatus) => {
    const comment = prompt(`Enter comment for ${status} action:`);
    if (comment !== null) {
      updateDepartmentStatus(requestId, department, status, comment);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Connecting to Real-time Server</h3>
              <p className="text-muted-foreground">Please wait while we establish connection...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.accountType === 'student') {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Clearance Requests</h1>
          <p className="text-muted-foreground">Track your clearance progress in real-time</p>
        </div>

        <div className="grid gap-6">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No Clearance Requests</h3>
                  <p className="text-muted-foreground">You haven't submitted any clearance requests yet.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            requests.map((request: ClearanceRequest) => (
              <Card key={request._id} className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.studentName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {request.registrationNumber} • {t(`programs.${getProgramKey(request.program)}`)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(request.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(request.overallStatus as ClearanceStatus)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-4">Department Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(request.departmentClearances).map(([dept, clearance]) => (
                      <div key={dept} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium capitalize">{dept}</h5>
                          {getStatusBadge((clearance as DepartmentClearance).status as ClearanceStatus)}
                        </div>
                        {(clearance as DepartmentClearance).timestamp && (
                          <p className="text-xs text-muted-foreground mb-1">
                            Updated: {new Date((clearance as DepartmentClearance).timestamp!).toLocaleString()}
                          </p>
                        )}
                        {(clearance as DepartmentClearance).staffName && (
                          <p className="text-sm text-muted-foreground">
                            By: {(clearance as DepartmentClearance).staffName}
                          </p>
                        )}
                        {(clearance as DepartmentClearance).comment && (
                          <p className="text-sm mt-2 p-2 bg-gray-50 rounded">
                            {(clearance as DepartmentClearance).comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  if (user?.accountType === 'staff') {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Department Dashboard</h1>
          <p className="text-muted-foreground">
            Manage clearance requests for {user.department} department
          </p>
        </div>

        <div className="grid gap-6">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">No Requests</h3>
                  <p className="text-muted-foreground">No clearance requests to display.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            requests.map((request: ClearanceRequest) => (
              <Card key={request._id} className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.studentName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {request.registrationNumber} • {request.program}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(request.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(request.overallStatus as ClearanceStatus)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Your Department Status</h4>
                    {(request.departmentClearances as Record<string, DepartmentClearance>)[user.department!] && (
                      getStatusBadge(((request.departmentClearances as Record<string, DepartmentClearance>)[user.department!] as DepartmentClearance).status as ClearanceStatus)
                    )}
                  </div>
                  
                  {(request.departmentClearances as Record<string, DepartmentClearance>)[user.department!]?.timestamp && (
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date(((request.departmentClearances as Record<string, DepartmentClearance>)[user.department!] as DepartmentClearance).timestamp!).toLocaleString()}
                      </p>
                      {((request.departmentClearances as Record<string, DepartmentClearance>)[user.department!] as DepartmentClearance).comment && (
                        <p className="text-sm mt-1">
                          Comment: {((request.departmentClearances as Record<string, DepartmentClearance>)[user.department!] as DepartmentClearance).comment}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {user.department && request._id && (
                      <>
                        <Button
                          onClick={() => handleStatusUpdate(request._id!, user.department!, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={((request.departmentClearances as Record<string, DepartmentClearance>)[user.department!] as DepartmentClearance)?.status === 'approved'}
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleStatusUpdate(request._id!, user.department!, 'rejected')}
                          variant="destructive"
                          disabled={((request.departmentClearances as Record<string, DepartmentClearance>)[user.department!] as DepartmentClearance)?.status === 'rejected'}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">Please log in to access this dashboard.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
