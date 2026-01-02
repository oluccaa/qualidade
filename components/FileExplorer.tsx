import React, { useEffect, useState, useRef } from 'react';
import { FileNode, FileType, UserRole } from '../types.ts';
import { useAuth } from '../services/authContext.tsx';
import * as fileService from '../services/fileService.ts';
import { 
  Folder, 
  FileText, 
  Search, 
  ChevronRight, 
  Download, 
  Eye,
  ArrowUp,
  X,
  FileCheck,
  Tag
} from 'lucide-react';

interface FileExplorerProps {
  allowUpload?: boolean;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ allowUpload = false }) => {
  const { user } = useAuth();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string, name: string}[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dragActive, setDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileNode | null>(null);

  const loadFiles = async () => {
    if (!user) return;
    setLoading(true);
    try {
        let result;
        if (searchQuery.length > 0) {
            result = await fileService.searchFiles(user, searchQuery);
            setBreadcrumbs([{ id: 'search', name: `Busca: "${searchQuery}"` }]);
        } else {
            result = await fileService.getFiles(user, currentFolderId);
            setBreadcrumbs(fileService.getBreadcrumbs(currentFolderId));
        }
        setFiles(result);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolderId, user, searchQuery]);

  const handleNavigate = (folderId: string | null) => {
    setSearchQuery('');
    setCurrentFolderId(folderId);
  };

  const handleDownload = async (e: React.MouseEvent, file: FileNode) => {
      e.stopPropagation();
      if(!user) return;
      try {
        await fileService.getFileSignedUrl(user, file.id);
        alert(`Download iniciado: ${file.name}\n\nAcesso registrado no log de auditoria.`);
      } catch (err) {
        alert("Erro de permissão ou arquivo não encontrado.");
      }
  };

  const handlePreview = async (file: FileNode) => {
      if(!user) return;
      // Log the preview action
      await fileService.logAction(user, 'PREVIEW', file.name);
      setPreviewFile(file);
  };

  const handleUpload = () => {
      alert("Feature de Upload simulada.\n\nNa versão real, abriria o seletor de arquivos do sistema.");
  };

  // Drag and Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
          setDragActive(true);
      } else if (e.type === 'dragleave') {
          setDragActive(false);
      }
  };

  const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0] && allowUpload && user) {
          const file = e.dataTransfer.files[0];
          await fileService.logAction(user, 'UPLOAD', file.name);
          alert(`Arquivo "${file.name}" enviado com sucesso!\nTags automáticas geradas.`);
          loadFiles();
      }
  };

  const renderFileIcon = (type: FileType) => {
    switch (type) {
      case FileType.FOLDER: return <Folder className="text-blue-500" size={40} />;
      case FileType.PDF: return <FileText className="text-red-500" size={40} />;
      default: return <FileText className="text-slate-400" size={40} />;
    }
  };

  if (!user) return null;

  return (
    <div 
        className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[600px] relative"
        onDragEnter={allowUpload ? handleDrag : undefined}
    >
      
      {/* Drag & Drop Overlay */}
      {dragActive && allowUpload && (
          <div 
            className="absolute inset-0 bg-blue-50/90 z-50 flex flex-col items-center justify-center border-2 border-dashed border-blue-500 rounded-xl"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
              <ArrowUp size={48} className="text-blue-600 mb-4 animate-bounce" />
              <p className="text-xl font-semibold text-blue-700">Solte os arquivos aqui</p>
              <p className="text-sm text-blue-500">Upload automático para a pasta atual</p>
          </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
          <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-5xl h-[85vh] rounded-lg flex flex-col overflow-hidden">
                  <div className="flex justify-between items-center p-4 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                          <FileText className="text-red-500" />
                          <span className="font-semibold text-slate-800">{previewFile.name}</span>
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">Read-Only View</span>
                      </div>
                      <button onClick={() => setPreviewFile(null)} className="text-slate-500 hover:text-slate-800">
                          <X size={24} />
                      </button>
                  </div>
                  <div className="flex-1 bg-slate-100 flex items-center justify-center">
                      <div className="text-center">
                          <p className="text-slate-400 mb-2">Simulação de Visualizador de PDF</p>
                          <div className="w-64 h-80 bg-white shadow-lg mx-auto mb-4 border border-slate-200 flex flex-col p-4">
                              <div className="h-4 w-3/4 bg-slate-200 mb-4"></div>
                              <div className="h-2 w-full bg-slate-100 mb-2"></div>
                              <div className="h-2 w-full bg-slate-100 mb-2"></div>
                              <div className="h-2 w-full bg-slate-100 mb-2"></div>
                              <div className="h-32 w-full bg-slate-50 mt-4 border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-300">
                                  Conteúdo do Documento
                              </div>
                          </div>
                          <button 
                            onClick={(e) => { setPreviewFile(null); handleDownload(e, previewFile); }}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                          >
                              Baixar Arquivo Original
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-slate-600 overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
           {breadcrumbs.map((crumb, index) => (
             <div key={crumb.id} className="flex items-center">
               {index > 0 && <ChevronRight size={16} className="mx-2 text-slate-400" />}
               <button 
                 onClick={() => crumb.id !== 'search' && handleNavigate(crumb.id === 'root' ? null : crumb.id)}
                 className={`hover:text-blue-600 transition-colors ${index === breadcrumbs.length - 1 ? 'font-bold text-slate-900' : ''}`}
                 disabled={crumb.id === 'search'}
               >
                 {crumb.name}
               </button>
             </div>
           ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Nome, lote ou certificado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
          </div>
          {allowUpload && (
            <button 
                onClick={handleUpload}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <ArrowUp size={18} />
              <span className="hidden sm:inline">Upload</span>
            </button>
          )}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden">
            <button 
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-slate-100 text-blue-600' : 'text-slate-500'}`}
            >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-[1px]"></div>
                    <div className="bg-current rounded-[1px]"></div>
                    <div className="bg-current rounded-[1px]"></div>
                    <div className="bg-current rounded-[1px]"></div>
                </div>
            </button>
            <button 
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-slate-100 text-blue-600' : 'text-slate-500'}`}
            >
                <div className="w-4 h-4 flex flex-col justify-between gap-0.5">
                    <div className="h-[2px] w-full bg-current rounded-full"></div>
                    <div className="h-[2px] w-full bg-current rounded-full"></div>
                    <div className="h-[2px] w-full bg-current rounded-full"></div>
                </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 bg-slate-50/50">
        {loading ? (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Folder size={64} className="mb-4 text-slate-200" />
                <p>Nenhum item encontrado nesta pasta.</p>
                {allowUpload && <p className="text-sm mt-2">Arraste arquivos para fazer upload</p>}
            </div>
        ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {files.map(file => (
                    <div 
                        key={file.id}
                        onClick={() => file.type === FileType.FOLDER ? handleNavigate(file.id) : handlePreview(file)}
                        className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all flex flex-col items-center text-center relative"
                    >
                        <div className="mb-3 transform group-hover:scale-110 transition-transform duration-200">
                            {renderFileIcon(file.type)}
                        </div>
                        <h3 className="text-sm font-medium text-slate-700 break-all line-clamp-2 w-full" title={file.name}>
                            {file.name}
                        </h3>
                        {file.tags && file.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap justify-center gap-1">
                                {file.tags.slice(0, 1).map(tag => (
                                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200">
                                        {tag}
                                    </span>
                                ))}
                                {file.tags.length > 1 && <span className="text-[10px] text-slate-400">+{file.tags.length - 1}</span>}
                            </div>
                        )}
                        <p className="text-xs text-slate-400 mt-2">{file.updatedAt}</p>
                        
                        {file.type !== FileType.FOLDER && (
                             <button 
                                onClick={(e) => handleDownload(e, file)}
                                className="absolute top-2 right-2 p-1 text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Download"
                             >
                                <Download size={16} />
                             </button>
                        )}
                    </div>
                ))}
            </div>
        ) : (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 font-medium">Nome</th>
                            <th className="px-4 py-3 font-medium hidden sm:table-cell">Tags</th>
                            <th className="px-4 py-3 font-medium w-32">Data</th>
                            <th className="px-4 py-3 font-medium w-24">Tamanho</th>
                            <th className="px-4 py-3 font-medium w-16">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {files.map(file => (
                             <tr 
                                key={file.id} 
                                className="hover:bg-slate-50 cursor-pointer group"
                                onClick={() => file.type === FileType.FOLDER ? handleNavigate(file.id) : handlePreview(file)}
                            >
                                <td className="px-4 py-3 flex items-center gap-3">
                                    <div className="scale-75 origin-left">
                                        {renderFileIcon(file.type)}
                                    </div>
                                    <span className="font-medium text-slate-700">{file.name}</span>
                                </td>
                                <td className="px-4 py-3 hidden sm:table-cell">
                                    <div className="flex gap-1 flex-wrap">
                                        {file.tags?.map(tag => (
                                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-500">{file.updatedAt}</td>
                                <td className="px-4 py-3 text-slate-500">{file.size || '-'}</td>
                                <td className="px-4 py-3">
                                    {file.type !== FileType.FOLDER && (
                                        <div className="flex gap-2">
                                            <button onClick={(e) => handleDownload(e, file)} className="text-slate-400 hover:text-blue-600" title="Download">
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};