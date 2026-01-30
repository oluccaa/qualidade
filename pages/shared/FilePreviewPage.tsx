
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Hand, Pencil, Highlighter, Eraser, 
  Download, Loader2, ChevronLeft, ChevronRight, 
  Plus, Save, ZoomIn, ZoomOut, Columns, 
  ShieldCheck, FileText, PenTool, X, Info, Zap
} from 'lucide-react';
import { useAuth } from '../../context/authContext.tsx';
import { useFilePreview } from '../../components/features/files/hooks/useFilePreview.ts';
import { PdfViewport } from '../../components/features/files/components/PdfViewport.tsx';
import { DrawingCanvas, DrawingTool } from '../../components/features/files/components/DrawingCanvas.tsx';
import { AuditWorkflow } from '../../components/features/quality/components/AuditWorkflow.tsx';
import { UserRole, normalizeRole, FileNode, DocumentAnnotations } from '../../types/index.ts';

// CONTROLE FLUTUANTE COM SNAP MAGNÉTICO E RESIZE ADAPTATIVO
const DraggableControl: React.FC<{ 
  children: React.ReactNode; 
  initialPos: { x: number, y: number }; 
  onAction: () => void;
  id: string;
}> = ({ children, initialPos, onAction, id }) => {
  const [pos, setPos] = useState(() => {
    const saved = localStorage.getItem(`vital_hud_v12_${id}`);
    if (saved) {
      try { return JSON.parse(saved); } catch { return initialPos; }
    }
    return initialPos;
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [isPressed, setIsPressed] = useState(false); 
  const dragStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });
  const hasMovedRef = useRef(false);
  const currentPosRef = useRef(pos);

  useEffect(() => {
    currentPosRef.current = pos;
  }, [pos]);

  const performSnap = useCallback((currentX: number, currentY: number) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const padding = 16;
    const size = w < 768 ? 48 : 56;
    const headerHeight = 64;
    const footerHeight = 110; 

    const snapX = currentX + size / 2 < w / 2 ? padding : w - size - padding;
    const snapY = Math.max(headerHeight + padding, Math.min(currentY, h - footerHeight - size));

    const finalPos = { x: snapX, y: snapY };
    setPos(finalPos);
    localStorage.setItem(`vital_hud_v12_${id}`, JSON.stringify(finalPos));
  }, [id]);

  useEffect(() => {
    const handleResize = () => performSnap(currentPosRef.current.x, currentPosRef.current.y);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [performSnap]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    setIsPressed(true);
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY, initialX: pos.x, initialY: pos.y };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    if (e.cancelable) e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    if (!hasMovedRef.current && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
      hasMovedRef.current = true;
      setIsDragging(true);
    }
    if (hasMovedRef.current) {
      setPos({ x: dragStartRef.current.initialX + deltaX, y: dragStartRef.current.initialY + deltaY });
    }
  }, []);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    setIsPressed(false);
    setIsDragging(false);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    if (hasMovedRef.current) {
      setPos(current => { performSnap(current.x, current.y); return current; });
    }
  }, [performSnap]);

  const handleClick = (e: React.MouseEvent) => {
    if (hasMovedRef.current) { e.preventDefault(); e.stopPropagation(); return; }
    onAction();
  };

  return (
    <div 
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      style={{ 
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.19, 1, 0.22, 1)'
      }}
      className={`fixed top-0 left-0 z-[250] flex items-center justify-center bg-[#1e293b]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl touch-none select-none
        ${window.innerWidth < 768 ? 'w-12 h-12' : 'w-14 h-14'}
        ${isDragging ? 'cursor-grabbing scale-110 border-blue-500 ring-4 ring-blue-500/20' : 'cursor-grab hover:border-white/40'}
        ${isPressed && !isDragging ? 'scale-95 bg-blue-600 border-blue-400' : ''} 
      `}
    >
      <div className={`transition-all duration-300 pointer-events-none ${isDragging ? 'text-blue-400' : 'text-white'}`}>
        {children}
      </div>
      {isDragging && <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/50 animate-pulse pointer-events-none" />}
    </div>
  );
};

