import React, { Suspense } from 'react';
import { Layout } from '../components/layout/MainLayout.tsx';
import { useAdminPage } from '../features/admin/hooks/useAdminPage.ts';
import { useTranslation } from 'react-i18next';
import { 
  Loader2, 
  Users, 
  Building2, 
  Activity, 
  Settings as SettingsIcon, 
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';

// Lazy loading views
const AdminOverview = React.lazy(() => import('../features/admin/views/AdminOverview.tsx').then(m => ({ default: m.AdminOverview })));
const AdminUsers = React.lazy(() => import('../features/admin/views/AdminUsers.tsx').then(m => ({ default: m.AdminUsers })));
const AdminClients = React.lazy(() => import('../features/admin/views/AdminClients.tsx').then(m => ({ default: m.AdminClients })));
const AdminLogs = React.lazy(() => import('../features/admin/views/AdminLogs.tsx').then(m => ({ default: m.AdminLogs })));
const AdminSettings = React.lazy(() => import('../features/admin/views/AdminSettings.tsx').then(m => ({ default: m.AdminSettings })));

const TabLoading = () => (
  <div className="flex flex-col items-center justify-center h-96 text-slate-400">
    <Loader2 className="animate-spin mb-4 text-blue-500" size={32} />
    <p className="text-[10px] font-black uppercase tracking-[4px]">Sincronizando Módulo...</p>
  </div>
);

const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    activeTab,
    isLoading,
    isSaving,
    setIsSaving,
    adminStats,
    systemStatus,
    setSystemStatus,
    qualityAnalysts,
    changeTab
  } = useAdminPage();

  const tabs = [
    { id: 'overview', label: t('admin.tabs.overview'), icon: LayoutDashboard },
    { id: 'users', label: t('admin.tabs.users'), icon: Users },
    { id: 'clients', label: t('admin.tabs.clients'), icon: Building2 },
    { id: 'logs', label: t('admin.tabs.logs'), icon: Activity },
    { id: 'settings', label: t('admin.tabs.settings'), icon: SettingsIcon },
  ];

  return (
    <Layout title={t('menu.management')}>
      <div className="flex flex-col relative w-full gap-6 pb-20">
        
        {/* Tab Navigation Bar */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm inline-flex w-full overflow-x-auto no-scrollbar sticky top-20 z-30 backdrop-blur-md bg-white/90">
            <div className="flex items-center gap-1 min-w-max w-full">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => changeTab(tab.id)}
                            className={`
                                flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300
                                ${isActive 
                                    ? 'bg-[#0f172a] text-white shadow-lg shadow-slate-900/20 translate-y-[-1px]' 
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}
                            `}
                        >
                            <Icon size={16} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>

        {(isSaving || isLoading) && (
          <div className="fixed top-24 right-1/2 translate-x-1/2 z-[110] bg-slate-900 text-white px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-in fade-in zoom-in-95 duration-300">
            <Loader2 size={14} className="animate-spin text-blue-400" /> 
            {t('common.updatingDatabase')}
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Suspense fallback={<TabLoading />}>
            {activeTab === 'overview' && adminStats && (
                <AdminOverview adminStats={adminStats} />
            )}

            {activeTab === 'users' && (
                <AdminUsers setIsSaving={setIsSaving} />
            )}

            {activeTab === 'clients' && (
                <AdminClients setIsSaving={setIsSaving} qualityAnalysts={qualityAnalysts} />
            )}

            {activeTab === 'logs' && (
                <AdminLogs />
            )}

            {activeTab === 'settings' && systemStatus && (
                <AdminSettings
                systemStatus={systemStatus}
                setSystemStatus={setSystemStatus}
                setIsSaving={setIsSaving}
                />
            )}
            </Suspense>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;