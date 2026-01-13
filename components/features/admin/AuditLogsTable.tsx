
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AuditLog } from '../../../types/index';
import { Eye, ShieldAlert, Clock, User, Globe, Activity, MoreHorizontal, ChevronRight } from 'lucide-react';

interface AuditLogsTableProps {
  logs: AuditLog[];
  severityFilter: string;
  onSeverityChange: (severity: any) => void;
  onInvestigate: (log: AuditLog) => void;
}

export const AuditLogsTable: React.FC<AuditLogsTableProps> = ({ logs, severityFilter, onSeverityChange, onInvestigate }) => {
  const { t } = useTranslation();

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      case 'ERROR': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'WARNING': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">{t('admin.stats.headers.timestamp')}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">{t('admin.stats.headers.user')}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">{t('admin.stats.headers.action')}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">{t('admin.stats.headers.target')}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">{t('admin.stats.headers.severity')}</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                  <Activity size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="font-bold text-xs uppercase tracking-widest">{t('admin.logs.noLogsFound')}</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group cursor-default">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-xs font-mono">{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px] border border-slate-200">
                        {log.userName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{log.userName}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-black">{log.userRole}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md border border-slate-200 uppercase tracking-tight">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-slate-400" />
                      <span className="text-xs text-slate-700 font-medium truncate max-w-[200px]" title={log.target}>
                        {log.target}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getSeverityStyles(log.severity)}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onInvestigate(log)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Eye size={12} /> {t('admin.logs.investigate')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
