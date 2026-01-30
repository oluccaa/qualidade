
import React from 'react';
import { CheckSquare, Square, Clock, Eye, Edit2, Trash2, FileText, Folder, MoreHorizontal } from 'lucide-react';
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

export const FileRow: React.FC<FileRowProps> = ({ 
  file, isSelected, onNavigate, onPreview, onToggleSelection, onRename, onDelete, userRole 
}) => {
  const isFolder = file.type === FileType.FOLDER;
  const isClient = userRole === UserRole.CLIENT;
  const isRootFolder = isFolder && file.parentId === null;
  
  return (
    <div 
      className={`group flex items-center px-6 py-4 hover:bg-slate-50 transition-all cursor-pointer relative border-b border-slate-100 last:border-0
        ${isSelected ? 'bg-blue-50/40' : ''}`}
      onClick={() => isFolder ? onNavigate(file.id) : onPreview(file)}
    >
      <div className="flex-1 min-w-0 flex items-center gap-5">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300
            ${isSelected 
                ? 'bg-blue-600 text-white border-blue-500 shadow-md' 
                : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-white group-hover:text-blue-500'}`}>
          {isFolder ? <Folder size={20} strokeWidth={2.5} /> : <FileText size={20} strokeWidth={2.5} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="space-y-0.5">
            <span className={`text-sm tracking-tight transition-colors truncate block ${isSelected || isFolder ? 'font-bold text-slate-900' : 'font-semibold text-slate-700 group-hover:text-blue-600'}`}>
              {file.name}
            </span>
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{file.size || 'VITAL CLOUD'}</span>
               {file.metadata?.batchNumber && (
                   <span className="text-[9px] font-black text-blue-600/60 uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">Lote {file.metadata.batchNumber}</span>
               )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-40 hidden lg:flex items-center gap-2">
         <Clock size={12} className="text-slate-300" />
         <span className="text-[11px] font-bold text-slate-400 uppercase">{new Date(file.updatedAt).toLocaleDateString()}</span>
      </div>

      <div className="w-36 flex justify-center scale-90 origin-center">
        {!isFolder && <FileStatusBadge status={file.metadata?.status} />}
      </div>

      <div className="w-28 flex items-center justify-end gap-2">
        {!isClient && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
            <button onClick={(e) => { e.stopPropagation(); onRename(file); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"><MoreHorizontal size={16} /></button>
          </div>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleSelection(file.id); }}
          className={`p-2.5 rounded-xl transition-all ${isSelected ? 'text-blue-600 bg-blue-50' : 'text-slate-200 hover:text-slate-400'}`}
        >
          {isSelected ? <CheckSquare size={22} strokeWidth={2.5} /> : <Square size={22} />}
        </button>
      </div>
    </div>
  );
};
