import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
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
  PenLine,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useTheme } from 'next-themes';
import SignaturePad from '@/components/SignaturePad';
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
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [adminSignature, setAdminSignature] = useState<string | undefined>(undefined);
  const [signatureSaving, setSignatureSaving] = useState(false);
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
    staffDefaultComment: 'Cleared successfully.',
    adminDefaultComment: 'Clearance approved by administrative override.',
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

  useEffect(() => {
    if (user?.signature) {
      setAdminSignature(user.signature);
    }
  }, [user]);

  const handleSaveSignature = async () => {
    if (!adminSignature || !token) return;
    setSignatureSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me/signature`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ signature: adminSignature })
      });
      if (!res.ok) throw new Error('Failed to save signature');
      toast({ title: t('admin_settings.signature_saved'), description: t('admin_settings.signature_saved_desc') });
    } catch (error) {
      toast({ title: t('common.error'), description: t('admin_settings.signature_save_error_desc'), variant: 'destructive' });
    } finally {
      setSignatureSaving(false);
    }
  };

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
          title: t('admin_settings.settings_saved'),
          description: t('admin_settings.settings_saved_desc'),
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('admin_settings.settings_save_error_desc'),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title={t('admin_settings.title')}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">{t('admin_settings.loading_settings')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('admin_settings.title')}>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
        <div className="flex items-center justify-between">
          <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('admin_settings.back_to_dashboard')}
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
            {t('admin_settings.save_changes')}
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
              <Shield className="w-4 h-4" /> {t('admin_settings.general')}
            </Button>
            <Button 
              variant={activeTab === 'notifications' ? 'secondary' : 'ghost'} 
              className={cn("w-full justify-start gap-2", activeTab === 'notifications' && "bg-primary/10 text-primary hover:bg-primary/20")}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell className="w-4 h-4" /> {t('admin_settings.notifications')}
            </Button>
            <Button 
              variant={activeTab === 'localization' ? 'secondary' : 'ghost'} 
              className={cn("w-full justify-start gap-2", activeTab === 'localization' && "bg-primary/10 text-primary hover:bg-primary/20")}
              onClick={() => setActiveTab('localization')}
            >
              <Globe className="w-4 h-4" /> {t('admin_settings.localization')}
            </Button>
            <Button 
              variant={activeTab === 'deadlines' ? 'secondary' : 'ghost'} 
              className={cn("w-full justify-start gap-2", activeTab === 'deadlines' && "bg-primary/10 text-primary hover:bg-primary/20")}
              onClick={() => setActiveTab('deadlines')}
            >
              <Clock className="w-4 h-4" /> {t('admin_settings.deadlines')}
            </Button>
            <Button 
              variant={activeTab === 'signature' ? 'secondary' : 'ghost'} 
              className={cn("w-full justify-start gap-2", activeTab === 'signature' && "bg-primary/10 text-primary hover:bg-primary/20")}
              onClick={() => setActiveTab('signature')}
            >
              <PenLine className="w-4 h-4" /> {t('admin_settings.signature')}
            </Button>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-2 space-y-6">
            {activeTab === 'general' && (
              <>
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle className="text-lg">{t('admin_settings.general_config')}</CardTitle>
                    <CardDescription>{t('admin_settings.general_config_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="systemName">{t('admin_settings.system_name')}</Label>
                      <Input 
                        id="systemName" 
                        value={settings.systemName}
                        onChange={e => setSettings(prev => ({ ...prev, systemName: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                      <div className="space-y-0.5">
                        <Label className="text-base">{t('admin_settings.allow_new_requests')}</Label>
                        <p className="text-sm text-muted-foreground">{t('admin_settings.allow_new_requests_desc')}</p>
                      </div>
                      <Switch 
                        checked={settings.allowNewRequests}
                        onCheckedChange={checked => setSettings(prev => ({ ...prev, allowNewRequests: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-destructive/20">
                      <div className="space-y-0.5">
                        <Label className="text-base text-destructive">{t('admin_settings.maintenance_mode')}</Label>
                        <p className="text-sm text-muted-foreground">{t('admin_settings.maintenance_mode_desc')}</p>
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
                    <CardTitle className="text-lg">{t('admin_settings.academic_context')}</CardTitle>
                    <CardDescription>{t('admin_settings.academic_context_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="academicYear">{t('admin_settings.academic_year')}</Label>
                      <Input 
                        id="academicYear" 
                        value={settings.academicYear}
                        onChange={e => setSettings(prev => ({ ...prev, academicYear: e.target.value }))}
                        placeholder="e.g. 2023/2024"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="semester">{t('admin_settings.semester')}</Label>
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
                    <CardTitle className="text-lg">{t('admin_settings.email_notifications')}</CardTitle>
                    <CardDescription>{t('admin_settings.email_notifications_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emails">{t('admin_settings.admin_notification_emails')}</Label>
                      <Input 
                        id="emails" 
                        value={settings.notificationEmails}
                        onChange={e => setSettings(prev => ({ ...prev, notificationEmails: e.target.value }))}
                        placeholder={t('admin_settings.admin_notification_emails_placeholder')}
                      />
                      <p className="text-xs text-muted-foreground">{t('admin_settings.admin_notification_emails_help')}</p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                      <div className="space-y-0.5">
                        <Label className="text-base">{t('admin_settings.enable_email_alerts')}</Label>
                        <p className="text-sm text-muted-foreground">{t('admin_settings.enable_email_alerts_desc')}</p>
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
                    <CardTitle className="text-lg">{t('admin_settings.alert_triggers')}</CardTitle>
                    <CardDescription>{t('admin_settings.alert_triggers_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                      <div className="space-y-0.5">
                        <Label className="text-base">{t('admin_settings.new_requests')}</Label>
                        <p className="text-sm text-muted-foreground">{t('admin_settings.new_requests_desc')}</p>
                      </div>
                      <Switch 
                        checked={settings.notifyOnNewRequest}
                        onCheckedChange={checked => setSettings(prev => ({ ...prev, notifyOnNewRequest: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                      <div className="space-y-0.5">
                        <Label className="text-base">{t('admin_settings.status_changes')}</Label>
                        <p className="text-sm text-muted-foreground">{t('admin_settings.status_changes_desc')}</p>
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
                  <CardTitle className="text-lg">{t('admin_settings.regional_settings')}</CardTitle>
                  <CardDescription>{t('admin_settings.regional_settings_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">{t('admin_settings.timezone')}</Label>
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
                    <Label htmlFor="dateFormat">{t('admin_settings.date_format')}</Label>
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

                  <div className="space-y-2">
                    <Label>{t('admin_settings.theme_mode') || 'Theme Mode'}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant={theme === 'light' ? 'default' : 'outline'} 
                        className="flex items-center gap-2"
                        onClick={() => setTheme('light')}
                      >
                        <Sun className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('common.theme_light')}</span>
                      </Button>
                      <Button 
                        variant={theme === 'dark' ? 'default' : 'outline'} 
                        className="flex items-center gap-2"
                        onClick={() => setTheme('dark')}
                      >
                        <Moon className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('common.theme_dark')}</span>
                      </Button>
                      <Button 
                        variant={theme === 'system' ? 'default' : 'outline'} 
                        className="flex items-center gap-2"
                        onClick={() => setTheme('system')}
                      >
                        <Monitor className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('common.theme_system')}</span>
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-4">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <PenLine className="w-4 h-4 text-primary" />
                      {t('admin_settings.default_comments')}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="staffDefaultComment">{t('admin_settings.staff_default_comment')}</Label>
                        <Input 
                          id="staffDefaultComment"
                          value={settings.staffDefaultComment}
                          onChange={e => setSettings(prev => ({ ...prev, staffDefaultComment: e.target.value }))}
                          placeholder="e.g. Cleared successfully."
                        />
                        <p className="text-xs text-muted-foreground">{t('admin_settings.staff_default_comment_desc')}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminDefaultComment">{t('admin_settings.admin_default_comment')}</Label>
                        <Input 
                          id="adminDefaultComment"
                          value={settings.adminDefaultComment}
                          onChange={e => setSettings(prev => ({ ...prev, adminDefaultComment: e.target.value }))}
                          placeholder="e.g. Clearance approved by administrative override."
                        />
                        <p className="text-xs text-muted-foreground">{t('admin_settings.admin_default_comment_desc')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'deadlines' && (
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin_settings.deadlines_constraints')}</CardTitle>
                  <CardDescription>{t('admin_settings.deadlines_constraints_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deadline">{t('admin_settings.clearance_deadline')}</Label>
                    <Input 
                      id="deadline" 
                      type="date"
                      value={settings.clearanceDeadline}
                      onChange={e => setSettings(prev => ({ ...prev, clearanceDeadline: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="earlyClearance">{t('admin_settings.early_clearance_days')}</Label>
                    <Input 
                      id="earlyClearance" 
                      type="number"
                      value={settings.earlyClearanceDays}
                      onChange={e => setSettings(prev => ({ ...prev, earlyClearanceDays: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                    <div className="space-y-0.5">
                      <Label className="text-base">{t('admin_settings.auto_archive')}</Label>
                      <p className="text-sm text-muted-foreground">{t('admin_settings.auto_archive_desc')}</p>
                    </div>
                    <Switch 
                      checked={settings.autoArchiveRequests}
                      onCheckedChange={checked => setSettings(prev => ({ ...prev, autoArchiveRequests: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'signature' && (
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin_settings.admin_signature')}</CardTitle>
                  <CardDescription>
                    {t('admin_settings.admin_signature_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SignaturePad 
                    label={t('admin_settings.draw_signature')} 
                    existingSignature={adminSignature} 
                    onSave={(dataUrl) => setAdminSignature(dataUrl)} 
                    onClear={() => setAdminSignature(undefined)} 
                  />
                  <Button 
                    onClick={handleSaveSignature} 
                    disabled={!adminSignature || signatureSaving} 
                    className="gradient-primary"
                  >
                    {signatureSaving ? ( 
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('admin_settings.saving')}...</> 
                    ) : ( 
                      <><Save className="w-4 h-4 mr-2" />{t('admin_settings.save_signature')}</> 
                    )} 
                  </Button>
                  <p className="text-xs text-muted-foreground"> 
                    {t('admin_settings.signature_storage_notice')}
                  </p>
                </CardContent>
              </Card>
            )}

            <CardFooter className="bg-muted/30 py-3 rounded-lg flex items-center gap-2 mt-6">
              <CheckCircle2 className="w-4 h-4 text-status-approved" />
              <span className="text-xs font-medium">{t('admin_settings.autosave_notice')}</span>
            </CardFooter>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
