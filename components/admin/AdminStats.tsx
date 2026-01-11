
import React from 'react';
import { Users, Building2, LifeBuoy, Activity, CheckCircle2, Cpu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
        <div className={`absolute -right-6 -top-6 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity text-${color}-600 transform scale-150`}>
            <Icon size={120} />
        </div>
        <div className="relative z-10 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center shrink-0`}>
                <Icon size={24} />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">{value}</h3>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">{label}</p>
            </div>
        </div>
        {subtext && (
            <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full bg-${color}-500`}></span>
                    {subtext}
                </p>
            </div>
        )}
    </div>
);

const ProgressBar: React.FC<{ percentage: number, color?: string }> = ({ percentage, color = "blue" }) => (
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div 
            className={`h-full rounded-full transition-all duration-500 bg-${color}-500`} 
            style={{ width: `${percentage}%` }}
        />
    </div>
);

interface AdminStatsProps {
    usersCount: number;
    activeUsersCount: number;
    clientsCount: number;
    ticketsCount: number;
    logsCount: number;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ usersCount, activeUsersCount, clientsCount, ticketsCount, logsCount }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard 
                    label={t('admin.stats.totalUsers')} 
                    value={usersCount} 
                    subtext={`${activeUsersCount} ${t('dashboard.active')}`}
                    icon={Users} color="blue" 
                />
                <StatCard 
                    label={t('admin.stats.organizations')} 
                    value={clientsCount} 
                    subtext={t('admin.stats.b2bContracts')}
                    icon={Building2} color="indigo" 
                />
                <StatCard 
                    label={t('admin.tabs.tickets')} 
                    value={ticketsCount}
                    subtext="Chamados Abertos"
                    icon={LifeBuoy} color="red" 
                />
                <StatCard 
                    label={t('admin.stats.activities')} 
                    value={logsCount > 99 ? '99+' : logsCount} 
                    subtext={t('admin.stats.loggedActions')}
                    icon={Activity} color="orange" 
                />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Cpu size={20} className="text-emerald-500" /> {t('admin.stats.systemHealth')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                            <span>{t('admin.stats.cpuLoad')}</span>
                            <span>24%</span>
                        </div>
                        <ProgressBar percentage={24} color="emerald" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                            <span>{t('admin.stats.memoryUsage')}</span>
                            <span>58%</span>
                        </div>
                        <ProgressBar percentage={58} color="blue" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                            <span>{t('admin.stats.dbConnections')}</span>
                            <span>8/50</span>
                        </div>
                        <ProgressBar percentage={16} color="purple" />
                    </div>
                </div>
                <div className="mt-6 p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 flex items-center gap-2">
                    <CheckCircle2 size={16} /> {t('admin.stats.allOperational')}
                </div>
            </div>
        </div>
    );
};
