
import React from 'react';
import { useQualityPortfolio } from '../hooks/useQualityPortfolio.ts';
import { 
  ArrowRight, AlertCircle, ShieldCheck, 
  Clock, Send, CheckCircle2, FileText,
  ChevronDown, Circle, PenTool, UserCheck, Hourglass,
  Workflow, Activity, Kanban
} from 'lucide-react';
import { QualityLoadingState } from '../components/ViewStates.tsx';
import { useNavigate } from 'react-router-dom';
import { FileNode, UserRole, normalizeRole, SteelBatchMetadata } from '../../../../types/index.ts';
import { useAuth } from '../../../../context/authContext.tsx';

export const QualityPortfolioView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pendingFiles, sentFiles, rejectedFiles, approvedFiles, isLoading } = useQualityPortfolio();
  
  const role = normalizeRole(user?.role);
  const isClient = role === UserRole.CLIENT;

  if (isLoading) return <QualityLoadingState message="Sincronizando Fluxo de Auditoria..." />;

  const isEmpty = pendingFiles.length === 0 && sentFiles.length === 0 && 
                  rejectedFiles.length === 0 && approvedFiles.length === 0;

  const totalAssets = pendingFiles.length + sentFiles.length + rejectedFiles.length + approvedFiles.length;

  if (isEmpty) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-10 py-20 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full animate-pulse" />
                <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-center justify-center relative z-10">
                    <ShieldCheck size={40} className="text-emerald-600" />
                </div>
            </div>
            <h3 className="text-lg font-extrabold text-slate-800 uppercase tracking-wider">Tudo em conformidade</h3>
            <p className="text-sm font-medium text-slate-500 mt-2 max-w-xs leading-relaxed">
              Não há ativos pendentes no pipeline de auditoria neste momento.
            </p>
        </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-20 font-sans">
      
      {/* Control Deck */}
      <div className="shrink-0 mb-8 px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-5">
                <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shrink-0">
                    <Kanban size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
                        Monitoramento de Fluxo
                    </h2>
                    <p className="text-sm font-semibold text-slate-500 mt-1.5 uppercase tracking-widest flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500" />
                       Tempo Real: {totalAssets} Ativos em Esteira
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl">
                <Workflow size={16} className="text-blue-600" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Pipeline B2B Ativo</span>
            </div>
        </div>
      </div>

      {/* Board Kanban - Acessibilidade de Contraste Melhorada */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 px-4">
            
            <KanbanColumn 
                title={isClient ? "Ação Requerida" : "Contestações"}
                subtitle="Prioridade Crítica"
                count={rejectedFiles.length}
                color="red"
                icon={AlertCircle}
                items={rejectedFiles}
                onCardClick={(id) => navigate(`/quality/inspection/${id}`)}
                emptyMessage="Sem divergências."
                userRole={role}
            />

            <KanbanColumn 
                title={isClient ? "Recebidos" : "Triagem Técnica"}
                subtitle="Aguardando Análise"
                count={pendingFiles.length}
                color="amber"
                icon={Clock}
                items={pendingFiles}
                onCardClick={(id) => navigate(`/quality/inspection/${id}`)}
                emptyMessage="Fila de triagem limpa."
                userRole={role}
            />

            <KanbanColumn 
                title={isClient ? "Em Análise Vital" : "Em Conferência"}
                subtitle="Validação em Curso"
                count={sentFiles.length}
                color="blue"
                icon={Send}
                items={sentFiles}
                onCardClick={(id) => navigate(`/quality/inspection/${id}`)}
                emptyMessage="Esteira vazia."
                userRole={role}
            />

            <KanbanColumn 
                title="Homologados"
                subtitle="Protocolo Concluído"
                count={approvedFiles.length}
                color="emerald"
                icon={CheckCircle2}
                items={approvedFiles}
                onCardClick={(id) => navigate(`/quality/inspection/${id}`)}
                emptyMessage="Nenhum histórico."
                userRole={role}
            />
      </div>
    </div>
  );
};

