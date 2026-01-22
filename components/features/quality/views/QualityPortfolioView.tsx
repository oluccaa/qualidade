import React, { memo, useMemo, useEffect, useState } from 'react';
import { useQualityPortfolio } from '../hooks/useQualityPortfolio.ts';
import { 
  AlertCircle, ShieldCheck, Clock, Send, CheckCircle2, FileText, Layers, ChevronRight,
  ClipboardList, Radio, Zap
} from 'lucide-react';
import { QualityLoadingState, QualityEmptyState } from '../components/ViewStates.tsx';
import { useNavigate } from 'react-router-dom';
import { UserRole, normalizeRole, FileNode } from '../../../../types/index.ts';
import { useAuth } from '../../../../context/authContext.tsx';

export const QualityPortfolioView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pendingFiles, sentFiles, rejectedFiles, approvedFiles, isLoading, isLive } = useQualityPortfolio();
  
  const role = normalizeRole(user?.role);
  const isClient = role === UserRole.CLIENT;

  const emptyState = useMemo(() => (
    <QualityEmptyState message="Nenhum ativo pendente no ledger" icon={ClipboardList} />
  ), []);

  if (isLoading) return <QualityLoadingState message="Sincronizando Ledger..." />;

  const isEmpty = pendingFiles.length === 0 && sentFiles.length === 0 && 
                  rejectedFiles.length === 0 && approvedFiles.length === 0;

  if (isEmpty) return emptyState;

  return (
    <div className="space-y-10 md:space-y-16 animate-in fade-in duration-700 pb-24">
      
      {/* Indicador de Status Compacto */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm mx-1 md:mx-0">
          <div className="flex items-center gap-3">
              <div className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </div>
              <p className="text-[9px] font-black uppercase tracking-[2px] text-slate-500">
                  {isLive ? 'Real-time Link' : 'Sincronizando...'}
              </p>
          </div>
          <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 text-[8px] font-black uppercase tracking-widest hidden sm:block">
              Cloud v4.2
          </div>
      </div>

      {rejectedFiles.length > 0 && (
        <AuditSection title="Ações Corretivas" subtitle="Urgência Industrial" count={rejectedFiles.length} icon={AlertCircle} variant="critical">
          {rejectedFiles.map(file => (
            <MemoizedFileWorkflowCard key={file.id} file={file} variant="critical" onClick={() => navigate(isClient ? `/preview/${file.id}?mode=audit` : `/quality/inspection/${file.id}`)} />
          ))}
        </AuditSection>
      )}

      {pendingFiles.length > 0 && (
        <AuditSection title="Fila de Triagem" subtitle="Aguardando Protocolo" count={pendingFiles.length} icon={Clock} variant="pending">
          {pendingFiles.map(file => (
            <MemoizedFileWorkflowCard key={file.id} file={file} variant="pending" onClick={() => navigate(isClient ? `/preview/${file.id}?mode=audit` : `/quality/inspection/${file.id}`)} />
          ))}
        </AuditSection>
      )}

      {sentFiles.length > 0 && (
        <AuditSection title="Fluxo Ativo" subtitle="Interação Parceira" count={sentFiles.length} icon={Send} variant="active">
          {sentFiles.map(file => (
            <MemoizedFileWorkflowCard key={file.id} file={file} variant="active" onClick={() => navigate(isClient ? `/preview/${file.id}?mode=audit` : `/quality/inspection/${file.id}`)} />
          ))}
        </AuditSection>
      )}

      {approvedFiles.length > 0 && (
        <AuditSection title="Homologados" subtitle="Histórico Concluído" count={approvedFiles.length} icon={CheckCircle2} variant="success">
          {approvedFiles.map(file => (
            <MemoizedFileWorkflowCard key={file.id} file={file} variant="success" onClick={() => navigate(`/preview/${file.id}`)} />
          ))}
        </AuditSection>
      )}
    </div>
  );
};

const AuditSection = memo(({ title, subtitle, count, icon: Icon, variant, children }: any) => {
    const vStyles: any = {
        critical: 'bg-red-600 text-white',
        pending: 'bg-amber-500 text-white',
        active: 'bg-blue-600 text-white',
        success: 'bg-slate-100 text-slate-400'
    };

    return (
        <section className="space-y-6">
            <header className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg ${vStyles[variant]}`}>
                        <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-sm md:text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">{title}</h3>
                        <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-[2px] mt-1 ${variant === 'critical' ? 'text-red-600' : 'text-slate-400'}`}>{subtitle}</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full border border-slate-200 text-[9px] font-black text-slate-500 uppercase">{count} Ativos</div>
            </header>
            
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {children}
            </div>
        </section>
    );
});

const FileWorkflowCard: React.FC<any> = ({ file, variant, onClick }) => {
    const [isRecent, setIsRecent] = useState(false);
    useEffect(() => {
        if (Date.now() - new Date(file.updatedAt).getTime() < 15000) {
            setIsRecent(true);
            setTimeout(() => setIsRecent(false), 5000);
        }
    }, [file.updatedAt]);

    const styles = {
        critical: `border-red-200 bg-white hover:border-red-600 ${isRecent ? 'ring-2 ring-red-500/30' : ''}`,
        pending: `border-slate-200 bg-white hover:border-amber-400 ${isRecent ? 'ring-2 ring-amber-500/30' : ''}`,
        active: `border-blue-100 bg-white hover:border-blue-500 ${isRecent ? 'ring-2 ring-blue-500/30' : ''}`,
        success: 'border-slate-100 bg-slate-50 grayscale hover:grayscale-0'
    };

    return (
        <div onClick={onClick} className={`group p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[180px] md:min-h-[240px] active:scale-[0.98] shadow-sm hover:shadow-xl ${styles[variant]}`}>
            <div className="relative z-10 min-w-0">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center border transition-colors ${variant === 'critical' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                        <FileText size={20} />
                    </div>
                    {isRecent && <div className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 animate-pulse">NOVO</div>}
                </div>
                
                <h4 className="text-[12px] md:text-sm font-black text-slate-800 uppercase tracking-tight leading-tight line-clamp-2 mb-3">{file.name}</h4>
                
                <div className="flex flex-wrap gap-2">
                    <div className="px-2 py-0.5 bg-[#132659] text-white rounded-lg text-[8px] font-black uppercase tracking-widest">Lote: {file.metadata?.batchNumber || 'N/A'}</div>
                    <div className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[8px] font-black uppercase tracking-widest">v{file.versionNumber}.0</div>
                </div>
            </div>

            <div className="relative z-10 mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[2px]">{variant === 'success' ? 'Ver Ledger' : 'Analisar'}</span>
                <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-all" />
            </div>
        </div>
    );
};

const MemoizedFileWorkflowCard = memo(FileWorkflowCard);