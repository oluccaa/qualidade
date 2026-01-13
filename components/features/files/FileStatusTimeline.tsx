
import React from 'react';
import { CheckCircle2, Clock, XCircle, User, Calendar, Info } from 'lucide-react';
import { FileNode } from '../../../types/index';
import { useTranslation } from 'react-i18next';

interface FileStatusTimelineProps {
  file: FileNode;
}

// Fix: Define an interface for timeline steps to avoid type inference issues when properties (like 'note') are added conditionally.
interface TimelineStep {
  id: string;
  title: string;
  date: string | null;
  user: string | null;
  icon: any;
  status: string;
  color: string;
  bg: string;
  note?: string;
}

export const FileStatusTimeline: React.FC<FileStatusTimelineProps> = ({ file }) => {
  const { t } = useTranslation();
  const metadata = file.metadata;

  // Fix: Explicitly type the steps array to allow the 'note' property in inspection steps.
  const steps: TimelineStep[] = [
    {
      id: 'upload',
      title: t('common.uploaded'),
      date: file.updatedAt,
      user: t('common.na'), // Idealmente viria de uploadedBy
      icon: Clock,
      status: 'completed',
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    }
  ];

  if (metadata?.inspectedAt) {
    const isApproved = metadata.status === 'APPROVED';
    steps.push({
      id: 'inspection',
      title: isApproved ? t('files.groups.approved') : t('files.groups.rejected'),
      date: metadata.inspectedAt,
      user: metadata.inspectedBy || 'Analista',
      icon: isApproved ? CheckCircle2 : XCircle,
      status: 'completed',
      color: isApproved ? 'text-emerald-500' : 'text-red-500',
      bg: isApproved ? 'bg-emerald-50' : 'bg-red-50',
      note: metadata.rejectionReason
    });
  } else {
    steps.push({
      id: 'pending',
      title: t('files.pending'),
      date: null,
      user: null,
      icon: Info,
      status: 'current',
      color: 'text-orange-500',
      bg: 'bg-orange-50'
    });
  }

  return (
    <div className="space-y-6">
      <h4 className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 flex items-center gap-2">
        <Calendar size={14} /> {t('dashboard.fileStatusTimeline')}
      </h4>
      <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative group">
              <div className={`absolute -left-[33px] top-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-all ${step.bg} ${step.color}`}>
                <Icon size={14} />
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-1">
                  <p className={`text-xs font-black uppercase tracking-wider ${step.color}`}>{step.title}</p>
                  {step.date && (
                    <span className="text-[9px] font-mono text-slate-400">
                      {new Date(step.date).toLocaleString()}
                    </span>
                  )}
                </div>
                {step.user && (
                  <p className="text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
                    <User size={10} /> {step.user}
                  </p>
                )}
                {/* Note property correctly identified via TimelineStep interface */}
                {step.note && (
                  <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-100 text-[10px] text-red-700 italic">
                    "{step.note}"
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