export const FilePreviewPage: React.FC = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const initialFileStub = useMemo(() => ({ id: fileId } as FileNode), [fileId]);
  const {
    currentFile, url, pageNum, setPageNum, zoom, setZoom,
    handleDownload, handleUpdateMetadata, isSyncing
  } = useFilePreview(user, initialFileStub);

  const role = normalizeRole(user?.role);
  const isRoot = role === UserRole.ADMIN;
  const isAuditMode = searchParams.get('mode') === 'audit';
  const isStep2Active = currentFile?.metadata?.currentStep === 2;
  const isStep2Finished = !!currentFile?.metadata?.signatures?.step2_documental;
  
  // PODER ROOT: Admin sempre pode editar e anotar
  const showEditTools = isRoot ? true : (role === UserRole.CLIENT ? isAuditMode : true);
  const canAnnotate = isRoot ? true : (role === UserRole.CLIENT ? (isAuditMode && isStep2Active && !isStep2Finished) : true);

  const handleBack = useCallback(() => {
    if (isAuditMode) {
      navigate(role === UserRole.CLIENT ? '/client/portal?view=audit_flow' : '/quality/monitor', { replace: true });
      return;
    }
    if (window.history.length > 2) navigate(-1);
    else navigate(role === UserRole.CLIENT ? '/client/portal' : '/quality/dashboard', { replace: true });
  }, [navigate, role, isAuditMode]);

  const [activeTool, setActiveTool] = useState<DrawingTool>('hand');
  const [selectedColor] = useState('#ef4444');
  const [numPages, setNumPages] = useState(0);
  const [pdfInstance, setPdfInstance] = useState<any>(null);
  const [annotations, setAnnotations] = useState<DocumentAnnotations>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(isAuditMode || isRoot);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const annCacheKey = `vital_ann_draft_${fileId}`;

  useEffect(() => {
    const cachedAnn = sessionStorage.getItem(annCacheKey);
    if (cachedAnn) try { setAnnotations(JSON.parse(cachedAnn)); } catch {}
    else if (currentFile?.metadata?.documentalDrawings) try { setAnnotations(JSON.parse(currentFile.metadata.documentalDrawings)); } catch {}
  }, [currentFile?.id, annCacheKey]);

  useEffect(() => {
    if (Object.keys(annotations).length > 0) sessionStorage.setItem(annCacheKey, JSON.stringify(annotations));
  }, [annotations, annCacheKey]);

  useEffect(() => {
    const generateThumbs = async () => {
      if (!pdfInstance) return;
      const thumbs = [];
      const totalToGen = Math.min(pdfInstance.numPages, 12);
      for (let i = 1; i <= totalToGen; i++) {
        const page = await pdfInstance.getPage(i);
        const viewport = page.getViewport({ scale: 0.15 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        canvas.width = viewport.width; canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        thumbs.push(canvas.toDataURL());
      }
      setThumbnails(thumbs);
    };
    if (pdfInstance) generateThumbs();
  }, [pdfInstance]);

  const handleZoom = (type: 'in' | 'out') => {
    if (type === 'in') setZoom(prev => Math.min(prev + 0.25, 4));
    if (type === 'out') setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handlePersistChanges = async () => {
    if (!currentFile || !canAnnotate) return;
    await handleUpdateMetadata({ documentalDrawings: JSON.stringify(annotations) });
    sessionStorage.removeItem(annCacheKey);
  };

  return (
    <div className="h-screen w-screen bg-[#020617] flex flex-col overflow-hidden font-sans text-slate-200">
      <header className={`h-16 flex items-center justify-between px-4 md:px-6 border-b z-[60] shadow-2xl shrink-0 transition-colors ${isRoot ? 'bg-indigo-950 border-indigo-500/30' : 'bg-[#0f172a] border-white/5'}`}>
        <div className="flex items-center gap-2 md:gap-6">
          <button onClick={handleBack} className="p-2 md:p-2.5 hover:bg-blue-600/20 rounded-xl transition-all text-slate-400 hover:text-white border border-transparent hover:border-blue-500/30 active:scale-90" title="Voltar"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-3 min-w-0">
             <div className={`p-2 rounded-xl text-white shadow-lg hidden xs:flex ${isRoot ? 'bg-indigo-600' : 'bg-blue-600'}`}><FileText size={18}/></div>
             <div className="min-w-0">
                <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[2px] md:tracking-[3px] truncate max-w-[120px] md:max-w-[280px] leading-none">{currentFile?.name || "Certificado"}</h2>
                <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase mt-1 flex items-center gap-1.5 truncate">
                   {isRoot && <Zap size={10} className="text-amber-400" />}
                   <ShieldCheck size={10} className={`${isRoot ? 'text-indigo-400' : 'text-emerald-500'} shrink-0`} />
                   v{currentFile?.metadata?.currentVersion || 1}.0 Vital Ledger {isRoot && " (Root Access)"}
                </p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
            {showEditTools && (
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 shadow-inner">
                 <ToolBtn icon={Hand} active={activeTool === 'hand'} onClick={() => setActiveTool('hand')} />
                 <ToolBtn icon={Pencil} active={activeTool === 'pencil'} onClick={() => setActiveTool('pencil')} disabled={!canAnnotate} />
                 <ToolBtn icon={Highlighter} active={activeTool === 'marker'} onClick={() => setActiveTool('marker')} disabled={!canAnnotate} />
                 <ToolBtn icon={Eraser} active={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')} disabled={!canAnnotate} />
              </div>
            )}
            {showEditTools && canAnnotate && (
                <button onClick={handlePersistChanges} disabled={isSyncing} className={`p-2.5 md:px-6 md:py-3 text-white rounded-xl text-[10px] font-black uppercase tracking-[2px] flex items-center gap-2 shadow-xl active:scale-95 transition-all ${isRoot ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
                    {isSyncing ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />} 
                    <span className="hidden md:inline">Gravar</span>
                </button>
            )}
            <button onClick={handleDownload} className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/10 transition-all active:scale-90"><Download size={20} /></button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <DraggableControl id="pages-hud" initialPos={{ x: 16, y: 100 }} onAction={() => setSidebarOpen(!sidebarOpen)}><Columns size={20} strokeWidth={2.5} /></DraggableControl>
        <DraggableControl id="audit-hud" initialPos={{ x: window.innerWidth - 72, y: 100 }} onAction={() => setWorkflowOpen(!workflowOpen)}>{workflowOpen ? <X size={20} strokeWidth={2.5} className="text-red-400" /> : <PenTool size={20} strokeWidth={2.5} />}</DraggableControl>

        <aside className={`bg-[#0f172a] border-r border-white/5 transition-all duration-500 flex flex-col shrink-0 shadow-2xl z-[160] fixed md:relative h-full ${sidebarOpen ? 'w-full md:w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'}`}>
            <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 shrink-0 bg-black/20"><span className="text-[10px] font-black uppercase tracking-[4px] text-slate-500">Índice Técnico</span><button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 p-2"><X size={20}/></button></header>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                {thumbnails.map((thumb, idx) => (
                    <div key={idx} onClick={() => { setPageNum(idx + 1); if(window.innerWidth < 768) setSidebarOpen(false); }} className={`relative cursor-pointer group transition-all duration-300 ${pageNum === idx + 1 ? 'ring-4 ring-blue-600 scale-105 shadow-2xl' : 'opacity-40 hover:opacity-100 hover:translate-x-1'}`}>
                        <img src={thumb} alt={`Page ${idx + 1}`} className="w-full rounded-xl shadow-lg bg-white" />
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black font-mono text-slate-500">{idx + 1}</div>
                    </div>
                ))}
            </div>
        </aside>

        <main className="flex-1 relative flex flex-col overflow-hidden bg-[#020617]">
            <PdfViewport url={url} pageNum={pageNum} zoom={zoom} onPdfLoad={(n, instance) => { setNumPages(n); setPdfInstance(instance); }} isHandToolActive={activeTool === 'hand'} renderOverlay={(w, h) => (<DrawingCanvas tool={activeTool} color={selectedColor} lineWidth={4} width={w} height={h} pageAnnotations={annotations[pageNum] || []} onAnnotationsChange={(newItems) => canAnnotate && setAnnotations(prev => ({ ...prev, [pageNum]: newItems }))} />)} />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col md:flex-row items-center gap-4 bg-[#0f172a]/95 backdrop-blur-3xl border border-white/10 p-3 md:px-8 md:py-3 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] w-[92%] md:w-auto max-w-[620px]">
                 <div className="flex items-center gap-6 md:gap-4 border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 md:pr-8 w-full md:w-auto justify-center"><button disabled={pageNum <= 1} onClick={() => setPageNum(pageNum - 1)} className="p-3 text-slate-400 hover:text-blue-400 disabled:opacity-10 transition-all active:scale-90"><ChevronLeft size={28} strokeWidth={3} /></button><div className="flex items-baseline gap-2 min-w-[90px] justify-center"><span className="text-xl font-black text-white font-mono leading-none">{pageNum}</span><span className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px]">de {numPages}</span></div><button disabled={pageNum >= numPages} onClick={() => setPageNum(pageNum + 1)} className="p-3 text-slate-400 hover:text-blue-400 disabled:opacity-10 transition-all active:scale-90"><ChevronRight size={28} strokeWidth={3} /></button></div>
                 <div className="flex items-center gap-3 w-full md:w-auto justify-center"><button onClick={() => handleZoom('out')} className="p-3 text-slate-400 hover:text-white transition-all hover:bg-white/5 rounded-full"><ZoomOut size={20}/></button><div className="px-4 min-w-[70px] text-center"><span className="text-[11px] font-black font-mono text-blue-400">{Math.round(zoom * 100)}%</span></div><button onClick={() => handleZoom('in')} className="p-3 text-slate-400 hover:text-white transition-all hover:bg-white/5 rounded-full"><ZoomIn size={20}/></button></div>
            </div>
        </main>

        <aside className={`bg-white text-slate-900 border-l border-slate-200 transition-all duration-500 flex flex-col shrink-0 shadow-2xl z-[160] fixed md:relative right-0 h-full ${workflowOpen ? 'w-full md:w-[420px] translate-x-0' : 'w-0 translate-x-full md:translate-x-0'}`}>
            <header className={`h-16 flex items-center justify-between px-8 border-b shrink-0 bg-slate-50/80 backdrop-blur-md ${isRoot ? 'border-indigo-100' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isRoot ? 'bg-indigo-500/10 text-indigo-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        <ShieldCheck size={20} strokeWidth={3} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[3px] text-slate-800">Workflow {isRoot ? "Master" : "Técnico"}</span>
                </div>
                <button onClick={() => setWorkflowOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all active:rotate-90 duration-300"><Plus size={24} className="rotate-45" /></button>
            </header>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                {isRoot ? (
                    <div className="mb-6 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-4 animate-pulse">
                        <Zap size={18} className="text-indigo-600 mt-0.5 shrink-0" />
                        <p className="text-[10px] font-bold text-indigo-800 uppercase leading-relaxed">Poder Root Ativo: Todas as travas de conformidade foram desativadas para seu terminal.</p>
                    </div>
                ) : (role === UserRole.CLIENT && !isAuditMode) && (
                    <div className="mb-6 p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4"><Info size={18} className="text-blue-600 mt-0.5 shrink-0" /><p className="text-[10px] font-bold text-blue-800 uppercase leading-relaxed">Modo Leitura: Para interagir com este certificado, utilize a aba "Fluxo de Auditoria" no portal.</p></div>
                )}
                <AuditWorkflow metadata={currentFile?.metadata} userRole={user?.role as UserRole} userName={user?.name || ''} userEmail={user?.email || ''} fileId={currentFile?.id || ''} onUpdate={handleUpdateMetadata} forceReadOnly={isRoot ? false : (role === UserRole.CLIENT && !isAuditMode)} />
                <div className="h-32 md:hidden" />
            </div>
        </aside>
      </div>
    </div>
  );
};

const ToolBtn = ({ icon: Icon, active, onClick, disabled }: any) => (
    <button disabled={disabled} onClick={onClick} className={`p-2.5 rounded-xl transition-all duration-300 ${disabled ? 'opacity-10 grayscale cursor-not-allowed' : active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-110' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Icon size={18} strokeWidth={active ? 3 : 2} /></button>
);
