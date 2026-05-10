import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import StatusPageLayout from '../../components/status/StatusPageLayout';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <StatusPageLayout
      errorCode="404"
      title="Page Not Found"
      description="Oops! The page you're looking for seems to have wandered off into the digital void. Let's get you back on track."
      primaryAction={{
        text: "Back to Dashboard",
        icon: Home,
        onClick: () => navigate('/')
      }}
      secondaryAction={{
        text: "Go Back",
        icon: ArrowLeft,
        onClick: () => navigate(-1)
      }}
    />
  );
};

export default NotFoundPage;
