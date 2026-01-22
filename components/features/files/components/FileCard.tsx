import React, { memo } from 'react';
import { CheckSquare, Square, Clock, Eye, Edit2, Trash2, FileText, Folder, Hash } from 'lucide-react';
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

export const FileCard = memo<FileCardProps>(({ 
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
      className={`group relative flex flex-col bg-white border-2 transition-all duration-500 rounded-[2rem] overflow-hidden cursor-pointer will-change-transform
        ${isSelected 
          ? 'border-blue-600 ring-[8px] md:ring-[12px] ring-blue-600/5 shadow-xl md:shadow-2xl scale-[1.01] md:scale-[1.02]' 
          : 'border-slate-100 hover:border-blue-400/50 hover:shadow-lg hover:-translate-y-1'}`}
      onClick={handleMainClick}
    >
      <div className="flex items-center justify-between p-4 md:p-5 shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-3">
            <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${isSelected ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 group-hover:text-blue-600 group-hover:border-blue-100'}`}>
                {isFolder ? <Folder size={20} strokeWidth={2.5} /> : <FileText size={20} strokeWidth={2.5} />}
            </div>
            {isViewed && !isFolder && (
                <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 animate-in fade-in" title="Lido pelo cliente">
                    <Eye size={12} strokeWidth={3} />
                </div>
            )}
        </div>

        <div className="flex items-center gap-1">
          {!isClient && (
            <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              <button 
                onClick={(e) => { e.stopPropagation(); onRename(file); }}
                className="p-2.5 bg-white hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all border border-slate-100 shadow-sm"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
          
          <button 
              className={`p-2.5 rounded-xl transition-all duration-300 active:scale-90
              ${isSelected ? 'text-blue-600 bg-blue-50 shadow-inner' : 'text-slate-200 hover:text-blue-500'}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelection(file.id);
              }}
          >
              {isSelected ? <CheckSquare size={26} strokeWidth={2.5} /> : <Square size={26} strokeWidth={2} />}
          </button>
        </div>
      </div>

      <div className="px-5 py-5 md:px-6 md:py-6 flex-1 flex flex-col justify-between">
        <div>
          <h4 className={`text-[13px] md:text-sm font-black leading-tight uppercase tracking-tight line-clamp-2 transition-colors mb-4
            ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
            {file.name}
          </h4>
          
          <div className="flex flex-col gap-2">
              {!isFolder && file.metadata?.batchNumber && (
                  <div className="inline-flex items-center gap-2 px-2 py-1 bg-[#132659] text-blue-100 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-[1px] w-fit shadow-sm">
                     <Hash size={10} /> Lote: {file.metadata.batchNumber}
                  </div>
              )}
              <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={12} strokeWidth={2.5} />
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                    {new Date(file.updatedAt).toLocaleDateString()}
                  </span>
              </div>
          </div>
        </div>

        {!isFolder && (
           <div className="mt-5 md:mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-[2px] font-mono">
                 {file.size || 'PDF'}
              </span>
              <div className="scale-75 md:scale-90 origin-right">
                 <FileStatusBadge status={file.metadata?.status} />
              </div>
           </div>
        )}
      </div>
    </div>
  );
}, (p, n) => p.isSelected === n.isSelected && p.file.updatedAt === n.file.updatedAt && p.file.metadata?.status === n.file.metadata?.status);