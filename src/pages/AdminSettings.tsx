import { DashboardLayout } from '@/components/DashboardLayout';
import { ArrowLeft, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminSettings() {
  return (
    <DashboardLayout title="Settings">
      <div className="min-h-[calc(100vh-250px)] bg-gray-50 -m-4 md:-m-8 p-4 md:p-8 flex flex-col items-start">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/admin" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8 text-left w-full">
          <h2 className="text-3xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-500 mt-1 text-lg">
            Configure system preferences and options
          </p>
        </div>

        {/* The Placeholder Card */}
        <div className="w-full max-w-4xl mx-auto mt-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 md:p-20 flex flex-col items-center text-center transition-all hover:shadow-md">
            {/* Icon */}
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-8 ring-8 ring-gray-50">
              <Settings className="w-12 h-12 text-gray-400 animate-spin-slow" />
            </div>

            {/* Text */}
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Settings Coming Soon</h3>
            <p className="text-gray-600 max-w-lg leading-relaxed text-lg">
              System settings and configuration options will be available in a future update. 
              For now, you can manage users and clearance requests from the dashboard.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
