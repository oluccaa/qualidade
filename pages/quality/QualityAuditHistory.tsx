import React from 'react';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { QualityAuditLog } from '../../components/features/quality/views/QualityAuditLog.tsx';
import { History, Database } from 'lucide-react';

const QualityAuditHistory: React.FC = () => {
  return (
    <Layout title="Logs de Auditoria B2B">
      <div className="flex flex-col flex-1 h-full overflow-hidden animate-in fade-in duration-700 px-6 md:px-10 pt-4 md:pt-8">
        
        {/* Header Padronizado (Estilo Overview) */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm border border-slate-200">
                    <History size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Histórico Técnico</h1>
                    <p className="text-slate-500 text-sm font-medium tracking-tight italic opacity-70">
                        Rastreabilidade forense de vereditos e laudos emitidos.
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 shadow-sm shrink-0">
                <Database size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Protocolo Inviolável</span>
            </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <QualityAuditLog />
        </div>
      </div>
    </Layout>
  );
};

export default QualityAuditHistory;