
import React, { memo } from 'react';
import { AdminStatsData } from '../../../../lib/services/interfaces.ts';
import { AdminStats } from '../components/AdminStats.tsx';

/**
 * AdminOverview View (Real Data Integration)
 * Memoized to prevent heavy re-renders during search/navigation.
 */
export const AdminOverview: React.FC<{ stats: AdminStatsData | null }> = memo(({ stats }) => {
  if (!stats) return <AdminOverviewSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <AdminStats 
        usersCount={stats.totalUsers}
        activeUsersCount={stats.activeUsers}
        clientsCount={stats.activeClients}
        logsCount={stats.logsLast24h}
      />

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex items-center justify-between">
          <div className="space-y-1">
              <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Status da Governança</h4>
              <p className="text-xs text-blue-700 font-medium italic opacity-70">Sincronia real-time com ledger industrial.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Core OK</span>
          </div>
      </div>
    </div>
  );
});

const AdminOverviewSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2.5rem] h-32 flex flex-col justify-center space-y-4">
                <div className="h-2 w-20 bg-slate-100 rounded-full skeleton-shimmer" />
                <div className="h-8 w-32 bg-slate-50 rounded-lg skeleton-shimmer" />
            </div>
        ))}
    </div>
);
