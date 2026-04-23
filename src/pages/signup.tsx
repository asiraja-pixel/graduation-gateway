import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Mail, Lock, AlertCircle, User, UserPlus, Briefcase, Building, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CountrySelect } from '@/components/CountrySelect';
import { DEPARTMENTS } from '@/types';
import { cn } from '@/lib/utils';

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

  // Schools and Programs Mapping
  const schoolPrograms = [
    {
      school: 'School of Sharia & Islamic Studies',
      programs: [
        'Bachelor of Arts in Islamic Sharia',
        'Bachelor of Arts in Arabic Language',
        'Diploma in Islamic Banking and Finance',
        'Diploma in Islamic Psychology',
        'Diploma in Arabic Language and Islamic Studies',
        'Certificate in Islamic Banking and Finance',
        'Certificate in Arabic Language and Islamic Studies'
      ]
    },
    {
      school: 'School of Business Management',
      programs: [
        'Bachelor of Business Management',
        'Diploma in Business Management',
        'Certificate in Business Management'
      ]
    },
    {
      school: 'School of Education',
      programs: [
        'Bachelor of Education (B.Ed)'
      ]
    },
    {
      school: 'School of Informatics & Technology',
      programs: [
        'Bachelor of Information Technology',
        'Diploma in Business Information Technology'
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        setError('Signature file is too large. Please use a smaller image (max 1MB).');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignature(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!name || !email || !registrationNumber || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (accountType === 'staff' && !department) {
      setError('Please select a department');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      type SignupResult = { success: boolean; error?: string };
      let result: SignupResult;
      
      if (accountType === 'student') {
        if (!program || !nationality || !gender || !phoneNumber || !address || !startYear || !endYear) {
          setError('Please fill in all student details');
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
          setError('Please provide your department and signature');
          setIsLoading(false);
          return;
        }
        result = await signup(name, email, registrationNumber, password, accountType, undefined, department, undefined, undefined, undefined, undefined, undefined, undefined, signature);
      }
      
      if (result.success) {
        // On success, redirect to login
        navigate('/login', { 
          state: { 
            message: 'Account created successfully! Please sign in.' 
          } 
        });
      } else {
        setError(result.error || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during signup. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            Join Our<br />IUK Clearance System
          </h2>
          <p className="text-lg opacity-80 max-w-md">
            Create your account to start IUK clearance process. 
            Track your progress and get cleared efficiently.
          </p>
        </div>

        <div className="flex gap-8 text-primary-foreground">

          <div>

            <div className="text-3xl font-bold">4+</div>

            <div className="text-sm opacity-70">Schools</div>

          </div>

          <div>

            <div className="text-3xl font-bold">13+</div>

            <div className="text-sm opacity-70">Programs</div>

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

      {/* Right Panel - Signup Form */}
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
            <h2 className="text-3xl font-bold text-foreground">Create Account</h2>
            <p className="mt-2 text-muted-foreground">
              Join the IUK clearance system
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
                ← Back to home
              </a>
            </p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Sign Up</CardTitle>
              <CardDescription>
                Fill in your information to create an account
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
                  <Label>Account Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={accountType === 'student' ? 'default' : 'outline'}
                      onClick={() => setAccountType('student')}
                      className="flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Student
                    </Button>
                    <Button
                      type="button"
                      variant={accountType === 'staff' ? 'default' : 'outline'}
                      onClick={() => setAccountType('staff')}
                      className="flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      Staff
                    </Button>
                  </div>
                </div>

                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
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
                  <Label htmlFor="email">Email Address</Label>
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

                {/* Registration Number Field */}
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">
                    {accountType === 'student' ? 'Student ID' : 'Staff ID'}
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
                      <Label htmlFor="program">Program of Study</Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                        <Select value={program} onValueChange={setProgram}>
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select your program" />
                          </SelectTrigger>
                          <SelectContent>
                            {schoolPrograms.map((school) => (
                              <div key={school.school}>
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                                  {school.school}
                                </div>
                                {school.programs.map((prog) => (
                                  <SelectItem key={prog} value={prog}>
                                    {prog}
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
                        <Label>Country / Nationality</Label>
                        <CountrySelect
                          value={nationality}
                          onValueChange={(_country, nat, callingCode) => {
                            setNationality(nat);
                            setCountryCallingCode(callingCode);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
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
                      <Label htmlFor="address">Address</Label>
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
                        <Label htmlFor="startYear">Start Year</Label>
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
                        <Label htmlFor="endYear">End Year</Label>
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
                      <Label htmlFor="department">Department</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Select value={department} onValueChange={setDepartment}>
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select your department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.value} value={dept.value}>
                                {dept.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signature">Signature (Image)</Label>
                      <div className="relative">
                        <Input
                          id="signature"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="cursor-pointer"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload a clear image of your signature (PNG or JPG).
                        </p>
                        {signature && (
                          <div className="mt-2 p-2 border rounded-md bg-muted/30">
                            <img src={signature} alt="Signature Preview" className="h-12 object-contain mx-auto" />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
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
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
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
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <a 
                href="/login" 
                className="text-primary hover:underline font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
