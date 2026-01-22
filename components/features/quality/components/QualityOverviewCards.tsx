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
    color: string;
    path: string;
    shadow: string;
    accent: string;
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
      id: 'clients',
      label: "Portfólio Ativo",
      value: totalClients,
      subtext: "Empresas Monitoradas",
      icon: Building2,
      color: "bg-slate-900",
      shadow: "shadow-slate-900/20",
      path: '/quality/portfolio',
      accent: "text-blue-400",
      tooltip: "Gerenciar base de empresas parceiras"
    },
    {
      id: 'pending',
      label: "Urgência Técnica",
      value: totalPendingDocs,
      subtext: "Aguardando Triagem",
      icon: FileWarning,
      color: "bg-[#b23c0e]",
      shadow: "shadow-orange-900/20",
      path: '/quality/monitor',
      accent: "text-white",
      tooltip: "Certificados prioritários para análise"
    },
    {
      id: 'compliance',
      label: "Conformidade",
      value: `${complianceRate}%`,
      subtext: "Ativos Aprovados",
      icon: ShieldCheck,
      color: "bg-emerald-800",
      shadow: "shadow-emerald-900/20",
      path: '/quality/audit',
      accent: "text-white",
      tooltip: "Índice global de qualidade industrial"
    },
    {
      id: 'alerts',
      label: "Contestações",
      value: totalRejected,
      subtext: "Exige Intervenção",
      icon: Activity,
      color: totalRejected > 0 ? "bg-red-800" : "bg-slate-800",
      shadow: "shadow-red-900/20",
      path: '/quality/monitor',
      accent: "text-white",
      tooltip: "Certificados com divergência técnica"
    }
  ], [totalClients, totalPendingDocs, complianceRate, totalRejected]);

  return (
    <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" aria-label="Indicadores Críticos de Qualidade">
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
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            aria-label={`${card.label}: ${card.value}. ${card.subtext}. ${card.tooltip}`}
            className="group bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all text-left flex flex-col justify-between min-h-[190px] relative overflow-hidden focus-visible:ring-4 focus-visible:ring-blue-600/30 outline-none"
        >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3.5 rounded-2xl ${card.color} text-white shadow-xl ${card.shadow} group-hover:scale-110 transition-transform`} aria-hidden="true">
                <Icon size={24} strokeWidth={2.5} className={card.accent} />
              </div>
              <ArrowUpRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-colors" aria-hidden="true" />
            </div>

            <div className="relative">
              <div className="flex items-center gap-2 mb-1.5">
                  <span className="metadata-label">{card.label}</span>
                  <Info size={12} className="text-slate-300" aria-hidden="true" />
              </div>
              <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{card.value}</span>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-2 opacity-90">{card.subtext}</p>
            </div>
        </div>
    );
};