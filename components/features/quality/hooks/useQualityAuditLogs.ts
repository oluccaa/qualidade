
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { AuditLog } from '../../../../types/index.ts';
import { qualityService } from '../../../../lib/services/index.ts';

export const useQualityAuditLogs = (refreshTrigger: number) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AuditLog['severity'] | 'ALL'>('ALL');
  
  // Paginação
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [investigation, setInvestigation] = useState<{ 
    isOpen: boolean; 
    targetLog: AuditLog | null; 
  }>({ isOpen: false, targetLog: null });

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await qualityService.getTechnicalAuditLogs(user.id, { 
        search, 
        severity: severityFilter 
      });
      setLogs(data);
    } catch (err: any) {
      showToast(t('common.errorLoadingLogs', { message: err.message }), 'error');
    } finally {
      setLoading(false);
    }
  }, [user, search, severityFilter, t, showToast]);

  useEffect(() => {
    const timer = setTimeout(fetchLogs, 300);
    return () => clearTimeout(timer);
  }, [fetchLogs, refreshTrigger]);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
        const matchesSearch = l.userName.toLowerCase().includes(search.toLowerCase()) || 
                             l.action.toLowerCase().includes(search.toLowerCase()) ||
                             l.target.toLowerCase().includes(search.toLowerCase());
        const matchesSeverity = severityFilter === 'ALL' || l.severity === severityFilter;
        return matchesSearch && matchesSeverity;
    });
  }, [logs, search, severityFilter]);

  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, severityFilter]);

  return {
    qualityAuditLogs: paginatedLogs,
    totalItems: filteredLogs.length,
    loadingAuditLogs: loading,
    auditLogSearch: search,
    setAuditLogSearch: setSearch,
    auditLogSeverityFilter: severityFilter,
    setAuditLogSeverityFilter: setSeverityFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    isAuditLogInvestigationModalOpen: investigation.isOpen,
    setIsAuditLogInvestigationModalOpen: (open: boolean) => setInvestigation(p => ({ ...p, isOpen: open })),
    auditLogInvestigationData: { 
      targetLog: investigation.targetLog
    },
    handleOpenQualityAuditLogInvestigation: (log: AuditLog) => setInvestigation({ isOpen: true, targetLog: log }),
  };
};
