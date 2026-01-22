import React, { useState, useEffect, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../../lib/services/index.ts';
import { supabase } from '../../../../lib/supabaseClient.ts';
import { useAuth } from '../../../../context/authContext.tsx';
import { useToast } from '../../../../context/notificationContext.tsx';
import { QualityOverviewCards } from '../components/QualityOverviewCards.tsx';
import { ArrowRight, FileWarning, Zap, Radio, ArrowUpRight } from 'lucide-react';
import { QualityStatus } from '../../../../types/enums.ts';

export const QualityOverview: React.FC = memo(() => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const loadStats = useCallback(async () => {
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
      showToast("Erro ao sincronizar indicadores operacionais.", 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    loadStats();

    const channel = supabase
      .channel('quality_global_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'files' }, (payload) => {
          loadStats();
          if (payload.eventType === 'INSERT' && (payload.new as any).type !== 'FOLDER') {
            showToast(`Novo ativo detectado: ${(payload.new as any).name}`, 'info');
          }
      })
      .subscribe((status) => {
          setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadStats, showToast]);

  if (isLoading) return <QualityOverviewSkeleton />;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-12">
      
      <header className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${isLive ? 'bg-blue-600 animate-pulse' : 'bg-slate-400'}`} />
              <h2 className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Fluxo Operacional Vital</h2>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-500 ${isLive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>
              <Radio size={12} className={isLive ? 'animate-pulse' : ''} />
              <span className="text-[9px] font-black uppercase tracking-widest">{isLive ? 'Sincronia Live' : 'Reconectando...'}</span>
          </div>
      </header>

      <div className="animate-stagger" style={{ animationDelay: '100ms' }}>
        <QualityOverviewCards
            totalClients={stats?.totalActiveClients || 0}
            totalPendingDocs={stats?.pendingDocs || 0}
            complianceRate={stats?.complianceRate || "0"}
            totalRejected={stats?.rejectedByClient || 0}
            onNavigate={(path) => navigate(path)}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 group animate-stagger" style={{ animationDelay: '200ms' }}>
            <button 
                onClick={() => navigate('/quality/portfolio')}
                className="w-full h-full bg-[#132659] rounded-[2.5rem] p-8 lg:p-10 text-white text-left relative overflow-hidden shadow-xl border border-white/5 transition-all hover:shadow-blue-900/30 active:scale-[0.99]"
            >
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 h-full">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg shadow-lg">
                                <Zap size={18} className="fill-white text-white" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[3px] text-blue-400">Gestão de Ativos</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight uppercase max-w-md">
                            Certificar Novos<br/>
                            <span className="text-white/40">Lotes Industriais.</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[1.5rem] border border-white/10 backdrop-blur-md">
                        <span className="text-[9px] font-black uppercase tracking-[2px]">Carteira</span>
                        <div className="w-10 h-10 bg-white text-[#132659] rounded-xl flex items-center justify-center shadow-lg group-hover:translate-x-1.5 transition-transform">
                            <ArrowRight size={20} strokeWidth={3} />
                        </div>
                    </div>
                </div>
            </button>
        </div>

        <div className="xl:col-span-4 h-full animate-stagger" style={{ animationDelay: '300ms' }}>
            <button 
                onClick={() => navigate('/quality/monitor')}
                className="w-full bg-white rounded-[2.5rem] border-2 border-red-50 p-8 text-left flex flex-col justify-between shadow-sm group hover:border-red-500/20 transition-all h-full active:scale-[0.98]"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-105">
                            <FileWarning size={24} strokeWidth={2.5} />
                        </div>
                        <span className={`px-3 py-1 text-white text-[8px] font-black uppercase tracking-widest rounded-lg ${stats?.rejectedByClient > 0 ? 'bg-red-600 animate-pulse' : 'bg-slate-300'}`}>
                            {stats?.rejectedByClient > 0 ? 'Crítico' : 'Estável'}
                        </span>
                    </div>
                    <div>
                        <h4 className="font-black text-slate-800 uppercase tracking-tight text-lg leading-none">Divergências</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ações Corretivas</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className={`text-5xl font-black tracking-tighter leading-none transition-colors duration-500 ${stats?.rejectedByClient > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                            {stats?.rejectedByClient || 0}
                        </p>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-red-50 flex items-center justify-between text-red-600">
                    <span className="text-[9px] font-black uppercase tracking-[2px]">Auditar</span>
                    <ArrowRight size={16} />
                </div>
            </button>
        </div>
      </div>
    </div>
  );
});

const QualityOverviewSkeleton = () => (
    <div className="space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[200px] rounded-[2.5rem] skeleton-shimmer shadow-sm" />
            ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8 h-[240px] rounded-[2.5rem] skeleton-shimmer shadow-sm" />
            <div className="xl:col-span-4 h-[240px] rounded-[2.5rem] skeleton-shimmer shadow-sm" />
        </div>
    </div>
);