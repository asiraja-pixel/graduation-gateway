import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RealtimeClearanceDashboard from '@/components/RealtimeClearanceDashboard';
import { SocketProvider } from '@/contexts/SocketContext';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RealtimeTestPage() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto p-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl text-center">🔄 Real-time Clearance System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <div className="w-8 h-8 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-lg font-semibold">Real-time Synchronization Active</h3>
                  <p className="text-muted-foreground">
                    This dashboard demonstrates real-time clearance request management with Socket.IO
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-sm">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">📤 Student Actions</h4>
                      <p className="text-blue-600">Submit clearance requests instantly</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">👥 Staff Actions</h4>
                      <p className="text-green-600">Approve/reject in real-time</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">🔄 Live Updates</h4>
                      <p className="text-purple-600">All changes sync instantly</p>
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
