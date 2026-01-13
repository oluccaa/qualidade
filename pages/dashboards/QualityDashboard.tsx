import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/layout/MainLayout.tsx';
import { useAuth } from '../../context/authContext.tsx';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { QualityOverview } from '../../features/quality/views/QualityOverview.tsx';
import { normalizeRole } from '../../types/index.ts';

const QualityDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const role = normalizeRole(user?.role);
    if (user && role !== 'QUALITY' && role !== 'ADMIN') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <Layout title={t('quality.overview')}>
      <div className="space-y-6">
        <QualityOverview />
      </div>
    </Layout>
  );
};

export default QualityDashboard;