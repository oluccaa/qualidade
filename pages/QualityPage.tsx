
import React, { Suspense } from 'react';
import { Layout } from '../components/layout/MainLayout.tsx';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, History, Building2, LayoutDashboard } from 'lucide-react';

const QualityOverview = React.lazy(() => import('../components/features/quality/views/QualityOverview.tsx').then(m => ({ default: m.QualityOverview })));
const QualityAuditLog = React.lazy(() => import('../components/features/quality/views/QualityAuditLog.tsx').then(m => ({ default: m.QualityAuditLog })));
const ClientList = React.lazy(() => import('../components/features/quality/views/ClientList.tsx').then(m => ({ default: m.ClientList })));

const QualityPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = searchParams.get('view') || 'overview';

  const VIEWS = [
    { id: 'overview', label: t('quality.overview'), icon: LayoutDashboard },
    { id: 'clients', label: t('quality.activePortfolio'), icon: Building2 },
    { id: 'audit-log', label: t('quality.myAuditLog'), icon: History },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'overview': return <QualityOverview />;
      case 'clients': return <ClientList onSelectClient={(client) => console.log('Selected client:', client)} />;
      case 'audit-log': return <QualityAuditLog />;
      default: return <QualityOverview />;
    }
  };

  return (
    <Layout title={t('menu.qualityManagement')}>
      <div className="flex flex-col relative w-full gap-8 pb-20">
        
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#b23c0e] rounded-full" />
                  Terminal de Inspeção Técnica
                </h1>
                <p className="text-slate-500 text-[10px] font-semibold ml-4.5 uppercase tracking-[0.2em]">Conformidade Aços Vital</p>
            </div>

            <nav className="bg-slate-100 p-1 rounded-2xl border border-slate-200 inline-flex shadow-inner">
                {VIEWS.map((view) => (
                    <button
                        key={view.id}
                        onClick={() => setSearchParams({ view: view.id })}
                        className={`
                            flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all
                            ${activeView === view.id 
                                ? 'bg-[#081437] text-white shadow-lg' 
                                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}
                        `}
                    >
                        <view.icon size={14} className={activeView === view.id ? 'text-[#b23c0e]' : ''} />
                        {view.label}
                    </button>
                ))}
            </nav>

            <div className="hidden xl:flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                Sistema Operacional
            </div>
        </header>

        <main className="min-h-[calc(100vh-320px)] animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Suspense fallback={<ViewFallback />}>
                {renderView()}
            </Suspense>
        </main>
      </div>
    </Layout>
  );
};

const ViewFallback = () => (
  <div className="flex flex-col items-center justify-center h-96 bg-white rounded-[2rem] border border-dashed border-slate-200">
    <Loader2 className="animate-spin mb-4 text-blue-500" size={32} />
    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 animate-pulse">Sincronizando Módulo...</p>
  </div>
);

export default QualityPage;
