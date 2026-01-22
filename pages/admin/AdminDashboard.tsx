import React, { useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { useAuth } from '../../context/authContext.tsx';
import { useAdminPage } from '../../components/features/admin/hooks/useAdminPage.ts';
import { useTranslation } from 'react-i18next';
import { Users, ShieldCheck, Activity, ArrowRight, Terminal, Radio, ArrowUpRight } from 'lucide-react';
import { AdminOverview } from '../../components/features/admin/views/AdminOverview.tsx';
import { normalizeRole, UserRole } from '../../types/index.ts';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { adminStats, isLoading, systemStatus, isLive } = useAdminPage();

  useEffect(() => {
    const role = normalizeRole(user?.role);
    if (user && role !== UserRole.ADMIN) {
      navigate('/quality/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <Layout title="Governança Master">
      <article className="space-y-8 pb-16">
        
        {/* HERO COMPACTADO */}
        <section 
          className="bg-[#0f172a] rounded-[2.5rem] p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl border border-white/5 group"
          aria-labelledby="hero-title"
        >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="px-4 py-1.5 bg-blue-600 rounded-xl text-[9px] font-black uppercase tracking-[2px] shadow-lg shadow-blue-500/30 flex items-center gap-2">
                           <Terminal size={12} /> Root Engine
                        </span>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-500 ${isLive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
                            <Radio size={12} className={isLive ? 'animate-pulse' : ''} />
                            <span className="text-[9px] font-bold uppercase tracking-[3px]">{isLive ? 'Live Sync' : 'Reconectando'}</span>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="h-12 w-64 bg-white/5 rounded-2xl skeleton-shimmer" />
                    ) : (
                        <h1 id="hero-title" className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.95] uppercase">
                            Gestão Global,<br/>
                            <span className="text-white/30">{user?.name.split(' ')[0]}.</span>
                        </h1>
                    )}
                </div>

                <div className="bg-white/[0.03] backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 flex items-center gap-6 shadow-xl min-w-[280px]">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${systemStatus?.mode === 'ONLINE' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-orange-500 animate-pulse'}`} />
                    <div>
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-[2px] mb-1">Status Gateway</p>
                        <p className="text-2xl font-black text-white uppercase tracking-tight leading-none">{systemStatus?.mode || 'OFF'}</p>
                        <p className="text-[8px] text-slate-400 font-bold mt-2 uppercase tracking-[1px]">Cluster v4.2.0-stable</p>
                    </div>
                </div>
            </div>
        </section>

        {/* INDICADORES OPERACIONAIS */}
        <section className="space-y-4">
             <div className="flex items-center gap-3 ml-2">
                <div className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-blue-600 animate-pulse' : 'bg-slate-400'}`} />
                <h2 className="text-[9px] font-black uppercase tracking-[4px] text-slate-400">Infraestrutura B2B</h2>
            </div>
            <AdminOverview stats={adminStats} />
        </section>

        {/* COMANDOS GRID */}
        <section className="space-y-6">
            <div className="flex items-center gap-3 ml-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                <h2 className="text-[9px] font-black uppercase tracking-[4px] text-slate-400">Terminais de Comando</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <CommandCard icon={Users} label="Identidades" desc="Governança de acessos parceiros." path="/admin/console?tab=users" variant="navy" navigate={navigate} />
                <CommandCard icon={Activity} label="Auditoria" desc="Rastreabilidade no Ledger Vital." path="/admin/console?tab=logs" variant="white" navigate={navigate} />
                <CommandCard icon={ShieldCheck} label="Gateway" desc="Controle de firewall e manutenção." path="/admin/console?tab=settings" variant="white" navigate={navigate} />
            </div>
        </section>
      </article>
    </Layout>
  );
};

const CommandCard = memo(({ icon: Icon, label, desc, path, variant, navigate }: any) => {
  const isNavy = variant === 'navy';
  return (
    <button 
        onClick={() => navigate(path)} 
        className={`group flex flex-col justify-between p-8 rounded-[2.5rem] transition-all text-left relative overflow-hidden h-[240px] border-2 active:scale-[0.98]
            ${isNavy 
                ? 'bg-[#0f172a] border-slate-800 text-white shadow-xl hover:border-blue-500/50' 
                : 'bg-white border-slate-100 text-slate-900 hover:border-blue-600 hover:shadow-lg'}`}
    >
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-md
                    ${isNavy ? 'bg-blue-600 text-white' : 'bg-slate-50 text-blue-600 border border-slate-100'}`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <ArrowUpRight size={20} className={`transition-opacity opacity-0 group-hover:opacity-100 ${isNavy ? 'text-white/20' : 'text-slate-200'}`} />
            </div>
            <h3 className="font-black text-xl uppercase tracking-tighter leading-none mb-2">{label}</h3>
            <p className={`text-[10px] font-bold uppercase tracking-widest leading-tight opacity-60`}>{desc}</p>
        </div>
        
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-current border-opacity-10">
            <span className="text-[9px] font-black uppercase tracking-[2px]">Acessar Terminal</span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
        </div>

        <Icon size={120} className={`absolute -right-10 -bottom-10 opacity-[0.03] rotate-12 transition-transform group-hover:scale-110 pointer-events-none ${isNavy ? 'text-white' : 'text-slate-900'}`} />
    </button>
  );
});

export default AdminDashboard;