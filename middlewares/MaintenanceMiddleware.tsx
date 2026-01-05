
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../services/authContext.tsx';
import * as adminService from '../services/adminService.ts';
import { UserRole, SystemStatus } from '../types.ts';
import { MaintenanceScreen } from '../components/MaintenanceScreen.tsx';
import { MaintenanceBanner } from '../components/MaintenanceBanner.tsx';

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
      // Poll every 30 seconds to check if maintenance started
      const interval = setInterval(checkStatus, 30000);
      return () => clearInterval(interval);
  }, []);

  if (isChecking) return null; // Or a subtle loading spinner

  // Logic: Block if MAINTENANCE mode AND user is NOT Admin
  if (status.mode === 'MAINTENANCE') {
      if (!user || user.role !== UserRole.ADMIN) {
          return <MaintenanceScreen status={status} onRetry={checkStatus} />;
      }
  }

  return (
    <>
        <MaintenanceBanner status={status} isAdmin={user?.role === UserRole.ADMIN} />
        <Outlet context={{ systemStatus: status }} />
    </>
  );
};
