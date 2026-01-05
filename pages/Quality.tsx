
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Layout } from '../components/Layout.tsx';
import { FileExplorer, FileExplorerHandle } from '../components/FileExplorer.tsx';
import { FilePreviewModal } from '../components/FilePreviewModal.tsx';
import { MOCK_CLIENTS, MOCK_FILES, MASTER_ORG_ID } from '../services/mockData.ts';
import { FileNode, ClientOrganization, FileType, SupportTicket } from '../types.ts';
import { useAuth } from '../services/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
    Check,
    LayoutGrid,
    List,
    Users,
    Hash,
    Calendar,
    Briefcase,
    LayoutDashboard,
    ArrowUpRight,
    MoreHorizontal,
    Edit2,
    Folder,
    ArrowDownAZ,
    ArrowUpZA,
    Layers,
    Home
} from 'lucide-react';
import * as fileService from '../services/fileService.ts';
import * as adminService from '../services/adminService.ts';

// --- TYPES & HELPERS ---
type QualityView = 'overview' | 'clients' | 'master' | 'tickets';
type GroupingMode = 'ALPHA' | 'STATUS' | 'YEAR' | 'NONE';

const Quality: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // -- GLOBAL NAVIGATION STATE --
  const activeView = (searchParams.get('view') as QualityView) || 'overview';
  
  const [selectedClient, setSelectedClient] = useState<ClientOrganization | null>(null);

  // Reset drill-down when main view changes via sidebar
  useEffect(() => {
      setSelectedClient(null);
  }, [activeView]);

  const changeView = (view: QualityView) => {
      setSearchParams({ view });
  };

  // -- DATA STATE --
  const [inboxTickets, setInboxTickets] = useState<SupportTicket[]>([]);
  const [outboxTickets, setOutboxTickets] = useState<SupportTicket[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // -- CLIENT HUB STATE (SCALABLE) --
  const [clientViewMode, setClientViewMode] = useState<'grid' | 'list'>('grid');
  const [clientSearch, setClientSearch] = useState('');
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('ALPHA');
  const [activeGroupFolder, setActiveGroupFolder] = useState<string | null>(null); // "A-E", "2023", "ACTIVE"

  // -- FILE EXPLORER STATE --
  const [rootFolderId, setRootFolderId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [inspectorFile, setInspectorFile] = useState<FileNode | null>(null);
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null);
  const [selectionCount, setSelectionCount] = useState(0);
  const fileExplorerRef = useRef<FileExplorerHandle>(null);

  // -- MODALS STATE --
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isTicketDetailOpen, setIsTicketDetailOpen] = useState(false);
  const [isInternalTicketModalOpen, setIsInternalTicketModalOpen] = useState(false);
  
  // -- FORMS --
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [internalTicketForm, setInternalTicketForm] = useState({ subject: '', description: '', priority: 'MEDIUM' as const });
  const [uploadFormData, setUploadFormData] = useState({ name: '', batchNumber: '', invoiceNumber: '', productName: '', status: 'APPROVED', file: null as File | null });
  const [resolutionNote, setResolutionNote] = useState('');
  const [newStatus, setNewStatus] = useState<SupportTicket['status']>('OPEN');

  // -- IMPORT MODAL STATE --
  const [masterFiles, setMasterFiles] = useState<FileNode[]>([]);
  const [selectedMasterFiles, setSelectedMasterFiles] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);

  // --- DERIVED DATA ---
  const getPendingCount = (clientId: string) => MOCK_FILES.filter(f => f.ownerId === clientId && f.metadata?.status === 'PENDING').length;
  const totalClients = MOCK_CLIENTS.length;
  const totalPendingDocs = MOCK_CLIENTS.reduce((acc, c) => acc + getPendingCount(c.id), 0);
  const totalOpenTickets = inboxTickets.filter(t => t.status !== 'RESOLVED').length;

  // --- CLIENT GROUPING LOGIC ---
  const clientGroups = useMemo(() => {
      // 1. First apply search filter (Search works globally across folders)
      const filtered = MOCK_CLIENTS.filter(c => 
          c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
          c.cnpj.includes(clientSearch)
      );

      // If searching, we flatten the structure effectively
      if (clientSearch) return { 'Resultados da Busca': filtered };

      // 2. Grouping Logic
      const groups: Record<string, ClientOrganization[]> = {};

      if (groupingMode === 'ALPHA') {
          // Group by First Letter (A-E, F-J, etc for scalability)
          // Simplified: A, B, C...
          filtered.forEach(c => {
              const letter = c.name.charAt(0).toUpperCase();
              if (!groups[letter]) groups[letter] = [];
              groups[letter].push(c);
          });
      } else if (groupingMode === 'STATUS') {
          filtered.forEach(c => {
              const status = c.status === 'ACTIVE' ? 'Ativos' : 'Inativos/Bloqueados';
              // Special Sub-group: Has Pendency
              const hasPending = getPendingCount(c.id) > 0;
              const key = hasPending ? '⚠ Com Pendências (Ação Necessária)' : status;
              
              if (!groups[key]) groups[key] = [];
              groups[key].push(c);
          });
      } else if (groupingMode === 'YEAR') {
          filtered.forEach(c => {
              const year = new Date(c.contractDate).getFullYear().toString();
              if (!groups[year]) groups[year] = [];
              groups[year].push(c);
          });
      } else {
          groups['Todos'] = filtered;
      }

      // Sort keys
      return Object.keys(groups).sort().reduce((obj, key) => { 
          obj[key] = groups[key]; 
          return obj;
      }, {} as Record<string, ClientOrganization[]>);

  }, [clientSearch, groupingMode]);

  // --- EFFECTS ---
  useEffect(() => {
      const loadData = async () => {
          if (user) {
              const inbox = await adminService.getQualityInbox();
              const outbox = await adminService.getMyTickets(user);
              setInboxTickets(inbox);
              setOutboxTickets(outbox);
          }
      };
      loadData();
  }, [user, refreshTrigger]);

  // Initialize Folder when entering Client Workspace or Master Tab
  useEffect(() => {
      const initFolder = async () => {
          // Case 1: Master Tab Active
          if (activeView === 'master') {
              const files = await fileService.getFilesByOwner(MASTER_ORG_ID);
              const root = files.find(f => f.type === FileType.FOLDER && f.parentId === null);
              if (root) {
                  setRootFolderId(root.id);
                  setCurrentFolderId(root.id);
              }
              return;
          }

          // Case 2: Client Selected
          if (selectedClient) {
              const files = await fileService.getFilesByOwner(selectedClient.id);
              const root = files.find(f => f.type === FileType.FOLDER && f.parentId === null);
              if (root) {
                  setRootFolderId(root.id);
                  setCurrentFolderId(root.id);
              } else if (user) {
                  // Auto-create root if missing
                  const newRoot = await fileService.createFolder(user, null, selectedClient.name, selectedClient.id);
                  setRootFolderId(newRoot?.id || null);
                  setCurrentFolderId(newRoot?.id || null);
              }
          }
      };
      initFolder();
      setInspectorFile(null);
      setSelectionCount(0);
  }, [selectedClient, activeView, user]);

  // Load master files for import modal
  useEffect(() => {
      if (isImportModalOpen) {
          fileService.getMasterLibraryFiles().then(setMasterFiles);
          setSelectedMasterFiles(new Set());
      }
  }, [isImportModalOpen]);

  const handleRefresh = () => setRefreshTrigger(p => p + 1);

  // --- ACTIONS ---
  const enterClientWorkspace = (client: ClientOrganization) => {
      setSelectedClient(client);
      // Logic handled by effect
  };

  const exitClientWorkspace = () => {
      setSelectedClient(null);
      setRootFolderId(null);
      setCurrentFolderId(null);
  };

  // ... (Keep existing CRUD handlers: Upload, Folder, Import, Delete, Edit, Tickets)
  const handleNavigate = (id: string | null) => {
      setCurrentFolderId(id || rootFolderId);
      setInspectorFile(null);
  };

  const handleQuickStatusChange = async (newStatus: 'APPROVED' | 'REJECTED') => {
      if (!user || !inspectorFile) return;
      await fileService.updateFile(user, inspectorFile.id, { metadata: { ...inspectorFile.metadata, status: newStatus } });
      setInspectorFile(prev => prev ? ({ ...prev, metadata: { ...prev.metadata, status: newStatus } } as any) : null);
      handleRefresh();
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
      e.preventDefault();
      const ownerId = activeView === 'master' ? MASTER_ORG_ID : selectedClient?.id;
      if (!user || !ownerId || !newFolderName) return;
      await fileService.createFolder(user, currentFolderId, newFolderName, ownerId);
      setIsFolderModalOpen(false); setNewFolderName(''); handleRefresh();
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const ownerId = activeView === 'master' ? MASTER_ORG_ID : selectedClient?.id;
      if (!user || !ownerId) return;
      
      // LOGIC UPDATE: If uploading to a client (not Master), force status to APPROVED
      // "Documents shown to clients automatically should be OK"
      const statusToSet = ownerId !== MASTER_ORG_ID ? 'APPROVED' : (uploadFormData.status as any);

      const newFile: Partial<FileNode> = {
          name: uploadFormData.name || uploadFormData.file?.name || 'Novo Arquivo',
          parentId: currentFolderId || rootFolderId,
          metadata: { 
              batchNumber: uploadFormData.batchNumber, 
              invoiceNumber: uploadFormData.invoiceNumber, 
              productName: uploadFormData.productName, 
              status: statusToSet 
          }
      };
      await fileService.uploadFile(user, newFile, ownerId);
      setIsUploadModalOpen(false); setUploadFormData({ name: '', batchNumber: '', invoiceNumber: '', productName: '', status: 'APPROVED', file: null }); handleRefresh();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !inspectorFile) return;
      const updates: Partial<FileNode> = {
          name: uploadFormData.name,
          metadata: {
              ...inspectorFile.metadata,
              productName: uploadFormData.productName
          }
      };
      await fileService.updateFile(user, inspectorFile.id, updates);
      setIsEditModalOpen(false);
      setUploadFormData({ name: '', batchNumber: '', invoiceNumber: '', productName: '', status: 'APPROVED', file: null });
      handleRefresh();
  };

  const handleImportSubmit = async () => {
      if (!user || !selectedClient || !currentFolderId) return;
      setIsImporting(true);
      await fileService.importFilesFromMaster(user, Array.from(selectedMasterFiles), currentFolderId, selectedClient.id);
      setIsImporting(false); setIsImportModalOpen(false); handleRefresh();
  };

  const openTicketDetail = (ticket: SupportTicket) => {
      setSelectedTicket(ticket); setNewStatus(ticket.status); setResolutionNote(ticket.resolutionNote || ''); setIsTicketDetailOpen(true);
  };

  const handleResolveTicket = async () => {
      if(!user || !selectedTicket) return;
      await adminService.resolveTicket(user, selectedTicket.id, newStatus, resolutionNote);
      setIsTicketDetailOpen(false); handleRefresh();
  };

  const handleCreateInternalTicket = async (e: React.FormEvent) => {
      e.preventDefault(); if(!user) return;
      await adminService.createTicket(user, internalTicketForm);
      setIsInternalTicketModalOpen(false); setInternalTicketForm({subject:'', description:'', priority: 'MEDIUM'}); handleRefresh();
  };

  const handleDelete = async (file: FileNode) => {
      if(!user) return;
      if(window.confirm(`Excluir ${file.name}?`)) { await fileService.deleteFile(user, file.id); setInspectorFile(null); handleRefresh(); }
  }

  // --- SUB-COMPONENTS FOR TABS ---

  const OverviewTab = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div onClick={() => changeView('clients')} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform"><Building2 size={24}/></div>
                      <ArrowUpRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors"/>
                  </div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Carteira Ativa</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{totalClients}</p>
              </div>
              
              <div onClick={() => { setGroupingMode('STATUS'); setActiveGroupFolder('⚠ Com Pendências (Ação Necessária)'); changeView('clients'); }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group border-l-4 border-l-orange-400">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform"><Clock size={24}/></div>
                      <ArrowUpRight size={20} className="text-slate-300 group-hover:text-orange-500 transition-colors"/>
                  </div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Docs. Pendentes</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{totalPendingDocs}</p>
              </div>

              <div onClick={() => changeView('tickets')} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform"><Inbox size={24}/></div>
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">{inboxTickets.length} Total</span>
                  </div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Chamados Abertos</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{totalOpenTickets}</p>
              </div>

              <div onClick={() => changeView('master')} className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer group text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Database size={80}/></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="p-3 bg-white/10 text-white rounded-xl"><Database size={24}/></div>
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider relative z-10">Repositório Mestre</p>
                  <p className="text-sm font-medium text-white mt-1 relative z-10 flex items-center gap-2">Acessar Arquivos <ChevronRight size={14}/></p>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions / Recent Activity Placeholder */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity size={20} className="text-blue-500"/> Atividade Recente</h3>
                  <div className="space-y-4">
                      {MOCK_CLIENTS.slice(0, 3).map(client => (
                          <div key={client.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="p-2 bg-white rounded-lg border border-slate-200"><Building2 size={16} className="text-slate-400"/></div>
                              <div>
                                  <p className="text-sm font-bold text-slate-700">{client.name}</p>
                                  <p className="text-xs text-slate-500">Documento "Lote 998" aprovado.</p>
                              </div>
                              <div className="ml-auto text-xs text-slate-400">2h atrás</div>
                          </div>
                      ))}
                  </div>
              </div>
              
              {/* System Alerts */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><ShieldAlert size={20} className="text-orange-500"/> Alertas do Sistema</h3>
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex gap-3">
                      <AlertTriangle className="text-orange-600 shrink-0" size={20} />
                      <div>
                          <p className="text-sm font-bold text-orange-800">Backup Agendado</p>
                          <p className="text-xs text-orange-700 mt-1">O sistema passará por manutenção programada no domingo às 02:00h.</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );

  const ClientHubTab = () => {
      // Determine what to display: Groups (Folders) OR Clients (Inside Folder)
      const isInsideFolder = !!activeGroupFolder || !!clientSearch;
      const displayItems = activeGroupFolder ? clientGroups[activeGroupFolder] : null;

      // Handle Back Navigation in Directory
      const handleBack = () => {
          if (activeGroupFolder) {
              setActiveGroupFolder(null);
              setClientSearch('');
          }
      };

      return (
      <div className="flex flex-col h-full gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Enhanced Toolbar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-4 flex-1 w-full">
                  {isInsideFolder && (
                      <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                          <ArrowLeft size={20} />
                      </button>
                  )}
                  
                  {/* Breadcrumbs for Client Directory */}
                  <div className="flex items-center gap-2 text-sm text-slate-600 overflow-hidden">
                      <div 
                        className={`flex items-center gap-1 font-bold ${!activeGroupFolder ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600 cursor-pointer'}`}
                        onClick={() => setActiveGroupFolder(null)}
                      >
                          <Home size={16} /> Diretório
                      </div>
                      {activeGroupFolder && (
                          <>
                            <ChevronRight size={14} className="text-slate-400" />
                            <div className="font-bold text-blue-600 flex items-center gap-2 truncate">
                                <FolderOpen size={16} /> {activeGroupFolder}
                            </div>
                          </>
                      )}
                      {clientSearch && !activeGroupFolder && (
                          <>
                            <ChevronRight size={14} className="text-slate-400" />
                            <div className="font-bold text-blue-600 truncate">Busca: "{clientSearch}"</div>
                          </>
                      )}
                  </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                  {/* Search */}
                  <div className="relative group w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                      <input 
                          type="text" 
                          placeholder="Buscar cliente..." 
                          className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          value={clientSearch}
                          onChange={e => setClientSearch(e.target.value)}
                      />
                  </div>

                  {/* Grouping Toggle - Only show at Root Level */}
                  {!isInsideFolder && (
                      <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
                          <button onClick={() => setGroupingMode('ALPHA')} className={`p-1.5 rounded-md transition-all ${groupingMode === 'ALPHA' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="A-Z"><ArrowDownAZ size={18}/></button>
                          <button onClick={() => setGroupingMode('STATUS')} className={`p-1.5 rounded-md transition-all ${groupingMode === 'STATUS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Por Status"><Layers size={18}/></button>
                          <button onClick={() => setGroupingMode('YEAR')} className={`p-1.5 rounded-md transition-all ${groupingMode === 'YEAR' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="Por Ano"><Calendar size={18}/></button>
                      </div>
                  )}

                  <div className="w-px h-6 bg-slate-200 hidden md:block"></div>
                  <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
                      <button onClick={() => setClientViewMode('grid')} className={`p-1.5 rounded-md transition-all ${clientViewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={18}/></button>
                      <button onClick={() => setClientViewMode('list')} className={`p-1.5 rounded-md transition-all ${clientViewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><List size={18}/></button>
                  </div>
              </div>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
              
              {/* LEVEL 0: GROUP FOLDERS (Root) */}
              {!activeGroupFolder && !clientSearch && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {Object.keys(clientGroups).map(groupKey => {
                          const count = clientGroups[groupKey].length;
                          const isWarning = groupKey.includes('Pendências');
                          
                          return (
                              <div 
                                  key={groupKey}
                                  onClick={() => setActiveGroupFolder(groupKey)}
                                  className={`
                                      p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md flex flex-col items-center text-center gap-3 bg-white
                                      ${isWarning ? 'border-orange-200 bg-orange-50/30 hover:border-orange-400' : 'border-slate-200 hover:border-blue-400'}
                                  `}
                              >
                                  <div className={`p-3 rounded-full ${isWarning ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                      {isWarning ? <AlertTriangle size={28} /> : <Folder size={28} fill="currentColor" className="opacity-20" />}
                                  </div>
                                  <div>
                                      <h3 className={`font-bold text-sm ${isWarning ? 'text-orange-800' : 'text-slate-700'}`}>{groupKey}</h3>
                                      <span className="text-xs text-slate-400 font-medium">{count} Empresas</span>
                                  </div>
                              </div>
                          )
                      })}
                  </div>
              )}

              {/* LEVEL 1: CLIENTS LIST (Inside Group or Search) */}
              {(activeGroupFolder || clientSearch) && displayItems && (
                  <>
                    {clientViewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {displayItems.length === 0 ? (
                                <div className="col-span-full py-12 text-center text-slate-400">
                                    <Building2 size={48} className="mx-auto mb-2 opacity-20" />
                                    <p>Nenhum cliente encontrado nesta pasta.</p>
                                </div>
                            ) : (
                                displayItems.map(client => {
                                    const pending = getPendingCount(client.id);
                                    return (
                                        <div key={client.id} onClick={() => enterClientWorkspace(client)} className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer group hover:shadow-lg ${pending > 0 ? 'border-orange-200 hover:border-orange-400' : 'border-slate-200 hover:border-blue-400'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-3 rounded-xl border ${pending > 0 ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}><Building2 size={24} /></div>
                                                {pending > 0 ? <span className="flex items-center gap-1.5 bg-orange-100 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-200 animate-pulse"><Clock size={12} /> {pending}</span> : <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200"><CheckCircle2 size={12} /> OK</span>}
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-base leading-tight mb-1 truncate">{client.name}</h3>
                                            <p className="text-xs text-slate-400 font-mono mb-4">{client.cnpj}</p>
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">Ver Arquivos</span>
                                                <div className="bg-slate-50 p-2 rounded-full text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all"><ChevronRight size={16} /></div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Empresa</th>
                                        <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">CNPJ</th>
                                        <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Data Contrato</th>
                                        <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Status Documental</th>
                                        <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {displayItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                <Building2 size={32} className="mx-auto mb-2 opacity-20" />
                                                Nenhum cliente nesta lista.
                                            </td>
                                        </tr>
                                    ) : (
                                        displayItems.map(client => {
                                            const pending = getPendingCount(client.id);
                                            return (
                                                <tr key={client.id} className="hover:bg-blue-50/50 group cursor-pointer transition-colors" onClick={() => enterClientWorkspace(client)}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg border ${pending > 0 ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                                <Building2 size={18}/>
                                                            </div>
                                                            <span className="font-bold text-slate-800 text-sm">{client.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{client.cnpj}</td>
                                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                                        {new Date(client.contractDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {pending > 0 ? (
                                                            <span className="flex items-center gap-1.5 text-orange-700 bg-orange-50 px-2 py-1 rounded-full w-fit border border-orange-100 text-xs font-bold animate-pulse">
                                                                <Clock size={12}/> {pending} Pendentes
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full w-fit border border-emerald-100 text-xs font-bold">
                                                                <CheckCircle2 size={12}/> Em dia
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                                            Abrir Pasta <ChevronRight size={14}/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                  </>
              )}
          </div>
      </div>
      );
  };

  const getPageTitle = () => {
      switch(activeView) {
          case 'overview': return 'Visão Geral da Qualidade';
          case 'clients': return 'Diretório de Clientes';
          case 'master': return 'Repositório Mestre';
          case 'tickets': return 'Service Desk';
          default: return 'Portal da Qualidade';
      }
  };

  return (
    <Layout title={t('menu.documents')}>
        <FilePreviewModal file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} />

        {/* Global Action: Open Ticket to Admin */}
        <div className="flex justify-between items-center mb-6">
            <div>
               <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{getPageTitle()}</h1>
               {!selectedClient && activeView === 'overview' && <p className="text-xs text-slate-500 mt-0.5">Gestão Centralizada de Documentos e Conformidade</p>}
            </div>
            
            <button onClick={() => setIsInternalTicketModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-md transition-all">
                <ShieldAlert size={14} className="text-orange-400"/> Admin Request
            </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="h-[calc(100vh-180px)] relative">
            
            {/* 1. Client Workspace Overlay (Drill Down) */}
            {selectedClient && (
                <div className="absolute inset-0 z-40 bg-slate-50 flex flex-col animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200 shrink-0">
                        <button onClick={exitClientWorkspace} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-slate-800">{selectedClient.name}</h2>
                                {getPendingCount(selectedClient.id) > 0 ? (
                                    <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">Ação Necessária</span>
                                ) : (
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">Em Conformidade</span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                                <Hash size={12}/> {selectedClient.cnpj} • <Calendar size={12}/> Contrato desde {new Date(selectedClient.contractDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {selectionCount > 0 ? (
                                <button onClick={() => fileExplorerRef.current?.triggerBulkDownload()} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm">
                                    <Download size={16} /> Baixar ({selectionCount})
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => setIsImportModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"><Copy size={16} /> Importar Mestre</button>
                                    <button onClick={() => setIsUploadModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"><FileUp size={16} /> Upload</button>
                                    <button onClick={() => setIsFolderModalOpen(true)} className="bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"><FolderPlus size={16} /> Pasta</button>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex-1 flex gap-4 overflow-hidden">
                        {/* File Explorer */}
                        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                             {rootFolderId ? (
                                <FileExplorer 
                                    ref={fileExplorerRef}
                                    key={`${selectedClient.id}-${refreshTrigger}`}
                                    currentFolderId={currentFolderId} 
                                    onNavigate={handleNavigate}
                                    allowUpload={false} 
                                    onFileSelect={setInspectorFile}
                                    hideToolbar={false} 
                                    onSelectionChange={setSelectionCount}
                                    onEdit={(f) => { 
                                        setInspectorFile(f); 
                                        setUploadFormData({...uploadFormData, name: f.name, productName: f.metadata?.productName || ''}); 
                                        setIsEditModalOpen(true); 
                                    }}
                                    onDelete={handleDelete}
                                />
                             ) : (
                                <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                             )}
                        </div>

                        {/* Inspector Side Panel */}
                        {inspectorFile && inspectorFile.type !== FileType.FOLDER && (
                            <div className="w-80 bg-white rounded-xl border border-slate-200 shadow-xl flex flex-col animate-in slide-in-from-right-10 duration-200">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-50 text-red-500 rounded-lg"><FileText size={20} /></div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate w-40">{inspectorFile.name}</p>
                                            <p className="text-xs text-slate-500">{inspectorFile.size}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setInspectorFile(null)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
                                </div>
                                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        <button onClick={() => handleQuickStatusChange('APPROVED')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1 ${inspectorFile.metadata?.status === 'APPROVED' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}><CheckCircle2 size={12}/> Aprovar</button>
                                        <button onClick={() => handleQuickStatusChange('REJECTED')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1 ${inspectorFile.metadata?.status === 'REJECTED' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}><X size={12}/> Rejeitar</button>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Metadados</p>
                                        <div className="space-y-2 text-sm">
                                            <div className="bg-slate-50 p-2 rounded border border-slate-100"><span className="block text-xs text-slate-400">Produto</span><span className="font-medium text-slate-700">{inspectorFile.metadata?.productName || '-'}</span></div>
                                            <div className="bg-slate-50 p-2 rounded border border-slate-100"><span className="block text-xs text-slate-400">Lote</span><span className="font-mono text-slate-700">{inspectorFile.metadata?.batchNumber || '-'}</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border-t border-slate-100 flex gap-2">
                                    <button onClick={() => { setPreviewFile(inspectorFile); fileService.logAction(user!, 'PREVIEW', inspectorFile.name); }} className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"><Eye size={14}/> Visualizar</button>
                                    <button onClick={() => handleDelete(inspectorFile)} className="p-2 border border-slate-200 text-slate-400 rounded-lg hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 2. TAB CONTENT SWITCHER */}
            {!selectedClient && (
                <div className="h-full flex flex-col">
                    {activeView === 'overview' && <OverviewTab />}
                    {activeView === 'clients' && <ClientHubTab />}
                    {activeView === 'master' && (
                        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-600 text-white rounded-lg"><Database size={20}/></div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">Repositório Mestre (Modelos & Padrões)</h3>
                                        <p className="text-xs text-slate-500">Arquivos disponíveis aqui podem ser importados para qualquer cliente.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsFolderModalOpen(true)} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:text-blue-600 transition-colors"><FolderPlus size={18}/></button>
                                    <button onClick={() => setIsUploadModalOpen(true)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><FileUp size={18}/></button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                {rootFolderId ? (
                                    <FileExplorer 
                                        key={`master-${refreshTrigger}`} 
                                        currentFolderId={currentFolderId} 
                                        onNavigate={handleNavigate} 
                                        allowUpload={false} 
                                        onEdit={(f) => { 
                                            setInspectorFile(f); 
                                            setUploadFormData({...uploadFormData, name: f.name, productName: f.metadata?.productName || ''}); 
                                            setIsEditModalOpen(true); 
                                        }}
                                        onDelete={handleDelete}
                                        onFileSelect={setInspectorFile}
                                    />
                                ) : <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}
                            </div>
                        </div>
                    )}
                    {activeView === 'tickets' && (
                        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4">
                            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                                <Inbox size={20} className="text-indigo-600" />
                                <h3 className="font-bold text-slate-800">Fila de Atendimento</h3>
                            </div>
                            <div className="overflow-auto p-0">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white text-slate-500 border-b border-slate-100">
                                        <tr><th className="px-6 py-3">Prioridade</th><th className="px-6 py-3">Assunto</th><th className="px-6 py-3">Cliente</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Ação</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {inboxTickets.map(t => (
                                            <tr key={t.id} className="hover:bg-slate-50 group">
                                                <td className="px-6 py-3 font-bold text-xs uppercase text-slate-500">{t.priority}</td>
                                                <td className="px-6 py-3 font-medium text-slate-800">{t.subject}</td>
                                                <td className="px-6 py-3 text-slate-600 text-xs">{t.userName}</td>
                                                <td className="px-6 py-3"><span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border">{t.status}</span></td>
                                                <td className="px-6 py-3 text-right"><button onClick={() => openTicketDetail(t)} className="text-blue-600 font-bold text-xs border px-3 py-1 rounded hover:bg-blue-50">Abrir</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* ... (MODALS: Keep existing modals logic) ... */}
        {/* Ticket Detail Modal */}
        {isTicketDetailOpen && selectedTicket && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-800">Gerenciar Chamado</h3>
                        <button onClick={() => setIsTicketDetailOpen(false)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
                    </div>
                    <div className="p-6 overflow-y-auto space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-slate-800 text-sm mb-2">{selectedTicket.subject}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{selectedTicket.description}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Alterar Status</label>
                            <select className="w-full px-4 py-2 border rounded-lg" value={newStatus} onChange={(e) => setNewStatus(e.target.value as any)}>
                                <option value="OPEN">Aberto</option><option value="IN_PROGRESS">Em Andamento</option><option value="RESOLVED">Resolvido</option>
                            </select>
                        </div>
                        {newStatus === 'RESOLVED' && (
                            <div><label className="block text-sm font-bold text-slate-700 mb-2">Nota</label><textarea className="w-full px-4 py-2 border rounded-lg h-24" value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)} /></div>
                        )}
                    </div>
                    <div className="p-6 border-t border-slate-100 flex justify-end gap-3"><button onClick={() => setIsTicketDetailOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button><button onClick={handleResolveTicket} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Salvar</button></div>
                </div>
            </div>
        )}
        
        {/* ... Include other modals (Internal Ticket, Upload, Import, Folder) similarly to previous version ... */}
        {isInternalTicketModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h3 className="text-lg font-bold text-slate-800">Admin Request</h3><button onClick={() => setIsInternalTicketModalOpen(false)}><X size={20}/></button></div>
                    <form onSubmit={handleCreateInternalTicket} className="p-6 space-y-4">
                        <input required className="w-full px-4 py-2 border rounded-lg" value={internalTicketForm.subject} onChange={e => setInternalTicketForm({...internalTicketForm, subject: e.target.value})} placeholder="Assunto"/>
                        <textarea required className="w-full px-4 py-2 border rounded-lg h-32" value={internalTicketForm.description} onChange={e => setInternalTicketForm({...internalTicketForm, description: e.target.value})} placeholder="Descrição"/>
                        <div className="flex justify-end gap-3"><button type="button" onClick={() => setIsInternalTicketModalOpen(false)} className="px-4 py-2 text-slate-600">Cancelar</button><button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">Enviar</button></div>
                    </form>
                </div>
            </div>
        )}

        {isFolderModalOpen && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"><div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center"><h3 className="text-lg font-bold text-slate-800">Nova Pasta</h3><button onClick={() => setIsFolderModalOpen(false)}><X size={20}/></button></div><form onSubmit={handleCreateFolder} className="p-6"><input className="w-full px-4 py-2 border rounded-lg mb-4" placeholder="Nome da pasta" required value={newFolderName} onChange={e => setNewFolderName(e.target.value)} autoFocus/><div className="flex justify-end gap-3"><button type="button" onClick={() => setIsFolderModalOpen(false)} className="px-4 py-2 text-slate-600">Cancelar</button><button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">Criar</button></div></form></div>
             </div>
        )}

        {isImportModalOpen && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden"><div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center"><h3 className="text-lg font-bold text-slate-800">Importar do Mestre</h3><button onClick={() => setIsImportModalOpen(false)}><X size={20}/></button></div><div className="flex-1 overflow-y-auto p-0"><table className="w-full text-left text-sm"><tbody className="divide-y divide-slate-100">{masterFiles.map(file => (<tr key={file.id} onClick={() => { const newSet = new Set(selectedMasterFiles); if(newSet.has(file.id)) newSet.delete(file.id); else newSet.add(file.id); setSelectedMasterFiles(newSet); }} className={`cursor-pointer ${selectedMasterFiles.has(file.id) ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}><td className="px-4 py-3 text-center">{selectedMasterFiles.has(file.id) && <Check size={16} className="text-indigo-600"/>}</td><td className="px-4 py-3">{file.name}</td></tr>))}</tbody></table></div><div className="p-4 border-t border-slate-100 flex justify-end gap-3"><button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-slate-600">Cancelar</button><button onClick={handleImportSubmit} disabled={selectedMasterFiles.size === 0 || isImporting} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-lg disabled:opacity-50">Importar</button></div></div>
             </div>
        )}

        {(isUploadModalOpen || isEditModalOpen) && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"><div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center"><h3 className="text-lg font-bold text-slate-800">{isEditModalOpen ? 'Editar' : 'Upload'}</h3><button onClick={() => {setIsUploadModalOpen(false); setIsEditModalOpen(false);}}><X size={20}/></button></div><form onSubmit={isEditModalOpen ? handleEditSubmit : handleUploadSubmit} className="p-6 space-y-4"><input className="w-full px-4 py-2 border rounded-lg" placeholder="Nome" value={uploadFormData.name} onChange={e => setUploadFormData({...uploadFormData, name: e.target.value})} required/>{!isEditModalOpen && <input type="file" className="w-full border p-2 rounded-lg" onChange={(e) => { const file = e.target.files?.[0]; if(file) setUploadFormData({...uploadFormData, file, name: uploadFormData.name || file.name}); }} required={!isEditModalOpen}/>}<input className="w-full px-4 py-2 border rounded-lg" placeholder="Produto" value={uploadFormData.productName} onChange={e => setUploadFormData({...uploadFormData, productName: e.target.value})}/><div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => {setIsUploadModalOpen(false); setIsEditModalOpen(false);}} className="px-4 py-2 text-slate-600">Cancelar</button><button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">Salvar</button></div></form></div>
             </div>
        )}

    </Layout>
  );
};

export default Quality;
