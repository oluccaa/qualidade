
import React from 'react';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { QualityPortfolioView } from '../../components/features/quality/views/QualityPortfolioView.tsx';

const QualityMonitor: React.FC = () => {
  return (
    <Layout title="Monitoria da Carteira">
      {/* 
          REMOVIDO: overflow-hidden e h-full
          ALTERADO: w-full para garantir largura, mas altura livre
      */}
      <div className="w-full animate-in fade-in duration-500">
          <QualityPortfolioView />
      </div>
    </Layout>
  );
};

export default QualityMonitor;
