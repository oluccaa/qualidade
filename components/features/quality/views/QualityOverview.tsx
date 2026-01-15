
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { fileService, adminService } from '../../../../lib/services/index.ts';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { QualityOverviewStats } from '../../../../lib/services/interfaces.ts';
import { QualityLoadingState, ErrorState } from '../components/ViewStates.tsx';
import { QualityOverviewCards } from '../components/QualityOverviewCards.tsx';
import { ShieldCheck, Info, ArrowRight } from 'lucide-react';

export const QualityOverview: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [, setSearchParams] = useSearchParams();

  const [stats, setStats] = useState<QualityOverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBaseData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const [globalStats, activeClientsRes] = await Promise.all([
          fileService.getDashboardStats(user),
          adminService.getClients({ status: 'ACTIVE' }, 1, 1), 
        ]);
        setStats({
          pendingDocs: globalStats.pendingValue || 0,
          totalActiveClients: activeClientsRes.total || 0
        });
      } catch (err) {
        setError(t('quality.errorLoadingQualityData'));
        showToast(t('quality.errorLoadingQualityData'), 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadBaseData();
  }, [user, showToast, t]);

  if (isLoading) return <QualityLoadingState message="Sincronizando Indicadores..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <QualityOverviewCards
        totalClients={stats?.totalActiveClients || 0}
        totalPendingDocs={stats?.pendingDocs || 0}
        onChangeView={(v) => setSearchParams({ view: v })}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#081437] rounded-[2rem] p-10 text-white relative overflow-hidden shadow-xl border border-white/5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
               <span className="px-3 py-1 bg-[#b23c0e] rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg">Protocolo SQA</span>
               <div className="h-1 w-1 rounded-full bg-blue-400"></div>
               <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Sistemas Nominais</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight leading-tight max-w-xl">
              Backlog de Inspeção:<br/>
              <span className="text-[#b23c0e]">{stats?.pendingDocs || 0} Certificados</span> em aguardo.
            </h2>
            <p className="text-slate-400 max-w-sm text-sm font-medium leading-relaxed">
              Otimize o SLA de análise para garantir a fluidez operacional da cadeia produtiva Aços Vital.
            </p>
            <button 
              onClick={() => setSearchParams({ view: 'clients' })}
              className="mt-4 flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/10 active:scale-95 group transition-all"
            >
              Iniciar Mutirão <ArrowRight size={14} className="text-[#b23c0e] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 flex flex-col justify-between shadow-sm">
          <div className="space-y-6">
            <header className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-tight">Status Compliance</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ISO 9001:2015 Ativo</p>
              </div>
            </header>
            <div className="space-y-5">
               <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <span>Acuracidade Técnica</span>
                    <span className="text-emerald-600">99.8%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[99.8%]" />
                  </div>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                  <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    Validamos a composição química e propriedades mecânicas de cada lote para assegurar rastreabilidade.
                  </p>
               </div>
            </div>
          </div>
          <p className="text-[9px] text-slate-400 font-semibold text-center mt-6 uppercase tracking-[0.3em]">Governance v2.4</p>
        </div>
      </div>
    </div>
  );
};
