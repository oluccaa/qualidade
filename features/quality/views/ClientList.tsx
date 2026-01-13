
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, UserPlus, Building2, LayoutGrid, List, Loader2 } from 'lucide-react';

import { ClientHub } from '../components/ClientHub.tsx';
import { UserModal, ClientModal } from '../../admin/components/AdminModals.tsx';
import { useQualityClientManagement } from '../hooks/useQualityClientManagement.ts';
import { ClientOrganization } from '../../../types/index.ts';

interface ClientListProps {
  onSelectClient: (client: ClientOrganization) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ onSelectClient }) => {
  const { t } = useTranslation();
  const [refreshTrigger] = useState(0);

  const {
    sortedClients,
    clientSearch,
    setClientSearch,
    clientStatus,
    setClientStatus,
    isLoadingClients,
    isLoadingMoreClients,
    hasMoreClients,
    handleLoadMoreClients,
    isProcessing,
    qualityAnalysts,

    isUserModalOpen,
    setIsUserModalOpen,
    editingUser,
    openUserModal,
    handleSaveUser,
    userFormData,
    setUserFormData,

    isClientModalOpen,
    setIsClientModalOpen,
    editingClient,
    openClientModal,
    handleSaveClient,
    clientFormData,
    setClientFormData,
  } = useQualityClientManagement(refreshTrigger);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortKey, setSortKey] = useState<'NAME' | 'PENDING' | 'NEWEST' | 'LAST_ANALYSIS'>('NAME');

  return (
    <>
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        editingUser={editingUser}
        formData={userFormData}
        setFormData={setUserFormData}
        organizations={sortedClients}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
        editingClient={editingClient}
        clientFormData={clientFormData}
        setClientFormData={setClientFormData}
        qualityAnalysts={qualityAnalysts}
        requiresConfirmation={true}
      />

      {isProcessing && (
        <div className="fixed top-4 right-1/2 translate-x-1/2 z-[110] bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <Loader2 size={14} className="animate-spin" /> {t('common.updatingDatabase')}
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col xl:flex-row justify-between items-center gap-4 mb-4">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={t('quality.searchClient')}
            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={clientSearch}
            onChange={e => setClientSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
          <button
            onClick={() => openUserModal()}
            className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
          >
            <UserPlus size={16} /> {t('quality.newClientUser')}
          </button>
          <button
            onClick={() => openClientModal()}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
          >
            <Building2 size={16} /> {t('quality.newCompany')}
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col xl:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><List size={18}/></button>
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={18}/></button>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl flex-1 xl:flex-none">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
            className="bg-transparent border-none text-xs font-bold text-slate-600 px-3 py-1.5 focus:ring-0 cursor-pointer"
          >
            <option value="NAME">{t('files.sort.nameAsc')}</option>
            <option value="PENDING">{t('dashboard.criticalPendencies')}</option>
            <option value="LAST_ANALYSIS">{t('dashboard.lastAnalysis')} ({t('files.sort.dateNew')})</option>
            <option value="NEWEST">{t('dashboard.recent')}</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl" role="group">
          {(['ALL', 'ACTIVE'] as const).map(status => (
            <button
              key={status}
              onClick={() => setClientStatus(status)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                clientStatus === status
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {status === 'ALL' ? t('dashboard.allClients') : t('dashboard.activeClients')}
            </button>
          ))}
        </div>
      </div>

      <ClientHub
        clients={sortedClients}
        clientSearch={clientSearch}
        setClientSearch={setClientSearch}
        clientStatus={clientStatus}
        setClientStatus={setClientStatus}
        onSelectClient={onSelectClient}
        isLoading={isLoadingClients}
        isLoadingMore={isLoadingMoreClients}
        hasMore={hasMoreClients}
        onLoadMore={handleLoadMoreClients}
        viewMode={viewMode}
        sortKey={sortKey}
      />
    </>
  );
};
