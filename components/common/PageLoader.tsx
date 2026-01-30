
import React from 'react';
import { Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PageLoaderProps {
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ 
  message, 
  onRetry, 
  fullScreen = true 
}) => {
  const { t } = useTranslation();
  const displayMessage = message || t('common.loading');

  const containerClasses = fullScreen 
    ? "fixed inset-0 w-full h-full bg-slate-50/50 z-50"
    : "flex-1 w-full h-full min-h-[300px] md:min-h-[400px] bg-transparent";

  return (
    <div className={`${containerClasses} flex flex-col items-center justify-center text-slate-600 font-sans px-4`}>
        <div className="relative mb-6 md:mb-8">
          <div className="relative">
            <Loader2 className="animate-spin text-blue-600 w-10 h-10 md:w-16 md:h-16" />
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full animate-pulse scale-150" />
          </div>
          <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-900/20 w-4 h-4 md:w-6 md:h-6" />
        </div>
        
        <div className="text-center space-y-4 md:space-y-6 px-2 md:px-6 max-w-lg relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
            <p className="text-[9px] md:text-[11px] font-black text-slate-400 tracking-[2px] md:tracking-[8px] uppercase animate-pulse leading-relaxed break-words">
                {displayMessage}
            </p>
            
            {onRetry && (
              <button 
                onClick={onRetry} 
                className="flex items-center justify-center gap-3 px-6 py-3 md:px-8 md:py-3 bg-white border-2 border-slate-200 text-[#132659] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500 hover:shadow-lg transition-all active:scale-95 mx-auto w-full md:w-auto"
              >
                <RefreshCw size={16} /> {t('common.retry')}
              </button>
            )}
        </div>
    </div>
  );
};
