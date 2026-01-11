import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.tsx';
import { FileExplorer } from '../components/FileExplorer.tsx';
import { SupportModal } from '../components/SupportModal.tsx';
import { useAuth } from '../services/authContext.tsx';
import { fileService, adminService } from '../services/index.ts';
import { FileNode, LibraryFilters, SupportTicket, SystemStatus } from '../types.ts';
import { useTranslation } from 'react-i18next';
import { 
    Search, 
    ArrowRight, 
    CheckCircle2,
    LifeBuoy,
    Plus,
    Clock,
    MessageSquare,
    FileText,
    ChevronRight,
    CalendarDays,
    FileCheck,
    Server,
    AlertTriangle,
    CalendarClock
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const queryParams = new URLSearchParams(location.search);
  const currentView = queryParams.get('view') || 'home'; 

  const [quickSearch, setQuickSearch] = useState('');
  const [stats, setStats] = useState<any>({ 
      mainValue: 0, subValue: 0, pendingValue: 0, 
      status: 'REGULAR', mainLabel: '', subLabel: '', activeClients: 0 
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({ mode: 'ONLINE' });

  const [viewFiles, setViewFiles] = useState<FileNode[]>([]);
  const [clientTickets, setClientTickets] = useState<SupportTicket[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<LibraryFilters>({
      startDate: '',
      endDate: '',
      status: 'ALL',
      search: ''
  });

  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
          const data = await fileService.getDashboardStats(user);
          const sysData = await adminService.getSystemStatus();
          setStats(data);
          setSystemStatus(sysData);

          if (currentView === 'home') {
              const tickets = await adminService.getMyTickets(user);
              setClientTickets(tickets.slice(0, 3));
          } else if (currentView === 'files') {
              const results = await fileService.getLibraryFiles(user, filters);
              setViewFiles(results.items);
          } else if (currentView === 'favorites') {
              const results = await fileService.getFavorites(user);
              setViewFiles(results);
          } else if (currentView === 'recent') {
              const results = await fileService.getRecentFiles(user, 50); 
              setViewFiles(results);
          } else if (currentView === 'tickets') {
              const results = await adminService.getMyTickets(user);
              results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              setClientTickets(results);
          }
      } finally {
          setIsLoading(false);
      }
  }, [user, currentView, filters]);

  useEffect(() => {
      fetchData();
  }, [fetchData]);

  const handleSupportClose = () => {
      setIsSupportModalOpen(false);
      if (currentView === 'tickets') fetchData(); 
  };

  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Bom dia';
      if (hour < 18) return 'Boa tarde';
      return 'Boa noite';
  };

  const KpiCard = ({ icon: Icon, label, value, subtext, color, onClick }: any) => (
      <div 
        onClick={onClick}
        className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer group transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      >
          <div className={`absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 text-${color}-600 transform scale-150 -translate-y-2 translate-x-2`}>
              <Icon size={100} />
          </div>
          <div className="relative z-10">
              <div className={`w-12 h-12 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                  <Icon size={24} />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
              {subtext && <p className={`text-xs font-medium mt-2 text-${color}-600 bg-${color}-50 inline-block px-2 py-0.5 rounded-full`}>{subtext}</p>}
          </div>
      </div>
  );

  if (currentView === 'home') {
      const openTicketCount = clientTickets.filter(t => t.status !== 'RESOLVED').length;

      return (
        <Layout title={t('menu.dashboard')}>
          <SupportModal isOpen={isSupportModalOpen} onClose={handleSupportClose} />
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[320px]">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                        
                        <div className="relative z-10 max-w-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-slate-900/20">
                                    Portal Vital Link
                                </span>
                                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                    <CalendarDays size={12} /> {new Date().toLocaleDateString()}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">
                                {getGreeting()}, {user?.name.split(' ')[0]}.
                            </h1>
                            <p className="text-slate-500 text-sm md:text-base max-w-lg mb-8">
                                Centralize seus certificados de qualidade e garanta a rastreabilidade total de seus materiais.
                            </p>

                            <div className="relative group max-w-lg">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm group-hover:shadow-md text-sm font-medium"
                                    placeholder={t('dashboard.searchPlaceholder')}
                                    value={quickSearch}
                                    onChange={(e) => setQuickSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && quickSearch) {
                                            setFilters(prev => ({ ...prev, search: quickSearch }));
                                            navigate('/dashboard?view=files');
                                        }
                                    }}
                                />
                                <div className="absolute inset-y-0 right-2 flex items-center">
                                    <button 
                                        onClick={() => {
                                            setFilters(prev => ({ ...prev, search: quickSearch }));
                                            navigate('/dashboard?view=files');
                                        }}
                                        className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95"
                                    >
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                  </div>

                  <div className="lg:col-span-4 flex flex-col gap-6">
                      <div className={`flex-1 rounded-3xl p-6 text-white relative overflow-hidden group shadow-xl ${systemStatus.mode === 'SCHEDULED' ? 'bg-gradient-to-br from-orange-600 to-orange-500' : 'bg-gradient-to-br from-slate-800 to-slate-900'}`}>
                          <div className="absolute top-0 right-0 p-6 opacity-10">
                              {systemStatus.mode === 'SCHEDULED' ? <AlertTriangle size={120} /> : <Server size={120} />}
                          </div>
                          
                          <div className="relative z-10 flex flex-col h-full justify-between">
                              <div>
                                  <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">Status do Sistema</p>
                                  <h3 className="text-2xl font-bold flex items-center gap-2">
                                      {systemStatus.mode === 'SCHEDULED' ? 'Manutenção Agendada' : 'Operação Normal'}
                                  </h3>
                              </div>

                              {systemStatus.mode === 'SCHEDULED' ? (
                                   <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm border border-white/10 mt-4 shadow-inner">
                                       <div className="flex items-center gap-2 mb-2 text-white">
                                           <CalendarClock size={18} />
                                           <span className="font-bold text-sm">
                                               {new Date(systemStatus.scheduledStart!).toLocaleDateString()}
                                           </span>
                                       </div>
                                       <p className="text-xs text-white/90 leading-relaxed font-medium">
                                           {systemStatus.message || 'Sistema em atualização programada.'}
                                       </p>
                                   </div>
                              ) : (
                                   <div className="mt-6 space-y-4">
                                       <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/30 w-fit px-3 py-1.5 rounded-full border border-emerald-500/20">
                                           <CheckCircle2 size={14} /> Monitoramento Vital Ativo
                                       </div>
                                   </div>
                              )}
                          </div>
                      </div>

                      <button onClick={() => setIsSupportModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-1 shadow-lg group hover:shadow-blue-500/20 transition-all active:scale-[0.98]">
                          <div className="bg-white rounded-[20px] p-4 flex items-center justify-between h-full group-hover:bg-blue-50/50 transition-colors">
                              <div className="flex items-center gap-4">
                                  <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><LifeBuoy size={24}/></div>
                                  <div className="text-left">
                                      <span className="block font-bold text-slate-800">Suporte Técnico</span>
                                      <span className="text-xs text-slate-500">Qualidade Vital</span>
                                  </div>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                  <Plus size={18} />
                              </div>
                          </div>
                      </button>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <KpiCard icon={FileText} label="Biblioteca" value={stats.subValue} subtext="Docs. Ativos" color="blue" onClick={() => navigate('/dashboard?view=files')} />
                  <KpiCard icon={Clock} label="Pendências" value={stats.pendingValue} subtext="Aguardando" color="orange" onClick={() => navigate('/dashboard?view=files&status=PENDING')} />
                  <KpiCard icon={MessageSquare} label="Chamados" value={openTicketCount} subtext="Em aberto" color="indigo" onClick={() => navigate('/dashboard?view=tickets')} />
              </div>

              <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                          <FileCheck size={20} className="text-blue-500" /> Certificados de Qualidade
                      </h3>
                      <button onClick={() => navigate('/dashboard?view=files')} className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
                          Explorar Tudo <ChevronRight size={14} />
                      </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[500px] flex flex-col">
                      <FileExplorer allowUpload={false} hideToolbar={false} />
                  </div>
              </div>
          </div>
        </Layout>
      );
  }

  return (
    <Layout title={t(`dashboard.${currentView}Title`) || "Portal"}>
        <SupportModal isOpen={isSupportModalOpen} onClose={handleSupportClose} />
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
            <FileExplorer allowUpload={false} externalFiles={viewFiles} flatMode={currentView !== 'files'} onRefresh={fetchData} />
        </div>
    </Layout>
  );
};

export default Dashboard;