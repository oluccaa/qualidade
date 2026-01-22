import React from 'react';
import { usePartnerDashboard } from '../hooks/usePartnerDashboard.ts';
import { ShieldCheck, FileText, Clock, FileWarning, ArrowRight, Loader2, ClipboardCheck, Info } from 'lucide-react';
import { FileStatusBadge } from '../../files/components/FileStatusBadge.tsx';
import { useSearchParams } from 'react-router-dom';

export const PartnerDashboardView: React.FC = () => {
  const { stats, recentFiles, isLoading } = usePartnerDashboard();
  const [, setSearchParams] = useSearchParams();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="metadata-label text-slate-400">Sincronizando Vault Vital...</p>
      </div>
    );
  }

  const totalPending = stats?.pendingValue || 0;
  const hasPending = totalPending > 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8" aria-label="Estatísticas do Meu Terminal">
        {/* Card: Status de Auditoria do Parceiro */}
        <article 
          className={`p-7 rounded-[2.5rem] border shadow-xl flex flex-col justify-between transition-all relative overflow-hidden group ${
            hasPending ? 'bg-[#b23c0e] border-orange-400 text-white' : 'bg-white border-slate-200'
          }`}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                hasPending ? 'bg-white text-[#b23c0e]' : 'bg-[#0f172a] text-white'
              }`}>
                <ClipboardCheck size={28} />
              </div>
              <div>
                  <h3 className={`metadata-label ${hasPending ? 'text-white/80' : 'text-slate-500'}`}>Ações Pendentes</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-tight ${hasPending ? 'text-white/60' : 'text-slate-400'}`}>Requer Conferência</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-black tracking-tighter" aria-live="polite">{totalPending}</span>
            </div>
          </div>
          {hasPending && (
              <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12 pointer-events-none" aria-hidden="true">
                  <FileWarning size={140} />
              </div>
          )}
        </article>

        <article className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between group relative overflow-hidden">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-inner group-hover:scale-110 transition-transform" aria-hidden="true">
              <ShieldCheck size={28} />
            </div>
            <div>
                <h3 className="metadata-label text-slate-500">Validados</h3>
                <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400">Ativos em Dia</p>
            </div>
          </div>
          <div>
            <span className="text-5xl font-black text-slate-900 tracking-tighter" aria-live="polite">{stats?.subValue || 0}</span>
            <p className="text-[11px] text-emerald-700 font-black uppercase mt-2 tracking-widest">Protocolos Conformados</p>
          </div>
        </article>

        <article className="bg-[#0f172a] p-7 rounded-[2.5rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" aria-hidden="true" />
          <div className="flex items-center gap-4 mb-5 relative z-10">
            <div className="w-14 h-14 bg-white/10 text-blue-400 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg group-hover:rotate-12 transition-transform" aria-hidden="true">
              <Clock size={28} />
            </div>
            <div>
                <h3 className="metadata-label text-blue-300">Sincronização</h3>
                <p className="text-[10px] font-bold uppercase tracking-tight text-slate-500">Core Industrial</p>
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-2xl font-black tracking-tight block truncate" aria-live="polite">
              {stats?.lastAnalysis ? new Date(stats.lastAnalysis).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Sincronizando...'}
            </span>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-[3px]">Protocolo Vital SGQ v4.2</p>
          </div>
        </article>
      </section>

      <section className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm" aria-labelledby="recent-title">
        <header className="px-10 py-7 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" aria-hidden="true" />
             <h2 id="recent-title" className="text-sm font-black text-slate-800 uppercase tracking-[3px]">Arquivos Recebidos Recentemente</h2>
          </div>
          <button 
            onClick={() => setSearchParams({ view: 'library' })}
            className="px-6 py-2.5 bg-white hover:bg-slate-100 text-[10px] font-black text-slate-700 uppercase tracking-widest rounded-xl border border-slate-200 transition-all shadow-sm active:scale-95"
            aria-label="Acessar todos os arquivos da biblioteca"
          >
            Acessar Biblioteca
          </button>
        </header>
        
        <div className="divide-y divide-slate-100">
          {recentFiles.map(file => (
            <div 
              key={file.id} 
              role="button"
              tabIndex={0}
              onClick={() => setSearchParams({ view: 'library', folderId: file.parentId || '' })}
              onKeyDown={(e) => e.key === 'Enter' && setSearchParams({ view: 'library', folderId: file.parentId || '' })}
              className="flex items-center justify-between p-8 hover:bg-blue-50/30 transition-all group cursor-pointer"
              aria-label={`Ver arquivo: ${file.name}. Status: ${file.metadata?.status || 'Pendente'}`}
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center border border-slate-200 group-hover:bg-[#0f172a] group-hover:text-blue-400 transition-all shadow-sm" aria-hidden="true">
                  <FileText size={26} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800 leading-tight uppercase tracking-tight">{file.name}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[11px] text-slate-500 font-bold font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{file.size}</span>
                    <FileStatusBadge status={file.metadata?.status} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hidden md:inline">Auditar Ativo</span>
                  <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" aria-hidden="true" />
              </div>
            </div>
          ))}
          {recentFiles.length === 0 && (
            <div className="py-24 text-center text-slate-400">
              <ShieldCheck size={56} className="mx-auto mb-6 opacity-10" aria-hidden="true" />
              <p className="text-sm font-bold uppercase tracking-widest">Sem movimentações recentes no Vault.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};