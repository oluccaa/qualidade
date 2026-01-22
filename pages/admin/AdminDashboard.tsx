
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { useAuth } from '../../context/authContext.tsx';
import { useAdminPage } from '../../components/features/admin/hooks/useAdminPage.ts';
import { useTranslation } from 'react-i18next';
import { Loader2, Users, ShieldCheck, Activity, ArrowRight } from 'lucide-react';
import { AdminOverview } from '../../components/features/admin/views/AdminOverview.tsx';
import { normalizeRole, UserRole } from '../../types/index.ts';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { adminStats, isLoading, systemStatus } = useAdminPage();

  useEffect(() => {
    const role = normalizeRole(user?.role);
    if (user && role !== UserRole.ADMIN) {
      navigate('/quality/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (isLoading) return (
    <Layout title="Governança Master">
        <div className="flex h-96 flex-col items-center justify-center text-slate-500 gap-6" role="status" aria-busy="true">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-xs font-black uppercase tracking-[6px] animate-pulse">Sincronizando Protocolos...</p>
        </div>
    </Layout>
  );

  return (
    <Layout title="Dashboard de Governança">
      <article className="space-y-10 pb-16">
        {/* Hero Section - Foco em contraste e tamanho de fonte */}
        <section 
          className="bg-[#0f172a] rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl border border-white/5"
          aria-labelledby="hero-title"
        >
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <span className="px-4 py-1.5 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-[3px] shadow-lg shadow-blue-500/20">Root Engine</span>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[4px]">{t('dashboard.status.monitoringActive')}</span>
                    </div>
                    <h1 id="hero-title" className="text-5xl md:text-7xl font-black tracking-tighter leading-none uppercase">
                        Gestão Global,<br/>
                        <span className="text-white/40">{user?.name.split(' ')[0]}.</span>
                    </h1>
                </div>
                <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 flex items-center gap-6 shadow-2xl">
                    <div 
                      className={`w-4 h-4 rounded-full ${systemStatus?.mode === 'ONLINE' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-orange-500 animate-pulse shadow-orange-500/50'} shadow-lg`}
                      aria-hidden="true"
                    ></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[3px]">Gateway de Segurança</p>
                        <p className="text-lg font-black text-white mt-1 uppercase tracking-widest">{systemStatus?.mode || 'Sincronizando...'}</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Indicadores Seção */}
        <section className="space-y-6" aria-labelledby="kpi-title">
             <div className="flex items-center gap-4 ml-2">
                <div className="h-[3px] w-10 bg-blue-600 rounded-full" aria-hidden="true"></div>
                <h2 id="kpi-title" className="text-xs font-black uppercase tracking-[5px] text-slate-500">Métricas de Infraestrutura</h2>
            </div>
            <AdminOverview stats={adminStats} />
        </section>

        {/* Atalhos Seção */}
        <section className="space-y-8" aria-labelledby="actions-title">
            <div className="flex items-center gap-4 ml-2">
                <div className="h-[3px] w-10 bg-orange-600 rounded-full" aria-hidden="true"></div>
                <h2 id="actions-title" className="text-xs font-black uppercase tracking-[5px] text-slate-500">Comandos Operacionais</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <QuickAction icon={Users} label="Gestão de Identidades" desc="Controle níveis de acesso de parceiros e analistas." path="/admin/console?tab=users" color="bg-blue-600" navigate={navigate} />
                <QuickAction icon={Activity} label="Auditoria Forense" desc="Rastreabilidade completa de todas as ações no sistema." path="/admin/console?tab=logs" color="bg-slate-900" navigate={navigate} />
                <QuickAction icon={ShieldCheck} label="Gateway de Segurança" desc="Controle de manutenção e firewall do portal." path="/admin/console?tab=settings" color="bg-emerald-600" navigate={navigate} />
            </div>
        </section>
      </article>
    </Layout>
  );
};

const QuickAction = ({ icon: Icon, label, desc, path, color, navigate }: any) => (
  <button 
    onClick={() => navigate(path)} 
    aria-label={`${label}: ${desc}`}
    className="flex items-start gap-6 p-8 bg-white border border-slate-200 rounded-[2.5rem] hover:border-blue-600 hover:shadow-2xl transition-all text-left group focus-visible:ring-4 focus-visible:ring-blue-600/20 outline-none"
  >
    <div className={`p-5 rounded-2xl ${color} text-white shrink-0 group-hover:scale-110 transition-transform shadow-xl`}>
        <Icon size={26} strokeWidth={2.5} />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-black text-[#0f172a] text-lg uppercase tracking-tight leading-none mb-2">{label}</h3>
      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold uppercase tracking-tight opacity-70">{desc}</p>
    </div>
    <ArrowRight size={22} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-2 transition-all mt-1" aria-hidden="true" />
  </button>
);

export default AdminDashboard;
