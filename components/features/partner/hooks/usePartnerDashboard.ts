import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { partnerService } from '../../../../lib/services/index.ts';
import { FileNode } from '../../../../types/index.ts';
import { DashboardStatsData } from '../../../../lib/services/interfaces.ts';
import { supabase } from '../../../../lib/supabaseClient.ts';

export const usePartnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [recentFiles, setRecentFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!user?.organizationId) {
      setIsLoading(false);
      return;
    }

    try {
      const [statsRes, filesRes] = await Promise.all([
        partnerService.getPartnerDashboardStats(user.organizationId),
        partnerService.getRecentActivity(user.organizationId)
      ]);
      
      setStats(statsRes);
      setRecentFiles(filesRes || []);
    } catch (error) {
      console.error("Falha ao carregar dashboard do parceiro:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.organizationId]);

  useEffect(() => {
    loadDashboardData();

    if (!user?.organizationId) return;

    // TÓPICO 4: Real-time para Cliente (Arquivos Próprios)
    const channel = supabase
      .channel(`partner_dashboard_${user.organizationId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'files', 
        filter: `owner_id=eq.${user.organizationId}` 
      }, () => {
          loadDashboardData();
      })
      .subscribe((status) => {
          setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.organizationId, loadDashboardData]);

  return {
    stats,
    recentFiles,
    isLoading,
    isLive,
    refresh: loadDashboardData
  };
};