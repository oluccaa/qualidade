
import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Send, Trash2, LucideIcon, ShieldCheck } from 'lucide-react';
import { QualityStatus } from '../../../../types/enums.ts';

interface StatusConfig {
  icon: LucideIcon;
  color: string;
  label: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  [QualityStatus.APPROVED]: { 
    icon: ShieldCheck, 
    color: 'text-emerald-800 bg-emerald-50 border-emerald-200/60', 
    label: 'Conforme' 
  },
  [QualityStatus.REJECTED]: { 
    icon: AlertCircle, 
    color: 'text-red-800 bg-red-50 border-red-200/60', 
    label: 'Divergente' 
  },
  [QualityStatus.SENT]: { 
    icon: Send, 
    color: 'text-blue-800 bg-blue-50 border-blue-200/60', 
    label: 'Em Fluxo' 
  },
  [QualityStatus.PENDING]: { 
    icon: Clock, 
    color: 'text-amber-800 bg-amber-50 border-amber-200/60', 
    label: 'Triagem' 
  },
  [QualityStatus.TO_DELETE]: { 
    icon: Trash2, 
    color: 'text-slate-700 bg-slate-100 border-slate-200/60', 
    label: 'Arquivado' 
  },
};

export const FileStatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const config = STATUS_MAP[status || ''] || STATUS_MAP[QualityStatus.PENDING];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 border-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest shadow-sm transition-all ${config.color}`}>
      <Icon size={12} strokeWidth={3} className="shrink-0" />
      {config.label}
    </div>
  );
};
