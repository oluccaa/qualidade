import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Loader2, AlertTriangle, Zap, Cpu, ShieldCheck } from 'lucide-react';

const PDF_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
  (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
}

const GLOBAL_DOCUMENT_CACHE = new Map<string, any>();

interface PdfViewportProps {
  url: string | null;
  pageNum: number;
  zoom: number;
  onPdfLoad: (numPages: number, pdfInstance: any) => void;
  // Fix: Changed React.Node to React.ReactNode as React.Node is not a valid member of React in TypeScript
  renderOverlay?: (width: number, height: number) => React.ReactNode;
  isHandToolActive?: boolean;
}

export const PdfViewport: React.FC<PdfViewportProps> = ({ 
  url, pageNum, zoom, onPdfLoad, renderOverlay, isHandToolActive = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleCanvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [error, setError] = useState<string | null>(null);

  // Estados para Arraste (Pan)
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  useEffect(() => {
    if (!url) return;
    let isActive = true;

    const loadDocument = async () => {
      if (GLOBAL_DOCUMENT_CACHE.has(url)) {
        const cached = GLOBAL_DOCUMENT_CACHE.get(url);
        setPdfDoc(cached);
        onPdfLoad(cached.numPages, cached);
        return;
      }

      setIsDownloading(true);
      try {
        const loadingTask = (window as any).pdfjsLib.getDocument({
          url,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
          disableAutoFetch: false,
          disableStream: false,
        });

        const doc = await loadingTask.promise;
        if (isActive) {
          GLOBAL_DOCUMENT_CACHE.set(url, doc);
          setPdfDoc(doc);
          onPdfLoad(doc.numPages, doc);
        }
      } catch (err) {
        if (isActive) setError("Falha na sincronização do binário técnico.");
      } finally {
        if (isActive) setIsDownloading(false);
      }
    };

    loadDocument();
    return () => { isActive = false; };
  }, [url, onPdfLoad]);

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !visibleCanvasRef.current) return;

    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch (e) {}
    }

    setIsRendering(true);
    
    try {
      const page = await pdfDoc.getPage(pageNum);
      const pixelRatio = Math.max(window.devicePixelRatio || 1, 2); 
      const viewport = page.getViewport({ scale: zoom * pixelRatio });

      const canvas = visibleCanvasRef.current;
      const context = canvas.getContext('2d', { alpha: false, desynchronized: true });

      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.width = `${viewport.width / pixelRatio}px`;
        canvas.style.height = `${viewport.height / pixelRatio}px`;

        const renderTask = page.render({ 
          canvasContext: context, 
          viewport: viewport,
          intent: 'display'
        });
        
        renderTaskRef.current = renderTask;
        await renderTask.promise;

        setDimensions({ 
          width: viewport.width / pixelRatio, 
          height: viewport.height / pixelRatio 
        });
      }
    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') {
        console.error("Erro no motor Vital:", err);
      }
    } finally {
      setIsRendering(false);
    }
  }, [pdfDoc, pageNum, zoom]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Lógica de Panning (Mãozinha)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isHandToolActive || !containerRef.current) return;
    
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop
    };
    containerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning || !containerRef.current) return;
    
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    
    containerRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
    containerRef.current.scrollTop = panStartRef.current.scrollTop - dy;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPanning) return;
    setIsPanning(false);
    if (containerRef.current) containerRef.current.releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full h-full overflow-auto bg-[#020617] flex justify-center custom-scrollbar p-2 md:p-12 transition-all duration-300 select-none
        ${isHandToolActive ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}
      `}
    >
      
      {(isDownloading || (isRendering && dimensions.width === 0)) && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617]/95 backdrop-blur-2xl animate-in fade-in duration-500">
           <div className="relative mb-10">
              <div className="w-24 md:w-40 h-24 md:h-40 border-2 border-blue-500/10 rounded-full animate-ping absolute inset-0" />
              <div className="w-24 md:w-40 h-24 md:h-40 border-t-4 border-blue-500 rounded-full animate-spin relative flex items-center justify-center">
                 <div className="bg-blue-500/10 p-4 md:p-6 rounded-3xl backdrop-blur-xl border border-white/10">
                    <Cpu className="text-blue-400 w-8 md:w-12 h-8 md:h-12 animate-pulse" />
                 </div>
              </div>
           </div>
           <h3 className="text-white text-[10px] font-black uppercase tracking-[5px] md:tracking-[10px] animate-pulse">Sincronizando Ledger</h3>
        </div>
      )}

      <div 
        className="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] md:shadow-[0_100px_200px_-40px_rgba(0,0,0,0.9)] bg-white transform-gpu origin-top shrink-0"
        style={{ 
          width: dimensions.width || 'auto', 
          height: dimensions.height || 'auto',
          minHeight: '200px',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' 
        }}
      >
        <canvas 
          ref={visibleCanvasRef} 
          className={`block transition-opacity duration-500 ${dimensions.width > 0 ? 'opacity-100' : 'opacity-0'}`} 
        />
        
        {renderOverlay && dimensions.width > 0 && (
          <div className={`absolute inset-0 z-10 ${isHandToolActive ? 'pointer-events-none' : 'pointer-events-auto'}`}>
            {renderOverlay(dimensions.width, dimensions.height)}
          </div>
        )}

        {isRendering && dimensions.width > 0 && (
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex items-center gap-2 bg-[#020617]/80 px-3 py-1.5 rounded-xl shadow-2xl border border-white/10 animate-in slide-in-from-right-4">
                <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />
                <span className="text-[8px] font-black text-white uppercase tracking-[1px]">Refinando...</span>
            </div>
        )}
      </div>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 z-[200] p-6 backdrop-blur-xl">
            <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
                    <AlertTriangle className="text-red-500 w-8 h-8" />
                </div>
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">{error}</p>
                <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-500 transition-all">Reconectar</button>
            </div>
        </div>
      )}
    </div>
  );
};
