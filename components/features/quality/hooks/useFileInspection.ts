
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { FileNode, SteelBatchMetadata, QualityStatus, FileType } from '../../../../types/index.ts';
import { qualityService, fileService } from '../../../../lib/services/index.ts';
import { supabase } from '../../../../lib/supabaseClient.ts';

const inspectionCache = new Map<string, FileNode>();
// Cache de URLs para evitar re-assinaturas caras
const urlCache = new Map<string, { url: string; expiry: number }>();

export const useFileInspection = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [inspectorFile, setInspectorFile] = useState<FileNode | null>(inspectionCache.get(fileId!) || null);
  const [loadingFile, setLoadingFile] = useState(!inspectorFile);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mainPreviewUrl, setMainPreviewUrl] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!user || !fileId) return;
    
    if (!inspectorFile) setLoadingFile(true);
    
    try {
      const file = await fileService.getFile(user, fileId);
      setInspectorFile(file);
      inspectionCache.set(fileId, file);

      // PRE-FETCHING AGRESSIVO: Assinar URL imediatamente após carregar metadados
      if (file.storagePath && file.storagePath !== 'system/folder') {
          const cached = urlCache.get(file.storagePath);
          if (cached && cached.expiry > Date.now()) {
            setMainPreviewUrl(cached.url);
          } else {
            const url = await fileService.getSignedUrl(file.storagePath);
            urlCache.set(file.storagePath, { url, expiry: Date.now() + 3500000 }); // ~1h
            setMainPreviewUrl(url);
          }
      }
    } catch (err: any) {
      showToast(err.message || "Falha na sincronização técnica.", 'error');
      navigate(-1);
    } finally {
      setLoadingFile(false);
    }
  }, [fileId, user, navigate, showToast, inspectorFile]);

  useEffect(() => {
    fetchDetails();
  }, [fileId]); // Apenas quando o ID mudar

  const handleInspectAction = async (updates: Partial<SteelBatchMetadata>) => {
    if (!inspectorFile || !user) return;
    setIsProcessing(true);
    try {
      await qualityService.submitVeredict(user, inspectorFile, updates);
      const updatedFile = { 
        ...inspectorFile, 
        metadata: { ...inspectorFile.metadata!, ...updates } as SteelBatchMetadata
      };
      setInspectorFile(updatedFile);
      inspectionCache.set(inspectorFile.id, updatedFile);
    } catch (err) {
      showToast("Falha ao gravar veredito no ledger.", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateNewVersion = async (file: File) => {
    if (!inspectorFile || !user) return;
    setIsProcessing(true);
    try {
      const currentVersion = inspectorFile.versionNumber || 1;
      const nextVersion = currentVersion + 1;
      const sanitizedName = file.name.replace(/\s+/g, '_').toLowerCase();
      const filePath = `${inspectorFile.ownerId}/versions/v${nextVersion}_${Date.now()}_${sanitizedName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const historicalEntry = {
        version: currentVersion,
        storagePath: inspectorFile.storagePath,
        createdAt: inspectorFile.updatedAt || new Date().toISOString(),
        createdBy: user.name,
        note: "Substituído por nova versão técnica."
      };

      const updatedMetadata = {
        ...(inspectorFile.metadata || {}),
        versionHistory: [historicalEntry, ...(inspectorFile.metadata?.versionHistory || [])],
        signatures: { step1_release: inspectorFile.metadata?.signatures?.step1_release },
        status: QualityStatus.SENT,
        documentalStatus: 'PENDING',
        physicalStatus: 'PENDING',
        currentStep: 2
      };

      const { error: updateError } = await supabase
        .from('files')
        .update({
          storage_path: uploadData.path,
          version_number: nextVersion,
          metadata: updatedMetadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', inspectorFile.id);

      if (updateError) throw updateError;
      
      inspectionCache.delete(inspectorFile.id);
      showToast(`Versão v${nextVersion}.0 efetivada.`, "success");
      await fetchDetails();
    } catch (err) {
      showToast("Falha crítica ao gerar nova versão.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadStepEvidence = async (file: File, step: 'documental' | 'physical') => {
    if (!inspectorFile || !user) return;
    setIsProcessing(true);
    try {
      const sanitizedName = file.name.replace(/\s+/g, '_').toLowerCase();
      const storagePath = `${inspectorFile.ownerId}/evidence/${step}/${Date.now()}_${sanitizedName}`;
      const { error: storageError } = await supabase.storage.from('certificates').upload(storagePath, file);
      if (storageError) throw storageError;

      const metadataKey = step === 'documental' ? 'documentalPhotos' : 'physicalPhotos';
      const currentPhotos = (inspectorFile.metadata as any)?.[metadataKey] || [];
      const updatedPhotos = [...currentPhotos, storagePath];

      await handleInspectAction({ [metadataKey]: updatedPhotos });
      showToast("Evidência arquivada com sucesso.", "success");
    } catch (err) {
      showToast("Erro ao processar anexo.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    inspectorFile, loadingFile, isProcessing,
    mainPreviewUrl, handleInspectAction,
    handleUploadStepEvidence, handleCreateNewVersion,
    user, handleDownload: async (file: FileNode) => {
      try {
        const url = await fileService.getSignedUrl(file.storagePath);
        window.open(url, '_blank');
      } catch { showToast("Erro ao baixar PDF.", 'error'); }
    },
    handleBackToClientFiles: () => navigate(-1)
  };
};
