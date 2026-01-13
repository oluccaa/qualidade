import React, { Suspense } from 'react';
import { Layout } from '../components/layout/MainLayout.tsx';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Loader2, 
  BarChart3, 
  Building2, 
  History, 
  ShieldCheck,
  Search
} from 'lucide-react';

// Lazy loading views
const QualityOverview = React.lazy(() => import('../features/quality/views/QualityOverview.tsx').then(m => ({ default: m.QualityOverview })));
const ClientList = React.lazy(() => import('../features/quality/views/ClientList.tsx').then(m => ({ default: m.ClientList })));
const QualityAuditLog = React.lazy(() => import('../features/quality/views/QualityAuditLog.tsx').then(m => ({ default: m.QualityAuditLog })));

const TabLoading = () => (
  <div className="flex flex-col items-center justify-center h-96 text-slate-400">
    <Loader2 className="animate-spin mb-4 text-blue-500" size={32} />
    <p className="text-[10px] font-black uppercase tracking-[4px]">Carregando Inteligência...</p>
  </div>
);

const QualityPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = searchParams.get('view') || 'overview';

  const views = [
    { id: 'overview', label: t('quality.overview'), icon: BarChart3 },
    { id: 'clients', label: t('quality.b2bPortfolio'), icon: Building2 },
    { id: 'audit-log', label: t('quality.myAuditLog'), icon: History },
  ];

  const handleViewChange = (viewId: string) => {
    setSearchParams({ view: viewId });
  };

  const renderView = () => {
    switch (activeView) {
      case 'overview': return <QualityOverview />;
      case 'clients': return <ClientList onSelectClient={(c) => setSearchParams({ view: 'files', clientId: c.id })} />;
      case 'audit-log': return <QualityAuditLog />;
      default: return <QualityOverview />;
    }
  };

  return (
    <Layout title={t('menu.qualityManagement')}>
      <div className="flex flex-col relative w-full gap-6 pb-20">
        
        {/* Header de Visualização Técnica */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 inline-flex shadow-inner">
                {views.map((view) => {
                    const isActive = activeView === view.id;
                    const Icon = view.icon;
                    return (
                        <button
                            key={view.id}
                            onClick={() => handleViewChange(view.id)}
                            className={`
                                flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all
                                ${isActive 
                                    ? 'bg-white text-blue-600 shadow-md translate-y-[-1px]' 
                                    : 'text-slate-500 hover:text-slate-800'}
                            `}
                        >
                            <Icon size={14} />
                            {view.label}
                        </button>
                    );
                })}
            </div>

            {activeView === 'clients' && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase bg-white px-4 py-2 rounded-xl border border-slate-200">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    Auditoria de Conformidade Ativa
                </div>
            )}
        </div>

        <div className="min-h-[calc(100vh-250px)] animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Suspense fallback={<TabLoading />}>
                {renderView()}
            </Suspense>
        </div>
      </div>
    </Layout>
  );
};

export default QualityPage;