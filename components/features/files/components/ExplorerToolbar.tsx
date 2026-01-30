
import React from 'react';
import { List, LayoutGrid, UploadCloud, FolderPlus, Trash2, MoreHorizontal, Download, Search, X, Filter } from 'lucide-react';
import { BreadcrumbItem, FileNode, UserRole } from '../../../../types/index.ts';
import { Breadcrumbs } from './Breadcrumbs.tsx';
import { useTranslation } from 'react-i18next';

interface ExplorerToolbarProps {
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
  onNavigate: (folderId: string | null) => void;
  breadcrumbs: BreadcrumbItem[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onUploadClick: () => void;
  onCreateFolderClick: () => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  onRenameSelected: () => void;
  onDownloadSelected: () => void;
  userRole: UserRole;
  selectedFilesData: FileNode[];
}

export const ExplorerToolbar: React.FC<ExplorerToolbarProps> = ({ 
  viewMode, onViewChange, onNavigate, breadcrumbs, searchTerm, onSearchChange,
  onUploadClick, onCreateFolderClick, selectedCount, onDeleteSelected, onRenameSelected, onDownloadSelected, userRole
}) => {
  const { t } = useTranslation();
  const isClient = userRole === UserRole.CLIENT;

  return (
    <div className="flex flex-col w-full gap-4">
      
      {/* Top Bar: Navigation & Hierarchy */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Breadcrumbs breadcrumbs={breadcrumbs} onNavigate={onNavigate} />
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-3">
           <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/50">
             <button 
                onClick={() => onViewChange('list')} 
                className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'list' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                title={t('files.listView')}
             >
                <List size={18} strokeWidth={2.5} />
             </button>
             <button 
                onClick={() => onViewChange('grid')} 
                className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                title={t('files.gridView')}
             >
                <LayoutGrid size={18} strokeWidth={2.5} />
             </button>
           </div>
           
           <button className="lg:hidden p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-500">
              <Filter size={20} />
           </button>
        </div>
      </div>

      {/* Main Actions Area */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative group w-full md:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder={t('files.traceability')}
            className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-medium outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/30 transition-all placeholder:text-slate-400 shadow-sm" 
            value={searchTerm} 
            onChange={e => onSearchChange(e.target.value)} 
          />
          {searchTerm && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all"
              >
                  <X size={14} strokeWidth={3} />
              </button>
          )}
        </div>

        {/* Action Sets */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {selectedCount > 0 ? (
            <div className="flex items-center gap-2 bg-[#0f172a] text-white px-5 py-2.5 rounded-[1.5rem] shadow-2xl animate-in zoom-in-95 w-full md:w-auto justify-center">
                <span className="text-[10px] font-black uppercase tracking-[2px] mr-3 border-r border-white/10 pr-4">
                  {selectedCount} {t(selectedCount === 1 ? 'files.itemSelected' : 'files.itemsSelected')}
                </span>
                <div className="flex items-center gap-1">
                    <ToolbarAction icon={Download} onClick={onDownloadSelected} />
                    {!isClient && (
                        <>
                            <ToolbarAction icon={MoreHorizontal} onClick={onRenameSelected} />
                            <ToolbarAction icon={Trash2} onClick={onDeleteSelected} variant="danger" />
                        </>
                    )}
                </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full md:w-auto">
              {!isClient && (
                <>
                  <button onClick={onUploadClick} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-[11px] font-extrabold uppercase tracking-[2px] hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-600/20">
                    <UploadCloud size={18} strokeWidth={2.5} /> {t('files.upload.button')}
                  </button>
                  <button onClick={onCreateFolderClick} className="p-3.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-2xl transition-all shadow-sm hover:shadow-md" title={t('files.createFolder.button')}>
                    <FolderPlus size={20} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ToolbarAction = ({ icon: Icon, onClick, variant = 'default' }: any) => (
  <button 
    onClick={onClick} 
    className={`p-2 rounded-xl transition-all active:scale-90 ${variant === 'danger' ? 'hover:bg-red-500 text-red-400 hover:text-white' : 'hover:bg-white/10 text-slate-400 hover:text-white'}`}
  >
    <Icon size={18} strokeWidth={2.5} />
  </button>
);
