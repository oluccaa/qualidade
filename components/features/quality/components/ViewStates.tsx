
import React from 'react';
import { Loader2, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Overlay de processamento global (S)
 * Bloqueia a interface durante operações críticas de mutação de dados.
 */
export const ProcessingOverlay: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
    <div className="bg-white px-6 py-5 md:px-8 rounded-2xl shadow-2xl border border-slate-200 flex flex-col md:flex-row items-center gap-4 text-center md:text-left max-w-[90%] w-auto">
      <Loader2 size={24} className="animate-spin text-[var(--color-detail-blue)] shrink-0" />
      <span className="text-[10px] md:text-xs font-black uppercase tracking-[2px] text-slate-800 leading-tight">{message}</span>
    </div>
  </div>
);

export const QualityLoadingState: React.FC<{ message?: string }> = ({ message }) => {
  const { t } = useTranslation();
  const defaultMessage = t('common.syncing');
  
  return (
    <div className="flex-1 h-full min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 animate-pulse px-4">
      <div className="relative mb-6">
        <Loader2 className="animate-spin text-[var(--color-detail-blue)] w-10 h-10 md:w-12 md:h-12" />
        <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-primary-dark-blue)] w-4 h-4 md:w-5 md:h-5" />
      </div>
      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[2px] md:tracking-[6px] text-slate-400 text-center leading-relaxed max-w-xs">
        {message || defaultMessage}
      </p>
    </div>
  );
};

export const QualityEmptyState: React.FC<{ message: string; icon?: React.ElementType }> = ({ message, icon: Icon = Activity }) => (
  <div className="flex-1 h-full min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 opacity-60 px-4 text-center">
    <Icon className="text-slate-300 mb-4 w-12 h-12 md:w-14 md:h-14" />
    <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest">{message}</p>
  </div>
);

export const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex-1 h-full min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center bg-red-50 rounded-[2.5rem] border border-red-100 text-red-500 gap-4 px-4 text-center">
    <AlertCircle className="w-10 h-10 md:w-12 md:h-12" />
    <p className="font-black text-[10px] md:text-xs uppercase tracking-widest leading-relaxed">{message}</p>
  </div>
);
