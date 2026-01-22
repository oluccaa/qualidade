
import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClientLayout } from '../../components/layout/ClientLayout.tsx';
import { ClientDashboardView } from '../../components/features/client/views/ClientDashboardView.tsx';
import { ClientLibraryView } from '../../components/features/client/views/ClientLibraryView.tsx';
import { QualityPortfolioView } from '../../components/features/quality/views/QualityPortfolioView.tsx';
import { useAuth } from '../../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, Globe, Terminal } from 'lucide-react';

const ClientPortal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const activeView = searchParams.get('view') || 'home';

  const handleViewChange = useCallback((viewId: string) => {
    setSearchParams(prev => {
      prev.set('view', viewId);
      if (viewId !== 'library') prev.delete('folderId');
      return prev;
    }, { replace: true });
  }, [setSearchParams]);

  const getPageTitle = () => {
    switch (activeView) {
      case 'home': return "Terminal do Parceiro";
      case 'library': return "Repositório de Ativos";
      case 'audit_flow': return "Gestão de Conformidade";
      default: return "Portal Vital";
    }
  };

  return (
    <ClientLayout 
      title={getPageTitle()} 
      activeView={activeView} 
      onViewChange={handleViewChange}
    >
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        {activeView === 'home' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pb-20">
             
             {/* HERO COMPACTADO: Redução de padding e escala de fonte */}
             <section 
                className="bg-[#0f172a] rounded-[2.5rem] p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl border border-white/5 group animate-in fade-in slide-in-from-top-4 duration-700"
                aria-labelledby="hero-title"
             >
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#b23c0e]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-[#b23c0e]/15 transition-all duration-1000" />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="px-4 py-1.5 bg-[#b23c0e] rounded-xl text-[9px] font-black uppercase tracking-[2px] shadow-lg shadow-[#b23c0e]/30 flex items-center gap-2">
                                <ShieldCheck size={12} /> Link B2B Seguro
                            </span>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-emerald-400">
                                <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[9px] font-bold uppercase tracking-[3px]">Ativo</span>
                            </div>
                        </div>
                        <h1 id="hero-title" className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.95] uppercase">
                            {t('common.welcome')},<br/>
                            <span className="text-white/30">{user?.name.split(' ')[0]}.</span>
                        </h1>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[2px] opacity-60">Sua Estação de Certificação Técnica</p>
                    </div>

                    <div className="bg-white/[0.03] backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 flex flex-col gap-4 shadow-xl min-w-[280px]">
                        <div className="flex items-center justify-between">
                             <p className="text-[9px] font-black uppercase text-slate-500 tracking-[2px]">Gateway B2B</p>
                             <Lock size={16} className="text-[#b23c0e] opacity-50" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <p className="text-2xl font-black text-white uppercase tracking-tight leading-none">Status OK</p>
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-[1px] truncate max-w-[200px]">{user?.organizationName}</p>
                        </div>
                    </div>
                </div>
             </section>

             <ClientDashboardView />
          </div>
        )}

        {activeView === 'library' && (
          <div className="flex-1 min-h-0 animate-in fade-in duration-500">
            <ClientLibraryView />
          </div>
        )}

        {activeView === 'audit_flow' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-1">
              <header className="mb-8 flex items-center gap-4">
                 <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Terminal size={20} />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Monitoramento de Fluxo</h2>
                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[3px] mt-0.5">Sincronia física e documental</p>
                 </div>
              </header>
              <QualityPortfolioView />
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
};

export default ClientPortal;
