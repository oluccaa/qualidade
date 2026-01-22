import React from 'react';
import { List, LayoutGrid, UploadCloud, FolderPlus, Trash2, MoreHorizontal, Download, Search, X, Radio, Plus } from 'lucide-react';
import { BreadcrumbItem, FileNode, UserRole } from '../../../../types/index.ts';
import { Breadcrumbs } from './Breadcrumbs.tsx';

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
  isLive?: boolean;
}

export const ExplorerToolbar: React.FC<ExplorerToolbarProps> = ({ 
  viewMode, onViewChange, onNavigate, breadcrumbs, searchTerm, onSearchChange,
  onUploadClick, onCreateFolderClick, selectedCount, onDeleteSelected, onRenameSelected, onDownloadSelected, userRole, isLive = false
}) => {
  const isClient = userRole === UserRole.CLIENT;

  return (
    <div className="bg-white flex flex-col shrink-0 z-20 border-b border-slate-200">
      
      {/* Nível 1: Navegação (Responsivo) */}
      <div className="px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-4 border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-center gap-3 md:gap-5 flex-1 min-w-0">
          <div className={`flex items-center gap-2 px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-xl shadow-sm border transition-all duration-500 shrink-0 ${
            isLive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-400'
          }`}>
             <Radio size={14} strokeWidth={3} className={isLive ? 'animate-pulse' : ''} />
             <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[1px] md:tracking-[2px]">{isLive ? 'Link' : 'Sync'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <Breadcrumbs breadcrumbs={breadcrumbs} onNavigate={onNavigate} />
          </div>
        </div>

        {/* Seletor de Visão Compacto */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-inner shrink-0">
           <button 
              onClick={() => onViewChange('list')} 
              className={`p-2 md:p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-[#132659] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
              title="Visão Detalhada"
           >
              <List size={18} strokeWidth={2.5}/>
           </button>
           <button 
              onClick={() => onViewChange('grid')} 
              className={`p-2 md:p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-[#132659] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
              title="Grade Visual"
           >
              <LayoutGrid size={18} strokeWidth={2.5}/>
           </button>
        </div>
      </div>

      {/* Nível 2: Busca e Ações (Stack no Mobile) */}
      <div className="px-4 md:px-8 py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-6">
        
        <div className="relative group flex-1 max-w-full md:max-w-xl">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-blue-600' : 'text-slate-400'}`} size={16} />
          <input 
            type="text" 
            placeholder="Pesquisar ativos técnicos..."
            className="w-full pl-11 pr-10 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs md:text-sm font-bold outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 focus:bg-white transition-all placeholder:text-slate-400 shadow-inner" 
            value={searchTerm} 
            onChange={e => onSearchChange(e.target.value)} 
          />
          {searchTerm && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-all"
              >
                  <X size={16} strokeWidth={3} />
              </button>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {selectedCount > 0 ? (
            <div className="flex-1 md:flex-none flex items-center justify-between md:justify-start gap-2 bg-[#b23c0e] text-white px-4 md:px-5 py-2.5 rounded-2xl shadow-xl animate-in slide-in-from-right-4 duration-300">
                <span className="text-[9px] font-black uppercase tracking-widest mr-2 md:mr-3 border-r border-white/20 pr-3 md:pr-4">{selectedCount} selecionados</span>
                <div className="flex items-center gap-1">
                    <ToolbarAction icon={Download} onClick={onDownloadSelected} label="Baixar" />
                    {!isClient && (
                        <>
                            <ToolbarAction icon={MoreHorizontal} onClick={onRenameSelected} label="Renomear" />
                            <ToolbarAction icon={Trash2} onClick={onDeleteSelected} label="Remover" variant="danger" />
                        </>
                    )}
                </div>
            </div>
          ) : (
            <div className="flex-1 md:flex-none flex items-center gap-2">
              {!isClient && (
                <>
                  <button onClick={onUploadClick} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-[#132659] text-white rounded-2xl text-[10px] font-black uppercase tracking-[1px] hover:bg-blue-900 transition-all active:scale-95 shadow-lg shadow-blue-950/20 group whitespace-nowrap">
                    <Plus size={16} className="text-blue-400 group-hover:rotate-90 transition-transform" /> Importar
                  </button>
                  <button onClick={onCreateFolderClick} className="p-3 text-slate-500 hover:text-slate-900 bg-white border-2 border-slate-100 rounded-2xl transition-all shadow-sm hover:border-blue-300" title="Novo Agrupamento">
                    <FolderPlus size={18} />
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

const ToolbarAction = ({ icon: Icon, onClick, label, variant = 'default' }: any) => (
  <button 
    onClick={onClick} 
    className={`p-2 rounded-xl transition-all flex items-center gap-2 hover:scale-110 active:scale-90 ${
        variant === 'danger' ? 'hover:bg-red-500 text-white' : 'hover:bg-white/10 text-white'
    }`}
    title={label}
  >
    <Icon size={18} strokeWidth={2.5} />
  </button>
);