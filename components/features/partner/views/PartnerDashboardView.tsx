
import React, { memo } from 'react';
import { usePartnerDashboard } from '../hooks/usePartnerDashboard.ts';
import { ShieldCheck, FileText, Clock, FileWarning, ArrowRight, Loader2, ClipboardCheck, Search, Layers } from 'lucide-react';
import { FileStatusBadge } from '../../files/components/FileStatusBadge.tsx';
import { useSearchParams } from 'react-router-dom';

export const PartnerDashboardView: React.FC = memo(() => {
  const { stats, recentFiles, isLoading } = usePartnerDashboard();
  const [, setSearchParams] = useSearchParams();

  if (isLoading) return <PartnerDashboardSkeleton />;

  const totalPending = stats?.pendingValue || 0;
  const hasPending = totalPending > 0;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* SEÇÃO 1: KPIs CLICÁVEIS */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-4">
            <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
            <h2 className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Ações de Conformidade Requeridas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1: Pendências -> Fluxo */}
            <button 
                onClick={() => setSearchParams({ view: 'audit_flow' })}
                className={`p-8 lg:p-10 rounded-[3.5rem] border-2 transition-all text-left relative overflow-hidden group h-[260px] flex flex-col justify-between
                ${hasPending 
                    ? 'bg-orange-600 border-orange-500 text-white shadow-2xl shadow-orange-600/30 active:scale-[0.97]' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
            >
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 rounded-2xl shadow-xl transition-transform group-hover:scale-110 ${hasPending ? 'bg-white text-orange-600' : 'bg-slate-50 text-slate-300'}`}>
                            <ClipboardCheck size={28} strokeWidth={2.5} />
                        </div>
                    </div>
                    <div>
                        <p className="text-5xl font-black tracking-tighter leading-none">{totalPending}</p>
                        <p className={`text-[11px] font-black uppercase tracking-[2px] mt-3 ${hasPending ? 'text-white' : 'text-slate-400'}`}>
                            {hasPending ? 'Aguardando seu Aceite' : 'Zero Pendências'}
                        </p>
                    </div>
                </div>
                <div className="relative z-10 flex items-center justify-between pt-6 border-t border-current border-opacity-10">
                    <span className="text-[9px] font-black uppercase tracking-[3px]">{hasPending ? 'Resolver Agora' : 'Sistemas OK'}</span>
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
                </div>
                <FileWarning className="absolute -right-8 -bottom-8 opacity-10 rotate-12 pointer-events-none" size={160} />
            </button>

            {/* Card 2: Homologados -> Biblioteca */}
            <button 
                onClick={() => setSearchParams({ view: 'library' })}
                className="bg-white p-8 lg:p-10 rounded-[3.5rem] border-2 border-slate-100 shadow-sm flex flex-col justify-between group h-[260px] hover:border-emerald-500/30 hover:shadow-xl active:scale-[0.97] transition-all text-left"
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 group-hover:scale-110 transition-transform shadow-inner">
                            <ShieldCheck size={28} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">Conformidade</p>
                    </div>
                    <div>
                        <p className="text-5xl font-black text-slate-800 tracking-tighter leading-none">{stats?.subValue || 0}</p>
                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[2px] mt-3">Ativos Homologados</p>
                    </div>
                </div>
                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ver Biblioteca</span>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
            </button>

            {/* Card 3: Última Sync -> Fluxo/Histórico */}
            <button 
                onClick={() => setSearchParams({ view: 'audit_flow' })}
                className="bg-[#132659] p-8 lg:p-10 rounded-[3.5rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group h-[260px] hover:shadow-blue-900/40 active:scale-[0.97] transition-all text-left"
            >
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/10 text-blue-400 rounded-2xl border border-white/5 group-hover:rotate-12 transition-transform shadow-xl">
                            <Clock size={28} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-500">Sincronia</p>
                    </div>
                    <div>
                        <p className="text-3xl font-black tracking-tight leading-none truncate">
                            {stats?.lastAnalysis ? new Date(stats.lastAnalysis).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '--/--'}
                        </p>
                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-[4px] mt-4">Protocolo Vital Cloud</p>
                    </div>
                </div>
                <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Ver Ledger</span>
                    <ArrowRight size={16} className="text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
            </button>
        </div>
      </section>

      {/* SEÇÃO 2: RECENT ACTIVITY */}
      <section className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <header className="px-10 py-10 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-600/20"><Layers size={28} /></div>
             <div>
                <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Ativos Recém-Processados</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-[4px]">Rastreabilidade em tempo real</p>
             </div>
          </div>
          <button 
            onClick={() => setSearchParams({ view: 'library' })}
            className="flex items-center gap-4 px-8 py-4 bg-white border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 text-[10px] font-black text-slate-600 uppercase tracking-[3px] rounded-2xl transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            Acessar Biblioteca <ArrowRight size={16} />
          </button>
        </header>

        <div className="divide-y divide-slate-100">
          {recentFiles.map((file, idx) => (
            <div 
              key={file.id} 
              onClick={() => setSearchParams({ view: 'library', folderId: file.parentId || '' })}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-10 hover:bg-slate-50 transition-all group cursor-pointer animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-8 min-w-0">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center border border-slate-200 group-hover:bg-[#132659] group-hover:text-blue-400 transition-all shrink-0"><FileText size={32} /></div>
                <div className="min-w-0">
                  <p className="text-lg font-black text-slate-800 leading-tight uppercase tracking-tight truncate group-hover:text-blue-600 transition-colors mb-2">{file.name}</p>
                  <div className="flex flex-wrap items-center gap-5">
                    <span className="text-[11px] text-slate-500 font-black font-mono bg-slate-100 px-3 py-1 rounded-lg uppercase tracking-tighter border border-slate-200">{file.size}</span>
                    <FileStatusBadge status={file.metadata?.status} />
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all"><ArrowRight size={24} /></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
});

const PartnerDashboardSkeleton = () => (
    <div className="space-y-12 animate-pulse pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-white border border-slate-100 rounded-[3.5rem] h-[260px] skeleton-shimmer" />
            ))}
        </div>
        <div className="bg-white border border-slate-100 rounded-[3.5rem] h-[500px] skeleton-shimmer" />
    </div>
);
