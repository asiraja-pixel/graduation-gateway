import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Mail, Lock, AlertCircle, User, UserPlus, Briefcase, Building, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CountrySelect } from '@/components/CountrySelect';
import SignaturePad from '@/components/SignaturePad';
import { DEPARTMENTS } from '@/types';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<'student' | 'staff'>('student');
  const [department, setDepartment] = useState('');
  const [program, setProgram] = useState('');
  const [nationality, setNationality] = useState('');
  const [countryCallingCode, setCountryCallingCode] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [signature, setSignature] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup, isAuthenticated, user } = useAuth();
  const { t } = useTranslation();

  // Schools and Programs Mapping with translation keys
  const schoolPrograms = [
    {
      key: 'sharia',
      programs: [
        { key: 'sharia_ba', english: 'Bachelor of Arts in Islamic Sharia' },
        { key: 'arabic_ba', english: 'Bachelor of Arts in Arabic Language' },
        { key: 'islamic_banking_dip', english: 'Diploma in Islamic Banking and Finance' },
        { key: 'islamic_psych_dip', english: 'Diploma in Islamic Psychology' },
        { key: 'arabic_islamic_dip', english: 'Diploma in Arabic Language and Islamic Studies' },
        { key: 'islamic_banking_cert', english: 'Certificate in Islamic Banking and Finance' },
        { key: 'arabic_islamic_cert', english: 'Certificate in Arabic Language and Islamic Studies' }
      ]
    },
    {
      key: 'business',
      programs: [
        { key: 'business_ba', english: 'Bachelor of Business Management' },
        { key: 'business_dip', english: 'Diploma in Business Management' },
        { key: 'business_cert', english: 'Certificate in Business Management' }
      ]
    },
    {
      key: 'education',
      programs: [
        { key: 'education_ba', english: 'Bachelor of Education (B.Ed)' }
      ]
    },
    {
      key: 'informatics',
      programs: [
        { key: 'bit_ba', english: 'Bachelor of Information Technology' },
        { key: 'bit_dip', english: 'Diploma in Business Information Technology' }
      ]
    }
  ];

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardPath = user.role === 'student' ? '/student' : user.role === 'staff' ? '/staff' : '/admin';
      navigate(dashboardPath);
    }
  }, [isAuthenticated, user, navigate]);

  const departments = DEPARTMENTS;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!name || !email || !registrationNumber || !password || !confirmPassword) {
      setError(t('auth.fill_all_fields') || 'Please fill in all fields');
      return;
    }

    if (accountType === 'staff' && !department) {
      setError(t('auth.select_department') || 'Please select a department');
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwords_not_match') || 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError(t('auth.password_too_short') || 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      type SignupResult = { success: boolean; error?: string };
      let result: SignupResult;
      
      if (accountType === 'student') {
        if (!program || !nationality || !gender || !phoneNumber || !address || !startYear || !endYear) {
          setError(t('auth.fill_student_details') || 'Please fill in all student details');
          setIsLoading(false);
          return;
        }
        result = await signup(
          name, 
          email, 
          registrationNumber, 
          password, 
          accountType, 
          program, 
          undefined,
          nationality,
          gender,
          phoneNumber,
          address,
          startYear,
          endYear
        );
      } else {
        if (!department || !signature) {
          setError(t('auth.provide_dept_signature') || 'Please provide your department and draw your signature');
          setIsLoading(false);
          return;
        }
        result = await signup(name, email, registrationNumber, password, accountType, undefined, department, undefined, undefined, undefined, undefined, undefined, undefined, signature);
      }
      
      if (result.success) {
        // On success, redirect to login
        navigate('/login', { 
          state: {
            message: t('auth.signup_success') || 'Account created successfully! Please sign in.' 
          } 
        });
      } else {
        setError(result.error || t('auth.signup_failed') || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      setError(t('common.error_occurred') || 'An error occurred during signup. Please try again.');
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
              <h1 className="text-2xl font-bold">{t('landing.title') || 'IUK'}</h1>
              <p className="text-sm opacity-80">{t('landing.subtitle') || 'Clearance System'}</p>
            </div>
          </div>
        </div>
        
        <div className="text-primary-foreground">
          <h2 className="text-4xl font-bold mb-4">
            {t('auth.signup_hero_title') || 'Join Our IUK Clearance System'}
          </h2>
          <p className="text-lg opacity-80 max-w-md">
            {t('auth.signup_hero_subtitle') || 'Create your account to start IUK clearance process. Track your progress and get cleared efficiently.'}
          </p>
        </div>

        <div className="flex gap-8 text-primary-foreground">

          <div>

            <div className="text-3xl font-bold">4+</div>

            <div className="text-sm opacity-70">{t('landing.schools') || 'Schools'}</div>

          </div>

          <div>

            <div className="text-3xl font-bold">13+</div>

            <div className="text-sm opacity-70">{t('landing.programs') || 'Programs'}</div>

          </div>

          <div>

            <div className="text-3xl font-bold">100%</div>

            <div className="text-sm opacity-70">{t('landing.digital_process') || 'Digital Process'}</div>

          </div>

          <div>

            <div className="text-3xl font-bold">24/7</div>

            <div className="text-sm opacity-70">{t('landing.access') || 'Access'}</div>

          </div>

        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src="/iuk_logo.png" alt="IUK Logo" className="w-10 h-10 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold">{t('landing.title') || 'IUK Clearance'}</h1>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-foreground">{t('auth.signup')}</h2>
            <p className="mt-2 text-muted-foreground">
              {t('auth.signup_subtitle_form') || 'Join the IUK clearance system'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              <a 
                href="/" 
                className="text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                }}
              >
                ← {t('common.back_to_home')}
              </a>
            </p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">{t('auth.signup')}</CardTitle>
              <CardDescription>
                {t('auth.signup_subtitle') || 'Fill in your information to create an account'}
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

                {/* Account Type Selection */}
                <div className="space-y-2">
                  <Label>{t('auth.account_type') || 'Account Type'}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={accountType === 'student' ? 'default' : 'outline'}
                      onClick={() => setAccountType('student')}
                      className="flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      {t('auth.student')}
                    </Button>
                    <Button
                      type="button"
                      variant={accountType === 'staff' ? 'default' : 'outline'}
                      onClick={() => setAccountType('staff')}
                      className="flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      {t('auth.staff')}
                    </Button>
                  </div>
                </div>

                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">{t('auth.full_name') || 'Full Name'}</Label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Registration Number Field */}
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">
                    {accountType === 'student' ? (t('auth.reg_number') || 'Student ID') : (t('auth.staff_id') || 'Staff ID')}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="registrationNumber"
                      type="text"
                      placeholder={accountType === 'student' ? 'STU2024001' : 'STAFF001'}
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Student Specific Fields */}
                {accountType === 'student' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="program">{t('auth.program') || 'Program of Study'}</Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                        <Select value={program} onValueChange={setProgram}>
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder={t('auth.select_program') || "Select your program"} />
                          </SelectTrigger>
                          <SelectContent>
                            {schoolPrograms.map((school) => (
                              <div key={school.key}>
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                                  {t(`schools.${school.key}`)}
                                </div>
                                {school.programs.map((prog) => (
                                  <SelectItem key={prog.key} value={prog.english}>
                                    {t(`programs.${prog.key}`)}
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('auth.nationality') || 'Country / Nationality'}</Label>
                        <CountrySelect
                          value={nationality}
                          onValueChange={(_country, nat, callingCode) => {
                            setNationality(nat);
                            setCountryCallingCode(callingCode);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">{t('auth.gender') || 'Gender'}</Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('auth.select_gender') || "Select gender"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">{t('auth.male')}</SelectItem>
                            <SelectItem value="Female">{t('auth.female')}</SelectItem>
                            <SelectItem value="Other">{t('auth.other')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">{t('auth.phone_number') || 'Phone Number'}</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        {countryCallingCode && (
                          <span className="absolute left-10 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            {countryCallingCode}
                          </span>
                        )}
                        <Input
                          id="phoneNumber"
                          placeholder={countryCallingCode ? "700 000000" : "+254 700 000000"}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className={cn("pl-10", countryCallingCode && "pl-20")}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">{t('auth.address') || 'Address'}</Label>
                      <Input
                        id="address"
                        placeholder="e.g. P.O. Box 123, Nairobi"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startYear">{t('auth.start_year') || 'Start Year'}</Label>
                        <Input
                          id="startYear"
                          type="number"
                          placeholder="2020"
                          value={startYear}
                          onChange={(e) => setStartYear(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endYear">{t('auth.end_year') || 'End Year'}</Label>
                        <Input
                          id="endYear"
                          type="number"
                          placeholder="2024"
                          value={endYear}
                          onChange={(e) => setEndYear(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Department Field - Only for Staff */}
                {accountType === 'staff' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="department">{t('auth.department') || 'Department'}</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Select value={department} onValueChange={setDepartment}>
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder={t('auth.select_department') || "Select your department"} />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.value} value={dept.value}>
                                {t(`departments.${dept.value}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <SignaturePad
                      label={t('auth.signature') || "Your Signature"}
                      onSave={(dataUrl) => setSignature(dataUrl)}
                      onClear={() => setSignature(undefined)}
                      existingSignature={signature}
                    />
                  </>
                )}

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="•••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.confirm_password') || 'Confirm Password'}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="•••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full gradient-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (t('common.loading') || 'Creating Account...') : (t('auth.signup') || 'Create Account')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth.have_account') || 'Already have an account?'} {' '}
              <a 
                href="/login" 
                className="text-primary hover:underline font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
              >
                {t('auth.login') || 'Sign in here'}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
