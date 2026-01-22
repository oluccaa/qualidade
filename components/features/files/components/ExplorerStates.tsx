import React from 'react';
import { Loader2, FileText, ShieldCheck, SearchX } from 'lucide-react';

interface StateProps {
  message?: string;
  t?: any;
}

/**
 * LoadingState Industrial com Skeletons Reais
 */
export const LoadingState: React.FC<StateProps> = ({ message = "Sincronizando Ledger..." }) => (
  <div className="h-full w-full flex flex-col min-h-[400px] animate-in fade-in duration-500">
    <div className="px-6 py-10 flex flex-col gap-6 max-w-[1800px] mx-auto w-full">
        {/* Simulação de Linhas do Explorador */}
        {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 flex items-center gap-6 shadow-sm relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 skeleton-shimmer shrink-0" />
                <div className="flex-1 space-y-3">
                    <div className="h-3 w-48 bg-slate-100 rounded-full skeleton-shimmer" />
                    <div className="h-2 w-32 bg-slate-50 rounded-full skeleton-shimmer" />
                </div>
                <div className="w-32 h-6 bg-slate-100 rounded-full skeleton-shimmer hidden md:block" />
                <div className="w-10 h-10 bg-slate-100 rounded-xl skeleton-shimmer shrink-0" />
            </div>
        ))}
    </div>
    
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-white/10 animate-bounce">
       <Loader2 size={16} className="animate-spin text-blue-400" />
       <span className="text-[10px] font-black uppercase tracking-[3px]">{message}</span>
    </div>
  </div>
);

/**
 * EmptyState Industrial Padronizado
 */
export const EmptyState: React.FC<StateProps & { icon?: any, title?: string, sub?: string }> = ({ t, icon: Icon = FileText, title, sub }) => (
  <div className="h-full w-full flex flex-col items-center justify-center py-20 min-h-[400px] text-center animate-in zoom-in-95 duration-500">
    <div className="relative mb-8">
        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center shadow-inner border border-slate-100">
            <Icon size={48} className="text-slate-200" />
        </div>
        <div className="absolute -bottom-2 -right-2 p-2 bg-slate-100 rounded-xl text-slate-400 border border-white shadow-sm">
            <SearchX size={16} strokeWidth={3} />
        </div>
    </div>
    <div className="space-y-2 px-6">
        <h3 className="font-black text-sm text-slate-600 uppercase tracking-widest">
            {title || (t ? t('files.noResultsFound') : "Nenhum Ativo Localizado")}
        </h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">
            {sub || (t ? t('files.typeToSearch') : "Não encontramos registros compatíveis com os filtros aplicados no momento.")}
        </p>
    </div>
  </div>
);

/**
 * Overlay Transparente para Operações de Fundo
 */
export const ProcessingOverlay: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed inset-0 z-[500] bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center p-6 animate-in fade-in duration-300">
    <div className="bg-[#132659] px-8 py-5 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/10 flex items-center gap-5">
      <div className="relative">
        <Loader2 size={24} className="animate-spin text-blue-400" />
        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
      </div>
      <span className="text-xs font-black uppercase tracking-[3px] text-white">{message}</span>
    </div>
  </div>
);