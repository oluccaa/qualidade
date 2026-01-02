
import React, { useEffect, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { FileNode, FileType, UserRole } from '../types.ts';
import { useAuth } from '../services/authContext.tsx';
import * as fileService from '../services/fileService.ts';
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
  Check
} from 'lucide-react';

export interface FileExplorerHandle {
    triggerBulkDownload: () => Promise<void>;
    clearSelection: () => void;
}

interface FileExplorerProps {
  allowUpload?: boolean;
  externalFiles?: FileNode[]; 
  flatMode?: boolean; 
  onRefresh?: () => void; 
  initialFolderId?: string | null; 
  currentFolderId?: string | null; // Controlled prop
  onNavigate?: (folderId: string | null) => void; // Controlled callback
  onDelete?: (file: FileNode) => void;
  onEdit?: (file: FileNode) => void;
  onUploadClick?: (currentFolderId: string | null) => void; 
  onFileSelect?: (file: FileNode | null) => void; 
  hideToolbar?: boolean; // New prop to hide internal breadcrumbs/search
  filterStatus?: 'ALL' | 'PENDING' | 'APPROVED'; // New prop for instant filtering
  onSelectionChange?: (count: number) => void; // Callback to notify parent about selection count
}

export const FileExplorer = forwardRef<FileExplorerHandle, FileExplorerProps>(({ 
  allowUpload = false, 
  externalFiles, 
  flatMode = false,
  onRefresh,
  initialFolderId = null,
  currentFolderId: controlledFolderId, // Alias
  onNavigate,
  onDelete,
  onEdit,
  onUploadClick,
  onFileSelect,
  hideToolbar = false,
  filterStatus = 'ALL',
  onSelectionChange
}, ref) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // Internal state is used ONLY if controlled props are not provided
  const [internalFolderId, setInternalFolderId] = useState<string | null>(initialFolderId);
  
  // Resolve effective ID: Controlled > Internal > Initial
  const activeFolderId = controlledFolderId !== undefined ? controlledFolderId : internalFolderId;

  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string, name: string}[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); 
  const [dragActive, setDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  
  // Manage actions dropdown
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Track single selection for Inspector
  const [singleSelectedId, setSingleSelectedId] = useState<string | null>(null);

  const isClient = user?.role === UserRole.CLIENT;
  const isManager = user?.role === UserRole.QUALITY || user?.role === UserRole.ADMIN;

  // Expose methods to parent via Ref
  useImperativeHandle(ref, () => ({
      triggerBulkDownload: handleBulkDownload,
      clearSelection: () => {
          setSelectedFiles(new Set());
          if (onSelectionChange) onSelectionChange(0);
      }
  }));

  // Sync initial folder if it changes (only for uncontrolled mode)
  useEffect(() => {
    if (initialFolderId !== undefined && controlledFolderId === undefined) {
        setInternalFolderId(initialFolderId);
    }
  }, [initialFolderId, controlledFolderId]);

  // Effect: Load Files
  useEffect(() => {
    if (!user) return;
    
    // If external files are provided, use them and skip internal fetching
    if (externalFiles) {
        setFiles(externalFiles);
        return;
    }

    const loadFiles = async () => {
        setLoading(true);
        // Clear selection on folder change/reload
        const newSet = new Set<string>();
        setSelectedFiles(newSet); 
        if(onSelectionChange) onSelectionChange(0);

        try {
            let result;
            if (searchQuery.length > 0) {
                result = await fileService.searchFiles(user, searchQuery);
                if (!hideToolbar) setBreadcrumbs([{ id: 'search', name: `"${searchQuery}"` }]);
            } else {
                result = await fileService.getFiles(user, activeFolderId);
                if (!hideToolbar) setBreadcrumbs(fileService.getBreadcrumbs(activeFolderId));
            }
            setFiles(result);
        } finally {
            setLoading(false);
        }
    };

    loadFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFolderId, user, searchQuery, externalFiles, hideToolbar]);

  // Forces List View in Flat Mode (Library)
  useEffect(() => {
    if (flatMode) setViewMode('list');
  }, [flatMode]);

  // Client-side Filtering Logic (Instant UX)
  const displayedFiles = useMemo(() => {
      if (filterStatus === 'ALL') return files;
      
      return files.filter(f => {
          // Always show folders regardless of filter, so navigation isn't broken
          if (f.type === FileType.FOLDER) return true;
          
          return f.metadata?.status === filterStatus;
      });
  }, [files, filterStatus]);

  const handleNavigate = (folderId: string | null) => {
    if (flatMode) return; 
    setSearchQuery('');
    setSingleSelectedId(null);
    if (onFileSelect) onFileSelect(null);

    // Call Parent or Set Internal
    if (onNavigate) {
        onNavigate(folderId);
    } else {
        setInternalFolderId(folderId);
    }
  };

  const handleFileClick = (file: FileNode) => {
      setSingleSelectedId(file.id);
      if (onFileSelect) {
          onFileSelect(file);
      } else {
          handlePreview(file);
      }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, file: FileNode) => {
      e.stopPropagation();
      if (!user) return;
      const newStatus = !file.isFavorite;
      setFiles(prev => prev.map(f => f.id === file.id ? { ...f, isFavorite: newStatus } : f));
      await fileService.toggleFavorite(user, file.id);
      if (onRefresh) onRefresh();
  };

  const handleDownload = async (e: React.MouseEvent, file: FileNode) => {
      e.stopPropagation();
      if(!user) return;
      try {
        await fileService.getFileSignedUrl(user, file.id);
        alert(`Iniciando download seguro: ${file.name}`);
      } catch (err) {
        alert("Erro de permissão ou arquivo não encontrado.");
      }
  };

  const handleBulkDownload = async () => {
      if(!user || selectedFiles.size === 0) return;
      const fileNames = files.filter(f => selectedFiles.has(f.id)).map(f => f.name).join(', ');
      await fileService.logAction(user, 'BULK_DOWNLOAD', `${selectedFiles.size} arquivos`);
      alert(`Gerando pacote ZIP contendo:\n${fileNames}`);
  };

  const toggleSelection = (fileId: string) => {
      const newSet = new Set(selectedFiles);
      if (newSet.has(fileId)) {
          newSet.delete(fileId);
      } else {
          newSet.add(fileId);
      }
      setSelectedFiles(newSet);
      if (onSelectionChange) onSelectionChange(newSet.size);
  };

  const toggleSelectAll = () => {
      let newSet = new Set<string>();
      
      // Only select visible files (respecting filters)
      const visibleFiles = displayedFiles.filter(f => f.type !== FileType.FOLDER);
      
      if (selectedFiles.size === visibleFiles.length && visibleFiles.length > 0) {
          // Unselect All
          newSet = new Set();
      } else {
          // Select All Visible
          newSet = new Set(visibleFiles.map(f => f.id));
      }
      
      setSelectedFiles(newSet);
      if (onSelectionChange) onSelectionChange(newSet.size);
  };

  const handlePreview = async (file: FileNode) => {
      if(!user) return;
      await fileService.logAction(user, 'PREVIEW', file.name);
      setPreviewFile(file);
  };

  const handleUploadTrigger = () => {
      if (onUploadClick) {
          onUploadClick(activeFolderId);
      } else {
          alert("Feature de Upload simulada.");
      }
  };

  const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
          setDragActive(true);
      } else if (e.type === 'dragleave') {
          setDragActive(false);
      }
  };

  const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0] && allowUpload && user) {
          const file = e.dataTransfer.files[0];
          alert(`Detectado arquivo: ${file.name}.\nPor favor, use o botão "Upload" para preencher os metadados corretamente.`);
      }
  };

  // --- UI Helpers ---

  const renderCheckbox = (checked: boolean, onChange: () => void) => (
    <div 
        onClick={(e) => { e.stopPropagation(); onChange(); }}
        className={`
            w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer shadow-sm
            ${checked 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-white border-slate-300 hover:border-blue-400'
            }
        `}
    >
        {checked && <Check size={14} strokeWidth={4} />}
    </div>
  );

  const renderFileIcon = (type: FileType) => {
    switch (type) {
      case FileType.FOLDER: return <Folder className="text-blue-500" size={isClient ? 24 : 40} />;
      case FileType.PDF: return <FileText className="text-red-500" size={isClient ? 24 : 40} />;
      default: return <FileText className="text-slate-400" size={isClient ? 24 : 40} />;
    }
  };

  const renderStatusBadge = (status?: string) => {
      if (!status) return null;
      if (status === 'APPROVED') return <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100"><CheckCircle2 size={10} /> {t('common.status')} OK</span>;
      if (status === 'PENDING') return <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100"><Clock size={10} /> Pending</span>;
      return null;
  };

  const showActions = isManager && (onEdit || onDelete);

  if (!user) return null;

  return (
    <div 
        className="bg-white rounded-xl flex flex-col h-full relative"
        onDragEnter={allowUpload ? handleDrag : undefined}
        onClick={() => setActiveActionId(null)}
    >
      {dragActive && allowUpload && (
          <div 
            className="absolute inset-0 bg-blue-50/90 z-50 flex flex-col items-center justify-center border-2 border-dashed border-blue-500 rounded-xl"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
              <ArrowUp size={48} className="text-blue-600 mb-4 animate-bounce" />
              <p className="text-xl font-semibold text-blue-700">{t('files.dropZone')}</p>
          </div>
      )}

      {/* NEW PREVIEW MODAL */}
      <FilePreviewModal 
          file={previewFile}
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
      />

      {/* Internal Toolbar (Only rendered if hideToolbar is false) */}
      {!hideToolbar && (
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center text-sm text-slate-600 overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
            {!flatMode ? breadcrumbs.map((crumb, index) => (
                <div key={crumb.id} className="flex items-center">
                {index > 0 && <ChevronRight size={16} className="mx-2 text-slate-400" />}
                <button 
                    onClick={() => crumb.id !== 'search' && handleNavigate(crumb.id === 'root' ? null : crumb.id)}
                    className={`hover:text-blue-600 transition-colors ${index === breadcrumbs.length - 1 ? 'font-bold text-slate-900' : ''}`}
                    disabled={crumb.id === 'search'}
                >
                    {crumb.name}
                </button>
                </div>
            )) : (
                <span className="font-bold text-slate-800 text-base">
                    {displayedFiles.length} docs found
                </span>
            )}
            </div>

            <div className="flex items-center gap-3">
            {selectedFiles.size > 0 && (
                <button 
                    onClick={handleBulkDownload}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium animate-in fade-in zoom-in-95 shadow-md shadow-blue-900/10"
                >
                    <Download size={16} /> {t('files.bulkDownload')} ({selectedFiles.size})
                </button>
            )}

            {!externalFiles && (
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
                    <input 
                    type="text"
                    placeholder={t('common.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 bg-slate-50 focus:bg-white transition-all"
                    />
                </div>
            )}
            
            {allowUpload && (
                <button 
                    onClick={handleUploadTrigger}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                <ArrowUp size={18} />
                <span className="hidden sm:inline">{t('common.upload')}</span>
                </button>
            )}

            {!flatMode && (
                <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <div className="w-4 h-4 grid grid-cols-2 gap-0.5"><div className="bg-current rounded-[1px]"></div><div className="bg-current rounded-[1px]"></div><div className="bg-current rounded-[1px]"></div><div className="bg-current rounded-[1px]"></div></div>
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-2 ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <div className="w-4 h-4 flex flex-col justify-between gap-0.5"><div className="h-[2px] w-full bg-current rounded-full"></div><div className="h-[2px] w-full bg-current rounded-full"></div><div className="h-[2px] w-full bg-current rounded-full"></div></div>
                    </button>
                </div>
            )}
            </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 p-0 md:p-2 bg-slate-50/50 overflow-hidden">
        {loading ? (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        ) : displayedFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <Folder size={64} className="mb-4 text-slate-200" />
                <p>{t('files.noItems')}</p>
                {flatMode && <p className="text-sm mt-2">Check filters.</p>}
            </div>
        ) : viewMode === 'grid' ? (
             /* GRID VIEW */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 overflow-y-auto max-h-full custom-scrollbar">
                {displayedFiles.map(file => (
                    <div 
                        key={file.id}
                        onClick={() => file.type === FileType.FOLDER ? handleNavigate(file.id) : handleFileClick(file)}
                        className={`group bg-white p-4 rounded-xl border hover:border-blue-300 hover:shadow-md cursor-pointer transition-all flex flex-col items-center text-center relative
                            ${singleSelectedId === file.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'}
                        `}
                    >
                        {file.type !== FileType.FOLDER && (
                            <button 
                                onClick={(e) => handleToggleFavorite(e, file)}
                                className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${file.isFavorite ? 'text-yellow-400 hover:bg-yellow-50' : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-100'}`}
                            >
                                <Star size={16} fill={file.isFavorite ? "currentColor" : "none"} />
                            </button>
                        )}
                        <div className="mb-3 transform group-hover:scale-110 transition-transform duration-200">
                            {renderFileIcon(file.type)}
                        </div>
                        <h3 className="text-sm font-medium text-slate-700 break-all line-clamp-2 w-full" title={file.name}>
                            {file.name}
                        </h3>
                        {renderStatusBadge(file.metadata?.status)}
                        
                        {/* Grid View Context Menu */}
                        {showActions && (
                             <div className="absolute top-2 left-2" onClick={(e) => e.stopPropagation()}>
                                 <button 
                                     onClick={() => setActiveActionId(activeActionId === file.id ? null : file.id)}
                                     className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                 >
                                     <MoreVertical size={16} />
                                 </button>
                                 {activeActionId === file.id && (
                                     <div className="absolute left-0 top-8 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
                                         <button onClick={() => { if(onEdit) onEdit(file); setActiveActionId(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Edit2 size={14} /> {t('common.edit')}</button>
                                         <div className="h-px bg-slate-100 my-1" />
                                         <button onClick={() => { if(onDelete) onDelete(file); setActiveActionId(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14} /> {t('common.delete')}</button>
                                     </div>
                                 )}
                             </div>
                        )}
                    </div>
                ))}
            </div>
        ) : (
            /* LIST VIEW */
            <div className="bg-white md:rounded-lg border-t md:border border-slate-200 overflow-hidden h-full flex flex-col">
                <div className="overflow-auto custom-scrollbar flex-1">
                    <table className="w-full text-left text-sm border-separate border-spacing-0">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="w-12 px-4 py-3 text-center border-b border-slate-200">
                                    <div className="flex justify-center">
                                        {renderCheckbox(
                                            displayedFiles.length > 0 && selectedFiles.size === displayedFiles.length && displayedFiles.filter(f => f.type !== FileType.FOLDER).length > 0,
                                            toggleSelectAll
                                        )}
                                    </div>
                                </th>
                                <th className="w-10 px-0 py-3 text-center border-b border-slate-200"></th>
                                <th className="px-4 py-3 font-medium border-b border-slate-200">{t('files.name')}</th>
                                {isClient && <th className="px-4 py-3 font-medium hidden lg:table-cell border-b border-slate-200">{t('files.productBatch')}</th>}
                                <th className="px-4 py-3 font-medium w-32 hidden xl:table-cell border-b border-slate-200">{t('files.date')}</th>
                                <th className="px-4 py-3 font-medium w-24 hidden lg:table-cell border-b border-slate-200">{t('files.status')}</th>
                                <th className="px-4 py-3 font-medium w-16 text-right border-b border-slate-200">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayedFiles.map(file => {
                                const isSelected = selectedFiles.has(file.id);
                                const isSingleSelected = singleSelectedId === file.id;
                                return (
                                 <tr 
                                    key={file.id} 
                                    className={`
                                        cursor-pointer group transition-colors 
                                        ${isSelected ? 'bg-blue-50/80' : ''}
                                        ${isSingleSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'}
                                    `}
                                    onClick={() => file.type === FileType.FOLDER ? handleNavigate(file.id) : handleFileClick(file)}
                                >
                                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-center">
                                            {file.type !== FileType.FOLDER && renderCheckbox(isSelected, () => toggleSelection(file.id))}
                                        </div>
                                    </td>
                                    <td className="px-0 py-3 text-center w-10">
                                        {file.type !== FileType.FOLDER && (
                                            <button 
                                                onClick={(e) => handleToggleFavorite(e, file)}
                                                className={`transition-all ${file.isFavorite ? 'text-yellow-400 scale-110' : 'text-slate-300 hover:text-yellow-400 hover:scale-110 opacity-0 group-hover:opacity-100'}`}
                                            >
                                                <Star size={16} fill={file.isFavorite ? "currentColor" : "none"} />
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="scale-75 origin-left flex-shrink-0">
                                                {renderFileIcon(file.type)}
                                            </div>
                                            <div className="min-w-0">
                                                <span className={`font-medium truncate block ${file.type === FileType.FOLDER ? 'text-blue-700' : 'text-slate-700'}`}>
                                                    {file.name}
                                                </span>
                                                <div className="lg:hidden text-xs text-slate-400 mt-0.5 truncate">
                                                    {file.metadata?.productName} • {file.metadata?.batchNumber}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {isClient && (
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <div className="flex flex-col">
                                                <span className="text-slate-700 font-medium text-xs">{file.metadata?.productName || '-'}</span>
                                                <span className="text-slate-400 text-[10px] font-mono">{t('quality.batch')}: {file.metadata?.batchNumber || '-'}</span>
                                            </div>
                                        </td>
                                    )}

                                    <td className="px-4 py-3 text-slate-500 text-xs hidden xl:table-cell">{file.updatedAt}</td>
                                    
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        {renderStatusBadge(file.metadata?.status)}
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {showActions && (
                                                <div className="relative" onClick={(e) => e.stopPropagation()}>
                                                    <button 
                                                        onClick={() => setActiveActionId(activeActionId === file.id ? null : file.id)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    {activeActionId === file.id && (
                                                        <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                            <button onClick={() => { if(onEdit) onEdit(file); setActiveActionId(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Edit2 size={14} /> {t('common.edit')}</button>
                                                            <div className="h-px bg-slate-100 my-1" />
                                                            <button onClick={() => { if(onDelete) onDelete(file); setActiveActionId(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14} /> {t('common.delete')}</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {file.type !== FileType.FOLDER && (
                                                <button onClick={(e) => handleDownload(e, file)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all" title={t('common.download')}><Download size={18} /></button>
                                            )}
                                        </div>
                                    </td>
                                 </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    </div>
  );
});

FileExplorer.displayName = 'FileExplorer';
