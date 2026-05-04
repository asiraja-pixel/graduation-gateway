import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { ClearanceProvider } from "@/contexts/ClearanceProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Signup from "./pages/signup";
import StudentDashboard from "./pages/StudentDashboard";

import StudentRequest from "./pages/StudentRequest";

import StaffDashboard from "./pages/StaffDashboard";

import StaffPending from "./pages/StaffPending";

import StaffHistory from "./pages/StaffHistory";

import AdminDashboard from "./pages/AdminDashboard";

import AdminRequests from "./pages/AdminRequests";

import AdminUsers from "./pages/AdminUsers";

import AdminSettings from "./pages/AdminSettings";

import RealtimeTestPage from "./pages/realtime-test";

import NotFound from "./pages/NotFound";



const queryClient = new QueryClient();



const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>

      <AuthProvider>

        <SocketProvider>
          <ClearanceProvider>

          <Toaster />
          <Sonner />
          <BrowserRouter>

            <Routes>

              {/* Public Routes */}

              <Route path="/" element={<Landing />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/realtime-test" element={<RealtimeTestPage />} />



              {/* Student Routes */}

              <Route path="/student" element={

                <ProtectedRoute allowedRoles={['student']}>

                  <StudentDashboard />

                </ProtectedRoute>

              } />

              <Route path="/student/request" element={

                <ProtectedRoute allowedRoles={['student']}>

                  <StudentRequest />

                </ProtectedRoute>

              } />



              {/* Staff Routes */}

              <Route path="/staff" element={

                <ProtectedRoute allowedRoles={['staff']}>

                  <StaffDashboard />

                </ProtectedRoute>

              } />

              <Route path="/staff/pending" element={

                <ProtectedRoute allowedRoles={['staff']}>

                  <StaffPending />

                </ProtectedRoute>

              } />

              <Route path="/staff/history" element={

                <ProtectedRoute allowedRoles={['staff']}>

                  <StaffHistory />

                </ProtectedRoute>

              } />



              {/* Admin Routes */}

              <Route path="/admin" element={

                <ProtectedRoute allowedRoles={['admin']}>

                  <AdminDashboard />

                </ProtectedRoute>

              } />

              <Route path="/admin/requests" element={

                <ProtectedRoute allowedRoles={['admin']}>

                  <AdminRequests />

                </ProtectedRoute>

              } />

              <Route path="/admin/users" element={

                <ProtectedRoute allowedRoles={['admin']}>

                  <AdminUsers />

                </ProtectedRoute>

              } />

              <Route path="/admin/settings" element={

                <ProtectedRoute allowedRoles={['admin']}>

                  <AdminSettings />

                </ProtectedRoute>

              } />



              {/* Catch-all */}

              <Route path="*" element={<NotFound />} />

            </Routes>

          </BrowserRouter>

          </ClearanceProvider>
        </SocketProvider>
      </AuthProvider>
    </TooltipProvider>
  </ThemeProvider>
</QueryClientProvider>
);



export default App;

