
import React from 'react';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { ClientList } from '../../components/features/quality/views/ClientList.tsx';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ScanEye, Building2, UserPlus, ShieldCheck } from 'lucide-react';
import { FileExplorerView } from '../../components/features/quality/views/FileExplorerView.tsx';
import { ClientManagementModal } from '../../components/features/admin/modals/ClientManagementModal.tsx';
import { useQualityClientManagement } from '../../components/features/quality/hooks/useQualityClientManagement.ts';
import { ProcessingOverlay } from '../../components/features/quality/components/ViewStates.tsx';

const QualityPortfolio: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orgId = searchParams.get('orgId');
  
  const {
    isProcessing,
    qualityAnalysts,
    clientModal
  } = useQualityClientManagement(0);

  return (
    <Layout title={orgId ? "Explorar Cliente" : "Gestão de Clientes"}>
      <div className="flex flex-col flex-1 h-full overflow-hidden animate-in fade-in duration-700">
        {isProcessing && <ProcessingOverlay message="Sincronizando protocolos..." />}
        
        <ClientManagementModal
          isOpen={clientModal.isOpen}
          onClose={() => clientModal.setOpen(false)}
          onSave={clientModal.save}
          editingClient={clientModal.editing}
          clientFormData={clientModal.data}
          setClientFormData={clientModal.setData}
          qualityAnalysts={qualityAnalysts}
          requiresConfirmation={true}
        />

        {/* Header Padronizado (Estilo Overview) */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
            <div className="flex items-center gap-4">
                {orgId ? (
                   <button 
                     onClick={() => navigate('/quality/portfolio')}
                     className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-[#b23c0e] hover:shadow-md transition-all group"
                   >
                     <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                   </button>
                ) : (
                    <div className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm border border-slate-200">
                        <Building2 size={24} />
                    </div>
                )}
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
                        {orgId ? "Exploração de Ativos" : "Diretório de Parceiros"}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium tracking-tight italic opacity-70">
                        {orgId ? "Auditoria e monitoramento de laudos em tempo real." : "Gestão cadastral e níveis de conformidade da carteira."}
                    </p>
                </div>
            </div>
            
            {!orgId ? (
                <button 
                  onClick={() => clientModal.open()}
                  className="bg-[#b23c0e] hover:bg-[#8a2f0b] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[2px] flex items-center gap-3 shadow-lg active:scale-95 transition-all"
                >
                  <UserPlus size={16} /> Novo Cadastro
                </button>
            ) : (
                <div className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 shadow-sm shrink-0">
                   <ScanEye size={20} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Modo Inspeção</span>
                </div>
            )}
        </header>

        {/* Conteúdo com scroll independente */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            {!orgId ? (
                <div className="h-full flex flex-col">
                    <ClientList onSelectClient={(c) => navigate(`/quality/portfolio?orgId=${c.id}`)} />
                </div>
            ) : (
                <div className="h-full">
                    <FileExplorerView orgId={orgId} />
                </div>
            )}
        </div>
      </div>
    </Layout>
  );
};

export default QualityPortfolio;
