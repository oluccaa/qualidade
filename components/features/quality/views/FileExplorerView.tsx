
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { FileNode, FileType, UserRole, normalizeRole } from '../../../../types/index.ts';
import { useFileCollection } from '../../files/hooks/useFileCollection.ts';
import { useFileOperations } from '../../files/hooks/useFileOperations.ts';
import { FileExplorer, FileExplorerHandle } from '../../files/FileExplorer.tsx';
import { ExplorerToolbar } from '../../files/components/ExplorerToolbar.tsx';
import { CreateFolderModal } from '../../files/modals/CreateFolderModal.tsx';
import { RenameModal } from '../../files/modals/RenameModal.tsx';
import { UploadFileModal } from '../../files/modals/UploadFileModal.tsx';
import { DeleteConfirmationModal } from '../../files/modals/DeleteConfirmationModal.tsx';
import { PaginationControls } from '../../../common/PaginationControls.tsx';
import { QualityLoadingState, ProcessingOverlay } from '../components/ViewStates.tsx';
import { fileService } from '../../../../lib/services/index.ts';
import { supabase } from '../../../../lib/supabaseClient.ts';
import { Layers, FileCheck, Sparkles, FolderTree, Cloud, Search, X } from 'lucide-react';

interface FileExplorerViewProps {
  orgId: string; // 'global' ou ID específico
  title?: string;
  icon?: React.ElementType;
  subtitle?: string;
}

