import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import StatusPageLayout from '../../components/status/StatusPageLayout';

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <StatusPageLayout
      errorCode="403"
      title="Access Forbidden"
      description="You don't have permission to view this content. It might be locked or restricted to other users."
      primaryAction={{
        text: "Back to Dashboard",
        icon: Home,
        onClick: () => navigate('/')
      }}
    />
  );
};

export default ForbiddenPage;
