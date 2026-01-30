
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../../lib/services/index.ts';
import { supabase } from '../../../../lib/supabaseClient.ts';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { QualityLoadingState } from '../components/ViewStates.tsx';
import { QualityOverviewCards } from '../components/QualityOverviewCards.tsx';
import { FileText, Send } from 'lucide-react';
import { QualityStatus } from '../../../../types/enums.ts';

export const QualityOverview: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      try {
        const [activeClientsRes, pendingRes, rejectedRes, totalRes, approvedRes] = await Promise.all([
          adminService.getClients({ status: 'ACTIVE' }, 1, 1),
          supabase.from('files').select('*', { count: 'exact', head: true }).eq('metadata->>status', QualityStatus.PENDING).neq('type', 'FOLDER'),
          supabase.from('files').select('*', { count: 'exact', head: true }).eq('metadata->>status', QualityStatus.REJECTED).neq('type', 'FOLDER'),
          supabase.from('files').select('*', { count: 'exact', head: true }).neq('type', 'FOLDER'),
          supabase.from('files').select('*', { count: 'exact', head: true }).eq('metadata->>status', QualityStatus.APPROVED).neq('type', 'FOLDER')
        ]);
        
        const totalFiles = totalRes.count || 0;
        const approvedFiles = approvedRes.count || 0;
        const complianceRate = totalFiles > 0 ? ((approvedFiles / totalFiles) * 100).toFixed(1) : "100";

        setStats({
          totalActiveClients: activeClientsRes.total || 0,
          pendingDocs: pendingRes.count || 0,
          rejectedByClient: rejectedRes.count || 0,
          complianceRate: complianceRate,
          totalFiles: totalFiles
        });
      } catch (err) {
        showToast("Erro ao sincronizar indicadores reais.", 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, [user]);

  if (isLoading) return <QualityLoadingState message="Sincronizando Lab..." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500 pb-20 px-6 md:px-8">
      
      {/* Hero Action Block (2x2) */}
      <div className="col-span-1 md:col-span-2 row-span-2 bg-[#132659] text-white rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl group flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all" />
          
          <div className="relative z-10 space-y-6">
             <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-600 rounded-lg text-[9px] font-black uppercase tracking-[3px] border border-blue-500/50">Lab Central</span>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             </div>
             <h2 className="text-4xl lg:text-5xl font-black tracking-tighter leading-[0.9]">
               Emissão de<br/>
               <span className="text-blue-400">Laudos Técnicos.</span>
             </h2>
             <p className="text-slate-400 max-w-sm text-sm font-medium leading-relaxed border-l-2 border-white/10 pl-4">
               Inicie o fluxo de auditoria selecionando um cliente para envio de novos certificados ou análise de backlog.
             </p>
          </div>

          <button 
            onClick={() => navigate('/quality/portfolio')}
            className="w-fit mt-8 bg-white text-[#132659] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[3px] shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-3"
          >
            <Send size={16} /> Acessar Carteira
          </button>
      </div>

      {/* KPI Blocks (Managed by QualityOverviewCards) */}
      <QualityOverviewCards
        totalClients={stats?.totalActiveClients || 0}
        totalPendingDocs={stats?.pendingDocs || 0}
        complianceRate={stats?.complianceRate || "0"}
        totalRejected={stats?.rejectedByClient || 0}
        onNavigate={(path) => navigate(path)}
      />

      {/* Rastreabilidade Block (Horizontal Long) */}
      <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                <FileText size={32} strokeWidth={1.5} />
            </div>
            <div>
               <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Rastreabilidade Total</h3>
               <p className="text-xs text-slate-500 font-medium mt-1">
                  Atualmente processando <b>{stats?.totalFiles || 0}</b> ativos no cluster Vital Cloud.
               </p>
            </div>
         </div>
         <button 
            onClick={() => navigate('/quality/audit')} 
            className="px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
         >
            Consultar Logs
         </button>
      </div>
    </div>
  );
};
