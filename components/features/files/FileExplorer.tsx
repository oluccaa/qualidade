
import React, { forwardRef, useImperativeHandle } from 'react'; 
import { useTranslation } from 'react-i18next';
import { FileNode, BreadcrumbItem, UserRole } from '../../../types/index.ts';
import { FileListView, FileGridView } from './components/FileViews.tsx';
import { LoadingState, EmptyState } from './components/ExplorerStates.tsx';

export interface FileExplorerHandle {
    clearSelection: () => void;
}

interface FileExplorerProps {
  files: FileNode[];
  loading: boolean;
  currentFolderId: string | null;
  searchTerm: string;
  breadcrumbs: BreadcrumbItem[];
  selectedFileIds: string[];
  viewMode: 'grid' | 'list';
  userRole: UserRole;
  
  onNavigate: (folderId: string | null) => void; 
  onFileSelectForPreview: (file: FileNode | null) => void; 
  onToggleFileSelection: (fileId: string) => void;

  onDownloadFile: (file: FileNode) => void;
  onRenameFile: (file: FileNode) => void;
  onDeleteFile: (fileId: string) => void;
}

export const FileExplorer = forwardRef<FileExplorerHandle, FileExplorerProps>((props, ref) => {
  const { t } = useTranslation();
  const { 
    files, loading, onNavigate, 
    onFileSelectForPreview, 
    selectedFileIds, onToggleFileSelection,
    onDownloadFile, onRenameFile, onDeleteFile, viewMode,
    userRole
  } = props;

  useImperativeHandle(ref, () => ({
      clearSelection: () => {} 
  }));

  if (loading && files.length === 0) return <div className="py-20"><LoadingState message="Acessando Cluster Industrial..." /></div>;
  if (!loading && files.length === 0) return <div className="py-20"><EmptyState t={t} /></div>;

  const viewProps = {
    files,
    onNavigate,
    onSelectFileForPreview: onFileSelectForPreview,
    selectedFileIds,
    onToggleFileSelection,
    onDownload: onDownloadFile,
    onRename: onRenameFile,
    onDelete: onDeleteFile,
    userRole,
  };

  // REMOVIDO: h-full e overflow-y-auto. Agora expande com o conteúdo.
  return (
    <div className="w-full">
      <div className="p-4 md:p-6 lg:p-8 w-full">
        <div className="w-full">
          {viewMode === 'list' ? (
            // Lista com fundo branco e bordas para contraste
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
              <FileListView {...viewProps} />
            </div>
          ) : (
            // Grid fluido
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 w-full">
              <FileGridView {...viewProps} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

FileExplorer.displayName = 'FileExplorer';
