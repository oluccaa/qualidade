
import React from 'react';
import { X, Download, Printer, Share2, ZoomIn, ZoomOut, FileText, CheckCircle2 } from 'lucide-react';
import { FileNode, FileType } from '../types.ts';
import { useAuth } from '../services/authContext.tsx';
import * as fileService from '../services/fileService.ts';

interface FilePreviewModalProps {
  file: FileNode | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, isOpen, onClose }) => {
  const { user } = useAuth();

  if (!isOpen || !file) return null;

  const handleDownload = async () => {
      if(!user) return;
      try {
        await fileService.getFileSignedUrl(user, file.id);
        alert(`Iniciando download do arquivo original: ${file.name}`);
      } catch (err) {
        alert("Erro ao solicitar download.");
      }
  };

  // Mock Content Renderer based on file type
  const renderContent = () => {
      if (file.type === FileType.IMAGE) {
          return (
              <div className="flex items-center justify-center h-full bg-slate-900/50">
                  <img src="https://via.placeholder.com/800x600" alt={file.name} className="max-h-full max-w-full rounded shadow-lg" />
              </div>
          );
      }

      // PDF / Document Simulation (Certificado de Qualidade Mock)
      return (
        <div className="flex justify-center p-8 min-h-full">
            <div className="bg-white w-[21cm] min-h-[29.7cm] shadow-2xl p-12 text-slate-800 relative flex flex-col">
                
                {/* Header */}
                <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-900 text-white p-3 rounded-lg">
                            <FileText size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold uppercase tracking-wide">Certificado de Qualidade</h1>
                            <p className="text-xs text-slate-500 font-medium mt-1">Conforme ISO 10474 / EN 10204 - 3.1</p>
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
                        <CheckCircle2 size={24} /> Aprovado CQ
                    </div>
                )}

                {/* Product Info */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase">Cliente</p>
                        <p className="text-sm font-semibold border p-2 rounded bg-slate-50">Empresa Parceira LTDA</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase">Nota Fiscal</p>
                        <p className="text-sm font-semibold border p-2 rounded bg-slate-50">{file.metadata?.invoiceNumber || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase">Produto</p>
                        <p className="text-sm font-semibold border p-2 rounded bg-slate-50">{file.metadata?.productName || file.name}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase">Corrida / Lote</p>
                        <p className="text-sm font-semibold border p-2 rounded bg-slate-50">{file.metadata?.batchNumber || 'N/A'}</p>
                    </div>
                </div>

                {/* Technical Results Table (Mock) */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-slate-800 uppercase mb-2 border-b border-slate-200 pb-1">Resultados Químicos</h3>
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
                    <h3 className="text-sm font-bold text-slate-800 uppercase mb-2 border-b border-slate-200 pb-1">Propriedades Mecânicas</h3>
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
                        <p>Data de Emissão: {file.updatedAt}</p>
                        <p>Certificado gerado eletronicamente.</p>
                    </div>
                    <div className="text-center">
                        <div className="h-12 w-32 mb-2 border-b border-slate-300 flex items-end justify-center">
                            <span className="font-script text-lg text-blue-900 italic">Carlos Silva</span>
                        </div>
                        <p className="font-bold">Engenheiro de Qualidade</p>
                        <p>CREA: 123456/SP</p>
                    </div>
                </div>

            </div>
        </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
      
      {/* Toolbar */}
      <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 shadow-lg z-10">
          <div className="flex items-center gap-4 text-white overflow-hidden">
              <div className="p-2 bg-slate-800 rounded-lg">
                  <FileText className="text-blue-400" size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm truncate">{file.name}</span>
                  <span className="text-xs text-slate-400 truncate">{file.metadata?.batchNumber ? `Lote: ${file.metadata.batchNumber}` : 'Visualização de Arquivo'}</span>
              </div>
          </div>

          <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden md:block" title="Zoom In">
                  <ZoomIn size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden md:block" title="Zoom Out">
                  <ZoomOut size={20} />
              </button>
              <div className="w-px h-6 bg-slate-700 mx-2 hidden md:block"></div>
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden md:block" title="Imprimir">
                  <Printer size={20} />
              </button>
              <button onClick={handleDownload} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-900/20">
                  <Download size={18} /> <span className="hidden sm:inline">Baixar</span>
              </button>
              <div className="w-px h-6 bg-slate-700 mx-2"></div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
                  <X size={24} />
              </button>
          </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-y-auto bg-slate-800 custom-scrollbar p-4 md:p-8 flex justify-center">
          {renderContent()}
      </div>

    </div>
  );
};
