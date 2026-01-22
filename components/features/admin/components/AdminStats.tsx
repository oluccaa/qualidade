import React from 'react';
import { Users, Building2, Activity, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  variant: 'blue' | 'indigo' | 'red' | 'orange' | 'slate';
  tooltip?: string;
}

const STAT_VARIANTS = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600/10', circle: 'bg-blue-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-600/10', circle: 'bg-indigo-600' },
  red: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-600/10', circle: 'bg-red-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-800', icon: 'text-orange-600/10', circle: 'bg-orange-600' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-800', icon: 'text-slate-600/10', circle: 'bg-slate-600' },
};

const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, icon: Icon, variant, tooltip }) => {
    const colors = STAT_VARIANTS[variant] || STAT_VARIANTS.slate;

    return (
        <article 
            className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-visible group hover:shadow-md transition-all"
            aria-labelledby={`stat-label-${label.replace(/\s+/g, '-')}`}
        >
            <div className={`absolute -right-6 -top-6 p-4 transform scale-150 transition-opacity opacity-0 group-hover:opacity-100 ${colors.icon}`} aria-hidden="true">
                <Icon size={120} />
            </div>
            
            <div className="relative z-10 flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.text}`} aria-hidden="true">
                    <Icon size={28} />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none" aria-live="polite">
                          {value}
                        </span>
                    </div>
                    <h3 id={`stat-label-${label.replace(/\s+/g, '-')}`} className="metadata-label mt-1">{label}</h3>
                </div>
            </div>

            {subtext && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                    <p className="text-[11px] text-slate-600 font-bold uppercase tracking-wider flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${colors.circle}`} aria-hidden="true"></span>
                        {subtext}
                    </p>
                </div>
            )}
        </article>
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
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" aria-label="Resumo de Métricas Administrativas">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <StatCard 
                    label={t('admin.stats.totalUsers')} 
                    value={usersCount} 
                    subtext={`${activeUsersCount} usuários ativos`}
                    icon={Users} 
                    variant="blue" 
                />
                <StatCard 
                    label={t('admin.stats.organizations')} 
                    value={clientsCount} 
                    subtext={`${clientsCount} parceiros ativos`}
                    icon={Building2} 
                    variant="indigo" 
                />
                <StatCard 
                    label={t('admin.stats.activities')} 
                    value={logsCount > 99 ? '99+' : logsCount} 
                    subtext="Log de Operações (24h)"
                    icon={Activity} 
                    variant="orange" 
                />
            </div>
        </section>
    );
};