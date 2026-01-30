import React from 'react';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { QualityPortfolioView } from '../../components/features/quality/views/QualityPortfolioView.tsx';

const QualityMonitor: React.FC = () => {
  return (
    <Layout title="Monitoria da Carteira">
      <div className="w-full h-full flex flex-col overflow-y-auto custom-scrollbar animate-in fade-in duration-500 px-6 md:px-10 pt-4 md:pt-8">
          <QualityPortfolioView />
      </div>
    </Layout>
  );
};

export default QualityMonitor;