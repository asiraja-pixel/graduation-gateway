import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { GraduationCap, Mail, Lock, AlertCircle, User, Briefcase, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        setError(result.error || t('auth.invalid_credentials') || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError(t('common.error_occurred') || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <ThemeToggle className="bg-background/20 text-primary-foreground hover:bg-background/30 dark:bg-background/10 dark:text-foreground" />
        <LanguageSelector />
      </div>

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-primary-foreground">
            <img src="/iuk_logo.png" alt="IUK Logo" className="w-12 h-12 rounded-xl" />
            <div>
              <h1 className="text-2xl font-bold">{t('landing.title')}</h1>
              <p className="text-sm opacity-80">{t('landing.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="text-primary-foreground">
          <h2 className="text-4xl font-bold mb-4">
            {t('landing.hero_title')}<br />
            {t('common.graduation_made_simple')}
          </h2>
          <p className="text-lg opacity-80 max-w-md">
            {t('landing.hero_subtitle')}
          </p>
        </div>

        <div className="flex gap-8 text-primary-foreground">
          <div>
            <div className="text-3xl font-bold">{t('landing.stats.schools_count')}</div>
            <div className="text-sm opacity-70">{t('landing.schools')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{t('landing.stats.programs_count')}</div>
            <div className="text-sm opacity-70">{t('landing.programs')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{t('landing.stats.digital_count')}</div>
            <div className="text-sm opacity-70">{t('landing.digital_process')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{t('landing.stats.access_count')}</div>
            <div className="text-sm opacity-70">{t('landing.access')}</div>
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
              <h1 className="text-xl font-bold">{t('landing.title')}</h1>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-foreground">{t('auth.login_welcome') || 'Welcome back'}</h2>
            <p className="mt-2 text-muted-foreground">
              {t('auth.login_subtitle') || 'Sign in to access your clearance dashboard'}
            </p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">{t('auth.login')}</CardTitle>
              <CardDescription>
                {t('auth.enter_credentials') || 'Enter your credentials to continue'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-sm text-primary hover:underline"
                    >
                      {t('auth.forgot_password')}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 gradient-primary" disabled={isLoading}>
                  {isLoading ? t('common.loading') : t('auth.login')}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">{t('auth.no_account')} </span>
                <button
                  onClick={() => navigate('/signup')}
                  className="text-primary font-semibold hover:underline"
                >
                  {t('auth.signup')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
