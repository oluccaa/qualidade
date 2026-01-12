
import React, { useEffect, useState, useMemo, forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import { FileNode, FileType, UserRole } from '../types.ts';
import { useAuth } from '../services/authContext.tsx';
import { fileService } from '../services/index.ts';
import { FilePreviewModal } from './FilePreviewModal.tsx';
import { useTranslation } from 'react-i18next';
import { 
  Folder, 
  FileText, 
  Search, 
  ChevronRight, 
  Download, 
  ArrowUp,
  CheckCircle2, 
  Clock,
  FileCheck,
  Star,
  MoreVertical,
  Trash2,
  Edit2,
  Check,
  Image as ImageIcon,
  SlidersHorizontal,
  ArrowDownAZ,
  ArrowUpZA,
  Calendar,
  Layers,
  LayoutGrid,
  List,
  MoreHorizontal,
  Home,
  Loader2
} from 'lucide-react';

export interface FileExplorerHandle {
    triggerBulkDownload: () => Promise<void>;
    clearSelection: () => void;
}

type SortOption = 'NAME_ASC' | 'NAME_DESC' | 'DATE_NEW' | 'DATE_OLD' | 'STATUS';
type GroupOption = 'NONE' | 'STATUS' | 'PRODUCT' | 'DATE';

interface FileExplorerProps {
  allowUpload?: boolean;
  externalFiles?: FileNode[]; 
  flatMode?: boolean; 
  onRefresh?: () => void; 
  initialFolderId?: string | null; 
  currentFolderId?: string | null; 
  onNavigate?: (folderId: string | null) => void; 
  onDelete?: (file: FileNode) => void;
  onEdit?: (file: FileNode) => void;
  onUploadClick?: (currentFolderId: string | null) => void; 
  onFileSelect?: (file: FileNode | null) => void; 
  hideToolbar?: boolean; 
  filterStatus?: 'ALL' | 'PENDING' | 'APPROVED'; 
  onSelectionChange?: (count: number) => void; 
  autoHeight?: boolean; 
}

const PAGE_SIZE = 20;

export const FileExplorer = forwardRef<FileExplorerHandle, FileExplorerProps>(({ 
  allowUpload = false, 
  externalFiles, 
  flatMode = false,
  onRefresh,
  initialFolderId = null,
  currentFolderId: controlledFolderId,
  onNavigate,
  onDelete,
  onEdit,
  onUploadClick,
  onFileSelect,
  hideToolbar = false,
  filterStatus = 'ALL',
  onSelectionChange,
  autoHeight = false
}, ref) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [internalFolderId, setInternalFolderId] = useState<string | null>(initialFolderId);
  const activeFolderId = controlledFolderId !== undefined ? controlledFolderId : internalFolderId;

  // Pagination State
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [searchQuery, searchQuerySet] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string, name: string}[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); 
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  
  const [sortBy, setSortBy] = useState<SortOption>('DATE_NEW');
  const [groupBy, setGroupBy] = useState<GroupOption>('NONE');
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [singleSelectedId, setSingleSelectedId] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting && hasMore && !externalFiles) {
              setPage(prevPage => prevPage + 1);
          }
      });
      if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, externalFiles]);

  useImperativeHandle(ref, () => ({
      triggerBulkDownload: handleBulkDownload,
      clearSelection: () => {
          setSelectedFiles(new Set());
          if (onSelectionChange) onSelectionChange(0);
      }
  }));

  // Effect: Reset and Load First Page
  useEffect(() => {
    if (!user || externalFiles) {
        if (externalFiles) setFiles(externalFiles);
        return;
    }

    const initLoad = async () => {
        setLoading(true);
        setPage(1);
        setSelectedFiles(new Set());
        if(onSelectionChange) onSelectionChange(0);

        try {
            let response;
            if (searchQuery.length > 0) {
                response = await fileService.searchFiles(user, searchQuery, 1, PAGE_SIZE);
                if (!hideToolbar) setBreadcrumbs([{ id: 'search', name: `"${searchQuery}"` }]);
            } else {
                response = await fileService.getFiles(user, activeFolderId, 1, PAGE_SIZE);
                // Await getBreadcrumbs as it is now an asynchronous operation
                if (!hideToolbar) {
                    const crumbs = await fileService.getBreadcrumbs(activeFolderId);
                    setBreadcrumbs(crumbs);
                }
            }
            setFiles(response.items);
            setHasMore(response.hasMore);
        } finally {
            setLoading(false);
        }
    };

    initLoad();
  }, [activeFolderId, user, searchQuery, externalFiles, hideToolbar, filterStatus]);

  // Effect: Load More Pages
  useEffect(() => {
      if (page === 1 || !user || externalFiles) return;

      const loadMore = async () => {
          setLoadingMore(true);
          try {
              let response;
              if (searchQuery.length > 0) {
                  response = await fileService.searchFiles(user, searchQuery, page, PAGE_SIZE);
              } else {
                  response = await fileService.getFiles(user, activeFolderId, page, PAGE_SIZE);
              }
              setFiles(prev => [...prev, ...response.items]);
              setHasMore(response.hasMore);
          } finally {
              setLoadingMore(false);
          }
      };

      loadMore();
  }, [page, user, activeFolderId, searchQuery, externalFiles]);

  const processedItems = useMemo(() => {
      // Logic for sorting and grouping of current loaded files
      const filtered = files;
      const folders = filtered.filter(f => f.type === FileType.FOLDER);
      const docs = filtered.filter(f => f.type !== FileType.FOLDER);

      docs.sort((a, b) => {
          switch (sortBy) {
              case 'NAME_ASC': return a.name.localeCompare(b.name);
              case 'NAME_DESC': return b.name.localeCompare(a.name);
              case 'DATE_NEW': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
              case 'DATE_OLD': return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
              case 'STATUS': return (a.metadata?.status || '').localeCompare(b.metadata?.status || '');
              default: return 0;
          }
      });

      if (groupBy === 'NONE') {
          return { type: 'FLAT', items: [...folders, ...docs] };
      }

      const groups: Record<string, FileNode[]> = {};
      if (folders.length > 0) groups['folders'] = folders;

      docs.forEach(doc => {
          let key = 'ungrouped';
          if (groupBy === 'STATUS') {
              const s = doc.metadata?.status || 'PENDING';
              key = s.toLowerCase();
          } else if (groupBy === 'PRODUCT') {
              key = doc.metadata?.productName || 'other';
          } else if (groupBy === 'DATE') {
              const d = new Date(doc.updatedAt);
              key = d.toLocaleString('default', { month: 'long', year: 'numeric' });
          }
          if (!groups[key]) groups[key] = [];
          groups[key].push(doc);
      });

      return { type: 'GROUPED', groups };
  }, [files, sortBy, groupBy]);

  const handleNavigate = (folderId: string | null) => {
    if (flatMode) return; 
    searchQuerySet('');
    setSingleSelectedId(null);
    if (onFileSelect) onFileSelect(null);
    if (onNavigate) onNavigate(folderId);
    else setInternalFolderId(folderId);
  };

  const handleFileClick = (file: FileNode) => {
      setSingleSelectedId(file.id);
      if (onFileSelect) onFileSelect(file);
  };

  const toggleSelection = (fileId: string) => {
      const newSet = new Set(selectedFiles);
      if (newSet.has(fileId)) newSet.delete(fileId);
      else newSet.add(fileId);
      setSelectedFiles(newSet);
      if (onSelectionChange) onSelectionChange(newSet.size);
  };

  const handleBulkDownload = async () => {
      if(!user || selectedFiles.size === 0) return;
      alert(`${t('files.zipGenerating')} ${selectedFiles.size} arquivos.`);
  };

  const renderStatusBadge = (status?: string) => {
      if (!status) return null;
      if (status === 'APPROVED') return <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 whitespace-nowrap"><CheckCircle2 size={10} /> OK</span>;
      if (status === 'PENDING') return <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 whitespace-nowrap"><Clock size={10} /> {t('files.pending')}</span>;
      return null;
  };

  const getGroupTitle = (key: string) => {
      switch(key) {
          case 'folders': return t('files.groups.folders');
          case 'approved': return t('files.groups.approved');
          case 'pending': return t('files.groups.pending');
          case 'ungrouped': return t('files.groups.ungrouped');
          default: return key;
      }
  };

  // Fixed: explicitly type as React.FC to support 'key' prop in JSX mapping
  const FileCard: React.FC<{ file: FileNode }> = ({ file }) => (
    <div 
        onClick={() => file.type === FileType.FOLDER ? handleNavigate(file.id) : handleFileClick(file)}
        className={`group bg-white p-4 rounded-xl border hover:border-blue-300 hover:shadow-md cursor-pointer transition-all flex flex-col items-center text-center relative ${singleSelectedId === file.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'}`}
    >
        <div className="mb-3 transform group-hover:scale-110 transition-transform">
            {file.type === FileType.FOLDER ? <Folder className="text-blue-500" size={32} /> : <FileText className="text-slate-400" size={32} />}
        </div>
        <h3 className="text-sm font-medium text-slate-700 truncate w-full" title={file.name}>{file.name}</h3>
        {renderStatusBadge(file.metadata?.status)}
    </div>
  );

  // Fixed: explicitly type as React.FC to support 'key' prop in JSX mapping
  const FileRow: React.FC<{ file: FileNode }> = ({ file }) => (
    <tr 
        className={`cursor-pointer group transition-colors ${selectedFiles.has(file.id) ? 'bg-blue-50/80' : 'hover:bg-slate-50'}`}
        onClick={() => file.type === FileType.FOLDER ? handleNavigate(file.id) : handleFileClick(file)}
    >
        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
            {file.type !== FileType.FOLDER && (
                <div 
                    onClick={() => toggleSelection(file.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedFiles.has(file.id) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}
                >
                    {selectedFiles.has(file.id) && <Check size={14} strokeWidth={4} />}
                </div>
            )}
        </td>
        <td className="px-4 py-3">
            <div className="flex items-center gap-3">
                {file.type === FileType.FOLDER ? <Folder className="text-blue-500" size={20} /> : <FileText className="text-slate-400" size={20} />}
                <span className="font-medium text-sm truncate max-w-xs">{file.name}</span>
            </div>
        </td>
        <td className="px-4 py-3 text-xs text-slate-500">{file.updatedAt}</td>
        <td className="px-4 py-3">{renderStatusBadge(file.metadata?.status)}</td>
    </tr>
  );

  return (
    <div className={`bg-white rounded-xl flex flex-col relative ${autoHeight ? '' : 'h-full'}`} onClick={() => setIsViewMenuOpen(false)}>
      {!hideToolbar && (
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 z-30">
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Search size={18}/></span>
                    <span className="font-bold text-slate-800 text-lg">Explorador de Arquivos</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {selectedFiles.size > 0 && (
                    <button onClick={handleBulkDownload} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium animate-in fade-in zoom-in-95">
                        <Download size={16} /> <span className="hidden sm:inline">Baixar Selecionados</span> ({selectedFiles.size})
                    </button>
                )}
                
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text"
                        placeholder={t('common.search')}
                        value={searchQuery}
                        onChange={(e) => searchQuerySet(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-48 bg-slate-50 transition-all"
                    />
                </div>

                <div className="relative">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsViewMenuOpen(!isViewMenuOpen); }}
                        className={`p-2 rounded-lg border ${isViewMenuOpen ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-600'}`}
                    >
                        <SlidersHorizontal size={18} />
                    </button>
                    {isViewMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-2 animate-in fade-in slide-in-from-top-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Ordenação</p>
                            <button onClick={() => setSortBy('NAME_ASC')} className={`w-full text-left px-3 py-1.5 text-xs rounded-lg ${sortBy === 'NAME_ASC' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}`}>Nome (A-Z)</button>
                            <button onClick={() => setSortBy('DATE_NEW')} className={`w-full text-left px-3 py-1.5 text-xs rounded-lg ${sortBy === 'DATE_NEW' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}`}>Mais Recente</button>
                            <div className="h-px bg-slate-100 my-2" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Modo</p>
                            <div className="flex gap-1 p-1 bg-slate-50 rounded-lg">
                                <button onClick={() => setViewMode('grid')} className={`flex-1 flex justify-center py-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}><LayoutGrid size={16}/></button>
                                <button onClick={() => setViewMode('list')} className={`flex-1 flex justify-center py-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}><List size={16}/></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      <div className={`flex-1 bg-slate-50/50 relative overflow-y-auto custom-scrollbar ${autoHeight ? '' : 'h-full'}`}>
        {loading && page === 1 ? (
            <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-blue-600" /></div>
        ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Folder size={48} className="mb-4 opacity-20" />
                <p>Nenhum documento nesta seção.</p>
            </div>
        ) : (
            <>
                {viewMode === 'grid' ? (
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {files.map(file => <FileCard key={file.id} file={file} />)}
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse bg-white">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                            <tr>
                                <th className="w-12 px-4 py-3"></th>
                                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Nome</th>
                                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Data</th>
                                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {files.map(file => <FileRow key={file.id} file={file} />)}
                        </tbody>
                    </table>
                )}
                
                {/* Sentinel for Intersection Observer */}
                <div ref={lastElementRef} className="h-20 flex items-center justify-center w-full">
                    {loadingMore && <Loader2 size={24} className="animate-spin text-blue-600" />}
                    {!hasMore && files.length > 0 && (
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest opacity-50">
                            Fim da lista - {files.length} itens carregados
                        </span>
                    )}
                </div>
            </>
        )}
      </div>
    </div>
  );
});

FileExplorer.displayName = 'FileExplorer';
