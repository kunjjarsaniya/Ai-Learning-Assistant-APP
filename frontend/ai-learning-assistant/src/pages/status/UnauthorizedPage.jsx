import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, ArrowLeft } from 'lucide-react';
import StatusPageLayout from '../../components/status/StatusPageLayout';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <StatusPageLayout
      errorCode="401"
      title="Authentication Required"
      description="You need to be logged in to access this learning material. Let's get you authenticated!"
      primaryAction={{
        text: "Log In",
        icon: LogIn,
        onClick: () => navigate('/login')
      }}
      secondaryAction={{
        text: "Go Back",
        icon: ArrowLeft,
        onClick: () => navigate(-1)
      }}
    />
  );
};

export default UnauthorizedPage;
