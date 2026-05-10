import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hourglass, RotateCcw, Home } from 'lucide-react';
import StatusPageLayout from '../../components/status/StatusPageLayout';

const TimeoutPage = () => {
  const navigate = useNavigate();

  return (
    <StatusPageLayout
      icon={Hourglass}
      title="Request Timeout"
      description="The server took too long to respond. Our AI might be processing a particularly complex task. Please try again."
      primaryAction={{
        text: "Try Again",
        icon: RotateCcw,
        onClick: () => window.location.reload()
      }}
      secondaryAction={{
        text: "Dashboard",
        icon: Home,
        onClick: () => navigate('/')
      }}
    />
  );
};

export default TimeoutPage;
