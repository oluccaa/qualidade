
import React, { useState, forwardRef, useImperativeHandle } from 'react'; 
import { 
  Folder, FileText, ChevronRight, Download, Star,
  LayoutGrid, List, Home, Loader2, FileUp, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFileExplorer } from './useFileExplorer.ts';
import { FileNode, FileType } from '../../../types/index.ts';

export interface FileExplorerHandle {
    clearSelection: () => void;
}

interface FileExplorerProps {
  allowUpload?: boolean;
  onNavigate?: (folderId: string | null) => void; 
  onFileSelect?: (file: FileNode | null) => void; 
  currentFolderId?: string | null;
  refreshKey?: number;
}

export const FileExplorer = forwardRef<FileExplorerHandle, FileExplorerProps>((props, ref) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const {
    files, loading, handleNavigate, activeFolderId
  } = useFileExplorer(props);

  useImperativeHandle(ref, () => ({
      clearSelection: () => {}
  }));

  const getStatusIcon = (status?: string) => {
      switch(status) {
          case 'APPROVED': return <CheckCircle2 size={14} className="text-emerald-500" />;
          case 'REJECTED': return <AlertCircle size={14} className="text-red-500" />;
          default: return <Clock size={14} className="text-orange-500" />;
      }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-inner border border-slate-100">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
            <button onClick={() => handleNavigate(null)} className="p-2 hover:bg-white rounded-xl transition-all"><Home size={18} className="text-slate-400"/></button>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Documentação Técnica</span>
        </div>
        <div className="flex bg-slate-200/50 p-1 rounded-lg">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><List size={16}/></button>
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><LayoutGrid size={16}/></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-[4px]">Acessando Arquivo...</span>
            </div>
        ) : files.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 italic py-20">
                <FileText size={48} className="opacity-10 mb-4" />
                <p>Nenhum documento disponível nesta pasta.</p>
            </div>
        ) : viewMode === 'list' ? (
            <div className="space-y-1">
                {files.map(file => (
                    <div 
                        key={file.id} 
                        onClick={() => file.type === FileType.FOLDER ? handleNavigate(file.id) : props.onFileSelect?.(file)}
                        className="group flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl cursor-pointer border border-transparent hover:border-slate-200 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${file.type === FileType.FOLDER ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}`}>
                                {file.type === FileType.FOLDER ? <Folder size={20} /> : <FileText size={20} />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{file.name}</p>
                                <div className="flex items-center gap-3 mt-0.5">
                                    <span className="text-[10px] text-slate-400 font-mono">{file.size || '--'}</span>
                                    {file.type !== FileType.FOLDER && (
                                        <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-white border border-slate-100 rounded text-[9px] font-black uppercase">
                                            {getStatusIcon(file.metadata?.status)}
                                            {file.metadata?.status || 'PENDING'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {files.map(file => (
                    <div 
                        key={file.id}
                        onClick={() => file.type === FileType.FOLDER ? handleNavigate(file.id) : props.onFileSelect?.(file)}
                        className="flex flex-col items-center p-4 hover:bg-slate-50 rounded-2xl cursor-pointer border border-transparent hover:border-slate-200 transition-all text-center group"
                    >
                        <div className={`w-16 h-16 mb-3 flex items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110 ${file.type === FileType.FOLDER ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}`}>
                            {file.type === FileType.FOLDER ? <Folder size={32} /> : <FileText size={32} />}
                        </div>
                        <p className="text-xs font-bold text-slate-700 line-clamp-2 leading-tight">{file.name}</p>
                        <span className="text-[9px] text-slate-400 font-mono mt-1 uppercase">{file.metadata?.status || (file.type === 'FOLDER' ? 'Folder' : 'Doc')}</span>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
});

FileExplorer.displayName = 'FileExplorer';
