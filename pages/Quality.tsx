
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Layout } from '../components/Layout.tsx';
import { FileExplorer, FileExplorerHandle } from '../components/FileExplorer.tsx';
import { FilePreviewModal } from '../components/FilePreviewModal.tsx';
import { MASTER_ORG_ID, FileNode, ClientOrganization, FileType, SupportTicket, FileMetadata } from '../types.ts';
import { useAuth } from '../services/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { 
    X, FileUp, ArrowLeft, Download, ShieldAlert, Loader2, CheckCircle, XCircle, AlertTriangle, Info, Tag, FileText
} from 'lucide-react';
import { fileService, adminService, notificationService } from '../services/index.ts';

import { QualityOverviewCards } from '../components/quality/QualityOverviewCards.tsx';
import { ClientHub } from '../components/quality/ClientHub.tsx';

const Quality: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = (searchParams.get('view') as any) || 'overview';
  
  const [clients, setClients] = useState<ClientOrganization[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientOrganization | null>(null);
  const [inboxTickets, setInboxTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState({ pendingDocs: 0 });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [clientSearch, setClientSearch] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [inspectorFile, setInspectorFile] = useState<FileNode | null>(null);
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null);
  const fileExplorerRef = useRef<FileExplorerHandle>(null);

  // Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState<Partial<FileMetadata>>({
      status: 'PENDING',
      productName: '',
      batchNumber: '',
      invoiceNumber: ''
  });
  const [selectedFileBlob, setSelectedFileBlob] = useState<File | null>(null);

  useEffect(() => { setSelectedClient(null); setInspectorFile(null); }, [activeView]);

  useEffect(() => {
      const loadData = async () => {
          if (user) {
              setIsLoading(true);
              try {
                  const [inbox, clientList, globalStats] = await Promise.all([
                      adminService.getQualityInbox(),
                      adminService.getClients(),
                      fileService.getDashboardStats(user)
                  ]);
                  setInboxTickets(inbox);
                  setClients(clientList);
                  setStats({ pendingDocs: globalStats.pendingValue || 0 });
              } catch (err) {
                  console.error("Erro ao carregar dados de qualidade:", err);
              } finally {
                  setIsLoading(false);
              }
          }
      };
      loadData();
  }, [user, refreshTrigger]);

  const handleInspectAction = async (action: 'APPROVE' | 'REJECT', reason?: string) => {
      if (!inspectorFile || !user) return;
      
      setIsProcessing(true);
      try {
          // Fix: Explicitly type updatedMetadata as FileMetadata and cast status to satisfy the enum-like type requirement.
          const updatedMetadata: FileMetadata = {
              ...inspectorFile.metadata,
              status: (action === 'APPROVE' ? 'APPROVED' : 'REJECTED') as 'APPROVED' | 'REJECTED',
              rejectionReason: reason || undefined,
              inspectedAt: new Date().toISOString(),
              inspectedBy: user.name
          };

          await fileService.updateFile(user, inspectorFile.id, { metadata: updatedMetadata });
          
          // Notificar Cliente
          if (inspectorFile.ownerId) {
              await notificationService.addNotification(
                  inspectorFile.ownerId, 
                  action === 'APPROVE' ? "Documento Aprovado" : "Documento Recusado",
                  `O arquivo ${inspectorFile.name} foi analisado pelo depto. de qualidade.`,
                  action === 'APPROVE' ? 'SUCCESS' : 'ALERT',
                  '/dashboard?view=files'
              );
          }

          setInspectorFile({ ...inspectorFile, metadata: updatedMetadata });
          setRefreshTrigger(prev => prev + 1);
          alert(`Documento ${action === 'APPROVE' ? 'aprovado' : 'rejeitado'} com sucesso.`);
      } catch (err) {
          alert("Erro ao processar inspeção.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleUpload = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedFileBlob || !user || !selectedClient) return;

      setIsProcessing(true);
      try {
          // Fix: Cast the fileData object to any because the interface is missing the fileBlob property required by the Supabase implementation.
          await fileService.uploadFile(user, {
              name: selectedFileBlob.name,
              parentId: currentFolderId,
              metadata: uploadData as any,
              fileBlob: selectedFileBlob
          } as any, selectedClient.id);

          setIsUploadModalOpen(false);
          setSelectedFileBlob(null);
          setUploadData({ status: 'PENDING', productName: '', batchNumber: '', invoiceNumber: '' });
          setRefreshTrigger(prev => prev + 1);
          alert("Certificado enviado com sucesso.");
      } catch (err) {
          alert("Erro no upload do arquivo.");
      } finally {
          setIsProcessing(false);
      }
  };

  const clientGroups = useMemo(() => {
      const filtered = clients.filter(c => {
          const name = (c.name || "").toLowerCase();
          const cnpj = (c.cnpj || "");
          const search = clientSearch.toLowerCase();
          return name.includes(search) || cnpj.includes(search);
      });

      if (clientSearch) return { 'Resultados': filtered };

      const groups: Record<string, ClientOrganization[]> = {};
      filtered.forEach(c => {
          const name = c.name || "Sem Nome";
          const letter = name.charAt(0).toUpperCase();
          if (!groups[letter]) groups[letter] = [];
          groups[letter].push(c);
      });
      return groups;
  }, [clients, clientSearch]);

  return (
    <Layout title={t('menu.documents')}>
        <FilePreviewModal file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} />
        
        {/* Modal de Upload de Qualidade */}
        {isUploadModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <FileUp size={20} className="text-blue-600"/> Enviar Novo Certificado
                        </h3>
                        <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
                    </div>
                    
                    <form onSubmit={handleUpload} className="p-6 space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Arquivo PDF/Imagem</label>
                            <input 
                                type="file" 
                                accept="application/pdf,image/*" 
                                required 
                                onChange={e => setSelectedFileBlob(e.target.files?.[0] || null)}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Produto</label>
                                <input 
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                                    placeholder="Ex: SAE 1045"
                                    value={uploadData.productName}
                                    onChange={e => setUploadData({...uploadData, productName: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Nº Corrida/Lote</label>
                                <input 
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                                    placeholder="L-998"
                                    value={uploadData.batchNumber}
                                    onChange={e => setUploadData({...uploadData, batchNumber: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Nota Fiscal vinculada</label>
                            <input 
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                                placeholder="NF-000123"
                                value={uploadData.invoiceNumber}
                                onChange={e => setUploadData({...uploadData, invoiceNumber: e.target.value})}
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={() => setIsUploadModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all">Cancelar</button>
                            <button 
                                type="submit" 
                                disabled={isProcessing}
                                className="flex-[2] py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={18}/> : 'Realizar Upload'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                {activeView === 'overview' ? 'Visão Geral' : activeView === 'clients' ? 'Carteira B2B' : 'Central de Requisições'}
            </h1>
            <div className="flex gap-2">
                 <button onClick={() => setRefreshTrigger(prev => prev + 1)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-xl shadow-sm transition-all">
                    <Loader2 size={18} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>
        </div>

        <div className="h-[calc(100vh-190px)] relative">
            {selectedClient ? (
                <div className="absolute inset-0 z-40 bg-slate-50 flex flex-col animate-in slide-in-from-right-4 duration-400">
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200 shrink-0">
                        <button onClick={() => setSelectedClient(null)} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:text-blue-600 shadow-sm transition-all"><ArrowLeft size={20} /></button>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 leading-none">{selectedClient.name}</h2>
                            <p className="text-[10px] text-slate-400 font-mono mt-1 tracking-widest">{selectedClient.cnpj}</p>
                        </div>
                        <div className="flex gap-2 ml-auto">
                            <button onClick={() => setIsUploadModalOpen(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"><FileUp size={16} /> Enviar Certificado</button>
                        </div>
                    </div>
                    
                    <div className="flex-1 flex gap-4 overflow-hidden">
                        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                             <FileExplorer 
                                ref={fileExplorerRef} 
                                currentFolderId={currentFolderId} 
                                onNavigate={setCurrentFolderId} 
                                allowUpload={false} 
                                onFileSelect={setInspectorFile} 
                                hideToolbar={false} 
                            />
                        </div>

                        {inspectorFile && inspectorFile.type !== FileType.FOLDER && (
                            <div className="w-80 bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col animate-in slide-in-from-right-10 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText size={16} className="text-blue-500 shrink-0"/>
                                        <p className="text-sm font-bold truncate" title={inspectorFile.name}>{inspectorFile.name}</p>
                                    </div>
                                    <button onClick={() => setInspectorFile(null)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"><X size={18}/></button>
                                </div>
                                
                                <div className="p-4 flex-1 space-y-6 overflow-y-auto custom-scrollbar">
                                    {/* Status Section */}
                                    <div className="space-y-3">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Status da Inspeção</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                                                    inspectorFile.metadata?.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                    inspectorFile.metadata?.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' : 
                                                    'bg-orange-50 text-orange-600 border-orange-100'
                                                }`}>
                                                    {inspectorFile.metadata?.status === 'APPROVED' ? <CheckCircle size={14}/> : 
                                                     inspectorFile.metadata?.status === 'REJECTED' ? <XCircle size={14}/> : <AlertTriangle size={14}/>}
                                                    {inspectorFile.metadata?.status || 'PENDENTE'}
                                                </span>
                                            </div>
                                            {inspectorFile.metadata?.rejectionReason && (
                                                <p className="mt-3 text-[11px] text-red-500 italic bg-red-50/50 p-2 rounded border border-red-100">
                                                    Motivo: {inspectorFile.metadata.rejectionReason}
                                                </p>
                                            )}
                                        </div>

                                        {/* INSPECTION ACTIONS (THE CORE ROBUSTNESS FEATURE) */}
                                        <div className="grid grid-cols-2 gap-2 pt-2">
                                            <button 
                                                disabled={isProcessing || inspectorFile.metadata?.status === 'APPROVED'}
                                                onClick={() => handleInspectAction('APPROVE')}
                                                className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all disabled:opacity-30"
                                            >
                                                <CheckCircle size={20} className="mb-1" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Aprovar</span>
                                            </button>
                                            <button 
                                                disabled={isProcessing || inspectorFile.metadata?.status === 'REJECTED'}
                                                onClick={() => {
                                                    const reason = prompt("Motivo da rejeição:");
                                                    if (reason) handleInspectAction('REJECT', reason);
                                                }}
                                                className="flex flex-col items-center justify-center p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-all disabled:opacity-30"
                                            >
                                                <XCircle size={20} className="mb-1" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Rejeitar</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Metadata Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Tag size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Informações do Material</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm hover:border-blue-200 transition-colors">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Produto</p>
                                                <p className="text-xs font-semibold text-slate-800">{inspectorFile.metadata?.productName || 'Não informado'}</p>
                                            </div>
                                            <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm hover:border-blue-200 transition-colors">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Nº Corrida (Lote)</p>
                                                <p className="text-xs font-mono font-bold text-blue-600">{inspectorFile.metadata?.batchNumber || 'N/A'}</p>
                                            </div>
                                            <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm hover:border-blue-200 transition-colors">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Nota Fiscal</p>
                                                <p className="text-xs font-semibold text-slate-800">{inspectorFile.metadata?.invoiceNumber || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {inspectorFile.metadata?.inspectedAt && (
                                        <div className="pt-4 flex items-center gap-2 text-[9px] text-slate-400 italic">
                                            <Info size={12}/> Analisado por {inspectorFile.metadata.inspectedBy} em {new Date(inspectorFile.metadata.inspectedAt).toLocaleString()}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                                    <button onClick={() => setPreviewFile(inspectorFile)} className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 active:scale-95 transition-all">Visualizar PDF</button>
                                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 transition-all"><Download size={18}/></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col">
                    {activeView === 'overview' && (
                        <QualityOverviewCards 
                            totalClients={clients.length} 
                            totalPendingDocs={stats.pendingDocs} 
                            totalOpenTickets={inboxTickets.length} 
                            totalInbox={inboxTickets.length} 
                            onChangeView={(v) => setSearchParams({view: v})} 
                        />
                    )}
                    {activeView === 'clients' && <ClientHub clientGroups={clientGroups} clientSearch={clientSearch} setClientSearch={setClientSearch} onSelectClient={setSelectedClient} />}
                </div>
            )}
        </div>
    </Layout>
  );
};

export default Quality;
