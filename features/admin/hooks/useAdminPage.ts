import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/authContext.tsx';
import { useToast } from '../../../context/notificationContext.tsx';
import { adminService, userService } from '../../../lib/services/index.ts';
import { UserRole, SystemStatus, User, normalizeRole } from '../../../types/index.ts';
import { AdminStatsData } from '../../../lib/services/interfaces.ts';

export const useAdminPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const activeTab = searchParams.get('tab') || 'overview';
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [adminStats, setAdminStats] = useState<AdminStatsData | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [qualityAnalysts, setQualityAnalysts] = useState<User[]>([]);

  const loadInitialData = useCallback(async () => {
    if (!user) return;
    
    // Blindagem de segurança nível hook: Redireciona se não for ADMIN de fato
    if (normalizeRole(user.role) !== 'ADMIN') {
        navigate('/dashboard');
        return;
    }

    setIsLoading(true);
    try {
      const [stats, status, analysts] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getSystemStatus(),
        userService.getUsersByRole(UserRole.QUALITY),
      ]);

      setAdminStats(stats);
      setSystemStatus(status);
      setQualityAnalysts(analysts);
    } catch (err: any) {
      console.error("[useAdminPage] Erro no carregamento:", err.message);
      showToast("Falha ao sincronizar dados administrativos.", 'error');
    } finally {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [user, showToast, navigate]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const changeTab = (tab: string) => {
    navigate(`/admin?tab=${tab}`);
  };

  return {
    user,
    activeTab,
    isLoading,
    isSaving,
    setIsSaving,
    adminStats,
    systemStatus,
    setSystemStatus,
    qualityAnalysts,
    changeTab,
    refreshData: loadInitialData
  };
};