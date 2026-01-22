import React, { memo } from 'react';
import { Users, Building2, Activity, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  variant: 'blue' | 'indigo' | 'orange';
  onClick?: () => void;
  index: number;
}

const STAT_VARIANTS = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-600/10', circle: 'bg-blue-500' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'text-indigo-600/10', circle: 'bg-indigo-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-600/10', circle: 'bg-orange-500' },
};

const StatCard = memo<StatCardProps>(({ label, value, subtext, icon: Icon, variant, onClick, index }) => {
    const colors = STAT_VARIANTS[variant];

    return (
        <button 
            onClick={onClick}
            className={`w-full bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group transition-all text-left animate-stagger
                ${onClick ? 'hover:shadow-xl hover:border-blue-400 active:scale-[0.98]' : 'cursor-default'}`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className={`absolute -right-4 -top-4 p-4 transform scale-150 transition-opacity opacity-0 group-hover:opacity-100 ${colors.icon}`} aria-hidden="true">
                <Icon size={80} />
            </div>
            
            <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.text} transition-transform group-hover:scale-110`}>
                        <Icon size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-none">{value}</h3>
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1.5 md:mt-2">{label}</p>
                    </div>
                </div>
                {onClick && <ArrowUpRight size={16} className="text-slate-200 group-hover:text-blue-500 transition-colors md:w-[18px]" />}
            </div>
            
            {subtext && (
                <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-slate-100">
                    <p className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <span className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${colors.circle} animate-pulse`}></span>
                        {subtext}
                    </p>
                </div>
            )}
        </button>
    );
});

interface AdminStatsProps {
    usersCount: number;
    activeUsersCount: number;
    clientsCount: number;
    logsCount: number;
}

export const AdminStats = memo<AdminStatsProps>(({ usersCount, activeUsersCount, clientsCount, logsCount }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <StatCard 
                index={1}
                label={t('admin.stats.totalUsers')} 
                value={usersCount} 
                subtext={`${activeUsersCount} Ativos no Core`}
                icon={Users} 
                variant="blue" 
                onClick={() => navigate('/admin/console?tab=users')}
            />
            <StatCard 
                index={2}
                label={t('admin.stats.organizations')} 
                value={clientsCount} 
                subtext="Entidades Homologadas"
                icon={Building2} 
                variant="indigo" 
                onClick={() => navigate('/quality/portfolio')}
            />
            <StatCard 
                index={3}
                label={t('admin.stats.activities')} 
                value={logsCount > 99 ? '99+' : logsCount} 
                subtext="Eventos (24h)"
                icon={Activity} 
                variant="orange" 
                onClick={() => navigate('/admin/console?tab=logs')}
            />
        </div>
    );
});