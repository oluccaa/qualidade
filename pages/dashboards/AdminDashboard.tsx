import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { useAuth } from '../../context/authContext.tsx';
import { useAdminPage } from '../../features/admin/hooks/useAdminPage.ts';
import { useTranslation } from 'react-i18next';
import { 
  Loader2, 
  Users, 
  ShieldCheck, 
  Activity, 
  ArrowRight,
  Zap,
  Lock,
  Building2,
  FileText,
  Server,
  Database
} from 'lucide-react';
import { AdminOverview } from '../../features/admin/views/AdminOverview.tsx';
import { normalizeRole } from '../../types/index.ts';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { adminStats, isLoading, systemStatus } = useAdminPage();

  useEffect(() => {
    const role = normalizeRole(user?.role);
    if (user && role !== 'ADMIN') {
      const target = role === 'QUALITY' ? '/quality/dashboard' : '/client/dashboard';
      navigate(target, { replace: true });
    }
  }, [user, navigate]);

  const QuickAction = ({ icon: Icon, label, description, path, color }: any) => (
    <button 
      onClick={() => navigate(path)}
      className="flex items-start gap-4 p-6 bg-white border border-slate-200 rounded-3xl hover:border-[#62A5FA] hover:shadow-2xl hover:shadow-blue-500/10 transition-all text-left group"
    >
      <div className={`p-4 rounded-2xl ${color} text-white shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-black text-[#081437] text-sm uppercase tracking-wider">{label}</h4>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{description}</p>
      </div>
      <ArrowRight size={18} className="text-slate-300 group-hover:text-[#62A5FA] group-hover:translate-x-1 transition-all" />
    </button>
  );

  return (
    <Layout title="Command Center">
      <div className="space-y-8 pb-12 animate-in fade-in duration-1000">
        
        {/* Banner de Controle Global */}
        <div className="bg-[#081437] rounded-[2rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#62A5FA]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#B23C0E]/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-[#62A5FA] rounded-full text-[9px] font-black uppercase tracking-[3px] shadow-lg shadow-blue-500/40">Root Engine</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px]">{t('dashboard.status.monitoringActive')}</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter leading-none">
                        Gestão Global,<br/>
                        <span className="text-slate-400">{user?.name.split(' ')[0]}.</span>
                    </h1>
                </div>
                
                <div className="flex flex-col gap-3">
                    <div className="bg-white/5 backdrop-blur-2xl p-5 rounded-[1.5rem] border border-white/10 flex items-center gap-4">
                        <div className={`w-3.5 h-3.5 rounded-full ${systemStatus?.mode === 'ONLINE' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-[#B23C0E] animate-pulse'} `}></div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-slate-500 tracking-[2px]">Gateway Status</p>
                            <p className="text-xs font-bold text-white mt-1 uppercase tracking-widest">{systemStatus?.mode || 'SYNCING...'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {isLoading ? (
          <div className="flex h-96 flex-col items-center justify-center text-slate-400 gap-6">
            <Loader2 className="animate-spin text-[#62A5FA]" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[6px] animate-pulse">Sincronizando Console de Gestão...</p>
          </div>
        ) : (
          <>
            <AdminOverview adminStats={adminStats} />

            <div className="space-y-6">
                <div className="flex items-center gap-4 ml-1">
                    <div className="h-[2px] w-8 bg-[#62A5FA]"></div>
                    <h3 className="text-[10px] font-black uppercase tracking-[5px] text-slate-400">
                        Ações Críticas de Infraestrutura
                    </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <QuickAction 
                        icon={Users} 
                        label="Usuários" 
                        description="Gestão de identidades e níveis de acesso granular." 
                        path="/admin?tab=users" 
                        color="bg-gradient-to-br from-blue-600 to-blue-800"
                    />
                    <QuickAction 
                        icon={Building2} 
                        label="Clientes" 
                        description="Administração do portfólio de empresas B2B." 
                        path="/admin?tab=clients" 
                        color="bg-gradient-to-br from-indigo-600 to-indigo-800"
                    />
                    <QuickAction 
                        icon={Activity} 
                        label="Auditoria" 
                        description="Logs forenses de todas as ações no sistema." 
                        path="/admin?tab=logs" 
                        color="bg-gradient-to-br from-slate-700 to-slate-900"
                    />
                    <QuickAction 
                        icon={ShieldCheck} 
                        label="Segurança" 
                        description="Configurações de modo manutenção e firewall." 
                        path="/admin?tab=settings" 
                        color="bg-gradient-to-br from-emerald-600 to-emerald-800"
                    />
                </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;