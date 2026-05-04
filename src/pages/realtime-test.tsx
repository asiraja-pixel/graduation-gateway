import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthProvider } from '@/contexts/AuthProvider';
import { SocketProvider } from '@/contexts/SocketProvider';
import RealtimeClearanceDashboard from '@/components/RealtimeClearanceDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';

export default function RealtimeTestPage() {
  const { t } = useTranslation();

  return (
    <AuthProvider>
      <SocketProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto p-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl text-center">🔄 {t('dashboard.realtime_clearance_system')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <div className="w-8 h-8 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-lg font-semibold">{t('dashboard.realtime_sync_active')}</h3>
                  <p className="text-muted-foreground">
                    {t('dashboard.realtime_sync_desc')}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-sm">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">📤 {t('dashboard.student_actions')}</h4>
                      <p className="text-blue-600">{t('dashboard.student_actions_desc')}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">👥 {t('dashboard.staff_actions')}</h4>
                      <p className="text-green-600">{t('dashboard.staff_actions_desc')}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">🔄 {t('dashboard.live_updates')}</h4>
                      <p className="text-purple-600">{t('dashboard.live_updates_desc')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <RealtimeClearanceDashboard />
          </div>
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}
