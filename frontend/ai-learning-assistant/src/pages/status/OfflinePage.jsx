import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WifiOff, RotateCcw } from 'lucide-react';
import StatusPageLayout from '../../components/status/StatusPageLayout';

const OfflinePage = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      navigate(-1); // Automatically go back when online
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [navigate]);

  return (
    <StatusPageLayout
      icon={WifiOff}
      title="You're Offline"
      description="It seems you've lost your internet connection. Don't worry, some of your cached materials might still be available, but this page requires a connection."
      primaryAction={{
        text: "Try Again",
        icon: RotateCcw,
        onClick: () => window.location.reload()
      }}
    />
  );
};

export default OfflinePage;
