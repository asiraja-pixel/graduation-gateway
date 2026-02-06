import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminSettings() {
  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6 animate-fade-in">
        <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>

        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">
            Configure system preferences and options
          </p>
        </div>

        <Card className="card-elevated">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                <Settings className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Settings Coming Soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                System settings and configuration options will be available in a future update. 
                For now, you can manage users and clearance requests from the dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
