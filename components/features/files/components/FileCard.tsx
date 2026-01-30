
import React from 'react';
import { CheckSquare, Square, Clock, Eye, Edit2, Trash2, FileText, Folder, MoreVertical } from 'lucide-react';
import { FileNode, FileType, UserRole } from '../../../../types/index.ts';
import { FileStatusBadge } from './FileStatusBadge.tsx';

interface FileCardProps {
  file: FileNode;
  isSelected: boolean;
  onNavigate: (id: string | null) => void;
  onPreview: (file: FileNode) => void;
  onToggleSelection: (fileId: string) => void;
  onRename: (file: FileNode) => void;
  onDelete: (fileId: string) => void;
  userRole: UserRole;
}

export const FileCard: React.FC<FileCardProps> = ({ 
  file, isSelected, onNavigate, onPreview, onToggleSelection, onRename, onDelete, userRole 
}) => {
  const isFolder = file.type === FileType.FOLDER;
  const isViewed = !!file.metadata?.viewedAt;
  const isClient = userRole === UserRole.CLIENT;
  const isRootFolder = isFolder && file.parentId === null;

  const handleMainClick = () => {
    if (isFolder) onNavigate(file.id);
    else onPreview(file);
  };

  return (
    <div 
      className={`group relative flex flex-col bg-white border transition-all duration-300 rounded-[2rem] overflow-hidden cursor-pointer
        ${isSelected 
          ? 'border-blue-600 ring-4 ring-blue-600/5 shadow-xl scale-[1.01]' 
          : 'border-slate-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1'}`}
      onClick={handleMainClick}
    >
      {/* Zona de Ações (Topo) */}
      <div className="flex items-center justify-between p-4 pb-2 shrink-0">
        <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 
                ${isSelected 
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20' 
                    : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100'}`}>
                {isFolder ? <Folder size={22} strokeWidth={2.5} /> : <FileText size={22} strokeWidth={2.5} />}
            </div>
            {isViewed && !isFolder && (
                <div className="flex items-center text-blue-600 bg-blue-50 p-1.5 rounded-lg border border-blue-100" title="Visto pelo cliente">
                    <Eye size={12} strokeWidth={2.5} />
                </div>
            )}
        </div>

        <div className="flex items-center gap-1.5">
          {!isClient && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
              <button 
                onClick={(e) => { e.stopPropagation(); onRename(file); }}
                className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                title="Configurar"
              >
                <MoreVertical size={14} />
              </button>
            </div>
          )}
          
          <button 
              className={`p-2 rounded-xl transition-all
              ${isSelected ? 'text-blue-600 bg-blue-50' : 'text-slate-300 hover:text-blue-500'}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelection(file.id);
              }}
          >
              {isSelected ? <CheckSquare size={20} strokeWidth={2.5} /> : <Square size={20} />}
          </button>
        </div>
      </div>

      {/* Zona de Identificação (Centro) */}
      <div className="px-6 py-4 flex-1">
        <h4 className={`text-sm font-bold leading-snug tracking-tight line-clamp-2 transition-colors mb-3
          ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
          {file.name}
        </h4>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5">
                <Clock size={11} className="text-slate-300" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {new Date(file.updatedAt).toLocaleDateString()}
                </span>
            </div>
            {!isFolder && file.metadata?.batchNumber && (
                <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg border border-slate-200 uppercase tracking-tighter shadow-sm">
                   Lote {file.metadata.batchNumber}
                </span>
            )}
        </div>
      </div>

      {/* Zona de Status (Rodapé) */}
      <div className={`mt-2 px-6 py-4 border-t flex items-center justify-between bg-slate-50/50 
        ${isSelected ? 'border-blue-100 bg-blue-50/30' : 'border-slate-50'}`}>
         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
            {isFolder ? 'Estrutura' : file.size || 'PDF'}
         </span>
         
         <div className="shrink-0 scale-90 origin-right">
            {!isFolder && <FileStatusBadge status={file.metadata?.status} />}
         </div>
      </div>
    </div>
  );
};
