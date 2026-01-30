
import { useState, useEffect, useCallback, useRef } from 'react';
import { FileNode, SteelBatchMetadata, User, UserRole, normalizeRole } from '../../../../types/index.ts';
import { fileService, partnerService } from '../../../../lib/services/index.ts';
import { useToast } from '../../../../context/notificationContext.tsx';

// Cache estático de URLs assinadas para evitar re-fetches
const SIGNED_URL_CACHE = new Map<string, { url: string; expiry: number }>();

export const useFilePreview = (user: User | null, initialFile: FileNode | null) => {
  const { showToast } = useToast();
  const [currentFile, setCurrentFile] = useState<FileNode | null>(initialFile);
  const [url, setUrl] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const cacheKey = `vital_viewer_state_${initialFile?.id}`;
  const getCachedState = () => {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  };

  const cached = getCachedState();
  const [pageNum, setPageNum] = useState(cached?.pageNum || 1);
  const [zoom, setZoom] = useState(cached?.zoom || 1.25);
  
  const isMounted = useRef(true);
  const activeFileId = useRef<string | null>(null);

  useEffect(() => {
    if (!initialFile?.id) return;
    sessionStorage.setItem(cacheKey, JSON.stringify({ pageNum, zoom }));
  }, [pageNum, zoom, initialFile?.id, cacheKey]);

  const loadFileDetails = useCallback(async (id: string) => {
    if (!user || !id || activeFileId.current === id) return;
    
    activeFileId.current = id;
    setIsSyncing(true);

    try {
        // Tenta pegar do cache antes de ir ao Supabase
        let signedUrl = "";
        const cached = SIGNED_URL_CACHE.get(id);
        if (cached && cached.expiry > Date.now()) {
            signedUrl = cached.url;
        }

        const fetchPromise = signedUrl 
          ? fileService.getFile(user, id) 
          : Promise.all([fileService.getFile(user, id), fileService.getFileSignedUrl(user, id)]);

        const result = await fetchPromise;
        
        if (!isMounted.current) return;

        if (Array.isArray(result)) {
            const [fileData, newUrl] = result;
            setCurrentFile(fileData);
            setUrl(newUrl);
            SIGNED_URL_CACHE.set(id, { url: newUrl, expiry: Date.now() + 3500000 });
        } else {
            setCurrentFile(result as FileNode);
            setUrl(signedUrl);
        }

        // Registro de visualização assíncrono
        if (normalizeRole(user.role) === UserRole.CLIENT) {
            partnerService.logFileView(user, (Array.isArray(result) ? result[0] : result) as FileNode);
        }

    } catch (e: any) {
        if (isMounted.current) showToast("Erro na sincronização de segurança.", "error");
    } finally {
        if (isMounted.current) setIsSyncing(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    isMounted.current = true;
    if (user && initialFile?.id) loadFileDetails(initialFile.id);
    return () => { isMounted.current = false; };
  }, [initialFile?.id, user, loadFileDetails]);

  const handleUpdateMetadata = useCallback(async (updatedMetadata: Partial<SteelBatchMetadata>) => {
    if (!currentFile) return;
    setIsSyncing(true);
    try {
        await fileService.updateFileMetadata(currentFile.id, updatedMetadata);
        if (isMounted.current) {
            setCurrentFile(prev => prev ? ({
                ...prev,
                metadata: { ...(prev.metadata || {}), ...updatedMetadata } as SteelBatchMetadata
            }) : null);
            showToast("Ledger atualizado.", "success");
        }
    } catch (e: any) {
        showToast("Erro na persistência.", "error");
    } finally {
        if (isMounted.current) setIsSyncing(false);
    }
  }, [currentFile, showToast]);

  return {
    currentFile, url, isSyncing, pageNum, setPageNum, zoom, setZoom,
    handleUpdateMetadata, handleDownload: () => url && window.open(url, '_blank')
  };
};
