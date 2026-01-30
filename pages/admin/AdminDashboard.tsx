
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { useAuth } from '../../context/authContext.tsx';
import { useAdminPage } from '../../components/features/admin/hooks/useAdminPage.ts';
import { useTranslation } from 'react-i18next';
import { Loader2, Users, ShieldCheck, Activity, ArrowRight, Terminal } from 'lucide-react';
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
        <div className="flex-1 h-full min-h-[60vh] flex flex-col items-center justify-center text-slate-500 gap-6" role="status" aria-busy="true">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-xs font-black uppercase tracking-[6px] animate-pulse">Sincronizando Protocolos...</p>
        </div>
    </Layout>
  );

  return (
    <Layout title="Dashboard de Governança">
      <article className="space-y-10 pb-16 px-6 md:px-8">
        
        {/* Header Compacto (o Hero agora é parte do Bento Grid em AdminOverview) */}
        <header className="flex items-center gap-4 px-1">
            <div className="p-3 bg-[#0f172a] text-white rounded-2xl shadow-lg">
                <Terminal size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Command Center</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Visão Global • {user?.name.split(' ')[0]}
                </p>
            </div>
        </header>

        {/* Grid Principal */}
        <section aria-labelledby="kpi-title">
            <AdminOverview stats={adminStats} />
        </section>

        {/* Atalhos Operacionais (Bento Style) */}
        <section className="space-y-6">
            <div className="flex items-center gap-4 ml-2">
                <div className="h-[3px] w-10 bg-slate-900 rounded-full" aria-hidden="true"></div>
                <h2 className="text-xs font-black uppercase tracking-[5px] text-slate-400">Acesso Rápido</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuickAction icon={Users} label="Identidades" desc="Gestão de Acessos" path="/admin/console?tab=users" color="bg-blue-600" navigate={navigate} />
                <QuickAction icon={Activity} label="Auditoria" desc="Logs Forenses" path="/admin/console?tab=logs" color="bg-slate-900" navigate={navigate} />
                <QuickAction icon={ShieldCheck} label="Gateway" desc="Segurança" path="/admin/console?tab=settings" color="bg-emerald-600" navigate={navigate} />
            </div>
        </section>
      </article>
    </Layout>
  );
};

const QuickAction = ({ icon: Icon, label, desc, path, color, navigate }: any) => (
  <button 
    onClick={() => navigate(path)} 
    className="flex items-center gap-5 p-5 bg-white border border-slate-200 rounded-[2rem] hover:border-slate-300 hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
  >
    <div className={`p-4 rounded-2xl ${color} text-white shrink-0 shadow-lg`}>
        <Icon size={20} strokeWidth={2.5} />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">{label}</h3>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide opacity-70">{desc}</p>
    </div>
    <ArrowRight size={18} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
  </button>
);

export default AdminDashboard;
