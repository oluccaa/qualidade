
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { AuditLog } from '../../../../types/index.ts';
import { adminService } from '../../../../lib/services/index.ts';

interface InvestigationState {
  targetLog: AuditLog | null;
  relatedLogs: AuditLog[];
  riskScore: number;
}

export const useAdminAuditLogs = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AuditLog['severity'] | 'ALL'>('ALL');
  
  // Paginação
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [isInvestigationModalOpen, setIsInvestigationModalOpen] = useState(false);
  const [investigationData, setInvestigationData] = useState<InvestigationState>({ 
    targetLog: null, 
    relatedLogs: [], 
    riskScore: 0 
  });

  const loadLogs = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingLogs(true);
    try {
      // Usamos o adminService para logs globais
      const auditLogs = await adminService.getGlobalAuditLogs(user);
      setLogs(auditLogs);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      showToast(`Falha na recuperação de logs: ${message}`, 'error');
    } finally {
      setIsLoadingLogs(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        log.userName.toLowerCase().includes(search) || 
        log.action.toLowerCase().includes(search) || 
        log.target.toLowerCase().includes(search) || 
        (log.ip && log.ip.includes(searchTerm));
        
      const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
      
      return matchesSearch && matchesSeverity;
    });
  }, [logs, searchTerm, severityFilter]);

  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, severityFilter]);

  const handleOpenInvestigation = useCallback((log: AuditLog) => {
    const related = logs
      .filter(l => 
        (l.ip === log.ip && l.ip !== '127.0.0.1') || 
        (l.userId === log.userId && l.userId !== 'unknown')
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setInvestigationData({ 
      targetLog: log, 
      relatedLogs: related, 
      riskScore: log.severity === 'CRITICAL' ? 95 : log.severity === 'ERROR' ? 60 : 10 
    });
    setIsInvestigationModalOpen(true);
  }, [logs]);

  return {
    filteredLogs: paginatedLogs,
    totalItems: filteredLogs.length,
    isLoadingLogs,
    searchTerm,
    setSearchTerm,
    severityFilter,
    setSeverityFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    isInvestigationModalOpen,
    setIsInvestigationModalOpen,
    investigationData,
    handleOpenInvestigation,
    refreshLogs: loadLogs
  };
};
