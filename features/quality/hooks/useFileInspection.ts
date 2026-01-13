
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/authContext.tsx';
import { useToast } from '../../../context/notificationContext.tsx';
import { FileNode } from '../../../types/index';
import { fileService, notificationService } from '../../../lib/services/index.ts';

export const useFileInspection = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [inspectorFile, setInspectorFile] = useState<FileNode | null>(null);
  const [loadingFile, setLoadingFile] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mainPreviewUrl, setMainPreviewUrl] = useState<string | null>(null);
  // Fix: Added missing state for file preview modal
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null);

  const fetchFileDetails = useCallback(async () => {
    if (!user || !fileId) return;
    setLoadingFile(true);
    try {
      // No schema real, buscamos os arquivos e filtramos o ID
      const result = await fileService.getFiles(user, null, 1, 1000); 
      const foundFile = result.items.find(f => f.id === fileId);

      if (foundFile) {
        setInspectorFile(foundFile);
        const url = await fileService.getFileSignedUrl(user, foundFile.id);
        setMainPreviewUrl(url);
      } else {
        showToast("Arquivo não localizado ou sem permissão.", 'error');
        navigate(-1);
      }
    } catch (err) {
      showToast("Erro ao carregar inspeção.", 'error');
    } finally {
      setLoadingFile(false);
    }
  }, [fileId, user, navigate, showToast]);

  useEffect(() => {
    fetchFileDetails();
  }, [fetchFileDetails]);

  const handleInspectAction = async (action: 'APPROVE' | 'REJECT', reason?: string) => {
    if (!inspectorFile || !user) return;
    setIsProcessing(true);
    try {
      const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      const updatedMetadata = {
        ...inspectorFile.metadata,
        status,
        rejectionReason: reason,
        inspectedAt: new Date().toISOString(),
        inspectedBy: user.name
      };

      await fileService.updateFile(user, inspectorFile.id, { metadata: updatedMetadata });

      if (inspectorFile.ownerId) {
        await notificationService.addNotification(
          inspectorFile.ownerId,
          status === 'APPROVED' ? "Certificado Aprovado" : "Certificado Recusado",
          `O documento ${inspectorFile.name} foi analisado.`,
          status === 'APPROVED' ? 'SUCCESS' : 'ALERT'
        );
      }

      showToast(`Documento ${action === 'APPROVE' ? 'aprovado' : 'recusado'}!`, 'success');
      setInspectorFile({ ...inspectorFile, metadata: updatedMetadata });
    } catch (err) {
      showToast("Falha na gravação do status.", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Fix: Added missing handler for file download
  const handleDownload = async (file: FileNode) => {
    if (!user) return;
    try {
      const url = await fileService.getFileSignedUrl(user, file.id);
      window.open(url, '_blank');
    } catch (err) {
      showToast("Erro ao baixar arquivo.", 'error');
    }
  };

  // Fix: Added missing handler to reset status to pending
  const handleSetStatusToPending = async (file: FileNode) => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const updatedMetadata = {
        ...file.metadata,
        status: 'PENDING' as const,
        rejectionReason: undefined
      };
      await fileService.updateFile(user, file.id, { metadata: updatedMetadata });
      setInspectorFile({ ...file, metadata: updatedMetadata });
      showToast("Status alterado para pendente.", 'success');
    } catch (err) {
      showToast("Erro ao alterar status.", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    inspectorFile,
    loadingFile,
    isProcessing,
    mainPreviewUrl,
    handleInspectAction,
    handleBack: () => navigate(-1),
    // Fix: Exported missing state and handlers for view compatibility
    previewFile,
    setPreviewFile,
    handleDownload,
    handleSetStatusToPending,
    handleBackToClientFiles: () => navigate(-1)
  };
};
