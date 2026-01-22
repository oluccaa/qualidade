import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Send, Trash2, LucideIcon, ShieldAlert } from 'lucide-react';
import { QualityStatus } from '../../../../types/enums.ts';

interface StatusConfig {
  icon: LucideIcon;
  color: string;
  label: string;
  dot: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  [QualityStatus.APPROVED]: { 
    icon: CheckCircle2, 
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200 shadow-emerald-100/50', 
    label: 'Conforme',
    dot: 'bg-emerald-500'
  },
  [QualityStatus.REJECTED]: { 
    icon: ShieldAlert, 
    color: 'text-red-700 bg-red-50 border-red-200 shadow-red-100/50', 
    label: 'Divergente',
    dot: 'bg-red-500'
  },
  [QualityStatus.SENT]: { 
    icon: Send, 
    color: 'text-blue-700 bg-blue-50 border-blue-200 shadow-blue-100/50', 
    label: 'Em Análise',
    dot: 'bg-blue-500'
  },
  [QualityStatus.PENDING]: { 
    icon: Clock, 
    color: 'text-amber-700 bg-amber-50 border-amber-200 shadow-amber-100/50', 
    label: 'Aguardando',
    dot: 'bg-amber-500'
  },
  [QualityStatus.TO_DELETE]: { 
    icon: Trash2, 
    color: 'text-slate-600 bg-slate-100 border-slate-300 shadow-slate-100/50', 
    label: 'Obsoleto',
    dot: 'bg-slate-400'
  },
};

export const FileStatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const config = STATUS_MAP[status || ''] || STATUS_MAP[QualityStatus.PENDING];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm transition-all hover:scale-[1.02] ${config.color}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      <Icon size={12} strokeWidth={3} />
      {config.label}
    </div>
  );
};