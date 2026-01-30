
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { ClientOrganization, User, AccountStatus } from '../../../../types/index.ts';
import { adminService } from '../../../../lib/services/index.ts';
import { ClientFormData } from '../modals/ClientManagementModal.tsx';

interface UseAdminClientProps {
  setIsSaving: (state: boolean) => void;
  isSavingGlobal: boolean;
  qualityAnalysts: User[];
}

export const useAdminClientManagement = ({ setIsSaving, isSavingGlobal, qualityAnalysts }: UseAdminClientProps) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [clientsList, setClientsList] = useState<ClientOrganization[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Paginação
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientOrganization | null>(null);
  
  const [clientFormData, setClientFormData] = useState<ClientFormData>({
    name: '',
    cnpj: '',
    contractDate: '',
    status: AccountStatus.ACTIVE,
    qualityAnalystId: '',
  });

  const loadClients = useCallback(async () => {
    setIsLoadingClients(true);
    try {
      const response = await adminService.getClients({ search: searchTerm }, page, pageSize);
      setClientsList(response.items);
      setTotalItems(response.total);
    } catch (err: any) {
      const msg = err?.message || err?.details || 'Erro ao carregar portfólio';
      showToast(msg, 'error');
    } finally {
      setIsLoadingClients(false);
    }
  }, [showToast, searchTerm, page, pageSize]);

  useEffect(() => {
    if (user) {
        const timer = setTimeout(loadClients, 300);
        return () => clearTimeout(timer);
    }
  }, [user, loadClients]);

  const handleSaveClient = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSavingGlobal) return;

    setIsSaving(true);
    try {
      const analyst = qualityAnalysts.find(qa => qa.id === clientFormData.qualityAnalystId);
      
      const payload: Partial<ClientOrganization> = {
        ...clientFormData,
        id: editingClient?.id,
        qualityAnalystName: analyst?.name,
      };

      await adminService.saveClient(user, payload);
      showToast(`Empresa ${editingClient ? 'atualizada' : 'registrada'} com sucesso!`, 'success');
      setIsClientModalOpen(false);
      await loadClients();
    } catch (err: any) {
      const msg = err?.message || err?.details || 'Falha na persistência de dados técnicos.';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [user, clientFormData, editingClient, qualityAnalysts, showToast, setIsSaving, loadClients, isSavingGlobal]);

  const openClientModal = useCallback((client?: ClientOrganization) => {
    if (client) {
      setEditingClient(client);
      setClientFormData({
        name: client.name,
        cnpj: client.cnpj,
        contractDate: client.contractDate,
        status: client.status,
        qualityAnalystId: client.qualityAnalystId || '',
      });
    } else {
      setEditingClient(null);
      setClientFormData({
        name: '',
        cnpj: '',
        contractDate: new Date().toISOString().split('T')[0],
        status: AccountStatus.ACTIVE,
        qualityAnalystId: '',
      });
    }
    setIsClientModalOpen(true);
  }, []);

  return {
    clientsList,
    totalItems,
    isLoadingClients,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    pageSize,
    setPageSize,
    isClientModalOpen,
    setIsClientModalOpen,
    editingClient,
    openClientModal,
    handleSaveClient,
    clientFormData,
    setClientFormData,
  };
};
