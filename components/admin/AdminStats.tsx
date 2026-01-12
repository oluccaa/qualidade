
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

const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, icon: Icon, color }) => {
    // Mapeamento de cores seguro
    const getColors = (c: string) => {
        switch(c) {
            case 'blue': return { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-600/10', circle: 'bg-blue-500' };
            case 'indigo': return { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'text-indigo-600/10', circle: 'bg-indigo-500' };
            case 'red': return { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-600/10', circle: 'bg-red-500' };
            case 'orange': return { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-600/10', circle: 'bg-orange-500' };
            default: return { bg: 'bg-slate-50', text: 'text-slate-600', icon: 'text-slate-600/10', circle: 'bg-slate-500' };
        }
    };
    const colors = getColors(color);

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className={`absolute -right-6 -top-6 p-4 transform scale-150 transition-opacity opacity-0 group-hover:opacity-100 ${colors.icon}`}>
                <Icon size={120} />
            </div>
            <div className="relative z-10 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.text}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">{value}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">{label}</p>
                </div>
            </div>
            {subtext && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.circle}`}></span>
                        {subtext}
                    </p>
                </div>
            )}
        </div>
    );
};

const ProgressBar: React.FC<{ percentage: number, color?: 'emerald' | 'blue' | 'purple' | 'red' }> = ({ percentage, color = "blue" }) => {
    const getColorClass = () => {
        if (percentage > 85) return 'bg-red-500';
        if (percentage > 65) return 'bg-orange-500';
        switch(color) {
            case 'emerald': return 'bg-emerald-500';
            case 'purple': return 'bg-purple-500';
            case 'red': return 'bg-red-500';
            default: return 'bg-blue-500';
        }
    };

    return (
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-700 ${getColorClass()}`} 
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

interface AdminStatsProps {
    usersCount: number;
    activeUsersCount: number;
    clientsCount: number;
    ticketsCount: number;
    logsCount: number;
    infraHealth: {
        cpu: number;
        memory: number;
        db: number;
        dbMax: number;
    };
}

export const AdminStats: React.FC<AdminStatsProps> = ({ usersCount, activeUsersCount, clientsCount, ticketsCount, logsCount, infraHealth }) => {
    const { t } = useTranslation();
    
    const dbPercentage = Math.round((infraHealth.db / infraHealth.dbMax) * 100);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard 
                    label={t('admin.stats.totalUsers')} 
                    value={usersCount} 
                    subtext={`${activeUsersCount} Ativos`}
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
                    subtext="Pendentes de Resposta"
                    icon={LifeBuoy} color="red" 
                />
                <StatCard 
                    label={t('admin.stats.activities')} 
                    value={logsCount > 99 ? '99+' : logsCount} 
                    subtext="Logs nas últimas 24h"
                    icon={Activity} color="orange" 
                />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Cpu size={20} className="text-emerald-500" /> 
                        {t('admin.stats.systemHealth')}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tempo Real</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                            <span>{t('admin.stats.cpuLoad')}</span>
                            <span className={infraHealth.cpu > 80 ? 'text-red-500' : 'text-slate-900'}>{infraHealth.cpu}%</span>
                        </div>
                        <ProgressBar percentage={infraHealth.cpu} color="emerald" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                            <span>{t('admin.stats.memoryUsage')}</span>
                            <span className={infraHealth.memory > 80 ? 'text-red-500' : 'text-slate-900'}>{infraHealth.memory}%</span>
                        </div>
                        <ProgressBar percentage={infraHealth.memory} color="blue" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                            <span>{t('admin.stats.dbConnections')}</span>
                            <span className={dbPercentage > 80 ? 'text-red-500' : 'text-slate-900'}>{infraHealth.db}/{infraHealth.dbMax}</span>
                        </div>
                        <ProgressBar percentage={dbPercentage} color="purple" />
                    </div>
                </div>
                
                <div className="mt-6 p-4 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-xl border border-emerald-100 flex items-center gap-3">
                    <CheckCircle2 size={18} /> {t('admin.stats.allOperational')}
                </div>
            </div>
        </div>
    );
};
