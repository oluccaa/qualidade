
import React from 'react';
import { ChevronRight, List, LayoutGrid, Search, UploadCloud, FolderPlus, Edit2, Download, Trash2 } from 'lucide-react';
import { BreadcrumbItem, FileNode, FileType, UserRole } from '../../../../types/index.ts';
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
  selectedFilesData: FileNode[];
  userRole: UserRole;
}

export const ExplorerToolbar: React.FC<ExplorerToolbarProps> = ({ 
  viewMode, 
  onViewChange, 
  onNavigate, 
  breadcrumbs, 
  searchTerm, 
  onSearchChange,
  onUploadClick,
  onCreateFolderClick,
  selectedCount,
  onDeleteSelected,
  onRenameSelected,
  onDownloadSelected,
  selectedFilesData,
  userRole
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
      
      <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
        <Breadcrumbs breadcrumbs={breadcrumbs} onNavigate={onNavigate} t={t} />
        <SearchInput searchTerm={searchTerm} onSearchChange={onSearchChange} t={t} />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {selectedCount > 0 ? (
          <SelectedActions 
            count={selectedCount} 
            onDelete={onDeleteSelected} 
            onRename={onRenameSelected} 
            onDownload={onDownloadSelected}
            selectedFilesData={selectedFilesData}
            t={t}
            userRole={userRole}
          />
        ) : (
          <PrimaryActions 
            onUpload={onUploadClick} 
            onCreateFolder={onCreateFolderClick} 
            viewMode={viewMode} 
            onViewChange={onViewChange}
            t={t}
            userRole={userRole}
          />
        )}
      </div>
    </div>
  );
};

const Breadcrumbs: React.FC<{ breadcrumbs: BreadcrumbItem[]; onNavigate: (id: string | null) => void, t: any }> = ({ breadcrumbs, onNavigate, t }) => (
  <nav className="flex items-center text-sm font-medium text-slate-600 overflow-x-auto whitespace-nowrap custom-scrollbar -ml-2 -mr-2 px-2 py-1 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-100 shadow-sm">
    {breadcrumbs.map((item, index) => {
      // Tradução dinâmica do nó raiz baseada no idioma selecionado
      const label = item.id === null ? t('dashboard.kpi.libraryLabel') : item.name;
      
      return (
        <React.Fragment key={item.id || 'home-root'}>
          <button 
            onClick={() => onNavigate(item.id)}
            className={`px-2 py-1 rounded-lg transition-colors ${index === breadcrumbs.length - 1 ? 'font-bold text-[var(--color-detail-blue)] bg-blue-50' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            {label}
          </button>
          {index < breadcrumbs.length - 1 && <ChevronRight size={14} className="text-slate-400 mx-0.5" />}
        </React.Fragment>
      );
    })}
  </nav>
);

const SearchInput: React.FC<{ searchTerm: string; onSearchChange: (term: string) => void; t: any }> = ({ searchTerm, onSearchChange, t }) => (
  <div className="relative flex-1 min-w-[240px] max-w-sm ml-4 hidden lg:block group">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--color-detail-blue)] transition-colors" size={16} />
    <input 
      type="text" 
      placeholder={t('files.searchPlaceholder')}
      className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-[var(--color-detail-blue)]/20 focus:border-[var(--color-detail-blue)] font-medium text-slate-700" 
      value={searchTerm} 
      onChange={e => onSearchChange(e.target.value)} 
    />
  </div>
);

const PrimaryActions: React.FC<{ 
  onUpload: () => void; 
  onCreateFolder: () => void; 
  viewMode: 'grid' | 'list'; 
  onViewChange: (mode: 'grid' | 'list') => void; 
  t: any;
  userRole: UserRole;
}> = ({ 
  onUpload, onCreateFolder, viewMode, onViewChange, t, userRole 
}) => {
  const isClient = userRole === UserRole.CLIENT;
  return (
    <div className="flex items-center gap-3">
      {!isClient && (
        <>
          <button 
            onClick={onUpload} 
            className="bg-[var(--color-detail-blue)] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            <UploadCloud size={16} /> <span className="hidden md:inline">{t('files.upload.button')}</span>
          </button>
          <button 
            onClick={onCreateFolder} 
            className="bg-[var(--color-primary-dark-blue)] hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg"
          >
            <FolderPlus size={16} /> <span className="hidden md:inline">{t('files.createFolder.button')}</span>
          </button>
          <div className="h-6 w-px bg-slate-200 hidden md:block" />
        </>
      )}
      
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <ViewButton active={viewMode === 'list'} onClick={() => onViewChange('list')} icon={List} />
        <ViewButton active={viewMode === 'grid'} onClick={() => onViewChange('grid')} icon={LayoutGrid} />
      </div>
    </div>
  );
};

const SelectedActions: React.FC<{ 
  count: number; 
  onDelete: () => void; 
  onRename: () => void; 
  onDownload: () => void; 
  t: any; 
  selectedFilesData: FileNode[];
  userRole: UserRole;
}> = ({ count, onDelete, onRename, onDownload, t, selectedFilesData, userRole }) => {
  const isSingleFileSelected = count === 1 && selectedFilesData[0]?.type !== FileType.FOLDER;
  const isSingleItemSelected = count === 1;
  const isClient = userRole === UserRole.CLIENT;

  return (
    <div className="flex items-center gap-3 bg-blue-50 text-blue-900 px-4 py-2 rounded-xl border border-blue-100 shadow-sm animate-in zoom-in-95">
      <span className="text-[10px] font-black uppercase tracking-widest">{count} {count === 1 ? t('files.itemSelected') : t('files.itemsSelected')}</span>
      <div className="h-6 w-px bg-blue-200" />
      
      {!isClient && (
        <>
          <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title={t('common.delete')}><Trash2 size={18} /></button>
          {isSingleItemSelected && (
            <button onClick={onRename} className="p-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors" title={t('files.rename.title')}><Edit2 size={18} /></button>
          )}
        </>
      )}

      {isSingleFileSelected && (
        <button onClick={onDownload} className="p-2 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors" title={t('files.downloadButton')}><Download size={18} /></button>
      )}
    </div>
  );
};

const ViewButton = ({ active, onClick, icon: Icon }: any) => (
  <button 
    onClick={onClick} 
    className={`p-1.5 rounded-lg transition-all ${active ? 'bg-white shadow-md text-[var(--color-detail-blue)]' : 'text-slate-500 hover:text-slate-700'}`}
  >
    <Icon size={16}/>
  </button>
);
