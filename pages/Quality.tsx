
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Layout } from '../components/Layout.tsx';
import { FileExplorer, FileExplorerHandle } from '../components/FileExplorer.tsx';
import { FilePreviewModal } from '../components/FilePreviewModal.tsx'; // Import
import { MOCK_CLIENTS, MOCK_FILES } from '../services/mockData.ts';
import { FileNode, ClientOrganization, FileType } from '../types.ts';
import { useAuth } from '../services/authContext.tsx';
import { 
    FileText, 
    UploadCloud, 
    Users, 
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
    MoreHorizontal,
    Eye,
    Download,
    FileCheck,
    Filter,
    Activity,
    Shield,
    Home,
    ArrowLeft,
    ChevronLeft,
    ListFilter,
    FolderPlus
} from 'lucide-react';
import * as fileService from '../services/fileService.ts';

const Quality: React.FC = () => {
  const { user } = useAuth();
  
  // -- STATE: Layout & Navigation --
  const [selectedClient, setSelectedClient] = useState<ClientOrganization | null>(null);
  const [rootFolderId, setRootFolderId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null); // Lifted state for navigation
  const [inspectorFile, setInspectorFile] = useState<FileNode | null>(null);
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null); // NEW: State for Preview Modal
  const [clientSearch, setClientSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');

  // -- STATE: Selection & Actions --
  const [selectionCount, setSelectionCount] = useState(0);
  const fileExplorerRef = useRef<FileExplorerHandle>(null);

  // -- STATE: Modals --
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // -- STATE: Data --
  const [uploadFormData, setUploadFormData] = useState({
      name: '',
      batchNumber: '',
      invoiceNumber: '',
      productName: '',
      status: 'APPROVED',
      file: null as File | null
  });

  // Derived: Filtered Clients List
  const filteredClients = MOCK_CLIENTS.filter(c => 
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
      c.cnpj.includes(clientSearch)
  );

  // Helper to get current folder name (for toolbar since breadcrumbs are gone)
  const currentFolderName = useMemo(() => {
    if (!currentFolderId || currentFolderId === rootFolderId) return selectedClient?.name;
    const crumbs = fileService.getBreadcrumbs(currentFolderId);
    return crumbs[crumbs.length - 1]?.name;
  }, [currentFolderId, rootFolderId, selectedClient]);

  // Effect: When client changes, find their root folder & clear inspector
  useEffect(() => {
      if (!selectedClient) {
          setRootFolderId(null);
          setCurrentFolderId(null);
          setInspectorFile(null);
          setSelectionCount(0);
          return;
      }
      
      const findRoot = async () => {
          const files = await fileService.getFilesByOwner(selectedClient.id);
          const root = files.find(f => f.type === FileType.FOLDER && f.parentId === null);
          if (root) {
              setRootFolderId(root.id);
              setCurrentFolderId(root.id); // Start at root
          } else {
              // Self-healing mock
              if (user) {
                  const newRoot = await fileService.createFolder(user, null, selectedClient.name, selectedClient.id);
                  setRootFolderId(newRoot?.id || null);
                  setCurrentFolderId(newRoot?.id || null);
              }
          }
      };
      findRoot();
      setInspectorFile(null);
  }, [selectedClient, user]);

  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

  // -- HANDLERS: Navigation --
  const handleNavigate = (folderId: string | null) => {
      // Prevent navigating "above" the root folder for this client
      if (folderId === null && rootFolderId) {
          setCurrentFolderId(rootFolderId);
      } else {
          setCurrentFolderId(folderId);
      }
      setInspectorFile(null);
  };

  const handleGoUp = () => {
    if (!currentFolderId) return;
    const crumbs = fileService.getBreadcrumbs(currentFolderId);
    // crumbs: [root, folder1, folder2]
    // If length is 2 (root, current), go to root.
    if (crumbs.length > 1) {
         handleNavigate(crumbs[crumbs.length - 2].id);
    } else {
         handleNavigate(rootFolderId);
    }
  };

  // -- HANDLERS: Actions --

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
          parentId: currentFolderId || rootFolderId, // Upload to current folder
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

  const handleEditSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !inspectorFile) return;

      // Ensure we pass the updated name along with metadata
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
      // Update local state to reflect changes immediately in inspector
      setInspectorFile(prev => prev ? ({ ...prev, name: uploadFormData.name, metadata: { ...prev.metadata, ...uploadFormData } } as any) : null);
      handleRefresh();
  };

  const handleDelete = async (file: FileNode) => {
      if (!user) return;
      const isFolder = file.type === FileType.FOLDER;
      const message = isFolder 
        ? `ATENÇÃO: Deseja excluir a pasta "${file.name}" e TODOS os arquivos dentro dela?`
        : `Tem certeza que deseja excluir "${file.name}" permanentemente?`;

      if (window.confirm(message)) {
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
      // Pre-fill form
      setUploadFormData({
          name: file.name,
          batchNumber: file.metadata?.batchNumber || '',
          invoiceNumber: file.metadata?.invoiceNumber || '',
          productName: file.metadata?.productName || '',
          status: file.metadata?.status || 'APPROVED',
          file: null
      });
      // Important: if it's a folder, some metadata might be irrelevant, but name is key
      setIsEditModalOpen(true);
      // We might want to set inspector file if opened via context menu directly
      setInspectorFile(file);
  };

  const handlePreviewOpen = () => {
      if (inspectorFile) {
          setPreviewFile(inspectorFile);
          fileService.logAction(user!, 'PREVIEW', inspectorFile.name);
      }
  };

  const resetUploadForm = () => {
      setUploadFormData({
          name: '',
          batchNumber: '',
          invoiceNumber: '',
          productName: '',
          status: 'APPROVED',
          file: null
      });
  };

  // Helper to count pending documents for a client (Mock logic)
  const getPendingCount = (clientId: string) => {
     // In real app this would be an API call or aggregated data
     return MOCK_FILES.filter(f => f.ownerId === clientId && f.metadata?.status === 'PENDING').length;
  };

  return (
    <Layout title="Gestão de Qualidade">
        
        {/* PREVIEW MODAL */}
        <FilePreviewModal 
            file={previewFile}
            isOpen={!!previewFile}
            onClose={() => setPreviewFile(null)}
        />

        {/* Main Workspace */}
        <div className="flex flex-col lg:flex-row h-[calc(100vh-130px)] md:h-[calc(100vh-160px)] bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative">
            
            {/* 1. LEFT PANE: Client Selector / Navigation */}
            <div className={`
                w-full lg:w-72 xl:w-80 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0 transition-all absolute lg:static inset-0 z-10
                ${selectedClient ? '-translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100 pointer-events-none lg:pointer-events-auto' : 'translate-x-0 opacity-100 pointer-events-auto'}
            `}>
                <div className="p-4 border-b border-slate-200">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Empresas Parceiras</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text"
                            placeholder="Buscar cliente..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={clientSearch}
                            onChange={e => setClientSearch(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredClients.map(client => {
                        const pending = getPendingCount(client.id);
                        const isSelected = selectedClient?.id === client.id;
                        return (
                            <div 
                                key={client.id}
                                onClick={() => setSelectedClient(client)}
                                className={`
                                    p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-100 group
                                    ${isSelected ? 'bg-white border-l-4 border-l-blue-600 shadow-sm z-10' : 'border-l-4 border-l-transparent'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-semibold text-sm truncate pr-2 ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                                        {client.name}
                                    </span>
                                    {pending > 0 && (
                                        <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                            {pending} <Clock size={10} />
                                        </span>
                                    )}
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

            {/* 2. CENTER PANE: Active Workspace (File Explorer) */}
            <div className={`
                flex-1 flex flex-col min-w-0 bg-white relative transition-all
                ${selectedClient ? 'opacity-100' : 'opacity-0 lg:opacity-100 pointer-events-none lg:pointer-events-auto'}
            `}>
                {selectedClient && rootFolderId ? (
                    <>
                        {/* ROW 1: Filter Toolbar */}
                        <div className="h-14 border-b border-slate-100 flex items-center justify-between px-2 md:px-4 bg-white shrink-0 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] z-10 gap-2">
                             {/* Left Group: Navigation */}
                             <div className="flex items-center gap-2 overflow-hidden flex-1">
                                <button 
                                    onClick={() => setSelectedClient(null)} 
                                    className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg shrink-0"
                                    title="Voltar para lista de clientes"
                                >
                                    <ArrowLeft size={20} />
                                </button>

                                {currentFolderId !== rootFolderId && (
                                    <button 
                                        onClick={handleGoUp}
                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors shrink-0"
                                        title="Subir Nível"
                                    >
                                        <ChevronLeft size={18} />
                                        <span className="hidden sm:inline">Voltar</span>
                                    </button>
                                )}

                                <div className="flex items-center gap-2 min-w-0">
                                    {currentFolderId === rootFolderId ? (
                                        <Building2 size={16} className="text-blue-500 shrink-0" />
                                    ) : (
                                        <FolderOpen size={16} className="text-blue-500 shrink-0" />
                                    )}
                                    <span className="font-bold text-slate-700 text-sm truncate">{currentFolderName || 'Carregando...'}</span>
                                </div>
                             </div>

                             {/* Right Group: Actions */}
                             <div className="flex items-center gap-3 shrink-0">
                                
                                {/* Improved Segmented Control Filter */}
                                <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto no-scrollbar">
                                    <button 
                                        onClick={() => setActiveTab('ALL')}
                                        className={`
                                            flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap
                                            ${activeTab === 'ALL' 
                                                ? 'bg-white text-slate-800 shadow-sm ring-1 ring-black/5' 
                                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                                        `}
                                    >
                                        <ListFilter size={14} /> 
                                        Todos
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('PENDING')}
                                        className={`
                                            flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap
                                            ${activeTab === 'PENDING' 
                                                ? 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5' 
                                                : 'text-slate-500 hover:text-orange-600 hover:bg-slate-200/50'}
                                        `}
                                    >
                                        <Clock size={14} className={activeTab === 'PENDING' ? 'text-orange-500' : ''} /> 
                                        <span className="hidden xl:inline">Pendentes</span>
                                        <span className="xl:hidden">Pend.</span>
                                    </button>
                                </div>

                                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                                {selectionCount > 0 ? (
                                    <button 
                                        onClick={() => fileExplorerRef.current?.triggerBulkDownload()}
                                        className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm whitespace-nowrap animate-in fade-in zoom-in-95"
                                    >
                                        <Download size={14} /> Baixar ({selectionCount})
                                    </button>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => setIsFolderModalOpen(true)}
                                            className="p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors"
                                            title="Nova Pasta"
                                        >
                                            <FolderPlus size={20} />
                                        </button>
                                        <button 
                                            onClick={() => setIsUploadModalOpen(true)}
                                            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
                                        >
                                            <FileUp size={14} /> <span className="hidden sm:inline">Upload</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ROW 2: File Grid (Content) */}
                        <div className="flex-1 overflow-hidden relative">
                             <FileExplorer 
                                ref={fileExplorerRef}
                                key={`${selectedClient.id}-${refreshTrigger}`}
                                currentFolderId={currentFolderId} // Controlled navigation
                                onNavigate={handleNavigate} // Controlled callback
                                allowUpload={false} // Handled by parent button
                                onFileSelect={setInspectorFile} // Hooking up the inspector
                                hideToolbar={true} // Hide internal breadcrumbs
                                filterStatus={activeTab} // Instant client-side filtering
                                onSelectionChange={setSelectionCount}
                                onEdit={openEditModal} // Enable Edit (Rename/Metadata) for files AND folders
                                onDelete={handleDelete} // Enable Recursive Delete
                            />
                        </div>
                    </>
                ) : (
                    <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-slate-300">
                        <Building2 size={64} className="mb-4 text-slate-100" />
                        <p className="font-medium text-slate-400">Selecione um cliente para iniciar</p>
                    </div>
                )}
            </div>

            {/* 3. RIGHT PANE: Context Inspector */}
            {inspectorFile && inspectorFile.type !== FileType.FOLDER && (
                <div className="fixed inset-0 z-50 xl:static xl:w-80 border-l border-slate-200 bg-slate-50 flex flex-col shrink-0 animate-in slide-in-from-right-10 duration-200 shadow-2xl xl:shadow-none">
                    <div className="p-6 border-b border-slate-200 bg-white flex flex-col relative">
                        <button 
                            onClick={() => setInspectorFile(null)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 xl:hidden"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex items-start gap-3 pr-8">
                            <div className="p-3 bg-red-50 rounded-xl text-red-500 shrink-0">
                                <FileText size={24} />
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-slate-800 text-sm leading-tight break-words">{inspectorFile.name}</h4>
                                <p className="text-xs text-slate-500 mt-1">{inspectorFile.size} • {inspectorFile.type}</p>
                            </div>
                        </div>
                        
                        {/* Status Toggle */}
                        <div className="mt-4 flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                            <button 
                                onClick={() => handleQuickStatusChange('APPROVED')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all
                                    ${inspectorFile.metadata?.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}
                                `}
                            >
                                <CheckCircle2 size={12} /> Aprovar
                            </button>
                            <button 
                                onClick={() => handleQuickStatusChange('REJECTED')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all
                                    ${inspectorFile.metadata?.status === 'REJECTED' ? 'bg-red-100 text-red-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}
                                `}
                            >
                                <X size={12} /> Rejeitar
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50">
                        {/* Metadata Group */}
                        <div>
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Activity size={12} /> Dados Técnicos
                            </h5>
                            <div className="space-y-3">
                                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Produto</span>
                                    <span className="text-sm font-medium text-slate-800">{inspectorFile.metadata?.productName || '-'}</span>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Corrida/Lote</span>
                                        <span className="text-sm font-mono text-slate-700">{inspectorFile.metadata?.batchNumber || '-'}</span>
                                    </div>
                                    <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Nota Fiscal</span>
                                        <span className="text-sm font-mono text-slate-700">{inspectorFile.metadata?.invoiceNumber || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-2 pb-8 xl:pb-4">
                         <button 
                            onClick={() => openEditModal(inspectorFile)}
                            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                        >
                             <Filter size={14} /> Editar Dados
                         </button>
                         <div className="flex gap-2">
                             <button 
                                onClick={handlePreviewOpen} // Opens the NEW Preview Modal
                                className="flex-1 py-2.5 border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                             >
                                 <Eye size={14} /> Preview
                             </button>
                             <button 
                                onClick={() => handleDelete(inspectorFile)}
                                className="px-3 py-2.5 border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-400 rounded-lg transition-colors"
                             >
                                 <Trash2 size={16} />
                             </button>
                         </div>
                    </div>
                </div>
            )}
            
            {/* Desktop Empty State for Right Pane */}
            {!inspectorFile && selectedClient && rootFolderId && (
                <div className="hidden xl:flex w-80 border-l border-slate-200 bg-slate-50/50 flex-col items-center justify-center text-center p-8 shrink-0">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                        <MoreHorizontal size={32} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-600">Nenhum arquivo selecionado</h4>
                    <p className="text-xs text-slate-400 mt-2">Clique em um documento na lista para ver detalhes, aprovar ou editar metadados.</p>
                </div>
            )}

        </div>

        {/* MODAL: New Folder */}
        {isFolderModalOpen && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <FolderPlus className="text-blue-500" size={20}/> Nova Pasta
                        </h3>
                        <button onClick={() => setIsFolderModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleCreateFolder} className="p-6">
                        <div className="space-y-1 mb-4">
                            <label className="text-sm font-semibold text-slate-700">Nome da Pasta</label>
                            <input 
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="Ex: Certificados 2024"
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
                                Cancelar
                            </button>
                            <button 
                                type="submit"
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-900/20"
                            >
                                Criar
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
                            {isEditModalOpen ? <><FileText className="text-blue-500"/> Editar Metadados</> : <><FileUp className="text-blue-500"/> Novo Upload</>}
                        </h3>
                        <button onClick={() => { setIsUploadModalOpen(false); setIsEditModalOpen(false); }} className="text-slate-400 hover:text-red-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={isEditModalOpen ? handleEditSubmit : handleUploadSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* File Name / Rename */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Nome do Arquivo/Pasta</label>
                                <input 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                                    placeholder="Nome do arquivo..."
                                    value={uploadFormData.name}
                                    onChange={e => setUploadFormData({...uploadFormData, name: e.target.value})}
                                    required
                                />
                            </div>

                            {/* File Selection (Upload Only) */}
                            {!isEditModalOpen && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Arquivo Original (PDF)</label>
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
                                            {uploadFormData.file ? uploadFormData.file.name : "Clique para selecionar ou arraste aqui"}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">PDF até 10MB</p>
                                    </div>
                                </div>
                            )}

                            {/* Metadata Fields (Only relevant if not just a folder structure, but keeping visible for simplicity or if editing file) */}
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Identificação do Produto</label>
                                <input 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="Ex: Barra Aço SAE 1045"
                                    value={uploadFormData.productName}
                                    onChange={e => setUploadFormData({...uploadFormData, productName: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Número do Lote / Corrida</label>
                                <input 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                                    placeholder="Ex: L-99855"
                                    value={uploadFormData.batchNumber}
                                    onChange={e => setUploadFormData({...uploadFormData, batchNumber: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Nota Fiscal (Opcional)</label>
                                <input 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                                    placeholder="Ex: NF-102030"
                                    value={uploadFormData.invoiceNumber}
                                    onChange={e => setUploadFormData({...uploadFormData, invoiceNumber: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Status de Aprovação</label>
                                <select 
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm cursor-pointer"
                                    value={uploadFormData.status}
                                    onChange={e => setUploadFormData({...uploadFormData, status: e.target.value})}
                                >
                                    <option value="APPROVED">Aprovado (Visível ao Cliente)</option>
                                    <option value="PENDING">Em Análise (Interno)</option>
                                    <option value="REJECTED">Rejeitado/Obsoleto</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Warnings */}
                        <div className="mt-6 bg-blue-50 p-3 rounded-lg flex gap-3 text-xs text-blue-800 border border-blue-100">
                             <AlertCircle size={16} className="shrink-0 mt-0.5" />
                             <div>
                                 <p className="font-bold">Confirmação de Integridade</p>
                                 <p>Ao salvar, você confirma que os dados conferem com o documento físico original, garantindo a rastreabilidade conforme ISO 9001.</p>
                             </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end gap-3">
                            <button 
                                type="button"
                                onClick={() => { setIsUploadModalOpen(false); setIsEditModalOpen(false); }}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit"
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-transform active:scale-95"
                            >
                                <Save size={18} />
                                {isEditModalOpen ? 'Salvar Alterações' : 'Confirmar Upload'}
                            </button>
                        </div>
                    </form>
                </div>
             </div>
        )}

    </Layout>
  );
};

export default Quality;
