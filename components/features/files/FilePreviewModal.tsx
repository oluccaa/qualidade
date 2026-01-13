
import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, Loader2, FileText, AlertCircle } from 'lucide-react';
import { FileNode } from '../../../types/index';
import { fileService } from '../../../lib/services/index.ts';
import { useAuth } from '../../../context/authContext.tsx';
import { useTranslation } from 'react-i18next';

interface FilePreviewModalProps {
  file: FileNode | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && file && user) {
      loadUrl();
    } else {
      setUrl(null);
      setError(null);
    }
  }, [isOpen, file, user]);

  const loadUrl = async () => {
    if (!file || !user) return;
    setLoading(true);
    setError(null);
    try {
      const signedUrl = await fileService.getFileSignedUrl(user, file.id);
      setUrl(signedUrl);
    } catch (err: any) {
      console.error("Erro ao gerar preview:", err);
      setError(t('files.errorLoadingDocument'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isImage = file?.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full h-full flex flex-col overflow-hidden border border-white/20">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 truncate text-sm md:text-base">{file?.name}</h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                {file?.size} • {t('files.authenticatedView')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {url && (
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                title={t('files.openInNewTab')}
              >
                <ExternalLink size={20} />
              </a>
            )}
            <button 
              onClick={onClose}
              className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 size={40} className="animate-spin text-blue-500" />
              <p className="text-xs font-black uppercase tracking-[4px]">{t('files.authenticatingAccess')}</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-4 text-center p-8 max-w-sm">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <AlertCircle size={32} />
              </div>
              <div>
                <p className="font-bold text-slate-800">{error}</p>
                <p className="text-sm text-slate-500 mt-1">{t('files.permissionOrExpiredLink')}</p>
              </div>
              <button 
                onClick={loadUrl}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                {t('maintenance.retry')}
              </button>
            </div>
          )}

          {!loading && !error && url && (
            isImage ? (
              <img 
                src={url} 
                alt={file?.name} 
                className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-500" 
              />
            ) : (
              <iframe 
                src={`${url}#toolbar=0&navpanes=0`} 
                className="w-full h-full border-none bg-white"
                title={file?.name}
              ></iframe>
            )
          )}
        </div>

        {/* Footer info (Optional) */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
           <span>{t('menu.brand')} Industrial Link</span>
           <span>SSL 256-bit Encrypted</span>
        </div>
      </div>
    </div>
  );
};
