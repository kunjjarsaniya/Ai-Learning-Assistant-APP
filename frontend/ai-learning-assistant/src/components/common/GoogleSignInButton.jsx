import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

const GoogleSignInButton = ({ onSuccess, text = 'signin_with' }) => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId || googleClientId === 'your_google_client_id_here') {
    return null;
  }

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse?.credential) {
            onSuccess(credentialResponse);
          } else {
            toast.error('Google sign-in failed');
          }
        }}
        onError={() => {
          toast.error('Google sign-in failed');
        }}
        theme="outline"
        size="large"
        text={text}
        shape="rectangular"
        width="100%"
      />
    </div>
  );
};

export default GoogleSignInButton;
