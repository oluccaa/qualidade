
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AdminStats } from '../components/AdminStats.tsx';
import { AdminStatsData } from '../../../lib/services/interfaces.ts';
import { Activity, Database, Server, ShieldCheck, Zap } from 'lucide-react';

interface AdminOverviewProps {
  adminStats: AdminStatsData | null;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ adminStats }) => {
  const { t } = useTranslation();

  if (!adminStats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPIs Principais */}
      <AdminStats
        usersCount={adminStats.totalUsers}
        activeUsersCount={adminStats.activeUsers}
        clientsCount={adminStats.activeClients}
        logsCount={adminStats.logsLast24h}
      />

      {/* Saúde da Infraestrutura */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Server size={18} className="text-blue-600" /> Performance do Cluster
            </h3>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md border border-emerald-100 uppercase">Estável</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Processamento (CPU)</span>
                <span>{adminStats.cpuUsage}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${adminStats.cpuUsage > 80 ? 'bg-red-500' : 'bg-blue-500'}`} 
                  style={{ width: `${adminStats.cpuUsage}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Memória RAM</span>
                <span>{adminStats.memoryUsage}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-1000" 
                  style={{ width: `${adminStats.memoryUsage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Database size={18} className="text-orange-600" /> Banco de Dados (Supabase)
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Conexões Ativas</p>
              <p className="text-2xl font-black text-slate-800">{adminStats.dbConnections}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Limite do Pool</p>
              <p className="text-2xl font-black text-slate-800">{adminStats.dbMaxConnections}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
             <Zap size={16} className="text-blue-600" />
             <p className="text-[10px] font-medium text-blue-700">Otimização de índices concluída com sucesso nas últimas 24h.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
