
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Layout } from '../components/Layout.tsx';
import { FileExplorer, FileExplorerHandle } from '../components/FileExplorer.tsx';
import { FilePreviewModal } from '../components/FilePreviewModal.tsx';
import { MASTER_ORG_ID } from '../services/mockData.ts';
import { FileNode, ClientOrganization, FileType, SupportTicket } from '../types.ts';
import { useAuth } from '../services/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { 
    X, FileUp, ArrowLeft, Download, ShieldAlert
} from 'lucide-react';
// Fix: Import from services/index.ts to use the correctly typed and initialized service instances
import { fileService, adminService } from '../services/index.ts';

// Components
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [clientSearch, setClientSearch] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [inspectorFile, setInspectorFile] = useState<FileNode | null>(null);
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null);
  const fileExplorerRef = useRef<FileExplorerHandle>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isInternalTicketModalOpen, setIsInternalTicketModalOpen] = useState(false);

  useEffect(() => { setSelectedClient(null); }, [activeView]);

  useEffect(() => {
      const loadData = async () => {
          if (user) {
              const [inbox, clientList] = await Promise.all([
                  adminService.getQualityInbox(),
                  adminService.getClients()
              ]);
              setInboxTickets(inbox);
              setClients(clientList);
          }
      };
      loadData();
  }, [user, refreshTrigger]);

  useEffect(() => {
      const initFolder = async () => {
          if (activeView === 'master') {
              const files = await fileService.getFilesByOwner(MASTER_ORG_ID);
              const root = files.find(f => f.type === FileType.FOLDER && f.parentId === null);
              setCurrentFolderId(root?.id || null);
              return;
          }
          if (selectedClient) {
              const files = await fileService.getFilesByOwner(selectedClient.id);
              const root = files.find(f => f.type === FileType.FOLDER && f.parentId === null);
              setCurrentFolderId(root?.id || null);
          }
      };
      initFolder();
  }, [selectedClient, activeView, user]);

  const clientGroups = useMemo(() => {
      const filtered = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.cnpj.includes(clientSearch));
      if (clientSearch) return { 'Resultados': filtered };
      const groups: Record<string, ClientOrganization[]> = {};
      filtered.forEach(c => {
          const letter = c.name.charAt(0).toUpperCase();
          if (!groups[letter]) groups[letter] = []; groups[letter].push(c);
      });
      return groups;
  }, [clients, clientSearch]);

  return (
    <Layout title={t('menu.documents')}>
        <FilePreviewModal file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} />
        
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                {activeView === 'overview' ? 'Visão Geral' : activeView === 'clients' ? 'Carteira B2B' : 'Central de Requisições'}
            </h1>
            <button onClick={() => setIsInternalTicketModalOpen(true)} className="bg-slate-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 transition-all">
                <ShieldAlert size={16} className="text-orange-400"/> Admin Service Desk
            </button>
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
                            <button onClick={() => setIsUploadModalOpen(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"><FileUp size={16} /> Novo Certificado</button>
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
                                    <p className="text-sm font-bold truncate pr-2" title={inspectorFile.name}>{inspectorFile.name}</p>
                                    <button onClick={() => setInspectorFile(null)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"><X size={18}/></button>
                                </div>
                                <div className="p-4 flex-1 space-y-4 overflow-y-auto custom-scrollbar">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-inner">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Status CQ</span>
                                        <span className={`font-bold text-xs px-2 py-0.5 rounded border ${inspectorFile.metadata?.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                            {inspectorFile.metadata?.status || 'PENDENTE'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Produto</p>
                                            <p className="text-xs font-semibold text-slate-800">{inspectorFile.metadata?.productName || '-'}</p>
                                        </div>
                                        <div className="p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Nº Corrida/Lote</p>
                                            <p className="text-xs font-mono text-slate-800">{inspectorFile.metadata?.batchNumber || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                                    <button onClick={() => setPreviewFile(inspectorFile)} className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 active:scale-95 transition-all">Visualizar</button>
                                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all"><Download size={18}/></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col">
                    {activeView === 'overview' && <QualityOverviewCards totalClients={clients.length} totalPendingDocs={4} totalOpenTickets={inboxTickets.length} totalInbox={inboxTickets.length} onChangeView={(v) => setSearchParams({view: v})} />}
                    {activeView === 'clients' && <ClientHub clientGroups={clientGroups} clientSearch={clientSearch} setClientSearch={setClientSearch} onSelectClient={setSelectedClient} />}
                </div>
            )}
        </div>
    </Layout>
  );
};
