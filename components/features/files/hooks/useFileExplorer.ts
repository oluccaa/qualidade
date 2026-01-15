
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { fileService } from '../../../../lib/services/index.ts';
import { useToast } from '../../../../context/notificationContext.tsx';
import { useTranslation } from 'react-i18next';
import { FileNode, BreadcrumbItem, UserRole, FileType } from '../../../../types/index.ts';

interface FileExplorerOptions {
  currentFolderId: string | null;
  refreshKey?: number;
  searchTerm: string;
  viewMode: 'grid' | 'list';
}

interface UseFileExplorerReturn {
  files: FileNode[];
  loading: boolean;
  hasMore: boolean;
  breadcrumbs: BreadcrumbItem[];
  handleNavigate: (folderId: string | null) => void;
  fetchFiles: (resetPage?: boolean) => Promise<void>;
  handleUploadFile: (fileBlob: File, fileName: string, parentId: string | null) => Promise<void>;
  handleCreateFolder: (folderName: string, parentId: string | null) => Promise<void>;
  handleDeleteFiles: (fileIds: string[]) => Promise<void>;
  handleRenameFile: (fileId: string, newName: string) => Promise<void>;
}

export const useFileExplorer = (options: FileExplorerOptions): UseFileExplorerReturn => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  const activeFolderId = options.currentFolderId; 

  const fetchFiles = useCallback(async (resetPage = false) => {
    if (!user) return;
    const currentPage = resetPage ? 1 : page;
    setLoading(true);

    try {
      const [fileResult, breadcrumbResult] = await Promise.all([
        fileService.getFiles(user, activeFolderId, currentPage, 100, options.searchTerm),
        fileService.getBreadcrumbs(activeFolderId)
      ]);
      
      setFiles(prev => resetPage ? fileResult.items : [...prev, ...fileResult.items]);
      setHasMore(fileResult.hasMore);
      setPage(currentPage);
      setBreadcrumbs(breadcrumbResult);
    } catch (err: unknown) {
      console.error("[useFileExplorer] Failure:", err);
      showToast(t('files.errorLoadingFiles'), 'error');
    } finally {
      setLoading(false);
    }
  }, [user, page, activeFolderId, options.searchTerm, showToast, t]);

  const handleNavigate = useCallback((folderId: string | null) => {
    setPage(1); 
    setHasMore(true);
  }, []);

  const handleUploadFile = useCallback(async (fileBlob: File, fileName: string, parentId: string | null) => {
    if (!user || !user.organizationId) {
        showToast(t('files.upload.noOrgLinked'), 'error');
        return;
    }
    setLoading(true);
    try {
        await fileService.uploadFile(user, {
            name: fileName,
            fileBlob: fileBlob,
            parentId: parentId,
            type: fileBlob.type.startsWith('image/') ? FileType.IMAGE : FileType.PDF,
            size: `${(fileBlob.size / 1024 / 1024).toFixed(2)} MB`,
            mimeType: fileBlob.type
        }, user.organizationId);
        showToast(t('files.upload.success'), 'success');
        await fetchFiles(true);
    } catch (err: any) {
        showToast(err.message || t('files.errorLoadingFiles'), 'error');
    } finally {
        setLoading(false);
    }
  }, [user, showToast, t, fetchFiles]);

  const handleCreateFolder = useCallback(async (folderName: string, parentId: string | null) => {
    if (!user || !user.organizationId) {
      showToast(t('files.createFolder.noOrgLinked'), 'error');
      return;
    }
    setLoading(true);
    try {
      await fileService.createFolder(user, parentId, folderName, user.organizationId);
      showToast(t('files.createFolder.success'), 'success');
      await fetchFiles(true);
    } catch (err: any) {
      showToast(err.message || t('files.errorLoadingFiles'), 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast, t, fetchFiles]);

  const handleDeleteFiles = useCallback(async (fileIds: string[]) => {
    if (!user || fileIds.length === 0) return;
    setLoading(true);
    try {
      await fileService.deleteFile(user, fileIds);
      showToast(t('files.delete.success'), 'success');
      await fetchFiles(true);
    } catch (err: any) {
      showToast(err.message || t('files.errorLoadingFiles'), 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast, t, fetchFiles]);

  const handleRenameFile = useCallback(async (fileId: string, newName: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await fileService.renameFile(user, fileId, newName);
      showToast(t('files.rename.success'), 'success');
      await fetchFiles(true);
    } catch (err: any) {
      showToast(err.message || t('files.errorLoadingFiles'), 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast, t, fetchFiles]);

  useEffect(() => {
    fetchFiles(true);
  }, [activeFolderId, options.refreshKey, options.searchTerm, fetchFiles]);

  return {
    files, 
    loading, 
    hasMore, 
    breadcrumbs,
    handleNavigate, 
    fetchFiles,
    handleUploadFile,
    handleCreateFolder,
    handleDeleteFiles,
    handleRenameFile
  };
};
