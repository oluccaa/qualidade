
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, Download, Loader2, FileText, AlertCircle, 
  ChevronLeft, ChevronRight, Calendar, User, 
  HardDrive, Maximize2, Minimize2, ZoomIn, ZoomOut, 
  RotateCcw, ShieldCheck, Tag, Info, ExternalLink,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { FileNode, FileType } from '../../../types/index.ts';
import { fileService } from '../../../lib/services/index.ts';
import { useAuth } from '../../../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { FileStatusBadge } from './components/FileStatusBadge.tsx';
import { QualityStatus } from '../../../types/metallurgy.ts';

// Configuração do Worker do PDF.js para processamento paralelo
if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
  (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

interface FilePreviewModalProps {
  initialFile: FileNode | null;
  allFiles: FileNode[];
  isOpen: boolean;
  onClose: () => void;
  onDownloadFile: (file: FileNode) => void;
}

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [currentFile, setCurrentFile] = useState<FileNode | null>(initialFile);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // PDF Document States
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  
  // Viewer States - MVO: Iniciar sempre em 50%
  const [zoom, setZoom] = useState(0.5); 
  const [showSidebar, setShowSidebar] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sincronização inicial e controle de índice
  useEffect(() => {
    if (isOpen && initialFile) {
      const idx = allFiles.findIndex(f => f.id === initialFile.id);
      setCurrentIndex(idx);
      setCurrentFile(initialFile);
      setZoom(0.5); // Garante 50% no início
      setPageNum(1);
    }
  }, [isOpen, initialFile, allFiles]);

  // Carregamento de URL e Documento PDF
  useEffect(() => {
    if (currentFile && user && isOpen) {
      setLoading(true);
      setError(null);
      setPdfDoc(null);
      
      fileService.getFileSignedUrl(user, currentFile.id)
        .then(async (signedUrl) => {
          setUrl(signedUrl);
          
          if (currentFile.type === FileType.PDF || currentFile.name.toLowerCase().endsWith('.pdf')) {
            try {
              const loadingTask = (window as any).pdfjsLib.getDocument(signedUrl);
              const pdf = await loadingTask.promise;
              setPdfDoc(pdf);
              setNumPages(pdf.numPages);
              setPageNum(1);
            } catch (err) {
              console.error("PDF Load Error:", err);
              setError(t('files.errorLoadingDocument'));
            }
          }
        })
        .catch(() => setError(t('files.errorLoadingDocument')))
        .finally(() => setLoading(false));
    }
  }, [currentFile, user, isOpen, t]);

  // Renderização de Página no Canvas
  const renderPage = useCallback(async (num: number, scale: number) => {
    if (!pdfDoc || !canvasRef.current) return;
    
    setIsRendering(true);
    try {
      const page = await pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = Math.floor(viewport.width) + "px";
      canvas.style.height = Math.floor(viewport.height) + "px";

      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        transform: transform
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error("Render error:", err);
    } finally {
      setIsRendering(false);
    }
  }, [pdfDoc]);

  // Re-renderizar quando página ou zoom mudar
  useEffect(() => {
    if (pdfDoc) {
      renderPage(pageNum, zoom);
    }
  }, [pageNum, zoom, pdfDoc, renderPage]);

  // Navegação sequencial entre arquivos
  const navigateFile = useCallback((direction: 'next' | 'prev') => {
    if (allFiles.length <= 1) return;
    
    let newIndex = direction === 'next' 
      ? (currentIndex + 1) % allFiles.length 
      : (currentIndex - 1 + allFiles.length) % allFiles.length;
    
    setCurrentIndex(newIndex);
    setCurrentFile(allFiles[newIndex]);
    setZoom(0.5); // Reset zoom para 50% conforme requisito MVO
    setPageNum(1);
  }, [allFiles, currentIndex]);

  // Zoom Handlers
  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    if (type === 'in') setZoom(prev => Math.min(prev + 0.25, 4));
    else if (type === 'out') setZoom(prev => Math.max(prev - 0.25, 0.25));
    else setZoom(0.5);
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

  if (!isOpen || !currentFile) return null;

  const isImage = currentFile.type === FileType.IMAGE || currentFile.name.match(/\.(jpg|jpeg|png|webp)$/i);
  const isPDF = currentFile.type === FileType.PDF || currentFile.name.toLowerCase().endsWith('.pdf');

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-[200] bg-[#020617] flex flex-col animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Header Refinado */}
      <header className="h-16 shrink-0 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-500/30">
             {isImage ? <Tag className="text-blue-400" size={18} /> : <FileText className="text-blue-400" size={18} />}
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-bold text-sm truncate max-w-[200px] md:max-w-md tracking-tight leading-none">
              {currentFile.name}
            </h2>
            <p className="text-slate-500 text-[9px] uppercase font-black tracking-widest mt-1">
              Terminal de Visualização Aços Vital • {currentIndex + 1} de {allFiles.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          {isPDF && numPages > 1 && (
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-white/5 mr-4 shadow-inner">
               <button 
                onClick={() => setPageNum(p => Math.max(1, p - 1))}
                disabled={pageNum <= 1}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
               >
                 <ChevronUp size={16} />
               </button>
               <div className="px-3 text-[10px] font-black text-white border-x border-white/5 min-w-[60px] text-center">
                 Pág {pageNum} / {numPages}
               </div>
               <button 
                onClick={() => setPageNum(p => Math.min(numPages, p + 1))}
                disabled={pageNum >= numPages}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
               >
                 <ChevronDown size={16} />
               </button>
            </div>
          )}

          <ViewerButton onClick={() => onDownloadFile(currentFile)} icon={Download} title="Baixar Original" />
          <div className="w-px h-6 bg-white/10 mx-1" />
          <ViewerButton onClick={() => setShowSidebar(!showSidebar)} icon={showSidebar ? Minimize2 : Info} title="Dados Técnicos" active={showSidebar} />
          <ViewerButton onClick={toggleFullscreen} icon={isFullscreen ? Minimize2 : Maximize2} title="Tela Cheia" />
          <button 
            onClick={onClose}
            className="ml-2 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative bg-[#0f172a]">
        
        {/* Setas Laterais de Navegação (Requisito PO) */}
        {allFiles.length > 1 && (
          <>
            <NavArrow direction="left" onClick={() => navigateFile('prev')} />
            <NavArrow direction="right" onClick={() => navigateFile('next')} />
          </>
        )}

        {/* Floating Tool Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl shadow-2xl z-40 transition-opacity hover:opacity-100 opacity-60">
          <ViewerButton onClick={() => handleZoom('out')} icon={ZoomOut} title="Zoom Out" />
          <div className="px-3 text-[10px] font-black text-slate-400 w-14 text-center">
            {Math.round(zoom * 100)}%
          </div>
          <ViewerButton onClick={() => handleZoom('in')} icon={ZoomIn} title="Zoom In" />
          <div className="w-px h-4 bg-white/10 mx-1" />
          <ViewerButton onClick={() => handleZoom('reset')} icon={RotateCcw} title="Reset 50%" />
        </div>

        {/* Área de Renderização */}
        <main className="flex-1 overflow-auto custom-scrollbar flex items-start justify-center p-4 md:p-8">
          <div className="relative shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
            {loading && (
              <div className="flex flex-col items-center gap-4 text-slate-500 py-32">
                <Loader2 size={48} className="animate-spin text-blue-500" />
                <p className="text-[10px] font-black uppercase tracking-[4px]">Carregando Recurso...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center p-20 max-w-sm bg-slate-800/50 rounded-3xl border border-white/5 backdrop-blur-xl">
                <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={40} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{error}</h3>
                <button 
                  onClick={() => url && window.open(url, '_blank')}
                  className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                  <ExternalLink size={18} /> Abrir em Nova Aba
                </button>
              </div>
            )}

            {isPDF && pdfDoc && (
              <div className={`relative bg-white rounded shadow-2xl transition-opacity duration-300 ${isRendering ? 'opacity-50' : 'opacity-100'}`}>
                {isRendering && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/20 backdrop-blur-[2px]">
                    <Loader2 size={32} className="animate-spin text-blue-600" />
                  </div>
                )}
                <canvas ref={canvasRef} className="max-w-none bg-white rounded" />
              </div>
            )}

            {isImage && url && (
              <img 
                src={url} 
                alt={currentFile.name} 
                style={{ transform: `scale(${zoom / 0.5})`, transformOrigin: 'top center' }}
                className="max-w-[95vw] shadow-2xl rounded-lg transition-transform duration-200"
              />
            )}
          </div>
        </main>

        {/* Metadata Sidebar */}
        {showSidebar && (
          <aside className="w-80 shrink-0 bg-white border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300 z-50">
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <div>
                <h3 className="text-slate-900 text-xl font-black tracking-tighter leading-tight mb-6">
                  {currentFile.name}
                </h3>
                
                <div className="space-y-6">
                  <MetadataRow icon={FileText} label="MIME Type" value={currentFile.mimeType || 'N/A'} />
                  <MetadataRow icon={HardDrive} label="Tamanho" value={currentFile.size || 'N/A'} />
                  <MetadataRow icon={Calendar} label="Data de Registro" value={new Date(currentFile.updatedAt).toLocaleDateString('pt-BR')} />
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-4">Status da Qualidade</h4>
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
                      label="Analista Auditor" 
                      value={currentFile.metadata.inspectedBy || 'N/A'} 
                   />
                   <MetadataRow 
                      icon={ShieldCheck} 
                      label="Veredito em" 
                      value={currentFile.metadata.inspectedAt ? new Date(currentFile.metadata.inspectedAt).toLocaleDateString('pt-BR') : 'N/A'} 
                   />
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-200">
                <p className="text-[9px] text-slate-400 font-bold uppercase text-center tracking-widest">
                  ID UNÍVOCO: {currentFile.id.split('-')[0].toUpperCase()}
                </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

const ViewerButton = ({ onClick, icon: Icon, title, active = false }: any) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded-xl transition-all flex flex-col items-center gap-1 group
      ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
    title={title}
  >
    <Icon size={18} className="group-active:scale-90 transition-transform" />
  </button>
);

const NavArrow = ({ direction, onClick }: { direction: 'left' | 'right', onClick: () => void }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`absolute ${direction === 'left' ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 
                w-12 h-12 bg-slate-900/60 backdrop-blur-md text-white rounded-full 
                flex items-center justify-center hover:bg-[#b23c0e] transition-all 
                border border-white/10 shadow-2xl z-[60] group active:scale-95`}
    aria-label={direction === 'left' ? "Arquivo Anterior" : "Próximo Arquivo"}
  >
    {direction === 'left' ? (
      <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
    ) : (
      <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
    )}
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
