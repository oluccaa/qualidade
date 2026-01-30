
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Building2, Edit2, Loader2 } from 'lucide-react';
import { ClientManagementModal } from '../modals/ClientManagementModal.tsx';
import { PaginationControls } from '../../../common/PaginationControls.tsx';
import { useAdminClientManagement } from '../hooks/useAdminClientManagement.ts';
import { User, ClientOrganization } from '../../../../types/index.ts';

interface AdminClientsProps {
  isSaving: boolean;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  qualityAnalysts: User[];
}

export const AdminClients: React.FC<AdminClientsProps> = ({ isSaving, setIsSaving, qualityAnalysts }) => {
  const { t } = useTranslation();
  const management = useAdminClientManagement({ setIsSaving, isSavingGlobal: isSaving, qualityAnalysts });

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6">
      <ClientManagementModal
        isOpen={management.isClientModalOpen}
        onClose={() => management.setIsClientModalOpen(false)}
        onSave={management.handleSaveClient}
        editingClient={management.editingClient}
        clientFormData={management.clientFormData}
        setClientFormData={management.setClientFormData}
        qualityAnalysts={qualityAnalysts}
        isSaving={isSaving}
      />

      <ClientsToolbar 
        searchTerm={management.searchTerm} 
        onSearchChange={management.setSearchTerm} 
        onAddClient={() => management.openClientModal()} 
      />

      <div className="flex-1 min-h-0 flex flex-col bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden animate-in fade-in duration-300">
        {management.isLoadingClients && management.clientsList.length === 0 ? (
          <LoadingClientsState t={t} />
        ) : (
          <>
            <div className="flex-1 overflow-auto custom-scrollbar">
                <ClientsTable 
                    clients={management.clientsList} 
                    onEdit={management.openClientModal} 
                    t={t} 
                />
            </div>

            <PaginationControls 
                currentPage={management.page}
                pageSize={management.pageSize}
                totalItems={management.totalItems}
                onPageChange={management.setPage}
                onPageSizeChange={management.setPageSize}
                isLoading={management.isLoadingClients}
            />
          </>
        )}
      </div>
    </div>
  );
};

const ClientsToolbar = ({ searchTerm, onSearchChange, onAddClient }: any) => (
  <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-2xl shadow-sm shrink-0">
    <div className="relative group w-full sm:w-auto flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--color-detail-blue)] transition-colors" size={16} />
      <input 
        type="text" 
        placeholder="Buscar empresa por nome ou CNPJ..." 
        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-[var(--color-detail-blue)]/20" 
        value={searchTerm} 
        onChange={e => onSearchChange(e.target.value)} 
      />
    </div>
    <button 
      onClick={onAddClient} 
      className="bg-[var(--color-primary-dark-blue)] hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[var(--color-primary-dark-blue)]/20"
    >
      <Building2 size={16} /> Nova Empresa
    </button>
  </div>
);

const ClientsTable = ({ clients, onEdit, t }: { clients: ClientOrganization[], onEdit: (c: ClientOrganization) => void, t: any }) => (
  <table className="w-full text-left border-collapse min-w-[800px]">
    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 z-10">
      <tr>
        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">Empresa / Razão Social</th>
        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">Documento Fiscal</th>
        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-center">Status</th>
        <th className="px-6 py-4 text-right"></th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 bg-white">
      {clients.map(client => (
        <tr key={client.id} className="hover:bg-slate-50/80 transition-colors group">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--color-detail-blue)] flex items-center justify-center font-bold border border-blue-100 shadow-sm shrink-0">
                {client.name.charAt(0)}
              </div>
              <p className="font-bold text-slate-900 text-sm truncate max-w-[250px]">{client.name}</p>
            </div>
          </td>
          <td className="px-6 py-4 text-xs text-slate-500 font-mono">{client.cnpj}</td>
          <td className="px-6 py-4 text-center">
            <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
              client.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}>
              {client.status}
            </span>
          </td>
          <td className="px-6 py-4 text-right">
            <button 
              onClick={() => onEdit(client)} 
              className="p-2 text-slate-400 hover:text-[var(--color-detail-blue)] hover:bg-blue-50 rounded-lg transition-all"
            >
              <Edit2 size={16} />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const LoadingClientsState = ({ t }: any) => (
  <div className="flex flex-col items-center justify-center flex-1" role="status">
    <Loader2 size={40} className="animate-spin text-[var(--color-detail-blue)]" aria-hidden="true" />
    <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[4px]">{t('common.loading')}</p>
  </div>
);
