
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

// @ts-ignore - Importa a URL do worker local processado pelo Vite
import workerUrl from '../../../../lib/workers/pdf.worker.min.js?url';

/**
 * CONFIGURAÇÃO DO WORKER (Singleton)
 * Utiliza o ativo local da pasta lib/workers. 
 * Isso torna o portal imune a bloqueios de rede externa ou falta de internet.
 */
if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
  (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
}

interface PdfViewportProps {
  url: string | null;
  zoom: number;
  pageNum: number;
  onPdfLoad: (numPages: number) => void;
  onZoomChange?: (newZoom: number) => void;
  renderOverlay?: (width: number, height: number) => React.ReactNode;
  isHandToolActive?: boolean;
}

export const PdfViewport: React.FC<PdfViewportProps> = ({ 
  url, zoom, pageNum, onPdfLoad, onZoomChange, renderOverlay, isHandToolActive = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bufferCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Estado para Panning Manual (Mãozinha Premium)
  const [drag, setDrag] = useState({ isDragging: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });
  const renderTaskRef = useRef<any>(null);

  const cleanup = useCallback(() => {
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch (e) {}
      renderTaskRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!url) return;
    const loadPdf = async () => {
      cleanup();
      setError(null);
      setIsRendering(true);
      try {
        const loadingTask = (window as any).pdfjsLib.getDocument({
          url,
          withCredentials: false,
          // Fallback de CMaps para renderização de fontes especiais sem dependência externa
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/`,
          cMapPacked: true,
        });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        onPdfLoad(pdf.numPages);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("PDF Load Error:", err);
          setError("Falha na carga do ativo técnico.");
        }
      } finally {
        setIsRendering(false);
      }
    };
    loadPdf();
    return cleanup;
  }, [url, cleanup, onPdfLoad]);

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;
    cleanup();
    setIsRendering(true);
    try {
      const page = await pdfDoc.getPage(pageNum);
      const outputScale = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: zoom });
      
      const canvas = canvasRef.current;
      const bufferCanvas = bufferCanvasRef.current;
      const context = canvas.getContext('2d', { alpha: false });
      const bufferContext = bufferCanvas.getContext('2d', { alpha: false });

      if (!context || !bufferContext) return;

      bufferCanvas.width = Math.floor(viewport.width * outputScale);
      bufferCanvas.height = Math.floor(viewport.height * outputScale);
      
      const renderContext = {
        canvasContext: bufferContext,
        viewport: viewport,
        transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;

      canvas.width = bufferCanvas.width;
      canvas.height = bufferCanvas.height;
      context.drawImage(bufferCanvas, 0, 0);
      setDimensions({ width: viewport.width, height: viewport.height });
    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') console.error(err);
    } finally {
      setIsRendering(false);
    }
  }, [pdfDoc, pageNum, zoom, cleanup]);

  useEffect(() => { renderPage(); }, [renderPage]);

  // MANIPULAÇÃO DE PANNING (Mãozinha Premium)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isHandToolActive) return;
    if (!containerRef.current) return;

    setDrag({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop
    });
    containerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag.isDragging || !containerRef.current) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    // Ajusta o scroll nativo do container com base no movimento do mouse
    containerRef.current.scrollLeft = drag.scrollLeft - dx;
    containerRef.current.scrollTop = drag.scrollTop - dy;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (drag.isDragging && containerRef.current) {
      setDrag(prev => ({ ...prev, isDragging: false }));
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
        if (!onZoomChange) return;
        e.preventDefault();
        const direction = e.deltaY < 0 ? 1 : -1;
        onZoomChange(Math.max(0.1, Math.min(5, zoom + direction * 0.15)));
    }
  };

  return (
    <div 
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      className={`flex-1 overflow-auto bg-[#020617] relative custom-scrollbar flex justify-center items-start select-none touch-none outline-none ${
        isHandToolActive 
          ? (drag.isDragging ? 'cursor-grabbing no-scrollbar' : 'cursor-grab no-scrollbar') 
          : 'cursor-default'
      }`}
      style={{ 
        scrollBehavior: drag.isDragging ? 'auto' : 'smooth',
        padding: '100px' 
      }}
    >
      {/* Grid Técnico High-Tech (Background) */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.07]" 
        style={{ 
          backgroundImage: `
            radial-gradient(circle, #60a5fa 1px, transparent 1px),
            linear-gradient(to right, #ffffff05 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff05 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px, 128px 128px, 128px 128px'
        }} 
      />
      
      {/* Glow Atmosférico */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_transparent_70%)]" />

      {/* Documento (Canvas + Overlay) */}
      <div 
        className="relative flex-shrink-0 transition-opacity duration-700 ease-out"
        style={{ 
          width: dimensions.width || 'auto', 
          height: dimensions.height || 'auto', 
          opacity: dimensions.width ? 1 : 0,
          pointerEvents: isHandToolActive ? 'none' : 'auto'
        }}
      >
        {/* Sombra de Profundidade */}
        <div className="absolute inset-0 bg-black/60 blur-[60px] rounded-sm -z-10 translate-y-10 scale-[0.98]" />
        
        {/* Bordas do Papel Técnico */}
        <div className="bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_30px_100px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden border border-white/10">
            <canvas ref={canvasRef} style={{ width: dimensions.width, height: dimensions.height, display: 'block' }} />
        </div>
        
        {/* Camada Interativa (Anotações) */}
        <div className={`absolute inset-0 z-10 ${isHandToolActive ? 'pointer-events-none' : 'pointer-events-auto'}`}>
          {dimensions.width > 0 && renderOverlay && renderOverlay(dimensions.width, dimensions.height)}
        </div>
        
        {/* Indicador de Renderização em Progresso */}
        {isRendering && (
          <div className="absolute top-8 right-8 z-[60] bg-blue-600/90 backdrop-blur-md p-2.5 rounded-full shadow-2xl animate-pulse ring-4 ring-blue-500/20">
             <Loader2 size={16} className="animate-spin text-white" />
          </div>
        )}
      </div>

      {error && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-[200] text-center animate-in fade-in p-6">
            <AlertCircle size={64} className="text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
            <h3 className="text-white text-xl font-black uppercase tracking-[4px] mb-2">Erro de Viewport</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8 font-medium">O cluster industrial não conseguiu renderizar o laudo técnico.</p>
            <button onClick={() => window.location.reload()} className="flex items-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[3px] transition-all shadow-2xl active:scale-95">
               <RefreshCw size={14} /> Reiniciar Protocolo
            </button>
        </div>
      )}
    </div>
  );
};
