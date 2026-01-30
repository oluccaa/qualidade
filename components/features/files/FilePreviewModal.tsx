import React, { useState, useEffect } from 'react';
import { 
  X, Download, ShieldCheck, FileText, Loader2, 
  Pencil, Highlighter, Square, Circle, Eraser, 
  Hand, Maximize2, ZoomIn, ZoomOut,
  // Added missing Chevron icons for page navigation
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { FileNode, UserRole, DocumentAnnotations } from '../../../types/index.ts';
import { useAuth } from '../../../context/authContext.tsx';
import { AuditWorkflow } from '../quality/components/AuditWorkflow.tsx';
import { PdfViewport } from './components/PdfViewport.tsx';
import { DrawingCanvas, DrawingTool } from './components/DrawingCanvas.tsx';
import { useFilePreview } from './hooks/useFilePreview.ts';

export const FilePreviewModal: React.FC<{ 
  initialFile: FileNode | null; 
  isOpen: boolean; 
  onClose: () => void; 
}> = ({ initialFile, isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTool, setActiveTool] = useState<DrawingTool>('hand');
  const [annotations, setAnnotations] = useState<DocumentAnnotations>({});
  
  const {
    currentFile,
    url,
    isSyncing,
    pageNum,
    setPageNum,
    zoom,
    setZoom,
    handleUpdateMetadata,
    handleDownload
  } = useFilePreview(user, initialFile);

  useEffect(() => {
    if (currentFile?.metadata?.documentalDrawings) {
      try {
        setAnnotations(JSON.parse(currentFile.metadata.documentalDrawings));
      } catch { setAnnotations({}); }
    } else { setAnnotations({}); }
  }, [currentFile?.id]);

  if (!isOpen) return null;

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(4, Math.max(0.5, prev + delta)));
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#0f172a] flex animate-in fade-in duration-300 font-sans overflow-hidden">
      
      {/* Coluna Esquerda: Viewer */}
      <div className="flex-1 flex flex-col relative border-r border-white/5 bg-[#0f172a]">
        <header className="h-16 flex items-center justify-between px-6 bg-[#1e293b]/80 backdrop-blur-md border-b border-white/10 shrink-0 z-20">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><FileText size={18} /></div>
             <div>
                <h2 className="text-white text-xs font-black uppercase tracking-[2px] truncate max-w-md">{currentFile?.name}</h2>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Zoom Controls */}
            <div className="flex items-center bg-black/30 border border-white/10 rounded-xl p-1">
                <button onClick={() => handleZoom(-0.2)} className="p-2 text-slate-400 hover:text-white transition-colors"><ZoomOut size={16}/></button>
                <span className="px-3 text-[10px] font-black font-mono text-white w-14 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => handleZoom(0.2)} className="p-2 text-slate-400 hover:text-white transition-colors"><ZoomIn size={16}/></button>
            </div>

            <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
                <ToolIcon icon={Hand} active={activeTool === 'hand'} onClick={() => setActiveTool('hand')} />
                <div className="w-px h-4 bg-white/10 mx-1" />
                <ToolIcon icon={Pencil} active={activeTool === 'pencil'} onClick={() => setActiveTool('pencil')} />
                <ToolIcon icon={Highlighter} active={activeTool === 'marker'} onClick={() => setActiveTool('marker')} />
                <ToolIcon icon={Square} active={activeTool === 'rect'} onClick={() => setActiveTool('rect')} />
                <ToolIcon icon={Eraser} active={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')} />
            </div>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden">
            {url ? (
                <PdfViewport 
                    url={url} 
                    pageNum={pageNum} 
                    zoom={zoom}
                    onPdfLoad={() => {}} 
                    isHandToolActive={activeTool === 'hand'}
                    renderOverlay={(w, h) => (
                        <DrawingCanvas 
                            tool={activeTool} 
                            color="#ef4444" 
                            lineWidth={5}
                            width={w} 
                            height={h} 
                            pageAnnotations={annotations[pageNum] || []}
                            onAnnotationsChange={(newItems) => {
                                setAnnotations(prev => ({ ...prev, [pageNum]: newItems }));
                            }}
                        />
                    )}
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
                </div>
            )}
        </div>

        {/* Page Nav Modal Style */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full flex items-center gap-4 z-40">
             <button disabled={pageNum <= 1} onClick={() => setPageNum(pageNum - 1)} className="text-white disabled:opacity-20"><ChevronLeft size={20}/></button>
             <span className="text-[10px] font-black text-white font-mono">{pageNum}</span>
             <button onClick={() => setPageNum(pageNum + 1)} className="text-white"><ChevronRight size={20}/></button>
        </div>
      </div>

      {/* Coluna Direita: Workflow Lateral */}
      <div className="w-[420px] bg-white flex flex-col shadow-2xl z-30">
        <header className="h-16 flex items-center justify-between px-6 bg-slate-50 border-b border-slate-100 shrink-0">
           <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-emerald-500" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-[2px]">Gestão Técnica</h3>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all"><X size={20} /></button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <AuditWorkflow 
              metadata={currentFile?.metadata} 
              userRole={user?.role as UserRole} 
              userName={user?.name || ''}
              userEmail={user?.email || ''}
              fileId={currentFile?.id || ''}
              onUpdate={handleUpdateMetadata}
            />
        </div>

        <footer className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
           <button 
              onClick={handleDownload}
              className="w-full py-3.5 bg-[#0f172a] text-white rounded-xl text-[10px] font-black uppercase tracking-[3px] hover:bg-blue-900 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
           >
              <Download size={16} /> Download
           </button>
        </footer>
      </div>
    </div>
  );
};

const ToolIcon = ({ icon: Icon, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded-lg transition-all ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
  >
    <Icon size={16} />
  </button>
);