import { ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  LogOut, 
  User, 
  ClipboardCheck, 
  Users, 
  LayoutDashboard,
  FileText,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = {
    student: [
      { path: '/student', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/student/request', label: 'My Request', icon: FileText },
    ],
    staff: [
      { path: '/staff', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/staff/pending', label: 'Pending Requests', icon: ClipboardCheck },
      { path: '/staff/history', label: 'History', icon: FileText },
    ],
    admin: [
      { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/requests', label: 'All Requests', icon: ClipboardCheck },
      { path: '/admin/users', label: 'Manage Users', icon: Users },
      { path: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  };

  const currentNavItems = user ? navItems[user.role] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/iuk_logo.png" alt="IUK Logo" className="w-10 h-10 rounded-lg" />
              <div>
                <h1 className="text-xl font-bold">Clearance System</h1>
                <p className="text-sm opacity-80">{title}</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-foreground/10 rounded-lg">
                <User className="w-4 h-4" />
                <span className="text-sm">{user?.name}</span>
                <span className="text-xs opacity-70 capitalize">({user?.role})</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-primary-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:block border-t border-primary-foreground/10">
          <div className="container mx-auto px-4">
            <div className="flex gap-1">
              {currentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary-foreground/20 border-b-2 border-primary-foreground' 
                        : 'hover:bg-primary-foreground/10 border-b-2 border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b shadow-lg animate-fade-in">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-muted rounded-lg">
              <User className="w-4 h-4" />
              <span className="text-sm">{user?.name}</span>
              <span className="text-xs text-muted-foreground capitalize">({user?.role})</span>
            </div>
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <Button 
              variant="ghost" 
              className="w-full justify-start mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
