import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Save, 
  Shield, 
  Bell, 
  Globe, 
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function AdminSettings() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    systemName: 'Graduation Clearance System',
    allowNewRequests: true,
    maintenanceMode: false,
    notificationEmails: '',
    clearanceDeadline: '',
    academicYear: '2023/2024',
    semester: '1',
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    notifyOnNewRequest: true,
    notifyOnStatusChange: true,
    // Localization
    language: 'English',
    timezone: 'Africa/Nairobi',
    dateFormat: 'DD/MM/YYYY',
    // Deadlines & System
    earlyClearanceDays: '30',
    autoArchiveRequests: false,
    maxFileSize: '5', // MB
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (Object.keys(data).length > 0) {
            setSettings(prev => ({ ...prev, ...data }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchSettings();
    }
  }, [token]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "System configuration has been updated successfully.",
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update system settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="System Settings">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
        <div className="flex items-center justify-between">
          <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <Button 
            className="gradient-primary" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar Tabs */}
          <div className="space-y-1">
            <Button 
              variant={activeTab === 'general' ? 'secondary' : 'ghost'} 
              className={cn("w-full justify-start gap-2", activeTab === 'general' && "bg-primary/10 text-primary hover:bg-primary/20")}
              onClick={() => setActiveTab('general')}
            >
              <Shield className="w-4 h-4" /> General
            </Button>
            <Button 
              variant={activeTab === 'notifications' ? 'secondary' : 'ghost'} 
              className={cn("w-full justify-start gap-2", activeTab === 'notifications' && "bg-primary/10 text-primary hover:bg-primary/20")}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell className="w-4 h-4" /> Notifications
            </Button>
            <Button 
              variant={activeTab === 'localization' ? 'secondary' : 'ghost'} 
              className={cn("w-full justify-start gap-2", activeTab === 'localization' && "bg-primary/10 text-primary hover:bg-primary/20")}
              onClick={() => setActiveTab('localization')}
            >
              <Globe className="w-4 h-4" /> Localization
            </Button>
            <Button 
              variant={activeTab === 'deadlines' ? 'secondary' : 'ghost'} 
              className={cn("w-full justify-start gap-2", activeTab === 'deadlines' && "bg-primary/10 text-primary hover:bg-primary/20")}
              onClick={() => setActiveTab('deadlines')}
            >
              <Clock className="w-4 h-4" /> Deadlines
            </Button>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-2 space-y-6">
            {activeTab === 'general' && (
              <>
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="text-lg">General Configuration</CardTitle>
                    <CardDescription>Basic system behavior and identity</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="systemName">System Name</Label>
                      <Input 
                        id="systemName" 
                        value={settings.systemName}
                        onChange={e => setSettings(prev => ({ ...prev, systemName: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                      <div className="space-y-0.5">
                        <Label className="text-base">Allow New Requests</Label>
                        <p className="text-sm text-muted-foreground">Enable students to submit new clearance requests</p>
                      </div>
                      <Switch 
                        checked={settings.allowNewRequests}
                        onCheckedChange={checked => setSettings(prev => ({ ...prev, allowNewRequests: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-destructive/20">
                      <div className="space-y-0.5">
                        <Label className="text-base text-destructive">Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">Disable the system for all users except admins</p>
                      </div>
                      <Switch 
                        checked={settings.maintenanceMode}
                        onCheckedChange={checked => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="text-lg">Academic Context</CardTitle>
                    <CardDescription>Current academic year and period</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="academicYear">Academic Year</Label>
                      <Input 
                        id="academicYear" 
                        value={settings.academicYear}
                        onChange={e => setSettings(prev => ({ ...prev, academicYear: e.target.value }))}
                        placeholder="e.g. 2023/2024"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Input 
                        id="semester" 
                        value={settings.semester}
                        onChange={e => setSettings(prev => ({ ...prev, semester: e.target.value }))}
                        placeholder="e.g. 1"
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="text-lg">Email Notifications</CardTitle>
                    <CardDescription>Configure where system alerts are sent</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emails">Admin Notification Emails</Label>
                      <Input 
                        id="emails" 
                        value={settings.notificationEmails}
                        onChange={e => setSettings(prev => ({ ...prev, notificationEmails: e.target.value }))}
                        placeholder="admin@example.com, registrar@example.com"
                      />
                      <p className="text-xs text-muted-foreground">Separate multiple emails with commas</p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                      <div className="space-y-0.5">
                        <Label className="text-base">Enable Email Alerts</Label>
                        <p className="text-sm text-muted-foreground">Send automated emails for system events</p>
                      </div>
                      <Switch 
                        checked={settings.emailNotifications}
                        onCheckedChange={checked => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="text-lg">Alert Triggers</CardTitle>
                    <CardDescription>When should the system send notifications?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                      <div className="space-y-0.5">
                        <Label className="text-base">New Requests</Label>
                        <p className="text-sm text-muted-foreground">Notify staff when a new request is submitted</p>
                      </div>
                      <Switch 
                        checked={settings.notifyOnNewRequest}
                        onCheckedChange={checked => setSettings(prev => ({ ...prev, notifyOnNewRequest: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                      <div className="space-y-0.5">
                        <Label className="text-base">Status Changes</Label>
                        <p className="text-sm text-muted-foreground">Notify students when their request status is updated</p>
                      </div>
                      <Switch 
                        checked={settings.notifyOnStatusChange}
                        onCheckedChange={checked => setSettings(prev => ({ ...prev, notifyOnStatusChange: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'localization' && (
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Regional Settings</CardTitle>
                  <CardDescription>Timezone and formatting options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={settings.timezone}
                      onValueChange={value => setSettings(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Nairobi">Nairobi (GMT+3)</SelectItem>
                        <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT+0/1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select 
                      value={settings.dateFormat}
                      onValueChange={value => setSettings(prev => ({ ...prev, dateFormat: value }))}
                    >
                      <SelectTrigger id="dateFormat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'deadlines' && (
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-lg">Deadlines & Constraints</CardTitle>
                  <CardDescription>System-wide dates and limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Clearance Deadline</Label>
                    <Input 
                      id="deadline" 
                      type="date"
                      value={settings.clearanceDeadline}
                      onChange={e => setSettings(prev => ({ ...prev, clearanceDeadline: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="earlyClearance">Early Clearance Window (Days)</Label>
                    <Input 
                      id="earlyClearance" 
                      type="number"
                      value={settings.earlyClearanceDays}
                      onChange={e => setSettings(prev => ({ ...prev, earlyClearanceDays: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label className="text-base">Auto-archive</Label>
                      <p className="text-sm text-muted-foreground">Archive completed requests after 90 days</p>
                    </div>
                    <Switch 
                      checked={settings.autoArchiveRequests}
                      onCheckedChange={checked => setSettings(prev => ({ ...prev, autoArchiveRequests: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <CardFooter className="bg-muted/30 py-3 rounded-lg flex items-center gap-2 mt-6">
              <CheckCircle2 className="w-4 h-4 text-status-approved" />
              <span className="text-xs font-medium">Auto-save is disabled. Click Save Changes above to apply.</span>
            </CardFooter>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
