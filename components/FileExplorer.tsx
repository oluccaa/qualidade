
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
  Home
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
  currentFolderId?: string | null; // Controlled prop
  onNavigate?: (folderId: string | null) => void; // Controlled callback
  onDelete?: (file: FileNode) => void;
  onEdit?: (file: FileNode) => void;
  onUploadClick?: (currentFolderId: string | null) => void; 
  onFileSelect?: (file: FileNode | null) => void; 
  hideToolbar?: boolean; // New prop to hide internal breadcrumbs/search
  filterStatus?: 'ALL' | 'PENDING' | 'APPROVED'; // New prop for instant filtering
  onSelectionChange?: (count: number) => void; // Callback to notify parent about selection count
  autoHeight?: boolean; // NEW: If true, component grows with content instead of scrolling internally
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
  onSelectionChange,
  autoHeight = false
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
  
  // Sorting & Grouping State
  const [sortBy, setSortBy] = useState<SortOption>('DATE_NEW');
  const [groupBy, setGroupBy] = useState<GroupOption>('NONE');
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  
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

  // --- Logic: Filtering, Sorting, Grouping ---

  const processedData = useMemo(() => {
      // 1. FILTERING
      let filtered = files;
      if (filterStatus !== 'ALL') {
          filtered = files.filter(f => {
              if (f.type === FileType.FOLDER) return true; // Always show folders
              return f.metadata?.status === filterStatus;
          });
      }

      // 2. SEPARATE FOLDERS vs FILES (Folders usually stay on top or in their own group)
      const folders = filtered.filter(f => f.type === FileType.FOLDER);
      const docs = filtered.filter(f => f.type !== FileType.FOLDER);

      // 3. SORTING (Applies to docs)
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

      // 4. GROUPING
      // If group is NONE, we return a single list structure.
      // If group is active, we return a dictionary.
      
      if (groupBy === 'NONE') {
          return { type: 'FLAT', items: [...folders, ...docs], count: folders.length + docs.length };
      }

      const groups: Record<string, FileNode[]> = {};
      
      // Always put folders in a specific group if present
      if (folders.length > 0) {
          groups['folders'] = folders;
      }

      docs.forEach(doc => {
          let key = 'ungrouped';
          
          if (groupBy === 'STATUS') {
              const status = doc.metadata?.status || 'PENDING';
              if (status === 'APPROVED') key = 'approved';
              else if (status === 'REJECTED') key = 'rejected';
              else key = 'pending';
          } 
          else if (groupBy === 'PRODUCT') {
              key = doc.metadata?.productName || 'other';
          }
          else if (groupBy === 'DATE') {
              const date = new Date(doc.updatedAt);
              key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
          }

          if (!groups[key]) groups[key] = [];
          groups[key].push(doc);
      });

      return { type: 'GROUPED', groups, count: filtered.length };

  }, [files, filterStatus, sortBy, groupBy]);

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
        alert(`${t('files.downloading')} ${file.name}`);
      } catch (err) {
        alert(t('files.permissionError'));
      }
  };

  const handleBulkDownload = async () => {
      if(!user || selectedFiles.size === 0) return;
      const fileNames = files.filter(f => selectedFiles.has(f.id)).map(f => f.name).join(', ');
      await fileService.logAction(user, 'BULK_DOWNLOAD', `${selectedFiles.size} arquivos`);
      alert(`${t('files.zipGenerating')}\n${fileNames}`);
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
      
      // Determine all visible IDs based on current grouping/filtering
      let visibleIds: string[] = [];
      if (processedData.type === 'FLAT') {
          visibleIds = processedData.items.filter(f => f.type !== FileType.FOLDER).map(f => f.id);
      } else {
          Object.values(processedData.groups).forEach(groupFiles => {
              groupFiles.forEach(f => {
                  if (f.type !== FileType.FOLDER) visibleIds.push(f.id);
              });
          });
      }
      
      if (selectedFiles.size === visibleIds.length && visibleIds.length > 0) {
          newSet = new Set();
      } else {
          newSet = new Set(visibleIds);
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
          alert(t('files.uploadFeature'));
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
          alert(`${t('files.fileDetected')}: ${file.name}.\n${t('quality.uploadModal.dragDrop')}`);
      }
  };

  // --- UI Helpers ---

  const renderCheckbox = (checked: boolean, onChange: () => void) => (
    <div 
        onClick={(e) => { e.stopPropagation(); onChange(); }}
        className={`
            w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0
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
      case FileType.FOLDER: return <Folder className="text-blue-500" size={24} />;
      case FileType.PDF: return <FileText className="text-red-500" size={24} />;
      case FileType.IMAGE: return <ImageIcon className="text-purple-500" size={24} />;
      default: return <FileText className="text-slate-400" size={24} />;
    }
  };

  const renderStatusBadge = (status?: string) => {
      if (!status) return null;
      if (status === 'APPROVED') return <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 whitespace-nowrap"><CheckCircle2 size={10} /> OK</span>;
      if (status === 'PENDING') return <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 whitespace-nowrap"><Clock size={10} /> {t('files.pending')}</span>;
      if (status === 'REJECTED') return <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 whitespace-nowrap"><Trash2 size={10} /> REJ</span>;
      return null;
  };

  const getGroupTitle = (key: string) => {
      switch(key) {
          case 'folders': return t('files.groups.folders');
          case 'approved': return t('files.groups.approved');
          case 'pending': return t('files.groups.pending');
          case 'rejected': return t('files.groups.rejected');
          case 'other': return t('files.groups.other');
          case 'ungrouped': return t('files.groups.ungrouped');
          default: return key; // For Dates or Product Names
      }
  };

  // --- SMART BREADCRUMBS COMPONENT ---
  const renderBreadcrumbs = () => {
      if (flatMode) {
          return (
              <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Search size={18}/></span>
                  <span className="font-bold text-slate-800 text-lg">
                      {processedData.count} {t('files.docsFound')}
                  </span>
              </div>
          );
      }

      const count = breadcrumbs.length;
      
      // Render simple list if short
      if (count <= 3) {
          return (
              <nav className="flex items-center flex-wrap gap-2 text-sm">
                  {breadcrumbs.map((crumb, idx) => {
                      const isLast = idx === count - 1;
                      const isRoot = crumb.id === 'root';
                      return (
                          <div key={crumb.id} className="flex items-center group">
                              {idx > 0 && <ChevronRight size={14} className="mx-1 text-slate-300" />}
                              <button
                                  onClick={() => crumb.id !== 'search' && handleNavigate(isRoot ? null : crumb.id)}
                                  disabled={crumb.id === 'search'}
                                  className={`
                                      flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all border
                                      ${isLast 
                                          ? 'bg-slate-100 border-slate-200 text-slate-800 font-bold shadow-sm' 
                                          : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                                      }
                                  `}
                              >
                                  {isRoot && <Home size={14} className={isLast ? 'text-slate-800' : 'text-slate-400 group-hover:text-blue-600'} />}
                                  <span className="max-w-[150px] truncate">{crumb.name}</span>
                              </button>
                          </div>
                      );
                  })}
              </nav>
          );
      }

      // Render collapsed list if long
      const first = breadcrumbs[0];
      const last = breadcrumbs[count - 1];
      const middleCrumbs = breadcrumbs.slice(1, count - 1);

      return (
          <nav className="flex items-center flex-wrap gap-2 text-sm">
              {/* Root */}
              <button 
                  onClick={() => handleNavigate(null)} 
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all group"
              >
                  <Home size={14} className="text-slate-400 group-hover:text-blue-600" />
                  <span className="max-w-[100px] truncate">{first.name}</span>
              </button>
              
              <ChevronRight size={14} className="text-slate-300" />
              
              {/* Collapsed Menu */}
              <div className="relative group">
                  <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                      <MoreHorizontal size={16} />
                  </button>
                  <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-50 hidden group-hover:block animate-in fade-in zoom-in-95 duration-200">
                      {middleCrumbs.map(crumb => (
                          <button
                              key={crumb.id}
                              onClick={() => handleNavigate(crumb.id)}
                              className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors truncate"
                          >
                              <Folder size={14} />
                              {crumb.name}
                          </button>
                      ))}
                  </div>
              </div>

              <ChevronRight size={14} className="text-slate-300" />

              {/* Current (Last) */}
              <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="font-bold text-slate-800 text-sm max-w-[200px] truncate block">
                      {last.name}
                  </span>
              </div>
          </nav>
      );
  };

  const showActions = isManager && (onEdit || onDelete);

  // --- RENDER COMPONENT: FileCard (Grid) ---
  const FileCard = ({ file }: { file: FileNode }) => (
    <div 
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
  );

  // --- RENDER COMPONENT: FileRow (List) ---
  const FileRow = ({ file, isSelected, isSingleSelected }: { file: FileNode, isSelected: boolean, isSingleSelected: boolean }) => (
    <tr 
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
                </div>
            </div>
        </td>
        
        {isClient && (
            <td className="px-4 py-3 hidden md:table-cell">
                <div className="flex flex-col">
                    <span className="text-slate-700 font-medium text-xs">{file.metadata?.productName || '-'}</span>
                    <span className="text-slate-400 text-[10px] font-mono">{t('quality.batch')}: {file.metadata?.batchNumber || '-'}</span>
                </div>
            </td>
        )}

        <td className="px-4 py-3 text-slate-500 text-xs hidden xl:table-cell">{file.updatedAt}</td>
        
        <td className="px-4 py-3">
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
                            <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
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

  // --- RENDER: Mobile List Item (Reused from previous, but adapted) ---
  const MobileFileItem = ({ file, isSelected }: { file: FileNode, isSelected: boolean }) => (
    <div 
        className={`
            rounded-xl border transition-all duration-200 relative overflow-hidden
            ${isSelected ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-slate-200 shadow-sm'}
        `}
    >
        <div className="flex items-stretch">
            <div 
                className="flex flex-col items-center justify-center p-3 w-16 bg-slate-50 border-r border-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    if (file.type === FileType.FOLDER) handleNavigate(file.id);
                    else toggleSelection(file.id);
                }}
            >
                <div className="mb-2 pointer-events-none">{renderFileIcon(file.type)}</div>
                {file.type !== FileType.FOLDER && (
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                        {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                )}
            </div>
            <div 
                className="flex-1 p-3 min-w-0 active:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => file.type === FileType.FOLDER ? handleNavigate(file.id) : handleFileClick(file)}
            >
                <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-semibold text-sm truncate pr-2 ${file.type === FileType.FOLDER ? 'text-blue-700' : 'text-slate-800'}`}>{file.name}</h4>
                    {showActions && (
                        <button onClick={(e) => { e.stopPropagation(); setActiveActionId(activeActionId === file.id ? null : file.id); }} className="p-1 -mr-2 -mt-1 text-slate-400 hover:text-blue-600 active:scale-95 transition-transform"><MoreVertical size={18} /></button>
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    {file.metadata?.productName && <span className="text-xs text-slate-500 truncate">{file.metadata.productName}</span>}
                    <div className="flex items-center gap-2 mt-1">
                        {file.metadata?.batchNumber && <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{file.metadata.batchNumber}</span>}
                        {renderStatusBadge(file.metadata?.status)}
                    </div>
                </div>
            </div>
        </div>
        {/* Mobile Context Overlay Logic */}
        {activeActionId === file.id && (
            <div className="absolute inset-x-0 bottom-0 top-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200">
                <div className="flex gap-4">
                    <button onClick={() => { if(onEdit) onEdit(file); setActiveActionId(null); }} className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl shadow-sm active:scale-95"><Edit2 size={20} className="text-blue-600" /><span className="text-xs font-bold text-slate-600">{t('common.edit')}</span></button>
                    <button onClick={() => { if(onDelete) onDelete(file); setActiveActionId(null); }} className="flex flex-col items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl shadow-sm active:scale-95"><Trash2 size={20} className="text-red-600" /><span className="text-xs font-bold text-slate-600">{t('common.delete')}</span></button>
                </div>
                <button onClick={(e) => {e.stopPropagation(); setActiveActionId(null);}} className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">{t('common.close')}</button>
            </div>
        )}
    </div>
  );

  if (!user) return null;

  return (
    <div 
        className={`bg-white rounded-xl flex flex-col relative ${autoHeight ? '' : 'h-full'}`}
        onDragEnter={allowUpload ? handleDrag : undefined}
        onClick={() => { setActiveActionId(null); setIsViewMenuOpen(false); }}
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

      <FilePreviewModal file={previewFile} isOpen={!!previewFile} onClose={() => setPreviewFile(null)} />

      {/* Toolbar - Redesigned with Flex Wrap, Smart Breadcrumbs and Z-Index Fix */}
      {!hideToolbar && (
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 relative z-30">
            
            {/* Left: Smart Breadcrumbs */}
            <div className="flex-1 min-w-[200px]">
                {renderBreadcrumbs()}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                {selectedFiles.size > 0 && (
                    <button onClick={handleBulkDownload} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium animate-in fade-in zoom-in-95 shadow-md">
                        <Download size={16} /> <span className="hidden sm:inline">{t('files.bulkDownload')}</span> ({selectedFiles.size})
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
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-48 bg-slate-50 focus:bg-white transition-all"
                        />
                    </div>
                )}
                
                {/* View Options Dropdown */}
                <div className="relative">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsViewMenuOpen(!isViewMenuOpen); }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${isViewMenuOpen ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <SlidersHorizontal size={16} />
                        <span className="hidden lg:inline">{t('files.viewOptions')}</span>
                    </button>

                    {isViewMenuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 p-1" onClick={(e) => e.stopPropagation()}>
                            
                            <div className="p-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-2">{t('files.sortBy')}</span>
                                <div className="space-y-1">
                                    {[
                                        { id: 'NAME_ASC', label: t('files.sort.nameAsc'), icon: ArrowDownAZ },
                                        { id: 'NAME_DESC', label: t('files.sort.nameDesc'), icon: ArrowUpZA },
                                        { id: 'DATE_NEW', label: t('files.sort.dateNew'), icon: Calendar },
                                        { id: 'DATE_OLD', label: t('files.sort.dateOld'), icon: Calendar },
                                        { id: 'STATUS', label: t('files.sort.status'), icon: CheckCircle2 }
                                    ].map(opt => (
                                        <button 
                                            key={opt.id}
                                            onClick={() => { setSortBy(opt.id as SortOption); setIsViewMenuOpen(false); }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${sortBy === opt.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <opt.icon size={14} /> {opt.label}
                                            {sortBy === opt.id && <Check size={14} className="ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 mx-2" />

                            <div className="p-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-2">{t('files.groupBy')}</span>
                                <div className="space-y-1">
                                    {[
                                        { id: 'NONE', label: t('files.group.none'), icon: List },
                                        { id: 'STATUS', label: t('files.group.status'), icon: Layers },
                                        { id: 'PRODUCT', label: t('files.group.product'), icon: Folder },
                                        { id: 'DATE', label: t('files.group.date'), icon: Calendar }
                                    ].map(opt => (
                                        <button 
                                            key={opt.id}
                                            onClick={() => { setGroupBy(opt.id as GroupOption); setIsViewMenuOpen(false); }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${groupBy === opt.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            <opt.icon size={14} /> {opt.label}
                                            {groupBy === opt.id && <Check size={14} className="ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 mx-2" />

                            {/* Layout Toggle in Menu for Mobile */}
                            <div className="p-2 flex gap-2">
                                 <button 
                                    onClick={() => setViewMode('grid')} 
                                    className={`flex-1 flex justify-center items-center py-2 rounded-lg border ${viewMode === 'grid' ? 'bg-slate-100 border-slate-300 text-slate-900' : 'border-slate-100 text-slate-400'}`}
                                 >
                                     <LayoutGrid size={16} />
                                 </button>
                                 <button 
                                    onClick={() => setViewMode('list')} 
                                    className={`flex-1 flex justify-center items-center py-2 rounded-lg border ${viewMode === 'list' ? 'bg-slate-100 border-slate-300 text-slate-900' : 'border-slate-100 text-slate-400'}`}
                                 >
                                     <List size={16} />
                                 </button>
                            </div>
                        </div>
                    )}
                </div>

                {allowUpload && (
                    <button onClick={handleUploadTrigger} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                        <ArrowUp size={18} /> <span className="hidden sm:inline">{t('common.upload')}</span>
                    </button>
                )}
            </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 p-0 md:p-2 bg-slate-50/50 relative z-0 ${autoHeight ? '' : 'overflow-hidden'}`}>
        {loading ? (
            <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : processedData.count === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <Folder size={64} className="mb-4 text-slate-200" />
                <p>{t('files.noItems')}</p>
                {flatMode && <p className="text-sm mt-2">{t('files.checkFilters')}</p>}
            </div>
        ) : (
            <div className={`custom-scrollbar ${autoHeight ? '' : 'overflow-y-auto h-full'}`}>
                
                {/* 1. GRID VIEW LOGIC */}
                {viewMode === 'grid' && (
                    <div className="p-4 space-y-8">
                        {processedData.type === 'FLAT' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {processedData.items.map(file => <FileCard key={file.id} file={file} />)}
                            </div>
                        ) : (
                            Object.entries(processedData.groups).map(([groupKey, groupFiles]) => (
                                <div key={groupKey}>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 bg-slate-100/50 p-2 rounded-lg inline-block border border-slate-200/50">
                                        {getGroupTitle(groupKey)} <span className="ml-1 text-slate-400">({groupFiles.length})</span>
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {groupFiles.map(file => <FileCard key={file.id} file={file} />)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* 2. LIST VIEW LOGIC */}
                {viewMode === 'list' && (
                    <div className="bg-white md:rounded-lg border-t md:border border-slate-200 flex flex-col">
                        
                        {/* Mobile List View (Cards) */}
                        <div className="md:hidden flex flex-col space-y-3 p-3">
                             <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 sticky top-0 z-10 shadow-sm">
                                <div className="flex items-center gap-2" onClick={toggleSelectAll}>
                                    {renderCheckbox(selectedFiles.size > 0 && selectedFiles.size === (processedData.type === 'FLAT' ? processedData.items.length : processedData.count), () => {})}
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{selectedFiles.size > 0 ? `${selectedFiles.size} ${t('files.selected')}` : t('common.actions')}</span>
                                </div>
                             </div>
                             
                             {processedData.type === 'FLAT' ? (
                                 processedData.items.map(file => <MobileFileItem key={file.id} file={file} isSelected={selectedFiles.has(file.id)} />)
                             ) : (
                                 Object.entries(processedData.groups).map(([groupKey, groupFiles]) => (
                                     <div key={groupKey} className="space-y-3">
                                         <div className="sticky top-14 z-0 bg-slate-50 py-2 px-1">
                                             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{getGroupTitle(groupKey)}</h3>
                                         </div>
                                         {groupFiles.map(file => <MobileFileItem key={file.id} file={file} isSelected={selectedFiles.has(file.id)} />)}
                                     </div>
                                 ))
                             )}
                        </div>

                        {/* Desktop Table View */}
                        <table className="w-full text-left text-sm border-separate border-spacing-0 hidden md:table">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="w-12 px-4 py-3 text-center border-b border-slate-200">
                                        <div className="flex justify-center">{renderCheckbox(selectedFiles.size > 0, toggleSelectAll)}</div>
                                    </th>
                                    <th className="w-10 px-0 py-3 border-b border-slate-200"></th>
                                    <th className="px-4 py-3 font-medium border-b border-slate-200">{t('files.name')}</th>
                                    {isClient && <th className="px-4 py-3 font-medium hidden md:table-cell border-b border-slate-200">{t('files.productBatch')}</th>}
                                    <th className="px-4 py-3 font-medium w-32 hidden xl:table-cell border-b border-slate-200">{t('files.date')}</th>
                                    <th className="px-4 py-3 font-medium w-24 border-b border-slate-200">{t('files.status')}</th>
                                    <th className="px-4 py-3 font-medium w-16 text-right border-b border-slate-200">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {processedData.type === 'FLAT' ? (
                                    processedData.items.map(file => <FileRow key={file.id} file={file} isSelected={selectedFiles.has(file.id)} isSingleSelected={singleSelectedId === file.id} />)
                                ) : (
                                    Object.entries(processedData.groups).map(([groupKey, groupFiles]) => (
                                        <React.Fragment key={groupKey}>
                                            <tr className="bg-slate-50/80">
                                                <td colSpan={10} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-y border-slate-100">
                                                    {getGroupTitle(groupKey)} ({groupFiles.length})
                                                </td>
                                            </tr>
                                            {groupFiles.map(file => <FileRow key={file.id} file={file} isSelected={selectedFiles.has(file.id)} isSingleSelected={singleSelectedId === file.id} />)}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
});

FileExplorer.displayName = 'FileExplorer';
