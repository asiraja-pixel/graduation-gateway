import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, UserPlus, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/iuk_logo.png" alt="IUK Logo" className="w-12 h-12" />
              <div>
                <h1 className="text-xl font-bold">{t('landing.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('landing.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <ThemeToggle className="text-foreground hover:bg-muted" />
              <LanguageSelector className="text-foreground hover:bg-muted" />
              <Button variant="ghost" onClick={() => navigate('/login')} className="hidden sm:inline-flex">
                <LogIn className="w-4 h-4 mr-2" />
                {t('common.sign_in')}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/login')} className="sm:hidden px-2">
                <LogIn className="w-4 h-4" />
              </Button>
              <Button onClick={() => navigate('/signup')} className="hidden sm:inline-flex">
                <UserPlus className="w-4 h-4 mr-2" />
                {t('common.sign_up')}
              </Button>
              <Button onClick={() => navigate('/signup')} className="sm:hidden px-2">
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t('landing.hero_title')}
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('landing.hero_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/signup')} className="gradient-primary">
                {t('landing.get_started')}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                {t('common.sign_in')}
              </Button>
            </div>

            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">{t('landing.stats.schools_count')}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">{t('landing.schools')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">{t('landing.stats.programs_count')}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">{t('landing.programs')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">{t('landing.stats.digital_count')}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">{t('landing.digital_process')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">{t('landing.stats.access_count')}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">{t('landing.access')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
