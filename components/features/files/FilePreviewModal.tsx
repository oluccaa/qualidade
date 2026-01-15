import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, Download, Loader2, FileText, AlertCircle, 
  ChevronLeft, ChevronRight, Calendar, User, 
  HardDrive, Maximize2, Minimize2, ZoomIn, ZoomOut, 
  RotateCcw, ShieldCheck, Tag, Info
} from 'lucide-react';
import { FileNode, FileType } from '../../../types/index.ts';
import { fileService } from '../../../lib/services/index.ts';
import { useAuth } from '../../../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { FileStatusBadge } from './components/FileStatusBadge.tsx';
import { QualityStatus } from '../../../types/metallurgy.ts';

interface FilePreviewModalProps {
  initialFile: FileNode | null;
  allFiles: FileNode[];
  isOpen: boolean;
  onClose: () => void;
  onDownloadFile: (file: FileNode) => void;
}

/**
 * FilePreviewModal (Professional Grade Viewer)
 * Um visualizador imersivo que suporta PDFs e imagens com controles avançados de zoom e metadados técnicos.
 */
export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ 
  initialFile, 
  allFiles, 
  isOpen, 
  onClose, 
  onDownloadFile 
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  const [currentFile, setCurrentFile] = useState<FileNode | null>(initialFile);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Viewer States
  const [zoom, setZoom] = useState(1);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sincronização inicial
  useEffect(() => {
    if (isOpen && initialFile) {
      const idx = allFiles.findIndex(f => f.id === initialFile.id);
      setCurrentIndex(idx);
      setCurrentFile(initialFile);
      setZoom(1);
    }
  }, [isOpen, initialFile, allFiles]);

  // Carregamento de URL Assinada
  useEffect(() => {
    if (currentFile && user && isOpen) {
      setLoading(true);
      setError(null);
      fileService.getFileSignedUrl(user, currentFile.id)
        .then(signedUrl => setUrl(signedUrl))
        .catch(() => setError(t('files.errorLoadingDocument')))
        .finally(() => setLoading(false));
    }
  }, [currentFile, user, isOpen, t]);

  // Handlers de Navegação
  const navigateFile = useCallback((direction: 'next' | 'prev') => {
    if (allFiles.length <= 1) return;
    let newIndex = direction === 'next' 
      ? (currentIndex + 1) % allFiles.length 
      : (currentIndex - 1 + allFiles.length) % allFiles.length;
    
    setCurrentIndex(newIndex);
    setCurrentFile(allFiles[newIndex]);
    setZoom(1);
  }, [allFiles, currentIndex]);

  // Handlers de Visualização
  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    if (type === 'in') setZoom(prev => Math.min(prev + 0.25, 3));
    else if (type === 'out') setZoom(prev => Math.max(prev - 0.25, 0.5));
    else setZoom(1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') navigateFile('next');
      if (e.key === 'ArrowLeft') navigateFile('prev');
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') handleZoom('in');
      if (e.key === '-') handleZoom('out');
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [isOpen, navigateFile, onClose]);

  if (!isOpen || !currentFile) return null;

  const isImage = currentFile.name.match(/\.(jpg|jpeg|png|webp)$/i);

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-[200] bg-slate-950 flex flex-col animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Header - Glassmorphism */}
      <header className="h-16 shrink-0 bg-slate-900/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-500/10 rounded-xl">
             {isImage ? <Tag className="text-blue-400" size={20} /> : <FileText className="text-blue-400" size={20} />}
          </div>
          <div>
            <h2 className="text-white font-bold text-sm md:text-base tracking-tight leading-none">{currentFile.name}</h2>
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">
              Visualização Técnica Controlada
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ViewerButton onClick={() => onDownloadFile(currentFile)} icon={Download} title="Baixar Original" />
          <div className="w-px h-6 bg-white/10 mx-2" />
          <ViewerButton onClick={() => setShowSidebar(!showSidebar)} icon={showSidebar ? Minimize2 : Info} title="Info" active={showSidebar} />
          <ViewerButton onClick={toggleFullscreen} icon={isFullscreen ? Minimize2 : Maximize2} title="Tela Cheia" />
          <button 
            onClick={onClose}
            className="ml-2 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Viewer Area */}
        <main className="flex-1 relative flex items-center justify-center bg-slate-950 overflow-hidden">
          
          {/* Navegação Lateral */}
          {allFiles.length > 1 && (
            <>
              <NavArrow direction="left" onClick={() => navigateFile('prev')} />
              <NavArrow direction="right" onClick={() => navigateFile('next')} />
            </>
          )}

          {/* Floating Action Bar (Zoom & Tools) */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl shadow-2xl z-40">
            <ViewerButton onClick={() => handleZoom('out')} icon={ZoomOut} title="Zoom Out" />
            <div className="px-3 text-[10px] font-black text-slate-400 w-14 text-center">
              {Math.round(zoom * 100)}%
            </div>
            <ViewerButton onClick={() => handleZoom('in')} icon={ZoomIn} title="Zoom In" />
            <div className="w-px h-4 bg-white/10 mx-1" />
            <ViewerButton onClick={() => handleZoom('reset')} icon={RotateCcw} title="Resetar" />
          </div>

          {/* Content Rendering */}
          <div 
            className="w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
            style={{ transform: `scale(${zoom})` }}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-4 text-slate-500">
                <Loader2 size={48} className="animate-spin text-blue-500" />
                <p className="text-[10px] font-black uppercase tracking-[4px]">Sincronizando Buffer...</p>
              </div>
            ) : error ? (
              <div className="text-center p-8 max-w-sm">
                <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={40} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{error}</h3>
                <p className="text-slate-400 text-sm">{t('files.permissionOrExpiredLink')}</p>
              </div>
            ) : url && (
              isImage ? (
                <img 
                  src={url} 
                  alt={currentFile.name} 
                  className="max-w-[90%] max-h-[90%] object-contain shadow-[0_0_80px_rgba(0,0,0,0.5)] rounded-lg"
                />
              ) : (
                <iframe 
                  src={`${url}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full border-none bg-slate-900"
                  title={currentFile.name}
                />
              )
            )}
          </div>
        </main>

        {/* Technical Sidebar */}
        {showSidebar && (
          <aside className="w-80 shrink-0 bg-white border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300 z-40">
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <div>
                <h3 className="text-slate-900 text-xl font-black tracking-tighter leading-tight mb-6">
                  {currentFile.name}
                </h3>
                
                <div className="space-y-6">
                  <MetadataRow icon={FileText} label="Tipo de Recurso" value={currentFile.mimeType || 'N/A'} />
                  <MetadataRow icon={HardDrive} label="Peso do Arquivo" value={currentFile.size || 'N/A'} />
                  <MetadataRow icon={Calendar} label="Registro de Entrada" value={new Date(currentFile.updatedAt).toLocaleDateString('pt-BR')} />
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-4">Status de Auditoria</h4>
                <FileStatusBadge status={currentFile.metadata?.status} />
              </div>

              {currentFile.metadata?.status === QualityStatus.REJECTED && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 space-y-2">
                   <p className="text-[10px] font-black text-red-700 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle size={14} /> Motivo da Recusa
                   </p>
                   <p className="text-xs text-red-900 italic font-medium leading-relaxed">
                     "{currentFile.metadata.rejectionReason}"
                   </p>
                </div>
              )}

              {(currentFile.metadata?.inspectedBy || currentFile.metadata?.inspectedAt) && (
                <div className="pt-8 border-t border-slate-100 space-y-6">
                   <MetadataRow 
                      icon={User} 
                      label="Analista Responsável" 
                      value={currentFile.metadata.inspectedBy || 'N/A'} 
                   />
                   <MetadataRow 
                      icon={ShieldCheck} 
                      label="Data da Validação" 
                      value={currentFile.metadata.inspectedAt ? new Date(currentFile.metadata.inspectedAt).toLocaleDateString('pt-BR') : 'N/A'} 
                   />
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-200">
                <p className="text-[9px] text-slate-400 font-bold uppercase text-center tracking-widest">
                  ID: {currentFile.id.split('-')[0].toUpperCase()} • Aços Vital SGQ
                </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

/* --- Componentes Internos de UI --- */

const ViewerButton = ({ onClick, icon: Icon, title, active = false }: any) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded-xl transition-all flex flex-col items-center gap-1 group
      ${active ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
    title={title}
  >
    <Icon size={20} className="group-active:scale-90 transition-transform" />
  </button>
);

const NavArrow = ({ direction, onClick }: { direction: 'left' | 'right', onClick: () => void }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`absolute ${direction === 'left' ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 
                w-14 h-14 bg-slate-900/40 backdrop-blur-md text-white rounded-full 
                flex items-center justify-center hover:bg-blue-600 transition-all 
                border border-white/5 shadow-2xl z-40 group`}
  >
    {direction === 'left' ? <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" /> : <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />}
  </button>
);

const MetadataRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex gap-4">
    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0 border border-slate-100">
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[1.5px] mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-700 truncate">{value}</p>
    </div>
  </div>
);