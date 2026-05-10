import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import GoogleSignInButton from '../../components/common/GoogleSignInButton'
import { BrainCircuit, Mail, Lock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast';

const LoginPage = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      const { token, user } = response.data;
      login(user, token);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
      toast.error(err.message || 'Failed to login.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setError('');
      const res = await authService.googleAuth(tokenResponse.access_token);
      const { token, user } = res.data;
      login(user, token);
      toast.success('Logged in with Google');
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.error || err?.message || 'Google sign-in failed';
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background gradient-mesh overflow-hidden relative selection:bg-primary/20 selection:text-primary py-4 sm:py-8">

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sage/5 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md px-4 sm:px-6 z-10">

        <div className="glass-strong border border-border rounded-[2rem] shadow-warm-lg p-5 sm:p-8 relative overflow-hidden group/card">

          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="text-center mb-5 sm:mb-6 relative">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl gradient-primary shadow-glow-primary mb-3 sm:mb-4 transform group-hover/card:scale-105 transition-transform duration-500 ease-out">
              <BrainCircuit className='w-6 h-6 sm:w-7 sm:h-7 text-white' strokeWidth={1.5} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-1 sm:mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm font-medium">
              Sign in to continue your journey
            </p>
          </div>

          {/* Google Sign-In Button */}
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            text="Continue with Google"
          />

          {/* Divider */}
          <div className="relative my-5 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground font-medium">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-10 sm:h-12 pl-10 sm:pl-11 pr-4 border rounded-xl sm:rounded-2xl bg-card text-foreground placeholder-muted-foreground text-sm font-medium transition-all duration-300 outline-none
                    ${focusedField === 'email'
                      ? 'border-primary bg-primary/5 shadow-[0_0_0_4px_rgba(6,95,70,0.1)]'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }
                  `}
                  placeholder='Enter your email here'
                />
              </div>
            </div>

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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-10 sm:h-12 pl-10 sm:pl-11 pr-4 border rounded-xl sm:rounded-2xl bg-card text-foreground placeholder-muted-foreground text-sm font-medium transition-all duration-300 outline-none
                    ${focusedField === 'password'
                      ? 'border-primary bg-primary/5 shadow-[0_0_0_4px_rgba(6,95,70,0.1)]'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }
                  `}
                  placeholder='••••••••'
                />
              </div>
            </div>

            {error && (
              <div className='rounded-xl bg-red-50/50 border border-red-100 p-2.5 sm:p-3 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300'>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <p className='text-[10px] sm:text-xs text-red-600 font-medium'>{error}</p>
              </div>
            )}

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
                    <span className="animate-pulse">Signing in...</span>
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform duration-300' strokeWidth={2.5} />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className='mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border'>
            <p className='text-center text-xs sm:text-sm text-muted-foreground font-medium'>
              Don't have an account?{' '}
              <Link to='/register' className='text-primary hover:text-primary-hover font-bold hover:underline decoration-2 underline-offset-4 transition-all'>
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        <p className='text-center text-[10px] sm:text-xs text-muted-foreground mt-4 sm:mt-6 font-medium opacity-70'>
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default LoginPage