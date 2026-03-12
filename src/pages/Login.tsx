import { useState } from 'react';

import { useNavigate, Navigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { GraduationCap, Mail, Lock, AlertCircle, User, Briefcase, Shield } from 'lucide-react';

import { demoCredentials } from '@/data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';



export default function Login() {

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated, user } = useAuth();

  const navigate = useNavigate();



  // If already authenticated, redirect to appropriate dashboard

  if (isAuthenticated && user) {

    const dashboardPath = user.role === 'student' ? '/student' : user.role === 'staff' ? '/staff' : '/admin';

    return <Navigate to={dashboardPath} replace />;

  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        // Navigate will happen via the redirect above on re-render
      } else {
        setError(result.error || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  const fillDemoCredentials = (type: 'student' | 'staff' | 'admin') => {

    setEmail(demoCredentials[type].email);

    setPassword(demoCredentials[type].password);

    setError('');

  };



  return (

    <div className="min-h-screen flex">

      {/* Left Panel - Branding */}

      <div className="hidden lg:flex lg:w-1/2 gradient-hero p-12 flex-col justify-between">

        <div>

          <div className="flex items-center gap-3 text-primary-foreground">
            <img src="/iuk_logo.png" alt="IUK Logo" className="w-12 h-12 rounded-xl" />
            <div>
              <h1 className="text-2xl font-bold">IUK</h1>
              <p className="text-sm opacity-80">Clearance System</p>
            </div>
          </div>

        </div>

        

        <div className="text-primary-foreground">

          <h2 className="text-4xl font-bold mb-4">

            IUK Clearance<br />Made Simple

          </h2>

          <p className="text-lg opacity-80 max-w-md">

            Streamline your graduation process with our automated clearance system. 

            Track approvals, manage departments, and get cleared faster.

          </p>

        </div>



        <div className="flex gap-8 text-primary-foreground">

          <div>

            <div className="text-3xl font-bold">4+</div>

            <div className="text-sm opacity-70">Departments</div>

          </div>

          <div>

            <div className="text-3xl font-bold">100%</div>

            <div className="text-sm opacity-70">Digital Process</div>

          </div>

          <div>

            <div className="text-3xl font-bold">24/7</div>

            <div className="text-sm opacity-70">Access</div>

          </div>

        </div>

      </div>



      {/* Right Panel - Login Form */}

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">

        <div className="w-full max-w-md space-y-8">

          {/* Mobile Header */}

          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src="/iuk_logo.png" alt="IUK Logo" className="w-10 h-10 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold">IUK Clearance</h1>
            </div>
          </div>



          <div className="text-center lg:text-left">

            <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>

            <p className="mt-2 text-muted-foreground">

              Sign in to access your clearance dashboard

            </p>

          </div>



          <Card className="border-0 shadow-lg">

            <CardHeader className="space-y-1 pb-4">

              <CardTitle className="text-xl">Sign In</CardTitle>

              <CardDescription>

                Enter your credentials to continue

              </CardDescription>

            </CardHeader>

            <CardContent>

              <form onSubmit={handleSubmit} className="space-y-4">

                {error && (

                  <div className="flex items-center gap-2 p-3 text-sm bg-destructive/10 text-destructive rounded-lg animate-fade-in">

                    <AlertCircle className="w-4 h-4 flex-shrink-0" />

                    {error}

                  </div>

                )}



                <div className="space-y-2">

                  <Label htmlFor="email">Email</Label>

                  <div className="relative">

                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                    <Input

                      id="email"

                      type="email"

                      placeholder="you@university.edu"

                      value={email}

                      onChange={(e) => setEmail(e.target.value)}

                      className="pl-10"

                      required

                    />

                  </div>

                </div>



                <div className="space-y-2">

                  <Label htmlFor="password">Password</Label>

                  <div className="relative">

                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                    <Input

                      id="password"

                      type="password"

                      placeholder="••••••••"

                      value={password}

                      onChange={(e) => setPassword(e.target.value)}

                      className="pl-10"

                      required

                    />

                  </div>

                </div>



                <Button 

                  type="submit" 

                  className="w-full gradient-primary"

                  disabled={isLoading}

                >

                  {isLoading ? 'Signing in...' : 'Sign In'}

                </Button>

              </form>

            </CardContent>

          </Card>



          {/* Demo Credentials */}

          <div className="space-y-3">

            <p className="text-sm text-center text-muted-foreground">

              Try demo accounts:

            </p>

            <div className="grid grid-cols-3 gap-2">

              <Button

                variant="outline"

                size="sm"

                onClick={() => fillDemoCredentials('student')}

                className="flex flex-col items-center gap-1 h-auto py-3"

              >

                <User className="w-4 h-4" />

                <span className="text-xs">Student</span>

              </Button>

              <Button

                variant="outline"

                size="sm"

                onClick={() => fillDemoCredentials('staff')}

                className="flex flex-col items-center gap-1 h-auto py-3"

              >

                <Briefcase className="w-4 h-4" />

                <span className="text-xs">Staff</span>

              </Button>

              <Button

                variant="outline"

                size="sm"

                onClick={() => fillDemoCredentials('admin')}

                className="flex flex-col items-center gap-1 h-auto py-3"

              >

                <Shield className="w-4 h-4" />

                <span className="text-xs">Admin</span>

              </Button>

            </div>

          </div>

          {/* Forgot Password & Sign Up Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              <a 
                href="/forgot-password" 
                className="text-primary hover:underline font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/forgot-password');
                }}
              >
                Forgot your password?
              </a>
            </p>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <a 
                href="/signup" 
                className="text-primary hover:underline font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/signup');
                }}
              >
                Sign up here
              </a>
            </p>
          </div>

        </div>

      </div>

    </div>

  );

}