interface KanbanColumnProps {
    title: string;
    subtitle: string;
    count: number;
    color: 'red' | 'amber' | 'blue' | 'emerald';
    icon: React.ElementType;
    items: FileNode[];
    onCardClick: (id: string) => void;
    emptyMessage: string;
    userRole: UserRole;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
    title, subtitle, count, color, icon: Icon, items, onCardClick, emptyMessage, userRole
}) => {
    
    const themes = {
        red: { header: 'bg-red-50 text-red-800 border-red-200', dot: 'bg-red-600', count: 'bg-red-600 text-white' },
        amber: { header: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-600', count: 'bg-amber-600 text-white' },
        blue: { header: 'bg-blue-50 text-blue-800 border-blue-200', dot: 'bg-blue-600', count: 'bg-blue-600 text-white' },
        emerald: { header: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-600', count: 'bg-emerald-600 text-white' },
    };

    const theme = themes[color];

    return (
        <div className="flex flex-col gap-4">
            <header className={`p-4 rounded-2xl border-2 flex items-center justify-between shadow-sm ${theme.header}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${theme.dot}`} />
                    <div>
                        <h3 className="text-xs font-extrabold uppercase tracking-widest leading-none">{title}</h3>
                        <p className="text-[10px] font-semibold opacity-70 mt-1">{subtitle}</p>
                    </div>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${theme.count}`}>
                    {count}
                </span>
            </header>

            <div className="flex flex-col gap-3 min-h-[150px]">
                {items.length === 0 ? (
                    <div className="py-10 flex flex-col items-center justify-center text-slate-300 border border-dashed border-slate-200 rounded-2xl bg-white/50">
                        <Icon size={20} className="mb-2 opacity-30" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{emptyMessage}</span>
                    </div>
                ) : (
                    items.map(item => (
                        <KanbanCard 
                            key={item.id} 
                            file={item} 
                            color={color} 
                            onClick={() => onCardClick(item.id)} 
                            userRole={userRole}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const KanbanCard: React.FC<{ file: FileNode; color: 'red' | 'amber' | 'blue' | 'emerald'; onClick: () => void; userRole: UserRole }> = ({ file, onClick, userRole }) => {
    const statusAction = getActionStatus(file.metadata, userRole);
    const StatusIcon = statusAction.icon;

    return (
        <div 
            onClick={onClick}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group"
        >
            <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <h4 className="text-xs font-bold text-slate-800 leading-snug pr-4">
                        {file.name}
                    </h4>
                    <FileText size={16} className="text-slate-300 shrink-0" />
                </div>
                
                <div className="flex items-center gap-2">
                    <StatusIcon size={12} className={statusAction.color} />
                    <span className={`text-[10px] font-bold uppercase tracking-tight truncate ${statusAction.color}`}>
                        {statusAction.text}
                    </span>
                </div>

                <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Passo {file.metadata?.currentStep || 1}/7</span>
                    </div>
                    {file.metadata?.batchNumber && (
                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                            Lote: {file.metadata.batchNumber}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const getActionStatus = (metadata: SteelBatchMetadata | undefined, role: UserRole) => {
    if (!metadata) return { text: "Dados Indisponíveis", icon: AlertCircle, color: "text-slate-400" };
    
    const step = metadata.currentStep;
    const sigs = metadata.signatures || {};
    const isClient = role === UserRole.CLIENT;

    if (step === 7) return { text: "Protocolo Finalizado", icon: CheckCircle2, color: "text-emerald-700" };

    if (step === 6) {
        return { text: "Assinatura Pendente", icon: UserCheck, color: "text-blue-700" };
    }

    if (step === 5) {
        return isClient 
            ? { text: "Ação: Seu Aceite", icon: PenTool, color: "text-orange-700 font-black" }
            : { text: "Aguardando Cliente", icon: UserCheck, color: "text-slate-600" };
    }

    return { text: "Em Auditoria", icon: Clock, color: "text-slate-600" };
};
