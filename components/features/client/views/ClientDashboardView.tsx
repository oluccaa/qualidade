
import React from 'react';
import { useClientDashboard } from '../hooks/useClientDashboard.ts';
import { ShieldCheck, FileText, Clock, FileWarning, ArrowUpRight, Loader2, Lock, LayoutGrid } from 'lucide-react';
import { FileStatusBadge } from '../../files/components/FileStatusBadge.tsx';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const ClientDashboardView: React.FC = () => {
  const { t } = useTranslation();
  const { stats, recentFiles, isLoading } = useClientDashboard();
  const [, setSearchParams] = useSearchParams();

  if (isLoading) {
    return (
      <div className="flex-1 w-full h-full min-h-[60vh] flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 mx-4 md:mx-8">
        <Loader2 className="animate-spin text-[#081437] mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">{t('client.dashboard.loading')}</p>
      </div>
    );
  }

  const totalPending = stats?.pendingValue || 0;
  const hasPending = totalPending > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in duration-700 px-4 md:px-8">
      
      {/* 1. Status Principal (Vault Status) - Occupies 2 columns if high importance */}
      <div className={`md:col-span-2 relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-between shadow-lg transition-all group min-h-[200px] md:min-h-[220px] ${
          hasPending ? 'bg-[#b23c0e] text-white' : 'bg-white border border-slate-200 text-slate-800'
      }`}>
          <div className="flex justify-between items-start z-10 relative">
             <div className={`p-3 md:p-4 rounded-2xl ${hasPending ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'}`}>
                {hasPending ? <FileWarning size={24} className="md:w-7 md:h-7" /> : <ShieldCheck size={24} className="md:w-7 md:h-7" />}
             </div>
             {hasPending && <span className="px-3 py-1 bg-white text-[#b23c0e] text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm">Ação Requerida</span>}
          </div>
          
          <div className="z-10 relative space-y-2 mt-4 md:mt-0">
             <h3 className={`text-4xl md:text-5xl font-black tracking-tighter leading-none ${hasPending ? 'text-white' : 'text-slate-900'}`}>
                {totalPending > 0 ? totalPending : stats?.subValue}
             </h3>
             <p className={`text-[10px] md:text-xs font-black uppercase tracking-[3px] ${hasPending ? 'text-white/80' : 'text-slate-400'}`}>
                {hasPending ? t('client.dashboard.pendingActions') : t('client.dashboard.validatedAssets')}
             </p>
          </div>

          {/* Decoration */}
          <ShieldCheck size={180} className={`absolute -right-8 -bottom-10 rotate-12 opacity-[0.05] pointer-events-none ${hasPending ? 'text-white' : 'text-slate-900'}`} />
      </div>

      {/* 2. Última Auditoria (Info Block) */}
      <div className="md:col-span-1 bg-[#081437] text-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group min-h-[160px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-4 md:mb-6 opacity-60">
                <Clock size={18} />
                <span className="text-[9px] font-black uppercase tracking-widest">Último Sync</span>
             </div>
             <p className="text-xl md:text-2xl font-black tracking-tight leading-tight">
               {stats?.lastAnalysis ? new Date(stats.lastAnalysis).toLocaleDateString() : '--/--'}
             </p>
             <p className="text-[10px] text-blue-300 font-bold uppercase mt-1 tracking-wider">Protocolo Vital</p>
          </div>
      </div>

      {/* 3. Acesso Rápido à Biblioteca */}
      <button 
        onClick={() => setSearchParams({ view: 'library' })}
        className="md:col-span-1 bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-between hover:border-blue-500 hover:shadow-xl transition-all group text-left min-h-[160px]"
      >
         <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <LayoutGrid size={20} className="md:w-6 md:h-6" />
         </div>
         <div>
            <h4 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tight">Meus Ativos</h4>
            <div className="flex items-center gap-2 mt-2 text-slate-400 group-hover:text-blue-600 transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-widest">Acessar Vault</span>
                <ArrowUpRight size={14} />
            </div>
         </div>
      </button>

      {/* 4. Lista Recente (Wide Block) */}
      <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-sm">
         <header className="px-6 md:px-8 py-5 md:py-6 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-400"><FileText size={18} /></div>
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-[3px]">{t('client.dashboard.recentHistory')}</h4>
         </header>
         <div className="divide-y divide-slate-50">
            {recentFiles.map(file => (
                <div 
                  key={file.id} 
                  onClick={() => setSearchParams({ view: 'library', folderId: file.parentId || '' })}
                  className="flex items-center justify-between p-5 md:p-6 hover:bg-slate-50 transition-all cursor-pointer group"
                >
                   <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                      <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center font-bold text-[10px] md:text-xs group-hover:bg-[#081437] group-hover:text-white transition-colors shrink-0">
                         {file.type === 'PDF' ? 'PDF' : 'IMG'}
                      </div>
                      <div className="min-w-0">
                         <p className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate">{file.name}</p>
                         <p className="text-[9px] text-slate-400 font-mono mt-0.5">{file.size}</p>
                      </div>
                   </div>
                   <div className="shrink-0 pl-2">
                      <FileStatusBadge status={file.metadata?.status} />
                   </div>
                </div>
            ))}
            {recentFiles.length === 0 && (
                <div className="p-12 text-center text-slate-300">
                    <Lock size={32} className="mx-auto mb-3 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma movimentação recente no Vault.</p>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};
