import React, { useState, useMemo } from 'react';
import { Layout } from '../../../layout/MainLayout.tsx';
import { AuditWorkflow } from '../components/AuditWorkflow.tsx';
import { NewVersionUploadView, VersionHistoryView } from '../components/VersionViews.tsx';
import { ProcessingOverlay, QualityLoadingState } from '../components/ViewStates.tsx';
import { useFileInspection } from '../hooks/useFileInspection.ts';
import { 
  AlertCircle, Database, FileText, 
  Terminal, Users, Clock, 
  Activity, GitBranch, History, ExternalLink,
  ChevronDown, ChevronUp, UserPlus, ArrowUpRight, Calendar
} from 'lucide-react';
import { UserRole, normalizeRole } from '../../../../types/index.ts';

type TabType = 'workflow' | 'new_version' | 'history';

export const FileInspection: React.FC = () => {
  const {
    inspectorFile, loadingFile, isProcessing,
    mainPreviewUrl, handleInspectAction, handleBackToClientFiles,
    handleUploadStepEvidence, handleCreateNewVersion, user, handleDownload
  } = useFileInspection();

  const [activeTab, setActiveTab] = useState<TabType>('workflow');
  const [isTechnicalPanelOpen, setIsTechnicalPanelOpen] = useState(false);

  const role = normalizeRole(user?.role);
  const isQuality = role === UserRole.QUALITY || role === UserRole.ADMIN;

  const signatures = inspectorFile?.metadata?.signatures || {};

  if (loadingFile) return <QualityLoadingState message="Sincronizando protocolos..." />;
  if (!inspectorFile) return <ErrorLayout onBack={handleBackToClientFiles} />;

  return (
    <Layout title={isQuality ? "Painel de Auditoria" : "Conformidade"}>
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-sm">
        {isProcessing && <ProcessingOverlay message="Gravando no Ledger..." />}

        {/* Header Responsivo */}
        <header className="px-6 md:px-10 py-5 bg-[#132659] text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl shadow-inner shrink-0">
               <Terminal size={20} />
            </div>
            <div className="min-w-0">
                <h1 className="text-sm md:text-lg font-black uppercase tracking-tight truncate">{inspectorFile.name}</h1>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 truncate">v{inspectorFile.versionNumber}.0 • {inspectorFile.id.split('-')[0].toUpperCase()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {mainPreviewUrl && (
              <button 
                onClick={() => window.open(mainPreviewUrl!, '_blank')} 
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
              >
                <ExternalLink size={14} /> <span className="hidden sm:inline">Ver Laudo</span>
              </button>
            )}
            <button 
                onClick={() => setIsTechnicalPanelOpen(!isTechnicalPanelOpen)}
                className="lg:hidden p-3 bg-white/10 rounded-xl text-white active:bg-white/20 transition-colors"
            >
                {isTechnicalPanelOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* PAINEL DE RASTREABILIDADE (Based on Reference Image) */}
          <aside className={`
            lg:w-[320px] border-r border-slate-100 bg-[#fbfcfd] flex flex-col shrink-0 p-8 space-y-10 overflow-y-auto custom-scrollbar transition-all duration-300
            ${isTechnicalPanelOpen ? 'block' : 'hidden lg:flex'}
          `}>
            {/* Seção 1: Rastreabilidade Ledger */}
            <div className="space-y-6">
                <header className="flex items-center gap-3">
                    <Database size={18} className="text-blue-600" />
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[2px]">Rastreabilidade Ledger</h3>
                </header>
                <div className="space-y-4">
                    <TraceLabel label="ID de Referência" value={inspectorFile.id.split('-')[0].toUpperCase()} />
                    <TraceLabel label="Versão do Ativo" value={`V${inspectorFile.versionNumber}.0 ${inspectorFile.metadata?.status === 'APPROVED' ? 'FINAL' : 'EM CICLO'}`} />
                </div>
            </div>

            {/* Seção 2: Governança e Partes */}
            <div className="space-y-6">
                <header className="flex items-center gap-3">
                    <Users size={18} className="text-blue-600" />
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[2px]">Governança e Partes</h3>
                </header>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-5">
                    <TraceLabel label="Empresa Parceira" value={inspectorFile.organizationName || 'Não Identificada'} />
                    <TraceLabel label="Responsável Vital" value={signatures.step1_release?.userName || 'PENDENTE'} />
                    <div className="pt-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                            Usuário Cliente <UserPlus size={10} className="text-blue-500" />
                        </p>
                        <p className="text-xs font-black text-slate-800 uppercase">
                            {signatures.step2_documental?.userName || 'AGUARDANDO ACESSO'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Seção 3: Janela de Auditoria */}
            <div className="space-y-6">
                <header className="flex items-center gap-3">
                    <Clock size={18} className="text-blue-600" />
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[2px]">Janela de Auditoria</h3>
                </header>
                <div className="space-y-4">
                    <TraceIconLabel 
                        icon={<ArrowUpRight size={16} className="text-blue-600" />} 
                        label="Início do Ciclo" 
                        value={signatures.step1_release ? new Date(signatures.step1_release.timestamp).toLocaleDateString() : 'PENDENTE'} 
                        bg="bg-blue-50"
                    />
                    <TraceIconLabel 
                        icon={<Calendar size={16} className="text-emerald-600" />} 
                        label="Conclusão Técnica" 
                        value={signatures.step7_certification ? new Date(signatures.step7_certification.timestamp).toLocaleDateString() : 'PENDENTE'} 
                        bg="bg-emerald-50"
                    />
                </div>
            </div>

            <footer className="mt-auto pt-10 text-center">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[4px]">Vital Cloud Protocol v4.2</p>
            </footer>
          </aside>

          {/* Área Principal */}
          <main className="flex-1 overflow-y-auto custom-scrollbar bg-white">
            <div className="max-w-4xl mx-auto p-6 md:p-10 lg:p-12">
              
              {/* Tab Navigation (Scrollable on Mobile) */}
              <nav className="mb-8 flex items-center gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth" role="tablist">
                  <TabItem active={activeTab === 'workflow'} onClick={() => setActiveTab('workflow')} icon={Activity} label="Fluxo" />
                  {isQuality && <TabItem active={activeTab === 'new_version'} onClick={() => setActiveTab('new_version')} icon={GitBranch} label="Nova Versão" />}
                  <TabItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} label="Histórico" />
              </nav>

              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === 'workflow' && (
                  <AuditWorkflow 
                    metadata={inspectorFile.metadata} 
                    userRole={user?.role as UserRole} 
                    userName={user?.name || ''}
                    userEmail={user?.email || ''}
                    fileId={inspectorFile.id}
                    onUpdate={handleInspectAction}
                    onUploadStepEvidence={handleUploadStepEvidence}
                  />
                )}
                {activeTab === 'new_version' && isQuality && (
                  <NewVersionUploadView file={inspectorFile} userRole={user?.role as UserRole} onUpload={handleCreateNewVersion} onDownload={handleDownload} />
                )}
                {activeTab === 'history' && (
                  <VersionHistoryView file={inspectorFile} userRole={user?.role as UserRole} onUpload={async () => {}} onDownload={handleDownload} />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
};

/* Componentes de Estilo Conforme Imagem */
const TraceLabel = ({ label, value }: { label: string; value: string }) => (
    <div className="min-w-0">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[1.5px] leading-none mb-1.5">{label}</p>
        <p className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{value}</p>
    </div>
);

const TraceIconLabel = ({ icon, label, value, bg }: any) => (
    <div className="flex items-center gap-4 group">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105`}>
            {icon}
        </div>
        <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-[11px] font-black text-slate-800 uppercase">{value}</p>
        </div>
    </div>
);

const TabItem = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
      active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'
    }`}
  >
    <Icon size={14} /> {label}
  </button>
);

const ErrorLayout = ({ onBack }: { onBack: () => void }) => (
  <Layout title="Erro">
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
      <AlertCircle size={48} className="text-red-500 mb-4 opacity-20" />
      <p className="text-sm font-black text-slate-400 uppercase tracking-[3px]">Ativo Indisponível</p>
      <button onClick={onBack} className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Voltar ao Portfólio</button>
    </div>
  </Layout>
);