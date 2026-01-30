
import React from 'react';
import { Users, Building2, Activity, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  theme: 'dark' | 'light' | 'accent';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, icon: Icon, theme }) => {
    const styles = {
        dark: "bg-[#0f172a] text-white border-none",
        light: "bg-white text-slate-800 border border-slate-200",
        accent: "bg-blue-600 text-white border-none"
    };

    const iconStyles = {
        dark: "bg-white/10 text-blue-400",
        light: "bg-blue-50 text-blue-600",
        accent: "bg-white/20 text-white"
    };

    return (
        <article className={`p-6 rounded-[2rem] shadow-sm relative overflow-hidden group flex flex-col justify-between h-full min-h-[160px] ${styles[theme]}`}>
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${iconStyles[theme]} backdrop-blur-md`}>
                    <Icon size={24} />
                </div>
                {theme === 'accent' && <Activity size={80} className="absolute -right-4 -bottom-6 opacity-20 text-white rotate-12" />}
            </div>
            
            <div className="relative z-10 space-y-1">
                <span className="text-4xl font-black tracking-tighter leading-none block">{value}</span>
                <h3 className={`text-[10px] font-black uppercase tracking-[2px] ${theme === 'light' ? 'text-slate-400' : 'text-white/60'}`}>{label}</h3>
                {subtext && (
                    <p className={`text-[9px] font-bold mt-2 ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-300'}`}>
                        {subtext}
                    </p>
                )}
            </div>
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
        <>
            <StatCard 
                label={t('admin.stats.totalUsers')} 
                value={usersCount} 
                subtext={`${activeUsersCount} Online`}
                icon={Users} 
                theme="light" 
            />
            <StatCard 
                label={t('admin.stats.organizations')} 
                value={clientsCount} 
                subtext="Parceiros"
                icon={Building2} 
                theme="dark" 
            />
            <StatCard 
                label="Eventos (24h)" 
                value={logsCount} 
                subtext="Auditoria Ativa"
                icon={Database} 
                theme="accent" 
            />
        </>
    );
};
