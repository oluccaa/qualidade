import React, { useMemo } from 'react';
import { Building2, FileWarning, ShieldCheck, Activity, ArrowUpRight, LucideIcon, Info } from 'lucide-react';

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
    variant: 'neutral' | 'urgent' | 'success' | 'alert';
    path: string;
    tooltip: string;
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
      label: "Urgência",
      value: totalPendingDocs,
      subtext: "Aguardando Triagem",
      icon: FileWarning,
      variant: 'urgent',
      path: '/quality/monitor',
      tooltip: "Prioritários para análise técnica"
    },
    {
      id: 'alerts',
      label: "Alertas",
      value: totalRejected,
      subtext: "Contestações",
      icon: Activity,
      variant: 'alert',
      path: '/quality/monitor',
      tooltip: "Certificados com feedback negativo"
    },
    {
      id: 'compliance',
      label: "Compliance",
      value: `${complianceRate}%`,
      subtext: "Índice Global",
      icon: ShieldCheck,
      variant: 'success',
      path: '/quality/audit',
      tooltip: "Conformidade da operação"
    },
    {
      id: 'clients',
      label: "Portfólio",
      value: totalClients,
      subtext: "Empresas Ativas",
      icon: Building2,
      variant: 'neutral',
      path: '/quality/portfolio',
      tooltip: "Gestão da base de parceiros"
    }
  ], [totalClients, totalPendingDocs, complianceRate, totalRejected]);

  return (
    <nav className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" aria-label="Indicadores de Desempenho">
      {cardConfig.map((card) => (
        <KpiCard 
            key={card.id} 
            card={card} 
            onClick={() => onNavigate(card.path)} 
        />
      ))}
    </nav>
  );
};

const KpiCard: React.FC<{ card: KpiConfig; onClick: () => void }> = ({ card, onClick }) => {
    const Icon = card.icon;
    
    const variants = {
        urgent: 'bg-orange-600 border-orange-500 text-white shadow-orange-900/10',
        alert: 'bg-white border-red-200 text-red-600 shadow-red-900/5',
        success: 'bg-white border-emerald-100 text-emerald-700 shadow-emerald-900/5',
        neutral: 'bg-[#0f172a] border-slate-800 text-white shadow-slate-900/20'
    };

    const iconColors = {
        urgent: 'bg-white/20 text-white',
        alert: 'bg-red-50 text-red-600',
        success: 'bg-emerald-50 text-emerald-600',
        neutral: 'bg-blue-500/20 text-blue-400'
    };

    return (
        <button
            onClick={onClick}
            className={`group p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-2 transition-all text-left flex flex-col justify-between min-h-[160px] md:min-h-[200px] relative overflow-hidden focus-visible:ring-4 outline-none ${variants[card.variant]}`}
        >
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4 md:mb-6">
                    <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl ${iconColors[card.variant]} transition-transform group-hover:scale-110`}>
                        <Icon size={20} className="md:w-6 md:h-6" strokeWidth={2.5} />
                    </div>
                    <ArrowUpRight size={16} className="opacity-40 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform md:w-5 md:h-5" />
                </div>
                
                <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-[2px] mb-1 opacity-70`}>{card.label}</p>
                <h3 className="text-3xl md:text-4xl font-black tracking-tighter leading-none">{card.value}</h3>
            </div>

            <div className="relative z-10 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-current border-opacity-10">
                <p className="text-[9px] md:text-[11px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                    <Info size={12} className="md:w-[14px]" /> <span className="truncate">{card.subtext}</span>
                </p>
            </div>
            
            <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12 group-hover:scale-110 transition-transform hidden xs:block">
                <Icon size={120} />
            </div>
        </button>
    );
};