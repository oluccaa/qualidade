import React, { forwardRef, useImperativeHandle, useCallback } from 'react'; 
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

  const handleNavigate = useCallback((id: string | null) => onNavigate(id), [onNavigate]);
  const handlePreview = useCallback((file: FileNode | null) => onFileSelectForPreview(file), [onFileSelectForPreview]);
  const handleToggle = useCallback((id: string) => onToggleFileSelection(id), [onToggleFileSelection]);
  const handleRename = useCallback((file: FileNode) => onRenameFile(file), [onRenameFile]);
  const handleDelete = useCallback((id: string) => onDeleteFile(id), [onDeleteFile]);

  if (loading && files.length === 0) return <LoadingState message="Acessando Cluster Industrial..." />;
  if (!loading && files.length === 0) return <EmptyState t={t} />;

  const viewProps = {
    files,
    onNavigate: handleNavigate,
    onSelectFileForPreview: handlePreview,
    selectedFileIds,
    onToggleFileSelection: handleToggle,
    onDownload: onDownloadFile,
    onRename: handleRename,
    onDelete: handleDelete,
    userRole,
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar bg-white/50 scroll-smooth">
      <div className="p-3 md:p-8 min-h-full">
        <div className="max-w-[1800px] mx-auto pb-48 md:pb-40">
          {viewMode === 'list' ? (
            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <FileListView {...viewProps} />
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
              <FileGridView {...viewProps} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

FileExplorer.displayName = 'FileExplorer';