import React, { memo } from 'react';
import { usePartnerDashboard } from '../../partner/hooks/usePartnerDashboard.ts';
import { ShieldCheck, FileText, Clock, FileWarning, ArrowRight, ClipboardCheck, ArrowUpRight } from 'lucide-react';
import { FileStatusBadge } from '../../files/components/FileStatusBadge.tsx';
import { useSearchParams } from 'react-router-dom';

export const ClientDashboardView: React.FC = memo(() => {
  const { stats, recentFiles, isLoading, isLive } = usePartnerDashboard();
  const [, setSearchParams] = useSearchParams();

  if (isLoading) return <ClientDashboardSkeleton />;

  const totalPending = stats?.pendingValue || 0;
  const hasPending = totalPending > 0;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-safe-nav">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* KPI: Pendências -> Navega para Fluxo de Auditoria */}
        <button 
          onClick={() => setSearchParams({ view: 'audit_flow' })}
          className={`group p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border shadow-xl flex flex-col justify-between transition-all relative overflow-hidden text-left active:scale-[0.98] animate-stagger ${
            hasPending ? 'bg-orange-600 border-orange-500 text-white' : 'bg-white border-slate-200'
          }`} style={{ animationDelay: '100ms' }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                hasPending ? 'bg-white text-orange-600' : 'bg-[#132659] text-white'
              }`}>
                <ClipboardCheck size={20} className="md:w-6 md:h-6" />
              </div>
              <ArrowUpRight size={18} className={`transition-opacity ${hasPending ? 'text-white/40 group-hover:opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} />
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-black tracking-tighter">{totalPending}</p>
              <h3 className={`text-[9px] md:text-[10px] font-black uppercase tracking-[2px] mt-2 ${hasPending ? 'text-white/70' : 'text-slate-400'}`}>Ações Pendentes</h3>
            </div>
          </div>
          {hasPending && <FileWarning className="absolute -right-4 -bottom-4 opacity-10 rotate-12 pointer-events-none w-24 h-24 md:w-32 md:h-32" />}
        </button>

        {/* KPI: Validados -> Navega para Biblioteca */}
        <button 
          onClick={() => setSearchParams({ view: 'library' })}
          className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between group relative overflow-hidden text-left active:scale-[0.98] animate-stagger transition-all hover:border-blue-300 hover:shadow-md" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center border border-emerald-100 shadow-inner group-hover:scale-110 transition-transform">
              <ShieldCheck size={20} className="md:w-6 md:h-6" />
            </div>
            <ArrowUpRight size={18} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter">{stats?.subValue || 0}</p>
            <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[2px] text-slate-400 mt-2">Ativos Validados</h3>
          </div>
        </button>

        {/* KPI: Última Auditoria -> Navega para Fluxo de Auditoria (Histórico) */}
        <button 
          onClick={() => setSearchParams({ view: 'audit_flow' })}
          className="bg-[#132659] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group text-left active:scale-[0.98] animate-stagger transition-all hover:shadow-blue-900/30 sm:col-span-2 lg:col-span-1" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 text-blue-400 rounded-xl md:rounded-2xl flex items-center justify-center border border-white/5 shadow-lg group-hover:rotate-12 transition-transform">
              <Clock size={20} className="md:w-6 md:h-6" />
            </div>
            <ArrowUpRight size={18} className="text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="relative z-10">
            <p className="text-xl md:text-2xl font-black tracking-tight leading-none">
              {stats?.lastAnalysis ? new Date(stats.lastAnalysis).toLocaleString('pt-BR', { dateStyle: 'short' }) : '--/--/----'}
            </p>
            <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[2px] text-slate-500 mt-2">Sincronia Vital</h3>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm animate-stagger" style={{ animationDelay: '400ms' }}>
        <header className="px-6 md:px-8 py-4 md:py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            <h4 className="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-[2px] md:tracking-[3px]">Atividade em Tempo Real</h4>
          </div>
          <button 
            onClick={() => setSearchParams({ view: 'library' })}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-slate-100 hover:bg-slate-200 text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest rounded-lg md:rounded-xl transition-all"
          >
            Ver Todos
          </button>
        </header>
        <div className="divide-y divide-slate-50">
          {recentFiles.slice(0, 5).map(file => (
            <div 
              key={file.id} 
              onClick={() => setSearchParams({ view: 'library', folderId: file.parentId || '' })}
              className="flex items-center justify-between p-4 md:p-6 hover:bg-blue-50/30 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3 md:gap-5 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-400 rounded-xl md:rounded-2xl flex items-center justify-center border border-slate-100 shrink-0">
                  <FileText size={18} className="md:w-6 md:h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-tight truncate">{file.name}</p>
                  <div className="mt-1">
                    <FileStatusBadge status={file.metadata?.status} />
                  </div>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const ClientDashboardSkeleton = () => (
    <div className="space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-40 md:h-44 bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] skeleton-shimmer shadow-sm" />
            ))}
        </div>
        <div className="h-80 md:h-96 bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] skeleton-shimmer shadow-sm" />
    </div>
);