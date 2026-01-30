import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientHub } from '../components/ClientHub.tsx';
import { ClientManagementModal } from '../../admin/modals/ClientManagementModal.tsx';
import { ClientListToolbar, ClientListFilters } from '../components/ClientListControls.tsx';
import { ProcessingOverlay } from '../components/ViewStates.tsx';
import { PaginationControls } from '../../../common/PaginationControls.tsx';
import { useQualityClientManagement } from '../hooks/useQualityClientManagement.ts';
import { ClientOrganization } from '../../../../types/index.ts';

interface ClientListProps {
  onSelectClient: (client: ClientOrganization) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ onSelectClient }) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortKey, setSortKey] = useState<'NAME' | 'PENDING' | 'NEWEST' | 'LAST_ANALYSIS'>('NAME');

  const {
    sortedClients, clientSearch, setClientSearch, clientStatus, setClientStatus,
    isLoadingClients, isProcessing, qualityAnalysts, clientModal,
    page, setPage, pageSize, setPageSize, totalItems
  } = useQualityClientManagement(0);

  return (
    <div className="flex-1 flex flex-col space-y-6 animate-in fade-in duration-500 w-full h-full">
      {isProcessing && <ProcessingOverlay message="Atualizando Base de Dados..." />}

      <ClientManagementModal
        isOpen={clientModal.isOpen}
        onClose={() => clientModal.setOpen(false)}
        onSave={clientModal.save}
        onFlagDeletion={clientModal.flagDeletion}
        editingClient={clientModal.editing}
        clientFormData={clientModal.data}
        setClientFormData={clientModal.setData}
        qualityAnalysts={qualityAnalysts}
        requiresConfirmation={true}
      />

      <div className="shrink-0 space-y-4">
        <ClientListToolbar 
          search={clientSearch}
          onSearchChange={setClientSearch}
          onAddCompany={() => clientModal.open()}
          isLoading={isLoadingClients}
          t={t}
        />

        <ClientListFilters 
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortKey={sortKey}
          onSortChange={setSortKey}
          status={clientStatus}
          onStatusChange={setClientStatus}
          t={t}
        />
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <ClientHub
          clients={sortedClients}
          onSelectClient={onSelectClient}
          onEditClient={(client) => clientModal.open(client)}
          onFlagDeletion={(clientId) => clientModal.flagDeletion(clientId)}
          isLoading={isLoadingClients}
          isLoadingMore={false}
          hasMore={false}
          onLoadMore={() => {}}
          viewMode={viewMode}
          sortKey={sortKey}
        />
        
        <PaginationControls 
          currentPage={page}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          isLoading={isLoadingClients}
        />
      </div>
    </div>
  );
};