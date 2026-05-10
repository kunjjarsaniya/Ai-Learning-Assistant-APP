import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Home } from 'lucide-react';
import StatusPageLayout from '../../components/status/StatusPageLayout';

const ComingSoonPage = () => {
  const navigate = useNavigate();

  return (
    <StatusPageLayout
      icon={Rocket}
      title="Coming Soon!"
      description="We're currently building this amazing feature. Check back later to see it in action!"
      primaryAction={{
        text: "Back to Dashboard",
        icon: Home,
        onClick: () => navigate('/')
      }}
    />
  );
};

export default ComingSoonPage;
