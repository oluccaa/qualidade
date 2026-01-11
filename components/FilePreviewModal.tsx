
import React, { useState, useEffect } from 'react';
import { X, Download, Printer, ZoomIn, ZoomOut, FileText, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';
import { FileNode, FileType } from '../types.ts';
import { useAuth } from '../services/authContext.tsx';
// Fix: Import from services/index.ts to use the correctly typed and initialized service instances
import { fileService } from '../services/index.ts';
import { useTranslation } from 'react-i18next';

interface FilePreviewModalProps {
  file: FileNode | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [scale, setScale] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);

  // Reset scale when file changes
  useEffect(() => {
      if (isOpen) {
          // Ajuste inteligente de zoom baseado na largura da tela
          const width = window.innerWidth;
          if (width < 640) setScale(0.5); // Mobile small
          else if (width < 768) setScale(0.6); // Tablet portrait
          else if (width < 1024) setScale(0.8); // Tablet landscape
          else setScale(1.0); // Desktop
      }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2.0)); // Smoother steps
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.4)); // Allow smaller zoom for mobile
  const handleResetZoom = () => setScale(window.innerWidth < 768 ? 0.6 : 1);

  const handleDownload = async () => {
      if(!user) return;
      setIsDownloading(true);
      try {
        // 1. Simulate Security Check
        await fileService.getFileSignedUrl(user, file.id);
        
        // 2. Generate a Mock Blob to simulate real file download behavior
        const mockContent = `
            ${t('preview.title').toUpperCase()}
            --------------------------------
            ${t('files.name')}: ${file.name}
            ID: ${file.id}
            ${t('preview.product')}: ${file.metadata?.productName || 'N/A'}
            ${t('preview.batch')}: ${file.metadata?.batchNumber || 'N/A'}
            ${t('common.status')}: ${file.metadata?.status || 'N/A'}
            ${t('preview.emissionDate')}: ${file.updatedAt}
            
            ${t('preview.generated')}
        `;
        
        const blob = new Blob([mockContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        
        // 3. Trigger Browser Download
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.endsWith('.pdf') ? file.name.replace('.pdf', '.txt') : file.name; // Mocking txt download for demo
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

      } catch (err) {
        alert(t('files.permissionError'));
      } finally {
        setIsDownloading(false);
      }
  };

  const handlePrint = () => {
      window.print();
  };

  // Mock Content Renderer based on file type
  const renderContent = () => {
      if (file.type === FileType.IMAGE) {
          return (
              <div 
                className="flex items-center justify-center transition-transform duration-200 ease-out origin-top"
                style={{ transform: `scale(${scale})` }}
              >
                  <img src="https://via.placeholder.com/800x600" alt={file.name} className="max-w-full rounded shadow-lg" />
              </div>
          );
      }

      // PDF / Document Simulation (Certificado de Qualidade Mock)
      return (
        <div 
            className="flex justify-center min-h-full transition-transform duration-200 ease-out origin-top py-4 md:py-8"
            style={{ transform: `scale(${scale})` }}
        >
            <div className="bg-white w-[21cm] min-h-[29.7cm] shadow-2xl p-6 md:p-12 text-slate-800 relative flex flex-col shrink-0">
                
                {/* Header */}
                <div className="border-b-2 border-slate-800 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-900 text-white p-3 rounded-lg">
                            <FileText size={32} />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wide">{t('preview.title')}</h1>
                            <p className="text-xs text-slate-500 font-medium mt-1">{t('preview.subtitle')}</p>
                        </div>
                    </div>
                    <div className="text-left md:text-right w-full md:w-auto">
                        <div className="text-sm font-bold text-slate-900">{t('menu.brand')} S.A.</div>
                        <div className="text-xs text-slate-500">CNPJ: 00.123.456/0001-00</div>
                        <div className="text-xs text-slate-500">São Paulo, SP</div>
                    </div>
                </div>

                {/* Status Stamp */}
                {file.metadata?.status === 'APPROVED' && (
                    <div className="absolute top-10 right-10 border-4 border-emerald-600 text-emerald-600 rounded-lg px-4 py-2 font-black uppercase text-xl -rotate-12 opacity-80 pointer-events-none mix-blend-multiply flex items-center gap-2">
                        <CheckCircle2 size={24} /> {t('preview.approvedStamp')}
                    </div>
                )}

                {/* Product Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mb-8">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase">{t('preview.client')}</p>
                        <p className="text-sm font-semibold border p-2 rounded bg-slate-50">Empresa Parceira LTDA</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase">{t('preview.invoice')}</p>
                        <p className="text-sm font-semibold border p-2 rounded bg-slate-50">{file.metadata?.invoiceNumber || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase">{t('preview.product')}</p>
                        <p className="text-sm font-semibold border p-2 rounded bg-slate-50">{file.metadata?.productName || file.name}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase">{t('preview.batch')}</p>
                        <p className="text-sm font-semibold border p-2 rounded bg-slate-50">{file.metadata?.batchNumber || 'N/A'}</p>
                    </div>
                </div>

                {/* Technical Results Table (Mock) */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-slate-800 uppercase mb-2 border-b border-slate-200 pb-1">{t('preview.chemResults')}</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-center border border-slate-200">
                            <thead className="bg-slate-100 font-bold">
                                <tr>
                                    <th className="border p-2">C %</th>
                                    <th className="border p-2">Mn %</th>
                                    <th className="border p-2">Si %</th>
                                    <th className="border p-2">P %</th>
                                    <th className="border p-2">S %</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border p-2">0.45</td>
                                    <td className="border p-2">0.75</td>
                                    <td className="border p-2">0.25</td>
                                    <td className="border p-2">0.015</td>
                                    <td className="border p-2">0.010</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-sm font-bold text-slate-800 uppercase mb-2 border-b border-slate-200 pb-1">{t('preview.mechProps')}</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-center border border-slate-200">
                            <thead className="bg-slate-100 font-bold">
                                <tr>
                                    <th className="border p-2">{t('preview.table.yield')}</th>
                                    <th className="border p-2">{t('preview.table.tensile')}</th>
                                    <th className="border p-2">{t('preview.table.elongation')}</th>
                                    <th className="border p-2">{t('preview.table.hardness')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border p-2">380</td>
                                    <td className="border p-2">620</td>
                                    <td className="border p-2">18</td>
                                    <td className="border p-2">210</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex-1"></div>

                {/* Footer / Signature */}
                <div className="mt-12 flex flex-col sm:flex-row justify-between items-center sm:items-end text-xs text-slate-500 gap-6 sm:gap-0">
                    <div className="text-center sm:text-left">
                        <p>{t('preview.emissionDate')}: {file.updatedAt}</p>
                        <p>{t('preview.generated')}</p>
                    </div>
                    <div className="text-center">
                        <div className="h-12 w-32 mb-2 border-b border-slate-300 flex items-end justify-center mx-auto sm:mx-0">
                            <span className="font-script text-lg text-blue-900 italic">Carlos Silva</span>
                        </div>
                        <p className="font-bold">{t('preview.engineer')}</p>
                        <p>CREA: 123456/SP</p>
                    </div>
                </div>

            </div>
        </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      
      {/* 1. TOP TOOLBAR (RESPONSIVE) */}
      <div className="h-14 md:h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 md:px-6 shrink-0 shadow-lg z-20">
          
          {/* File Info */}
          <div className="flex items-center gap-3 md:gap-4 text-white overflow-hidden flex-1 min-w-0 mr-2">
              <div className="p-1.5 md:p-2 bg-slate-800 rounded-lg shrink-0">
                  <FileText className="text-blue-400" size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm truncate pr-2">{file.name}</span>
                  <span className="text-[10px] md:text-xs text-slate-400 truncate hidden sm:inline-block">
                    {file.metadata?.batchNumber ? `${t('preview.batch')}: ${file.metadata.batchNumber}` : t('preview.secureView')}
                  </span>
              </div>
          </div>

          {/* Desktop Controls (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-2">
              <div className="bg-slate-800 rounded-lg flex items-center p-0.5 border border-slate-700">
                  <button onClick={handleZoomOut} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors" title={t('preview.zoomOut')}>
                      <ZoomOut size={18} />
                  </button>
                  <span className="text-xs font-mono text-slate-300 w-12 text-center select-none">{Math.round(scale * 100)}%</span>
                  <button onClick={handleZoomIn} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors" title={t('preview.zoomIn')}>
                      <ZoomIn size={18} />
                  </button>
                  <button onClick={handleResetZoom} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors border-l border-slate-700 ml-1" title={t('preview.resetZoom')}>
                      <RotateCcw size={16} />
                  </button>
              </div>

              <div className="w-px h-6 bg-slate-700 mx-2"></div>
              
              <button onClick={handlePrint} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" title={t('preview.print')}>
                  <Printer size={20} />
              </button>
              
              <button 
                onClick={handleDownload} 
                disabled={isDownloading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                  {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  <span>{isDownloading ? t('common.loading') : t('common.download')}</span>
              </button>
              
              <div className="w-px h-6 bg-slate-700 mx-2"></div>
          </div>

          {/* Close Button (Always Visible) */}
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0">
              <X size={24} />
          </button>
      </div>

      {/* 2. MAIN PREVIEW AREA - ADDED OVERFLOW-X-AUTO */}
      <div 
        className="flex-1 overflow-x-auto overflow-y-auto bg-slate-800/50 custom-scrollbar p-0 md:p-8 flex items-start justify-center pb-24 md:pb-8" 
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
          {renderContent()}
      </div>

      {/* 3. MOBILE FLOATING CONTROLS (Bottom Bar) */}
      <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl border border-slate-700 p-1.5 rounded-full shadow-2xl animate-in slide-in-from-bottom-10">
          <button 
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center text-slate-300 active:text-white active:bg-slate-700 rounded-full transition-colors"
          >
              <ZoomOut size={20} />
          </button>
          
          <button 
            onClick={handleResetZoom}
            className="w-10 h-10 flex items-center justify-center text-slate-300 active:text-white active:bg-slate-700 rounded-full transition-colors border-l border-r border-slate-700/50 rounded-none px-2"
          >
              <RotateCcw size={18} />
          </button>
          
          <button 
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center text-slate-300 active:text-white active:bg-slate-700 rounded-full transition-colors"
          >
              <ZoomIn size={20} />
          </button>

          <div className="w-px h-6 bg-slate-700 mx-1"></div>

          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg shadow-blue-900/40 active:scale-90 transition-transform disabled:opacity-50"
          >
             {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          </button>
      </div>

    </div>
  );
};
