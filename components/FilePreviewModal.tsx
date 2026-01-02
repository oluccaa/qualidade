
import React, { useState, useEffect } from 'react';
import { X, Download, Printer, ZoomIn, ZoomOut, FileText, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';
import { FileNode, FileType } from '../types.ts';
import { useAuth } from '../services/authContext.tsx';
import * as fileService from '../services/fileService.ts';
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
          setScale(1);
      }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 2.5)); // Max 250%
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5)); // Min 50%
  const handleResetZoom = () => setScale(1);

  const handleDownload = async () => {
      if(!user) return;
      setIsDownloading(true);
      try {
        // 1. Simulate Security Check
        await fileService.getFileSignedUrl(user, file.id);
        
        // 2. Generate a Mock Blob to simulate real file download behavior
        // In a real app, you would fetch(url) and get the blob.
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
        alert("Erro ao solicitar download. Verifique suas permissões.");
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
            className="flex justify-center min-h-full transition-transform duration-200 ease-out origin-top py-8"
            style={{ transform: `scale(${scale})` }}
        >
            <div className="bg-white w-[21cm] min-h-[29.7cm] shadow-2xl p-12 text-slate-800 relative flex flex-col shrink-0">
                
                {/* Header */}
                <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-900 text-white p-3 rounded-lg">
                            <FileText size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold uppercase tracking-wide">{t('preview.title')}</h1>
                            <p className="text-xs text-slate-500 font-medium mt-1">{t('preview.subtitle')}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">Aços Vital S.A.</div>
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
                <div className="grid grid-cols-2 gap-8 mb-8">
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

                <div className="mb-8">
                    <h3 className="text-sm font-bold text-slate-800 uppercase mb-2 border-b border-slate-200 pb-1">{t('preview.mechProps')}</h3>
                    <table className="w-full text-xs text-center border border-slate-200">
                        <thead className="bg-slate-100 font-bold">
                            <tr>
                                <th className="border p-2">Limite Escoamento (MPa)</th>
                                <th className="border p-2">Limite Resistência (MPa)</th>
                                <th className="border p-2">Alongamento (%)</th>
                                <th className="border p-2">Dureza (HB)</th>
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

                <div className="flex-1"></div>

                {/* Footer / Signature */}
                <div className="mt-12 flex justify-between items-end text-xs text-slate-500">
                    <div>
                        <p>{t('preview.emissionDate')}: {file.updatedAt}</p>
                        <p>{t('preview.generated')}</p>
                    </div>
                    <div className="text-center">
                        <div className="h-12 w-32 mb-2 border-b border-slate-300 flex items-end justify-center">
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
      
      {/* Toolbar */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 shrink-0 shadow-lg z-20">
          <div className="flex items-center gap-4 text-white overflow-hidden">
              <div className="p-2 bg-slate-800 rounded-lg shrink-0">
                  <FileText className="text-blue-400" size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm truncate max-w-[150px] md:max-w-md">{file.name}</span>
                  <span className="text-xs text-slate-400 truncate hidden md:inline-block">
                    {file.metadata?.batchNumber ? `${t('preview.batch')}: ${file.metadata.batchNumber}` : 'Visualização Segura'}
                  </span>
              </div>
          </div>

          <div className="flex items-center gap-2">
              <div className="bg-slate-800 rounded-lg flex items-center p-0.5 border border-slate-700">
                  <button 
                    onClick={handleZoomOut}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors" 
                    title="Diminuir Zoom"
                  >
                      <ZoomOut size={18} />
                  </button>
                  <span className="text-xs font-mono text-slate-300 w-12 text-center select-none">
                      {Math.round(scale * 100)}%
                  </span>
                  <button 
                    onClick={handleZoomIn}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors" 
                    title="Aumentar Zoom"
                  >
                      <ZoomIn size={18} />
                  </button>
                  <button 
                    onClick={handleResetZoom}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors border-l border-slate-700 ml-1" 
                    title="Resetar Zoom"
                  >
                      <RotateCcw size={16} />
                  </button>
              </div>

              <div className="w-px h-6 bg-slate-700 mx-2 hidden md:block"></div>
              
              <button 
                onClick={handlePrint}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden md:block" 
                title={t('files.download')} // Using Print icon but semantically close
              >
                  <Printer size={20} />
              </button>
              
              <button 
                onClick={handleDownload} 
                disabled={isDownloading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                  {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  <span className="hidden sm:inline">{isDownloading ? t('common.loading') : t('common.download')}</span>
              </button>
              
              <div className="w-px h-6 bg-slate-700 mx-2"></div>
              
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
                  <X size={24} />
              </button>
          </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-auto bg-slate-800/50 custom-scrollbar p-4 md:p-8 flex items-start justify-center" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          {renderContent()}
      </div>

    </div>
  );
};
