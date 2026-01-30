
import React from 'react';
import { Loader2, ShieldCheck, Activity, Server, Globe } from 'lucide-react';
import { AdminStatsData } from '../../../../lib/services/interfaces.ts';
import { AdminStats } from '../components/AdminStats.tsx';

export const AdminOverview: React.FC<{ stats: AdminStatsData | null }> = ({ stats }) => {
  if (!stats) return <LoadingOverview />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in duration-700">
      
      {/* Bloco 1: Stats Principais (Espalhados no Grid) */}
      <AdminStats 
        usersCount={stats.totalUsers}
        activeUsersCount={stats.activeUsers}
        clientsCount={stats.activeClients}
        logsCount={stats.logsLast24h}
      />

      {/* Bloco 2: System Health (Vertical Alto) */}
      <div className="md:col-span-1 lg:row-span-2 bg-emerald-500 text-white p-6 rounded-[2.5rem] relative overflow-hidden shadow-xl shadow-emerald-500/20 group">
         <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700"><ShieldCheck size={120} /></div>
         <div className="h-full flex flex-col justify-between relative z-10">
            <div className="p-3 bg-white/20 w-fit rounded-2xl backdrop-blur-md"><Server size={24} /></div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[3px]">System Status</p>
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight leading-none">Nominal &<br/>Secure.</h3>
                <p className="text-xs font-medium text-emerald-100 leading-relaxed pt-2 opacity-90">
                    Todos os gateways de segurança operando com 99.9% de uptime. Criptografia ativa.
                </p>
            </div>
         </div>
      </div>

      {/* Bloco 3: Governança (Horizontal Largo) */}
      <div className="md:col-span-2 lg:col-span-3 bg-white border border-slate-200 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <Globe size={32} />
              </div>
              <div className="space-y-1">
                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Governança Global</h4>
                  <p className="text-xs text-slate-500 font-medium max-w-md">
                      Indicadores sincronizados em tempo real com o banco de dados de produção (Supabase).
                  </p>
              </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              <Activity size={16} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Live Sync</span>
          </div>
      </div>
    </div>
  );
};

const LoadingOverview = () => (
  <div className="flex-1 w-full min-h-[400px] bg-white border border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4">
    <Loader2 size={32} className="animate-spin text-blue-600" />
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Sincronizando Command Center...</p>
  </div>
);
