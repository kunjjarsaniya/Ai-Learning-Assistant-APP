import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import GoogleSignInButton from '../../components/common/GoogleSignInButton'
import { BrainCircuit, Mail, Lock, User, ArrowRight, CheckCircle2, Shield, Check, X } from 'lucide-react'
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    level: '',
    color: '',
    requirements: {
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecial: false
    }
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) {
      return {
        score: 0,
        level: '',
        color: '',
        requirements: {
          minLength: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumber: false,
          hasSpecial: false
        }
      };
    }

    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    // Calculate score based on requirements met
    const metRequirements = Object.values(requirements).filter(Boolean).length;
    let score = 0;
    let level = '';
    let color = '';

    if (metRequirements <= 2) {
      score = 25;
      level = 'Weak';
      color = 'bg-red-500';
    } else if (metRequirements === 3) {
      score = 50;
      level = 'Fair';
      color = 'bg-yellow-500';
    } else if (metRequirements === 4) {
      score = 75;
      level = 'Good';
      color = 'bg-lime-500';
    } else if (metRequirements === 5) {
      score = 100;
      level = 'Strong';
      color = 'bg-green-500';
    }

    return { score, level, color, requirements };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Calculate password strength when password changes
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }

    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Custom validation to replace browser's default
    if (!formData.username.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.password) {
      setError('Please create a password');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!formData.confirmPassword) {
      setError('Please confirm your password');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register(
        formData.username,
        formData.email,
        formData.password
      );
      const { token, user } = response.data;
      login(user, token);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError('');
      const res = await authService.googleAuth(credentialResponse.credential);
      const { token, user } = res.data;
      login(user, token);
      toast.success('Account created with Google');
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.error || err?.message || 'Google sign-up failed';
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background gradient-mesh overflow-hidden relative selection:bg-primary/20 selection:text-primary py-2 sm:py-6">

      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sage/5 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md px-4 sm:px-6 z-10">

        {/* Main Card */}
        <div className="glass-strong border border-border rounded-[2rem] shadow-warm-lg p-4 sm:p-6 relative overflow-hidden group/card">

          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-4 sm:mb-6 relative">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl gradient-primary shadow-glow-primary mb-3 sm:mb-4 transform group-hover/card:scale-105 transition-transform duration-500 ease-out">
              <BrainCircuit className='w-6 h-6 sm:w-7 sm:h-7 text-white' strokeWidth={1.5} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-1 sm:mb-2">
              Create Account
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm font-medium">
              Join us and start your learning journey today
            </p>
          </div>

          {/* Google Sign-Up Button */}
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            text="Continue with Google"
          />

          <div className="relative my-4 sm:my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground font-medium">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">

            {/* Username Field */}
            <div className="space-y-1 sm:space-y-1.5">
              <label className="block text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                Full Name
              </label>
              <div className={`relative group transition-all duration-300 ${focusedField === 'username' ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none transition-colors duration-300 
                  ${focusedField === 'username' ? 'text-primary' : 'text-muted-foreground'}
                `}>
                  <User className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <input
                  type='text'
                  name='username'
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-10 sm:h-11 pl-10 sm:pl-11 pr-4 border rounded-xl sm:rounded-2xl bg-card text-foreground placeholder-muted-foreground text-sm font-medium transition-all duration-300 outline-none
                    ${focusedField === 'username'
                      ? 'border-primary bg-primary/5 shadow-[0_0_0_4px_rgba(6,95,70,0.1)]'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }
                  `}
                  placeholder='Enter your name & surname here'
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1 sm:space-y-1.5">
              <label className="block text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none transition-colors duration-300 
                  ${focusedField === 'email' ? 'text-primary' : 'text-muted-foreground'}
                `}>
                  <Mail className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-10 sm:h-11 pl-10 sm:pl-11 pr-4 border rounded-xl sm:rounded-2xl bg-card text-foreground placeholder-muted-foreground text-sm font-medium transition-all duration-300 outline-none
                    ${focusedField === 'email'
                      ? 'border-primary bg-primary/5 shadow-[0_0_0_4px_rgba(6,95,70,0.1)]'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }
                  `}
                  placeholder='Enter your email here'
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1 sm:space-y-1.5">
              <label className="block text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                Password
              </label>
              <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none transition-colors duration-300 
                  ${focusedField === 'password' ? 'text-primary' : 'text-muted-foreground'}
                `}>
                  <Lock className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <input
                  type='password'
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-10 sm:h-11 pl-10 sm:pl-11 pr-4 border rounded-xl sm:rounded-2xl bg-card text-foreground placeholder-muted-foreground text-sm font-medium transition-all duration-300 outline-none
                    ${focusedField === 'password'
                      ? 'border-primary bg-primary/5 shadow-[0_0_0_4px_rgba(6,95,70,0.1)]'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }
                  `}
                  placeholder='Create a password'
                />
              </div>

              {/* Password Strength Indicator */}
              {formData.password && focusedField === 'password' && passwordStrength.score < 100 && (
                <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Strength Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                        <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Password Strength
                        </span>
                      </div>
                      {passwordStrength.level && (
                        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide
                          ${passwordStrength.score === 100 ? 'text-green-500' :
                            passwordStrength.score >= 75 ? 'text-lime-500' :
                              passwordStrength.score >= 50 ? 'text-yellow-500' :
                                'text-red-500'}
                        `}>
                          {passwordStrength.level}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ease-out ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Requirements Checklist */}
                  <div className="grid grid-cols-1 gap-1.5 p-3 bg-primary/5 rounded-xl border border-border">
                    <RequirementItem
                      met={passwordStrength.requirements.minLength}
                      text="At least 8 characters"
                    />
                    <RequirementItem
                      met={passwordStrength.requirements.hasUppercase}
                      text="One uppercase letter"
                    />
                    <RequirementItem
                      met={passwordStrength.requirements.hasLowercase}
                      text="One lowercase letter"
                    />
                    <RequirementItem
                      met={passwordStrength.requirements.hasNumber}
                      text="One number"
                    />
                    <RequirementItem
                      met={passwordStrength.requirements.hasSpecial}
                      text="One special character (!@#$%^&*...)"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1 sm:space-y-1.5">
              <label className="block text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                Confirm Password
              </label>
              <div className={`relative group transition-all duration-300 ${focusedField === 'confirmPassword' ? 'scale-[1.02]' : ''}`}>
                <div className={`absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none transition-colors duration-300 
                  ${focusedField === 'confirmPassword' ? 'text-primary' : 'text-muted-foreground'}
                `}>
                  <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <input
                  type='password'
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-10 sm:h-11 pl-10 sm:pl-11 pr-4 border rounded-xl sm:rounded-2xl bg-card text-foreground placeholder-muted-foreground text-sm font-medium transition-all duration-300 outline-none
                    ${focusedField === 'confirmPassword'
                      ? 'border-primary bg-primary/5 shadow-[0_0_0_4px_rgba(6,95,70,0.1)]'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }
                  `}
                  placeholder='Confirm your password'
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className='rounded-xl bg-red-50/50 border border-red-100 p-2.5 sm:p-3 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300'>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <p className='text-[10px] sm:text-xs text-red-600 font-medium'>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className='group relative w-full h-10 sm:h-12 gradient-primary hover:shadow-glow-primary active:scale-[0.98] text-white text-sm font-bold rounded-xl sm:rounded-2xl transition-all duration-300 shadow-warm disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 overflow-hidden'
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className='relative z-10 flex items-center justify-center gap-2'>
                {loading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    <span className="animate-pulse">Creating account...</span>
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform duration-300' strokeWidth={2.5} />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer */}
          <div className='mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border'>
            <p className='text-center text-xs sm:text-sm text-muted-foreground font-medium'>
              Already have an account?{' '}
              <Link to='/login' className='text-primary hover:text-primary-hover font-bold hover:underline decoration-2 underline-offset-4 transition-all'>
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Text */}
        {/* <p className='text-center text-[10px] sm:text-xs text-slate-400 mt-4 sm:mt-6 font-medium'>
          By registering, you agree to our Terms & Privacy Policy
        </p> */}
      </div>
    </div>
  )
}

// Helper component for password requirement items
const RequirementItem = ({ met, text }) => (
  <div className="flex items-center gap-2">
    <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${met ? 'bg-green-500' : 'bg-primary/10'
      }`}>
      {met ? (
        <Check className="w-3 h-3 text-background" strokeWidth={3} />
      ) : (
        <X className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.5} />
      )}
    </div>
    <span className={`text-[10px] sm:text-xs font-medium transition-colors duration-300 ${met ? 'text-green-500' : 'text-muted-foreground'
      }`}>
      {text}
    </span>
  </div>
);

export default RegisterPage