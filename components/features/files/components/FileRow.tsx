import React, { memo } from 'react';
import { CheckSquare, Square, Eye, Edit2, Trash2, FileText, Folder, Hash, ChevronRight } from 'lucide-react';
import { FileNode, FileType, UserRole } from '../../../../types/index.ts';
import { FileStatusBadge } from './FileStatusBadge.tsx';

interface FileRowProps {
  file: FileNode;
  isSelected: boolean;
  onNavigate: (id: string | null) => void;
  onPreview: (file: FileNode) => void;
  onToggleSelection: (fileId: string) => void;
  onRename: (file: FileNode) => void;
  onDelete: (fileId: string) => void;
  userRole: UserRole;
}

/**
 * FileRow Responsivo - Mobile-First
 * Prioriza nome e status em telas pequenas, expande dados técnicos em desktop.
 */
export const FileRow = memo<FileRowProps>(({ 
  file, isSelected, onNavigate, onPreview, onToggleSelection, onRename, onDelete, userRole 
}) => {
  const isFolder = file.type === FileType.FOLDER;
  const isClient = userRole === UserRole.CLIENT;
  const isRootFolder = isFolder && file.parentId === null;
  const isViewed = !!file.metadata?.viewedAt;
  
  return (
    <div 
      className={`group flex items-center px-4 md:px-6 py-4 hover:bg-slate-50 transition-all cursor-pointer relative border-b border-slate-100 last:border-0 min-h-[72px] md:min-h-0
        ${isSelected ? 'bg-blue-50/60' : ''}`}
      onClick={() => isFolder ? onNavigate(file.id) : onPreview(file)}
    >
      {/* Seleção e Ícone - Targets Ampliados para Mobile */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleSelection(file.id); }}
            className={`p-2.5 -ml-1 rounded-lg transition-all active:scale-90 ${isSelected ? 'text-blue-600' : 'text-slate-200 md:text-slate-200 group-hover:text-slate-400'}`}
          >
            {isSelected ? <CheckSquare size={22} strokeWidth={2.5} /> : <Square size={22} />}
          </button>
          <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${isSelected ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-white border-slate-100 text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100'}`}>
            {isFolder ? <Folder size={20} strokeWidth={2.5} /> : <FileText size={20} strokeWidth={2.5} />}
          </div>
      </div>

      {/* Info Principal - Layout Fluido */}
      <div className="flex-1 min-w-0 px-3 md:px-4">
        <div className="flex items-center gap-2">
            <span className={`text-[13px] md:text-sm tracking-tight uppercase transition-colors truncate ${isSelected || isFolder ? 'font-black text-slate-900' : 'font-bold text-slate-700 group-hover:text-slate-900'}`}>
              {file.name}
            </span>
            {isViewed && <Eye size={12} className="text-blue-500 shrink-0 hidden xs:block" />}
        </div>
        <div className="flex items-center flex-wrap gap-2 mt-1">
            {!isFolder && file.metadata?.batchNumber && (
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[1px] flex items-center gap-1">
                    <Hash size={10} /> Lote {file.metadata.batchNumber}
                </span>
            )}
            {/* Status visível no mobile quando não é pasta */}
            <div className="md:hidden scale-75 origin-left">
                {!isFolder && <FileStatusBadge status={file.metadata?.status} />}
            </div>
        </div>
      </div>

      {/* Colunas Ocultas no Mobile (MD+) */}
      <div className="w-40 px-4 shrink-0 hidden md:block">
        {!isFolder && <div className="scale-90 origin-left"><FileStatusBadge status={file.metadata?.status} /></div>}
      </div>

      <div className="w-32 px-4 shrink-0 hidden lg:block">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Sincronia</p>
          <p className="text-[10px] font-bold text-slate-600 uppercase">{new Date(file.updatedAt).toLocaleDateString()}</p>
      </div>

      {/* Ações Mobile vs Desktop */}
      <div className="w-10 md:w-28 flex items-center justify-end gap-1">
        <div className="md:hidden text-slate-300">
            <ChevronRight size={18} strokeWidth={3} />
        </div>
        {!isClient && (
          <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
            <button onClick={(e) => { e.stopPropagation(); onRename(file); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm" title="Renomear"><Edit2 size={16} /></button>
            {!isRootFolder && (
              <button onClick={(e) => { e.stopPropagation(); onDelete(file.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm" title="Excluir"><Trash2 size={16} /></button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}, (prev, next) => {
    return prev.isSelected === next.isSelected && 
           prev.file.updatedAt === next.file.updatedAt && 
           prev.file.name === next.file.name &&
           prev.file.metadata?.status === next.file.metadata?.status;
});