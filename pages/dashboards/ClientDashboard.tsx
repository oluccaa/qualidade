import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { useAuth } from '../../context/authContext.tsx';
import { fileService } from '../../lib/services/index.ts';
import { DashboardStatsData } from '../../lib/services/interfaces.ts';
import { useTranslation } from 'react-i18next';
import { Clock, FileText, Loader2 } from 'lucide-react';
import { normalizeRole } from '../../types/index.ts';

const FileExplorer = React.lazy(() => import('../../components/features/files/FileExplorer.tsx').then(m => ({ default: m.FileExplorer })));

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const currentView = queryParams.get('view') || 'home';

  const [stats, setStats] = useState<DashboardStatsData>({
    mainValue: 0, subValue: 0, pendingValue: 0, status: 'REGULAR', mainLabel: '', subLabel: ''
  });

  useEffect(() => {
    const role = normalizeRole(user?.role);
    if (user && role !== 'CLIENT') {
      const target = role === 'ADMIN' ? '/admin/dashboard' : '/quality/dashboard';
      navigate(target, { replace: true });
      return;
    }
    if (user) {
      fileService.getDashboardStats(user).then(setStats);
    }
  }, [user, navigate]);

  const KpiCard = ({ icon: Icon, label, value, subtext, color, onClick }: any) => (
    <div onClick={onClick} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
        <Icon size={24} />
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
      <p className="text-[10px] text-slate-500 mt-1 font-bold">{subtext}</p>
    </div>
  );

  return (
    <Layout title={t('menu.dashboard')}>
      <div className="space-y-8 pb-12 animate-in fade-in duration-500">
        {currentView === 'home' ? (
          <>
            <div className="bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h1 className="text-4xl font-black tracking-tighter mb-2">{t('common.goodMorning')}, {user?.name.split(' ')[0]}.</h1>
                <p className="text-slate-400 max-w-md">{t('dashboard.heroDescription')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <KpiCard icon={FileText} label={t('dashboard.kpi.libraryLabel')} value={stats.subValue} subtext={t('dashboard.kpi.activeDocsSubtext')} color="blue" onClick={() => navigate('/client/dashboard?view=files')} />
              <KpiCard icon={Clock} label={t('dashboard.kpi.pendingLabel')} value={stats.pendingValue} subtext={t('dashboard.kpi.awaitingSubtext')} color="orange" onClick={() => navigate('/client/dashboard?view=files&status=PENDING')} />
            </div>
            <div className="bg-white rounded-3xl border h-[600px] overflow-hidden shadow-sm">
               <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-500"/></div>}>
                  <FileExplorer hideToolbar={false} allowUpload={false} />
               </Suspense>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-3xl border min-h-[700px] overflow-hidden shadow-sm">
             <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-blue-500"/></div>}>
                <FileExplorer flatMode={currentView !== 'files'} allowUpload={currentView === 'files'} />
             </Suspense>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ClientDashboard;