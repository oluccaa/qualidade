
import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { ClientDashboardView } from '../../components/features/client/views/ClientDashboardView.tsx';
import { ClientLibraryView } from '../../components/features/client/views/ClientLibraryView.tsx';
import { QualityPortfolioView } from '../../components/features/quality/views/QualityPortfolioView.tsx';
import { useAuth } from '../../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock } from 'lucide-react';

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
      case 'home': return t('client.portal.title');
      case 'library': return t('client.portal.libraryTitle');
      case 'audit_flow': return t('client.portal.auditTitle');
      default: return t('menu.brand');
    }
  };

  return (
    <Layout 
      title={getPageTitle()}
      clientNav={{
        activeView,
        onViewChange: handleViewChange
      }}
    >
      <div className="flex-1 flex flex-col min-h-0">
        {activeView === 'home' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 md:space-y-8 pb-32 pt-2">
             <div className="px-4 md:px-8">
                <section className="bg-[#081437] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white relative overflow-hidden shadow-2xl border border-white/5 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-[#b23c0e]/10 rounded-full blur-[80px] md:blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 space-y-4 md:space-y-6">
                        <div className="flex flex-wrap items-center gap-3 md:gap-4">
                            <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 rounded-full border border-white/20 text-emerald-300 backdrop-blur-sm">
                                <ShieldCheck size={12} className="text-emerald-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest">{t('client.portal.gatewayActive')}</span>
                            </span>
                            <span className="px-3 py-1 bg-[#b23c0e] rounded-full text-[9px] font-black uppercase tracking-[3px] border border-white/10 shadow-lg shadow-[#b23c0e]/20">{t('roles.CLIENT')}</span>
                        </div>
                        <h1 className="text-3xl md:text-6xl font-black tracking-tighter leading-[1.1] uppercase">
                            {t('common.welcome')}, <br className="md:hidden"/>
                            <span className="text-white/60">{user?.name.split(' ')[0]}.</span>
                        </h1>
                        <div className="flex items-center gap-2 text-slate-400 pt-1">
                            <Lock size={14} />
                            <p className="text-xs md:text-sm font-medium leading-relaxed uppercase tracking-widest">{t('client.portal.exclusiveTerminal')}</p>
                        </div>
                    </div>
                </section>
             </div>
             <ClientDashboardView />
          </div>
        )}

        {activeView === 'library' && (
          <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-500">
            <ClientLibraryView />
          </div>
        )}

        {activeView === 'audit_flow' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 md:px-8 pb-32 pt-2">
              <QualityPortfolioView />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ClientPortal;
