import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Layout } from '../components/Layout.tsx';
import { FileExplorer, FileExplorerHandle } from '../components/FileExplorer.tsx';
import { FilePreviewModal } from '../components/FilePreviewModal.tsx';
import { MOCK_CLIENTS, MOCK_FILES, MASTER_ORG_ID } from '../services/mockData.ts';
import { FileNode, ClientOrganization, FileType, SupportTicket } from '../types.ts';
import { useAuth } from '../services/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { 
    FileText, 
    UploadCloud, 
    Building2,
    X,
    Save,
    CheckCircle2,
    AlertCircle,
    FileUp,
    FolderOpen,
    Trash2,
    Search,
    ChevronRight,
    Clock,
    Eye,
    Download,
    Filter,
    Activity,
    ArrowLeft,
    FolderPlus,
    Database,
    Copy,
    ListFilter,
    AlertTriangle,
    ShieldAlert,
    Inbox,
    Send,
    Check
} from 'lucide-react';
import * as fileService from '../services/fileService.ts';
import * as adminService from '../services/adminService.ts';

const Quality: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // -- STATE: Layout & Navigation --
  const [selectedClient, setSelectedClient] = useState<ClientOrganization | null>(null);
  const [rootFolderId, setRootFolderId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'DOCS' | 'TICKETS'>('DOCS');

  // -- STATE: Documents --
  const [inspectorFile, setInspectorFile] = useState<FileNode | null>(null);
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null); 
  const [clientSearch, setClientSearch] = useState('');
  const [activeDocFilter, setActiveDocFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  const [selectionCount, setSelectionCount] = useState(0);
  const fileExplorerRef = useRef<FileExplorerHandle>(null);

  // -- STATE: Service Desk (Tickets) --
  const [inboxTickets, setInboxTickets] = useState<SupportTicket[]>([]); // Tickets from Clients
  const [outboxTickets, setOutboxTickets] = useState<SupportTicket[]>([]); // Tickets sent to Admin
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [newStatus, setNewStatus] = useState<SupportTicket['status']>('OPEN');
  
  // -- STATE: Modals --
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isTicketDetailOpen, setIsTicketDetailOpen] = useState(false);
  const [isInternalTicketModalOpen, setIsInternalTicketModalOpen] = useState(false);
  
  // -- FORMS --
  const [newFolderName, setNewFolderName] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [internalTicketForm, setInternalTicketForm] = useState({ subject: '', description: '', priority: 'MEDIUM' as const });

  const [uploadFormData, setUploadFormData] = useState({
      name: '',
      batchNumber: '',
      invoiceNumber: '',
      productName: '',
      status: 'APPROVED',
      file: null as File | null
  });
  
  // -- STATE: Import Modal --
  const [masterFiles, setMasterFiles] = useState<FileNode[]>([]);
  const [selectedMasterFiles, setSelectedMasterFiles] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);

  // Derived: Filtered Clients List
  const filteredClients = MOCK_CLIENTS.filter(c => 
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
      c.cnpj.includes(clientSearch)
  );

  const MASTER_ORG: ClientOrganization = {
      id: MASTER_ORG_ID,
      name: t('quality.masterRepo'),
      cnpj: 'INTERNO',
      status: 'ACTIVE',
      contractDate: '-'
  };

  const isMasterSelected = selectedClient?.id === MASTER_ORG_ID;

  // INITIAL LOAD & REFRESH
  useEffect(() => {
      const loadAllData = async () => {
          if (user) {
              // Load Tickets regardless of client selection (Global Dashboard)
              const qualityInbox = await adminService.getQualityInbox();
              const myRequests = await adminService.getMyTickets(user);
              setInboxTickets(qualityInbox);
              setOutboxTickets(myRequests);
          }
      };
      loadAllData();
  }, [user, refreshTrigger]);

  // CLIENT SELECTION EFFECT
  useEffect(() => {
      if (!selectedClient) {
          setRootFolderId(null);
          setCurrentFolderId(null);
          setInspectorFile(null);
          setSelectionCount(0);
          return;
      }
      
      const initClientFiles = async () => {
          if (selectedClient.id === MASTER_ORG_ID) {
              const files = await fileService.getFilesByOwner(MASTER_ORG_ID);
              const root = files.find(f => f.type === FileType.FOLDER && f.parentId === null);
              if (root) {
                  setRootFolderId(root.id);
                  setCurrentFolderId(root.id);
              }
          } else {
              const files = await fileService.getFilesByOwner(selectedClient.id);
              const root = files.find(f => f.type === FileType.FOLDER && f.parentId === null);
              if (root) {
                  setRootFolderId(root.id);
                  setCurrentFolderId(root.id);
              } else if (user) {
                  const newRoot = await fileService.createFolder(user, null, selectedClient.name, selectedClient.id);
                  setRootFolderId(newRoot?.id || null);
                  setCurrentFolderId(newRoot?.id || null);
              }
          }
      };
      initClientFiles();
      setInspectorFile(null);
  }, [selectedClient, user]);

  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Load Master Files when Import Modal opens
  useEffect(() => {
      if (isImportModalOpen) {
          fileService.getMasterLibraryFiles().then(setMasterFiles);
          setSelectedMasterFiles(new Set());
      }
  }, [isImportModalOpen]);

  // -- HANDLERS: Navigation --
  const handleNavigate = (folderId: string | null) => {
      if (folderId === null && rootFolderId) {
          setCurrentFolderId(rootFolderId);
      } else {
          setCurrentFolderId(folderId);
      }
      setInspectorFile(null);
  };

  // -- HANDLERS: Service Desk --

  const openTicketDetail = (ticket: SupportTicket) => {
      setSelectedTicket(ticket);
      setNewStatus(ticket.status);
      setResolutionNote(ticket.resolutionNote || '');
      setIsTicketDetailOpen(true);
  };

  const handleResolveTicket = async () => {
      if (!user || !selectedTicket) return;
      await adminService.resolveTicket(user, selectedTicket.id, newStatus, resolutionNote);
      setIsTicketDetailOpen(false);
      handleRefresh();
  };

  const handleCreateInternalTicket = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      await adminService.createTicket(user, internalTicketForm);
      setIsInternalTicketModalOpen(false);
      setInternalTicketForm({ subject: '', description: '', priority: 'MEDIUM' });
      handleRefresh();
  };

  // -- HANDLERS: Document Actions -- (Existing logic preserved)
  const handleCreateFolder = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !selectedClient || !newFolderName) return;
      await fileService.createFolder(user, currentFolderId, newFolderName, selectedClient.id);
      setIsFolderModalOpen(false);
      setNewFolderName('');
      handleRefresh();
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !selectedClient || !rootFolderId) return;
      const newFile: Partial<FileNode> = {
          name: uploadFormData.name || uploadFormData.file?.name || 'Novo Arquivo',
          parentId: currentFolderId || rootFolderId,
          metadata: {
              batchNumber: uploadFormData.batchNumber,
              invoiceNumber: uploadFormData.invoiceNumber,
              productName: uploadFormData.productName,
              status: uploadFormData.status as any
          },
          tags: [uploadFormData.productName, uploadFormData.batchNumber].filter(Boolean)
      };
      await fileService.uploadFile(user, newFile, selectedClient.id);
      setIsUploadModalOpen(false);
      resetUploadForm();
      handleRefresh();
  };

  const handleImportSubmit = async () => {
      if (!user || !selectedClient || !currentFolderId || selectedMasterFiles.size === 0) return;
      setIsImporting(true);
      await fileService.importFilesFromMaster(user, Array.from(selectedMasterFiles), currentFolderId, selectedClient.id);
      setIsImporting(false);
      setIsImportModalOpen(false);
      handleRefresh();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !inspectorFile) return;
      await fileService.updateFile(user, inspectorFile.id, {
          name: uploadFormData.name, 
          metadata: {
             batchNumber: uploadFormData.batchNumber,
             invoiceNumber: uploadFormData.invoiceNumber,
             productName: uploadFormData.productName,
             status: uploadFormData.status as any
          }
      });
      setIsEditModalOpen(false);
      setInspectorFile(prev => prev ? ({ ...prev, name: uploadFormData.name, metadata: { ...prev.metadata, ...uploadFormData } } as any) : null);
      handleRefresh();
  };

  const handleDelete = async (file: FileNode) => {
      if (!user) return;
      const isFolder = file.type === FileType.FOLDER;
      if (window.confirm(isFolder ? `Excluir pasta "${file.name}" e conteúdo?` : `Excluir "${file.name}"?`)) {
          await fileService.deleteFile(user, file.id);
          setInspectorFile(null);
          handleRefresh();
      }
  };

  const handleQuickStatusChange = async (newStatus: 'APPROVED' | 'REJECTED') => {
      if (!user || !inspectorFile) return;
      await fileService.updateFile(user, inspectorFile.id, {
          metadata: { ...inspectorFile.metadata, status: newStatus }
      });
      setInspectorFile(prev => prev ? ({ ...prev, metadata: { ...prev.metadata, status: newStatus } } as any) : null);
      handleRefresh();
  };

  const openEditModal = (file: FileNode) => {
      setUploadFormData({
          name: file.name,
          batchNumber: file.metadata?.batchNumber || '',
          invoiceNumber: file.metadata?.invoiceNumber || '',
          productName: file.metadata?.productName || '',
          status: file.metadata?.status || 'APPROVED',
          file: null
      });
      setIsEditModalOpen(true);
      setInspectorFile(file);
  };

  const handlePreviewOpen = () => {
      if (inspectorFile) {
          setPreviewFile(inspectorFile);
          fileService.logAction(user!, 'PREVIEW', inspectorFile.name);
      }
  };

  const resetUploadForm = () => {
      setUploadFormData({ name: '', batchNumber: '', invoiceNumber: '', productName: '', status: 'APPROVED', file: null });
  };

  const getPendingCount = (clientId: string) => {
     return MOCK_FILES.filter(f => f.ownerId === clientId && f.metadata?.status === 'PENDING').length;
  };

  // Helper UI Components
  const StatusPill = ({ status }: { status: string }) => {
      const colors: Record<string, string> = {
          OPEN: 'bg-red-100 text-red-700 border-red-200',
          IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
          RESOLVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          SCHEDULED: 'bg-orange-100 text-orange-700'
      };
      const labels: Record<string, string> = {
          OPEN: 'Aberto',
          IN_PROGRESS: 'Em Andamento',
          RESOLVED: 'Respondido',
          SCHEDULED: 'Agendado'
      };
      return (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
              {labels[status] || status}
          </span>
      );
  };

  // Custom Checkbox
  const renderCheckbox = (checked: boolean, onChange: () => void) => (
      <div onClick={(e) => { e.stopPropagation(); onChange(); }} className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer shrink-0 ${checked ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-slate-200 border-slate-300 hover:bg-slate-300'}`}>
          {checked && <Check size={12} strokeWidth={4} />}
      </div>
  );

  return (
    <Layout title={t('menu.documents')}>
        
        <FilePreviewModal file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} />

        {/* Global Action: Open Ticket to Admin */}
        <div className="flex justify-end mb-4">
            <button 
                onClick={() => setIsInternalTicketModalOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-slate-900/10 transition-all active:scale-95"
            >
                <ShieldAlert size={16} className="text-orange-400" />
                Abrir Chamado Interno (Para Admin)
            </button>
        </div>

        {/* Main Workspace */}
        <div className="flex flex-col lg:flex-row h-[calc(100vh-180px)] bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative">
            
            {/* 1. LEFT PANE: Client Selector */}
            <div className={`
                w-full lg:w-72 xl:w-80 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0 transition-all absolute lg:static inset-0 z-20
                ${selectedClient || activeView === 'TICKETS' ? '-translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100 pointer-events-none lg:pointer-events-auto' : 'translate-x-0 opacity-100 pointer-events-auto'}
            `}>
                <div className="p-4 border-b border-slate-200">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{t('quality.partners')}</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text"
                            placeholder={t('quality.searchClient')}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={clientSearch}
                            onChange={e => setClientSearch(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* MASTER LIBRARY PINNED */}
                    <div 
                        onClick={() => { setSelectedClient(MASTER_ORG); setActiveView('DOCS'); }}
                        className={`mx-2 mt-2 mb-4 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md flex items-center gap-3 ${selectedClient?.id === MASTER_ORG_ID ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                    >
                         <div className={`p-2 rounded-lg ${selectedClient?.id === MASTER_ORG_ID ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                             <Database size={20} />
                         </div>
                         <div>
                             <span className={`block font-bold text-sm ${selectedClient?.id === MASTER_ORG_ID ? 'text-white' : 'text-slate-800'}`}>{t('quality.masterRepo')}</span>
                             <span className={`text-[10px] ${selectedClient?.id === MASTER_ORG_ID ? 'text-indigo-200' : 'text-slate-500'}`}>{t('quality.masterLib')}</span>
                         </div>
                    </div>

                    <div className="px-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('quality.partners')}</div>

                    {filteredClients.map(client => {
                        const pending = getPendingCount(client.id);
                        const isSelected = selectedClient?.id === client.id;
                        return (
                            <div 
                                key={client.id}
                                onClick={() => { setSelectedClient(client); setActiveView('DOCS'); }}
                                className={`p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-100 group ${isSelected ? 'bg-white border-l-4 border-l-blue-600 shadow-sm z-10' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-semibold text-sm truncate pr-2 ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{client.name}</span>
                                    {pending > 0 && <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">{pending} <Clock size={10} /></span>}
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-400">
                                    <span className="font-mono">{client.cnpj}</span>
                                    {isSelected && <ChevronRight size={14} className="text-blue-500" />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 2. CENTER PANE: Active Workspace */}
            <div className={`flex-1 flex flex-col min-w-0 bg-white relative transition-all ${selectedClient || activeView === 'TICKETS' ? 'opacity-100' : 'opacity-0 lg:opacity-100 pointer-events-none lg:pointer-events-auto'}`}>
                
                {/* TAB HEADER */}
                <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 bg-white shrink-0 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] z-10">
                        <div className="flex items-center gap-4">
                        <button onClick={() => { setSelectedClient(null); setActiveView('DOCS'); }} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg shrink-0"><ArrowLeft size={20} /></button>
                        
                        {/* VIEW TABS */}
                        <div className="flex p-1 bg-slate-100 rounded-lg">
                            <button 
                                onClick={() => setActiveView('DOCS')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${activeView === 'DOCS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <FolderOpen size={14} /> Documentos
                            </button>
                            <button 
                                onClick={() => { setActiveView('TICKETS'); setSelectedClient(null); }}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${activeView === 'TICKETS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Inbox size={14} /> Gestão de Chamados
                            </button>
                        </div>
                        {selectedClient && activeView === 'DOCS' && (
                            <span className="text-xs font-medium text-slate-400 border-l pl-4 border-slate-200 truncate max-w-[200px]">{selectedClient.name}</span>
                        )}
                        </div>

                        {/* Contextual Actions (Only for Docs view) */}
                        {activeView === 'DOCS' && selectedClient && rootFolderId && (
                            <div className="flex items-center gap-2">
                            {selectionCount > 0 ? (
                                <button onClick={() => fileExplorerRef.current?.triggerBulkDownload()} className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm">
                                    <Download size={14} /> <span className="hidden md:inline">{t('files.bulkDownload')}</span> ({selectionCount})
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => setIsFolderModalOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors"><FolderPlus size={20} /></button>
                                    {!isMasterSelected && (
                                        <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm">
                                            <Copy size={14} /> <span className="hidden sm:inline">{t('quality.importMaster')}</span>
                                        </button>
                                    )}
                                    <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">
                                        <FileUp size={14} /> <span className="hidden sm:inline">{t('quality.upload')}</span>
                                    </button>
                                </>
                            )}
                        </div>
                        )}
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-hidden relative">
                        {activeView === 'DOCS' ? (
                            selectedClient && rootFolderId ? (
                                <FileExplorer 
                                    ref={fileExplorerRef}
                                    key={`${selectedClient.id}-${refreshTrigger}`}
                                    currentFolderId={currentFolderId} 
                                    onNavigate={handleNavigate}
                                    allowUpload={false} 
                                    onFileSelect={setInspectorFile}
                                    hideToolbar={false} 
                                    filterStatus={activeDocFilter} 
                                    onSelectionChange={setSelectionCount}
                                    onEdit={openEditModal}
                                    onDelete={handleDelete}
                                />
                            ) : (
                                <div className="hidden lg:flex flex-1 h-full flex-col items-center justify-center text-slate-300">
                                    <Building2 size={64} className="mb-4 text-slate-100" />
                                    <p className="font-medium text-slate-400">{t('quality.selectClient')}</p>
                                </div>
                            )
                        ) : (
                            /* --- SERVICE DESK DASHBOARD (ROBUST VIEW) --- */
                            <div className="flex flex-col h-full bg-slate-50 p-6 overflow-auto">
                                
                                {/* Section 1: INCOMING (Clients -> Quality) */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Inbox size={20}/></div>
                                        <h3 className="text-lg font-bold text-slate-800">Chamados dos Clientes (Entrada)</h3>
                                        <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{inboxTickets.filter(t => t.status !== 'RESOLVED').length} Pendentes</span>
                                    </div>
                                    
                                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-6 py-4 font-bold uppercase text-xs">Status</th>
                                                    <th className="px-6 py-4 font-bold uppercase text-xs">Prioridade</th>
                                                    <th className="px-6 py-4 font-bold uppercase text-xs">Assunto</th>
                                                    <th className="px-6 py-4 font-bold uppercase text-xs">Cliente / Solicitante</th>
                                                    <th className="px-6 py-4 font-bold uppercase text-xs">Abertura</th>
                                                    <th className="px-6 py-4 font-bold uppercase text-xs text-right">Ação</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {inboxTickets.length === 0 ? (
                                                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">Nenhum chamado de cliente encontrado.</td></tr>
                                                ) : (
                                                    inboxTickets.map(ticket => (
                                                        <tr key={ticket.id} className="hover:bg-slate-50 transition-colors group">
                                                            <td className="px-6 py-4"><StatusPill status={ticket.status} /></td>
                                                            <td className="px-6 py-4">
                                                                <span className={`text-[10px] font-bold ${ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL' ? 'text-red-600' : 'text-slate-500'}`}>
                                                                    {t(`admin.tickets.priority.${ticket.priority}`)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 font-medium text-slate-800">{ticket.subject}</td>
                                                            <td className="px-6 py-4 text-slate-600 flex flex-col">
                                                                <span className="font-bold text-xs">{ticket.userName}</span>
                                                                <span className="text-[10px] text-slate-400">ID: {ticket.userId}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-500 font-mono text-xs">{ticket.createdAt}</td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button onClick={() => openTicketDetail(ticket)} className="text-blue-600 hover:text-blue-800 font-bold text-xs border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all">
                                                                    Gerenciar
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Section 2: OUTGOING (Quality -> Admin) */}
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><ShieldAlert size={20}/></div>
                                        <h3 className="text-lg font-bold text-slate-800">Meus Chamados Internos (Enviados ao Admin)</h3>
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                            {outboxTickets.length === 0 ? (
                                                <div className="col-span-full text-center py-8 text-slate-400 text-sm">Você não tem chamados abertos para a administração.</div>
                                            ) : (
                                                outboxTickets.map(ticket => (
                                                    <div key={ticket.id} className="p-4 border border-slate-100 rounded-lg bg-slate-50 hover:border-orange-200 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <StatusPill status={ticket.status} />
                                                            <span className="text-[10px] text-slate-400">{ticket.createdAt}</span>
                                                        </div>
                                                        <h4 className="font-bold text-slate-800 text-sm mb-1">{ticket.subject}</h4>
                                                        <p className="text-xs text-slate-500 line-clamp-2">{ticket.description}</p>
                                                        {ticket.resolutionNote && (
                                                            <div className="mt-3 bg-white p-2 rounded border border-slate-200">
                                                                <p className="text-[10px] font-bold text-slate-700 mb-1">Resposta do Admin:</p>
                                                                <p className="text-xs text-slate-600 italic">"{ticket.resolutionNote}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}
                </div>
            </div>

            {/* 3. RIGHT PANE: Context Inspector (Only in DOCS view) */}
            {activeView === 'DOCS' && inspectorFile && inspectorFile.type !== FileType.FOLDER && (
                <div className="fixed inset-0 z-50 xl:static xl:w-80 border-l border-slate-200 bg-slate-50 flex flex-col shrink-0 animate-in slide-in-from-right-10 duration-200 shadow-2xl xl:shadow-none">
                    <div className="p-6 border-b border-slate-200 bg-white flex flex-col relative">
                        <button onClick={() => setInspectorFile(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 xl:hidden"><X size={24} /></button>
                        <div className="flex items-start gap-3 pr-8">
                            <div className="p-3 bg-red-50 rounded-xl text-red-500 shrink-0"><FileText size={24} /></div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-slate-800 text-sm leading-tight break-words">{inspectorFile.name}</h4>
                                <p className="text-xs text-slate-500 mt-1">{inspectorFile.size} • {inspectorFile.type}</p>
                            </div>
                        </div>
                        <div className="mt-4 flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                            <button onClick={() => handleQuickStatusChange('APPROVED')} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all ${inspectorFile.metadata?.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                <CheckCircle2 size={12} /> {t('quality.approve')}
                            </button>
                            <button onClick={() => handleQuickStatusChange('REJECTED')} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all ${inspectorFile.metadata?.status === 'REJECTED' ? 'bg-red-100 text-red-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                <X size={12} /> {t('quality.reject')}
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50">
                        <div>
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Activity size={12} /> {t('quality.techData')}</h5>
                            <div className="space-y-3">
                                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm"><span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">{t('quality.product')}</span><span className="text-sm font-medium text-slate-800">{inspectorFile.metadata?.productName || '-'}</span></div>
                                <div className="flex gap-3">
                                    <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm"><span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">{t('quality.batch')}</span><span className="text-sm font-mono text-slate-700">{inspectorFile.metadata?.batchNumber || '-'}</span></div>
                                    <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm"><span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">{t('quality.invoice')}</span><span className="text-sm font-mono text-slate-700">{inspectorFile.metadata?.invoiceNumber || '-'}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-2 pb-8 xl:pb-4">
                         <button onClick={() => openEditModal(inspectorFile)} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"><Filter size={14} /> {t('quality.editData')}</button>
                         <div className="flex gap-2">
                             <button onClick={handlePreviewOpen} className="flex-1 py-2.5 border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"><Eye size={14} /> {t('quality.preview')}</button>
                             <button onClick={() => handleDelete(inspectorFile)} className="px-3 py-2.5 border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-400 rounded-lg transition-colors"><Trash2 size={16} /></button>
                         </div>
                    </div>
                </div>
            )}
        </div>

        {/* MODAL: Ticket Detail (Management) */}
        {isTicketDetailOpen && selectedTicket && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-800">Gerenciar Chamado</h3>
                        <button onClick={() => setIsTicketDetailOpen(false)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
                    </div>
                    <div className="p-6 overflow-y-auto">
                        <div className="mb-6 space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Problema Relatado por {selectedTicket.userName}</span>
                                <h4 className="font-bold text-slate-800 text-sm mb-2">{selectedTicket.subject}</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">{selectedTicket.description}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-700 uppercase border-b border-slate-100 pb-2">Ação do Departamento de Qualidade</h4>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Alterar Status</label>
                                <select 
                                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value as any)}
                                >
                                    <option value="OPEN">Aberto</option>
                                    <option value="IN_PROGRESS">Em Andamento</option>
                                    <option value="RESOLVED">Resolvido (Finalizar)</option>
                                </select>
                            </div>

                            {newStatus === 'RESOLVED' && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nota de Resolução (Obrigatório)</label>
                                    <textarea 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm h-32 resize-none"
                                        placeholder="Descreva o que foi feito para resolver o problema..."
                                        value={resolutionNote}
                                        onChange={(e) => setResolutionNote(e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500 mt-2">Esta nota será visível para o cliente.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                        <button onClick={() => setIsTicketDetailOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
                        <button 
                            onClick={handleResolveTicket} 
                            disabled={newStatus === 'RESOLVED' && !resolutionNote.trim()}
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* MODAL: Open Internal Ticket (Quality -> Admin) */}
        {isInternalTicketModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <ShieldAlert className="text-orange-500" size={20}/> Novo Chamado Interno
                        </h3>
                        <button onClick={() => setIsInternalTicketModalOpen(false)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
                    </div>
                    <form onSubmit={handleCreateInternalTicket} className="p-6 space-y-4">
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-xs text-orange-800 mb-4">
                            Este chamado será enviado diretamente para a <strong>Administração do Sistema</strong>. Use para reportar erros sistêmicos ou solicitar recursos.
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Assunto</label>
                            <input 
                                required 
                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                                value={internalTicketForm.subject} 
                                onChange={e => setInternalTicketForm({...internalTicketForm, subject: e.target.value})}
                                placeholder="Ex: Erro no upload em massa..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Prioridade</label>
                            <select 
                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                                value={internalTicketForm.priority}
                                onChange={e => setInternalTicketForm({...internalTicketForm, priority: e.target.value as any})}
                            >
                                <option value="LOW">Baixa</option>
                                <option value="MEDIUM">Média</option>
                                <option value="HIGH">Alta</option>
                                <option value="CRITICAL">Crítica</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Descrição</label>
                            <textarea 
                                required 
                                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm h-32 resize-none"
                                value={internalTicketForm.description} 
                                onChange={e => setInternalTicketForm({...internalTicketForm, description: e.target.value})}
                                placeholder="Descreva o problema ou solicitação..."
                            />
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsInternalTicketModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancelar</button>
                            <button type="submit" className="px-6 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 shadow-lg flex items-center gap-2">
                                <Send size={16} /> Enviar Solicitação
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* MODAL: Import from Master */}
        {isImportModalOpen && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div>
                             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Database className="text-indigo-600" size={20}/> {t('quality.importModal.title')}
                             </h3>
                             <p className="text-xs text-slate-500">{t('quality.importModal.desc')} <strong>{selectedClient?.name}</strong></p>
                        </div>
                        <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-0">
                        {masterFiles.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Database size={48} className="mx-auto mb-2 opacity-20" />
                                <p>{t('quality.importModal.empty')}</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 w-10 text-center">
                                            {renderCheckbox(
                                                selectedMasterFiles.size === masterFiles.length && masterFiles.length > 0,
                                                () => {
                                                    if (selectedMasterFiles.size === masterFiles.length) {
                                                        setSelectedMasterFiles(new Set());
                                                    } else {
                                                        setSelectedMasterFiles(new Set(masterFiles.map(f => f.id)));
                                                    }
                                                }
                                            )}
                                        </th>
                                        <th className="px-4 py-3 font-medium">{t('quality.importModal.filename')}</th>
                                        <th className="px-4 py-3 font-medium">{t('quality.importModal.ref')}</th>
                                        <th className="px-4 py-3 font-medium text-right">{t('quality.importModal.size')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {masterFiles.map(file => {
                                        const isSelected = selectedMasterFiles.has(file.id);
                                        return (
                                            <tr 
                                                key={file.id} 
                                                onClick={() => {
                                                    const newSet = new Set(selectedMasterFiles);
                                                    if(newSet.has(file.id)) newSet.delete(file.id);
                                                    else newSet.add(file.id);
                                                    setSelectedMasterFiles(newSet);
                                                }}
                                                className={`cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-slate-50'}`}
                                            >
                                                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                    {renderCheckbox(
                                                        isSelected,
                                                        () => {
                                                            const newSet = new Set(selectedMasterFiles);
                                                            if(newSet.has(file.id)) newSet.delete(file.id);
                                                            else newSet.add(file.id);
                                                            setSelectedMasterFiles(newSet);
                                                        }
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 flex items-center gap-2">
                                                    <FileText size={16} className="text-slate-400" />
                                                    <span className="font-medium text-slate-700">{file.name}</span>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-slate-500 text-xs">
                                                    {file.metadata?.batchNumber || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-500 text-xs">
                                                    {file.size || '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium">
                            {selectedMasterFiles.size} {t('quality.importModal.selected')}
                        </span>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsImportModalOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                            >
                                {t('common.cancel')}
                            </button>
                            <button 
                                onClick={handleImportSubmit}
                                disabled={selectedMasterFiles.size === 0 || isImporting}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-lg shadow-indigo-900/20 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isImporting ? t('common.loading') : <><Copy size={16} /> {t('quality.importModal.btnImport')}</>}
                            </button>
                        </div>
                    </div>
                </div>
             </div>
        )}

        {/* MODAL: New Folder */}
        {isFolderModalOpen && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <FolderPlus className="text-blue-500" size={20}/> {t('quality.newFolder')}
                        </h3>
                        <button onClick={() => setIsFolderModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleCreateFolder} className="p-6">
                        <div className="space-y-1 mb-4">
                            <label className="text-sm font-semibold text-slate-700">{t('quality.folderName')}</label>
                            <input 
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder={t('quality.folderPlaceholder')}
                                required
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button 
                                type="button"
                                onClick={() => setIsFolderModalOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                            >
                                {t('common.cancel')}
                            </button>
                            <button 
                                type="submit"
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-900/20"
                            >
                                {t('common.create')}
                            </button>
                        </div>
                    </form>
                </div>
             </div>
        )}

        {/* MODAL: Upload / Edit */}
        {(isUploadModalOpen || isEditModalOpen) && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            {isEditModalOpen ? <><FileText className="text-blue-500"/> {t('quality.uploadModal.titleEdit')}</> : <><FileUp className="text-blue-500"/> {t('quality.uploadModal.titleNew')}</>}
                        </h3>
                        <button onClick={() => { setIsUploadModalOpen(false); setIsEditModalOpen(false); }} className="text-slate-400 hover:text-red-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={isEditModalOpen ? handleEditSubmit : handleUploadSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">{t('files.name')}</label>
                                <input 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                                    placeholder="Nome do arquivo..."
                                    value={uploadFormData.name}
                                    onChange={e => setUploadFormData({...uploadFormData, name: e.target.value})}
                                    required
                                />
                            </div>
                            {!isEditModalOpen && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('quality.uploadModal.originalFile')}</label>
                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-slate-50 hover:border-blue-400 transition-colors cursor-pointer group relative">
                                        <input 
                                            type="file" 
                                            accept=".pdf"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if(file) setUploadFormData({...uploadFormData, file: file, name: uploadFormData.name || file.name});
                                            }}
                                            required={!isEditModalOpen}
                                        />
                                        <UploadCloud size={32} className="text-slate-400 group-hover:text-blue-500 mb-2" />
                                        <p className="text-sm font-medium text-slate-600 group-hover:text-blue-600">
                                            {uploadFormData.file ? uploadFormData.file.name : t('quality.uploadModal.dragDrop')}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">{t('quality.uploadModal.pdfMax')}</p>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">{t('quality.product')}</label>
                                <input 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Ex: Barra Aço SAE 1045"
                                    value={uploadFormData.productName}
                                    onChange={e => setUploadFormData({...uploadFormData, productName: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">{t('quality.batch')}</label>
                                <input 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                                    placeholder="Ex: L-99855"
                                    value={uploadFormData.batchNumber}
                                    onChange={e => setUploadFormData({...uploadFormData, batchNumber: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">{t('quality.invoice')}</label>
                                <input 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                                    placeholder="Ex: NF-102030"
                                    value={uploadFormData.invoiceNumber}
                                    onChange={e => setUploadFormData({...uploadFormData, invoiceNumber: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">{t('common.status')}</label>
                                <select 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm cursor-pointer"
                                    value={uploadFormData.status}
                                    onChange={e => setUploadFormData({...uploadFormData, status: e.target.value})}
                                >
                                    <option value="APPROVED">{t('common.status')} {t('dashboard.active')}</option>
                                    <option value="PENDING">Pending (Internal)</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 bg-blue-50 p-3 rounded-lg flex gap-3 text-xs text-blue-800 border border-blue-100">
                             <AlertCircle size={16} className="shrink-0 mt-0.5" />
                             <div>
                                 <p className="font-bold">{t('quality.uploadModal.integrity')}</p>
                                 <p>{t('quality.uploadModal.integrityText')}</p>
                             </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end gap-3">
                            <button type="button" onClick={() => { setIsUploadModalOpen(false); setIsEditModalOpen(false); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">{t('common.cancel')}</button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-transform active:scale-95"><Save size={18} />{t('common.save')}</button>
                        </div>
                    </form>
                </div>
             </div>
        )}

    </Layout>
  );
};

export default Quality;