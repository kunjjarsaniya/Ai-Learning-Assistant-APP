import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogIn } from 'lucide-react';
import StatusPageLayout from '../../components/status/StatusPageLayout';

const SessionExpiredPage = () => {
  const navigate = useNavigate();

  return (
    <StatusPageLayout
      icon={Clock}
      title="Session Expired"
      description="For your security, your session has expired due to inactivity. Please log in again to continue your learning journey."
      primaryAction={{
        text: "Log In",
        icon: LogIn,
        onClick: () => navigate('/login')
      }}
    />
  );
};

export default SessionExpiredPage;
