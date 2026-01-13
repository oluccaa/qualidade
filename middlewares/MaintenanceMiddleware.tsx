import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext.tsx';
import { adminService } from '../lib/services/index.ts';
import { UserRole, SystemStatus } from '../types/index.ts';
import { MaintenanceScreen } from '../components/common/MaintenanceScreen.tsx';

export const MaintenanceMiddleware: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SystemStatus>({ mode: 'ONLINE' });
  const [isChecking, setIsChecking] = useState(true);

  const checkStatus = async () => {
      const s = await adminService.getSystemStatus();
      setStatus(s);
      setIsChecking(false);
  };

  useEffect(() => {
      checkStatus();
      const interval = setInterval(checkStatus, 30000);
      return () => clearInterval(interval);
  }, []);

  if (isChecking) return null;

  if (status.mode === 'MAINTENANCE') {
      const userRole = String(user?.role).toUpperCase();
      if (!user || userRole !== 'ADMIN') {
          return <MaintenanceScreen status={status} onRetry={checkStatus} />;
      }
  }

  return (
    <>
        <Outlet context={{ systemStatus: status }} />
    </>
  );
};