export const FileExplorerView: React.FC<FileExplorerViewProps> = ({ 
  orgId, 
  title, 
  icon: IconProp,
  subtitle 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const role = normalizeRole(user?.role);
  const isStaff = role === UserRole.ADMIN || role === UserRole.QUALITY;
  
  const currentFolderId = searchParams.get('folderId');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => 
    (localStorage.getItem('explorer_view_mode') as 'grid' | 'list') || 'grid'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  
  const [isReady, setIsReady] = useState(false);
  const [isDraggingExternal, setIsDraggingExternal] = useState(false);
  const [externalFiles, setExternalFiles] = useState<File[]>([]);
  
  const [modals, setModals] = useState({
    upload: false, folder: false, rename: false, delete: false
  });
  
  const [fileToRename, setFileToRename] = useState<FileNode | null>(null);
  const fileExplorerRef = useRef<FileExplorerHandle>(null);
  const [contextualOwnerId, setContextualOwnerId] = useState<string | null>(orgId === 'global' ? null : orgId);

  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('explorer_view_mode', mode);
  };

  useEffect(() => {
    const resolveInitialFolder = async () => {
      if (orgId === 'global') {
        setIsReady(true);
        return;
      }
      if (orgId && !currentFolderId) {
        setIsReady(false);
        const { data } = await supabase.from('files').select('id').eq('owner_id', orgId).is('parent_id', null).maybeSingle();
        if (data?.id) {
          setSearchParams(p => { p.set('folderId', data.id); p.set('orgId', orgId); return p; }, { replace: true });
        }
      }
      setIsReady(true);
    };
    resolveInitialFolder();
  }, [orgId, currentFolderId, setSearchParams]);

  useEffect(() => {
    const resolveContextualOwner = async () => {
      if (orgId !== 'global') {
        setContextualOwnerId(orgId);
        return;
      }
      if (!currentFolderId) {
        setContextualOwnerId(null);
        return;
      }
      const { data } = await supabase.from('files').select('owner_id').eq('id', currentFolderId).single();
      setContextualOwnerId(data?.owner_id || null);
    };
    resolveContextualOwner();
  }, [orgId, currentFolderId]);

  const collection = useFileCollection({ currentFolderId, searchTerm, ownerId: orgId });
  const ops = useFileOperations(contextualOwnerId, () => collection.fetchFiles());

  const activeSelectedFile = collection.files.find(f => f.id === selectedFileIds[selectedFileIds.length - 1]) || null;

  const handleNavigate = useCallback((folderId: string | null) => {
    setSelectedFileIds([]);
    setSearchParams(prev => {
      if (folderId) prev.set('folderId', folderId);
      else prev.delete('folderId');
      prev.set('orgId', orgId); 
      return prev;
    }, { replace: true });
  }, [setSearchParams, orgId]);

  const handleFileClick = (file: FileNode) => {
    if (file.type === FileType.FOLDER) {
      handleNavigate(file.id);
    } else {
      navigate(`/preview/${file.id}`);
    }
  };

  const HeaderIcon = IconProp || Layers;

  if (!isReady) return <QualityLoadingState message="Sincronizando Vault..." />;

  return (
    <div 
        className="flex-1 flex flex-col min-h-0 w-full bg-[#f1f5f9] relative overflow-hidden"
        onDragOver={(e) => { if(isStaff) { e.preventDefault(); setIsDraggingExternal(true); } }}
        onDragLeave={() => setIsDraggingExternal(false)}
        onDrop={(e) => {
            if(!isStaff) return;
            e.preventDefault();
            setIsDraggingExternal(false);
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                setExternalFiles(files);
                setModals(m => ({ ...m, upload: true }));
            }
        }}
    >
      {/* Camada Estética Institutional */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 bg-[radial-gradient(at_top_left,_#ffffff,_transparent)]" />
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {ops.isProcessing && <ProcessingOverlay message="Sincronizando Protocolos..." />}
      
      {/* Modais de Operação (Apenas se Staff) */}
      {isStaff && (
        <>
          <UploadFileModal isOpen={modals.upload} onClose={() => { setModals(m => ({...m, upload: false})); setExternalFiles([]); }} onUpload={async (files) => { await ops.handleUploadBatch(files, currentFolderId); setModals(m => ({...m, upload: false})); setExternalFiles([]); }} isUploading={ops.isProcessing} currentFolderId={currentFolderId} initialFiles={externalFiles} />
          <CreateFolderModal isOpen={modals.folder} onClose={() => setModals(m => ({...m, folder: false}))} onCreate={async (n) => { await ops.handleCreateFolder(n, currentFolderId); setModals(m => ({...m, folder: false})); }} isCreating={ops.isProcessing} />
          <RenameModal isOpen={modals.rename} onClose={() => setModals(m => ({...m, rename: false}))} onRename={async (n) => { await ops.handleRename(fileToRename!.id, n); setModals(m => ({...m, rename: false})); }} isRenaming={ops.isProcessing} currentName={fileToRename?.name || ''} />
          <DeleteConfirmationModal isOpen={modals.delete} onClose={() => setModals(m => ({...m, delete: false}))} onConfirm={async () => { await ops.handleDelete(selectedFileIds); setModals(m => ({...m, delete: false})); setSelectedFileIds([]); }} isDeleting={ops.isProcessing} itemCount={selectedFileIds.length} hasFolder={collection.files.some(f => selectedFileIds.includes(f.id) && f.type === FileType.FOLDER)} />
        </>
      )}

      {/* Header Premium Unificado */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-10 py-8 shrink-0 bg-white/40 backdrop-blur-xl border-b border-slate-200/60 z-20">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-[1.5rem] shadow-xl shadow-blue-500/20">
             <HeaderIcon size={28} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-[3px] bg-blue-50 px-2 py-0.5 rounded-full">Vital Cloud System</span>
                <Sparkles size={10} className="text-blue-400" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                {title || (orgId === 'global' ? 'Cloud Industrial' : t('client.library.title'))}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col text-right mr-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle || "Sincronização em Tempo Real"}</span>
                <span className="text-xs font-black text-slate-900 uppercase">99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-sm shrink-0 font-black text-[11px] uppercase tracking-widest">
                 <FileCheck size={18} className="text-blue-600" strokeWidth={3} />
                 {collection.totalItems} Recursos
            </div>
        </div>
      </header>

      {/* Toolbar Premium (Shrink-0) */}
      <div className="shrink-0 z-10 bg-white/30 backdrop-blur-md border-b border-slate-200/50 px-10 py-4">
          <ExplorerToolbar
                viewMode={viewMode}
                onViewChange={handleViewChange}
                onNavigate={handleNavigate}
                breadcrumbs={collection.breadcrumbs}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onUploadClick={() => setModals(m => ({ ...m, upload: true }))} 
                onCreateFolderClick={() => setModals(m => ({ ...m, folder: true }))}
                selectedCount={selectedFileIds.length}
                onDeleteSelected={() => setModals(m => ({ ...m, delete: true }))} 
                onRenameSelected={() => { if(activeSelectedFile) { setFileToRename(activeSelectedFile); setModals(m => ({...m, rename: true})); } }}
                onDownloadSelected={async () => {
                    if (activeSelectedFile) {
                        const url = await fileService.getFileSignedUrl(user!, activeSelectedFile.id);
                        window.open(url, '_blank');
                    }
                }}
                userRole={role}
                selectedFilesData={collection.files.filter(f => selectedFileIds.includes(f.id))}
            />
      </div>

      {/* Área de Dados (Flex-1) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-10 pt-10 pb-24 relative z-10">
            <FileExplorer 
                ref={fileExplorerRef}
                files={collection.files} 
                loading={collection.loading}
                currentFolderId={currentFolderId}
                searchTerm={searchTerm}
                breadcrumbs={collection.breadcrumbs}
                selectedFileIds={selectedFileIds}
                onToggleFileSelection={(id) => setSelectedFileIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                onNavigate={handleNavigate}
                onFileSelectForPreview={handleFileClick}
                onDownloadFile={async (f) => { const url = await fileService.getFileSignedUrl(user!, f.id); window.open(url, '_blank'); }}
                onRenameFile={(f) => { setFileToRename(f); setModals(m => ({...m, rename: true})); }}
                onDeleteFile={(id) => { setSelectedFileIds([id]); setModals(m => ({...m, delete: true})); }}
                viewMode={viewMode}
                userRole={role}
            />
      </div>

      {/* Rodapé de Paginação Fixa */}
      <PaginationControls 
        currentPage={collection.page}
        pageSize={collection.pageSize}
        totalItems={collection.totalItems}
        onPageChange={collection.setPage}
        onPageSizeChange={collection.setPageSize}
        isLoading={collection.loading}
      />

      {/* Drag Overlay (Staff only) */}
      {isDraggingExternal && (
        <div className="absolute inset-0 z-[100] bg-blue-600/10 backdrop-blur-sm border-4 border-dashed border-blue-500/50 flex items-center justify-center animate-in fade-in duration-200">
           <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center space-y-4">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto animate-bounce">
                  <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24"><path d="M11 15h2v-3h3l-4-4-4 4h3z"/><path d="M20 18H4v-7H2v7c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-7h-2v7z"/></svg>
              </div>
              <p className="text-xl font-black text-slate-800 uppercase tracking-tight">Soltar para Importar</p>
           </div>
        </div>
      )}
    </div>
  );
};
