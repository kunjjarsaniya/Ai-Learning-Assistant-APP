import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, RotateCcw } from 'lucide-react';
import StatusPageLayout from '../../components/status/StatusPageLayout';

const ServerErrorPage = () => {
  const navigate = useNavigate();

  return (
    <StatusPageLayout
      errorCode="500"
      title="Internal Server Error"
      description="Our AI circuits got a little tangled up. We're working on untangling them right now. Please try again in a few moments."
      primaryAction={{
        text: "Refresh Page",
        icon: RotateCcw,
        onClick: () => window.location.reload()
      }}
      secondaryAction={{
        text: "Back to Dashboard",
        icon: Home,
        onClick: () => navigate('/')
      }}
    />
  );
};

export default ServerErrorPage;
