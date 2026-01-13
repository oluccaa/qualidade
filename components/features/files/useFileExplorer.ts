
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/authContext.tsx';
import { fileService } from '../../../lib/services/index.ts';
import { useToast } from '../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { FileNode } from '../../../types/index.ts';

export const useFileExplorer = (props: any) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [internalFolderId, setInternalFolderId] = useState<string | null>(props.initialFolderId || null);

  const activeFolderId = props.currentFolderId !== undefined ? props.currentFolderId : internalFolderId;

  const fetchFiles = useCallback(async (resetPage = false) => {
    if (!user) return;
    const currentPage = resetPage ? 1 : page;
    setLoading(true);

    try {
      const result = await fileService.getFiles(user, activeFolderId, currentPage, 100);
      setFiles(prev => resetPage ? result.items : [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setPage(currentPage);
    } catch (err: any) {
      console.error("Erro no explorador:", err.message);
      showToast(t('files.errorLoadingFiles'), 'error');
    } finally {
      setLoading(false);
    }
  }, [user, page, activeFolderId, showToast, t]);

  const handleNavigate = (folderId: string | null) => {
    setPage(1);
    if (props.onNavigate) props.onNavigate(folderId);
    else setInternalFolderId(folderId);
  };

  useEffect(() => {
    fetchFiles(true);
  }, [activeFolderId, props.refreshKey]);

  return {
    files, 
    loading, 
    hasMore, 
    activeFolderId, 
    handleNavigate, 
    fetchFiles
  };
};
