
import React from 'react';
import { Users, Building2, Activity, Zap, Server, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  color: 'blue' | 'indigo' | 'orange' | 'emerald';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, icon: Icon, color }) => {
    const colorMap = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', dot: 'bg-blue-500' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', dot: 'bg-indigo-500' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', dot: 'bg-orange-500' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-500' }
    };
    const c = colorMap[color];

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className={`absolute -right-4 -top-4 transform scale-150 transition-all opacity-[0.03] group-hover:opacity-10 ${c.text}`}>
                <Icon size={120} />
            </div>
            <div className="relative z-10 space-y-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${c.bg} ${c.text}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{value}</h3>
                    <p className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mt-2">{label}</p>
                </div>
                {subtext && (
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`}></span>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{subtext}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

interface AdminStatsProps {
    usersCount: number;
    activeUsersCount: number;
    clientsCount: number;
    logsCount: number;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ usersCount, activeUsersCount, clientsCount, logsCount }) => {
    const { t } = useTranslation();
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StatCard 
                label={t('admin.stats.totalUsers')} 
                value={usersCount} 
                subtext={`${activeUsersCount} ${t('common.statusActive')}`}
                icon={Users} color="blue" 
            />
            <StatCard 
                label={t('admin.stats.organizations')} 
                value={clientsCount} 
                subtext={t('admin.stats.activeClientsSummary', { count: clientsCount })}
                icon={Building2} color="indigo" 
            />
            <StatCard 
                label={t('admin.stats.activities')} 
                value={logsCount > 999 ? '999+' : logsCount} 
                subtext={t('admin.stats.logsLast24hSummary', { count: logsCount })}
                icon={Activity} color="orange" 
            />
        </div>
    );
};
