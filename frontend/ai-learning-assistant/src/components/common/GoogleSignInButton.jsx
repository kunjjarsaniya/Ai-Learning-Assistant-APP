import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const GoogleSignInButton = ({ onSuccess, text = 'Continue with Google' }) => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (tokenResponse?.access_token) {
        onSuccess(tokenResponse);
      } else {
        toast.error('Google sign-in failed');
      }
    },
    onError: () => toast.error('Google sign-in failed'),
    scope: 'openid profile email',
    flow: 'implicit',
    ux_mode: 'popup',
  });

  if (!googleClientId || googleClientId === 'your_google_client_id_here') {
    return null;
  }

  return (
    <div className="w-full">
      <button
        onClick={() => login()}
        className="group relative w-full h-11 sm:h-12 flex items-center justify-center gap-3 px-4 border border-border rounded-xl sm:rounded-2xl bg-card hover:border-primary/40 hover:bg-primary/[0.03] active:scale-[0.98] transition-all duration-300 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/[0.02] to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
        <GoogleIcon />
        <span className="text-sm font-semibold text-foreground">{text}</span>
      </button>
    </div>
  );
};

export default GoogleSignInButton;
