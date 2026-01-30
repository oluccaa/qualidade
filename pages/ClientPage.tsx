
import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout/MainLayout.tsx';
import ClientDashboard from './dashboards/ClientDashboard.tsx';
import { ClientLibraryView } from '../components/features/client/views/ClientLibraryView.tsx';

const ClientPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = searchParams.get('view') || 'home';

  const handleViewChange = useCallback((viewId: string) => {
    setSearchParams(prev => {
      prev.set('view', viewId);
      if (viewId !== 'files') prev.delete('folderId');
      return prev;
    }, { replace: true });
  }, [setSearchParams]);

  return (
    <Layout 
      title={activeView === 'home' ? "Dashboard do Parceiro" : "Biblioteca de arquivos"} 
      clientNav={{
        activeView,
        onViewChange: handleViewChange
      }}
    >
      <main className="animate-in fade-in slide-in-from-bottom-3 duration-700">
        {activeView === 'home' ? <ClientDashboard /> : <ClientLibraryView />}
      </main>
    </Layout>
  );
};

export default ClientPage;
