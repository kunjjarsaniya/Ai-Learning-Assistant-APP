import React from 'react';
import { Wrench } from 'lucide-react';
import StatusPageLayout from '../../components/status/StatusPageLayout';

const MaintenancePage = () => {
  return (
    <StatusPageLayout
      icon={Wrench}
      title="Under Maintenance"
      description="We're currently upgrading RankUP's AI cores to bring you an even better learning experience. We'll be back online shortly!"
      primaryAction={{
        text: "Refresh Status",
        onClick: () => window.location.reload()
      }}
    />
  );
};

export default MaintenancePage;
