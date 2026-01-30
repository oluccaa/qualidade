
import React, { useMemo } from 'react';
import { Building2, FileWarning, ShieldCheck, Activity, ArrowUpRight, LucideIcon } from 'lucide-react';

interface QualityOverviewCardsProps {
  totalClients: number;
  totalPendingDocs: number;
  complianceRate: string;
  totalRejected: number;
  onNavigate: (path: string) => void;
}

interface KpiConfig {
    id: string;
    label: string;
    value: string | number;
    subtext: string;
    icon: LucideIcon;
    theme: 'dark' | 'alert' | 'success' | 'light';
    path: string;
    span?: string;
}

export const QualityOverviewCards: React.FC<QualityOverviewCardsProps> = ({ 
  totalClients, 
  totalPendingDocs, 
  complianceRate, 
  totalRejected, 
  onNavigate 
}) => {
  
  const cardConfig: KpiConfig[] = useMemo(() => [
    {
      id: 'pending',
      label: "Urgência Técnica",
      value: totalPendingDocs,
      subtext: "Aguardando Triagem",
      icon: FileWarning,
      theme: totalPendingDocs > 0 ? 'alert' : 'light',
      path: '/quality/monitor',
      span: 'md:col-span-1'
    },
    {
      id: 'compliance',
      label: "Índice de Qualidade",
      value: `${complianceRate}%`,
      subtext: "Conformidade Global",
      icon: ShieldCheck,
      theme: 'success',
      path: '/quality/audit',
      span: 'md:col-span-1'
    },
    {
      id: 'clients',
      label: "Portfólio Ativo",
      value: totalClients,
      subtext: "Empresas Monitoradas",
      icon: Building2,
      theme: 'light',
      path: '/quality/portfolio',
      span: 'md:col-span-1'
    },
    {
      id: 'alerts',
      label: "Contestações",
      value: totalRejected,
      subtext: "Requer Intervenção",
      icon: Activity,
      theme: totalRejected > 0 ? 'dark' : 'light',
      path: '/quality/monitor',
      span: 'md:col-span-1'
    }
  ], [totalClients, totalPendingDocs, complianceRate, totalRejected]);

  return (
    <>
      {cardConfig.map((card) => (
        <KpiCard 
            key={card.id} 
            card={card} 
            onClick={() => onNavigate(card.path)} 
        />
      ))}
    </>
  );
};

const KpiCard: React.FC<{ card: KpiConfig; onClick: () => void }> = ({ card, onClick }) => {
    const Icon = card.icon;
    
    const themes = {
        alert: "bg-[#b23c0e] text-white border-none",
        success: "bg-emerald-600 text-white border-none",
        dark: "bg-slate-900 text-white border-none",
        light: "bg-white text-slate-800 border border-slate-200"
    };

    const iconThemes = {
        alert: "bg-white/20 text-white",
        success: "bg-white/20 text-white",
        dark: "bg-white/10 text-white",
        light: "bg-slate-50 text-slate-400"
    };

    return (
        <div
            role="button"
            onClick={onClick}
            className={`group p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between min-h-[180px] relative overflow-hidden ${themes[card.theme]} ${card.span}`}
        >
            <div className="flex justify-between items-start z-10 relative">
              <div className={`p-3 rounded-2xl ${iconThemes[card.theme]} transition-transform group-hover:scale-110`}>
                <Icon size={24} strokeWidth={2.5} />
              </div>
              <ArrowUpRight size={20} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="z-10 relative mt-4">
              <span className="text-4xl font-black tracking-tighter leading-none block">{card.value}</span>
              <p className="text-[10px] font-black uppercase tracking-[2px] mt-2 opacity-70">{card.label}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-90 border-t border-current/10 pt-2 inline-block">
                  {card.subtext}
              </p>
            </div>

            {/* Background Decoration */}
            <Icon size={100} className="absolute -right-4 -bottom-6 opacity-[0.07] rotate-12 pointer-events-none" />
        </div>
    );
};
