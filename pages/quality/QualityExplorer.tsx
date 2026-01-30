
import React from 'react';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { FolderTree } from 'lucide-react';
import { FileExplorerView } from '../../components/features/quality/views/FileExplorerView.tsx';

const QualityExplorer: React.FC = () => {
  return (
    <Layout title="Cloud Industrial Aços Vital">
        <FileExplorerView 
            orgId="global" 
            title="Repositório Global"
            icon={FolderTree}
            subtitle="Navegação completa na infraestrutura Vital"
        />
    </Layout>
  );
};

export default QualityExplorer;
