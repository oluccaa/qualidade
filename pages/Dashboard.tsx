
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.tsx';
import { FileExplorer } from '../components/FileExplorer.tsx';
import { SupportModal } from '../components/SupportModal.tsx';
import { useAuth } from '../services/authContext.tsx';
// Fix: Import from services/index.ts to use the correctly typed and initialized service instances
import { fileService, adminService } from '../services/index.ts';
import { FileNode, LibraryFilters, SupportTicket, UserRole, SystemStatus } from '../types.ts';
import { useTranslation } from 'react-i18next';
import { 
    Search, 
    ArrowRight, 
    Filter,
    XCircle,
    Star,
    History,
    CheckCircle2,
    ShieldCheck,
    LifeBuoy,
    Plus,
    Clock,
    AlertCircle,
    MessageSquare,
    FileText,
    TrendingUp,
    Zap,
    Bell,
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
  
  // View State
  const queryParams = new URLSearchParams(location.search);
  const currentView = queryParams.get('view') || 'home'; 

  // --- HOME VIEW STATE ---
  const [quickSearch, setQuickSearch] = useState('');
  const [stats, setStats] = useState<any>({ 
      mainValue: 0, subValue: 0, pendingValue: 0, 
      status: 'REGULAR', mainLabel: '', subLabel: '', activeClients: 0 
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({ mode: 'ONLINE' });

  // --- DATA STATE ---
  const [viewFiles, setViewFiles] = useState<FileNode[]>([]);
  const [recentFiles, setRecentFiles] = useState<FileNode[]>([]); 
  const [clientTickets, setClientTickets] = useState<SupportTicket[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<LibraryFilters>({
      startDate: '',
      endDate: '',
      status: 'ALL',
      search: ''
  });

  // --- MODAL STATE ---
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Main Data Fetcher
  const fetchData = useCallback(async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
          // Fix: Use instance methods from fileService and adminService
          const data = await fileService.getDashboardStats(user);
          const sysData = await adminService.getSystemStatus();
          setStats(data);
          setSystemStatus(sysData);

          if (currentView === 'home') {
              const recents = await fileService.getRecentFiles(user, 5);
              setRecentFiles(recents);
              // Also fetch tickets for the "Mini Widget"
              const tickets = await adminService.getMyTickets(user);
              setClientTickets(tickets.slice(0, 3));
          } else if (currentView === 'files') {
              const results = await fileService.getLibraryFiles(user, filters);
              setViewFiles(results);
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
      const timeoutId = setTimeout(fetchData, 100);
      return () => clearTimeout(timeoutId);
  }, [fetchData, currentView]);

  const handleSupportClose = () => {
      setIsSupportModalOpen(false);
      if (currentView === 'tickets') fetchData(); 
  };

  const clearFilters = () => {
      setFilters({ startDate: '', endDate: '', status: 'ALL', search: '' });
  };

  // --- UI HELPERS ---
  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Bom dia';
      if (hour < 18) return 'Boa tarde';
      return 'Boa noite';
  };

  const getTicketStatusColor = (status: string) => {
      switch (status) {
          case 'RESOLVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
          case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
          default: return 'bg-orange-100 text-orange-700 border-orange-200';
      }
  };

  // --- SUB-COMPONENTS (Local) ---

  const KpiCard = ({ icon: Icon, label, value, subtext, color, onClick }: any) => (
      <div 
        onClick={onClick}
        className={`
            relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer group transition-all duration-300 hover:shadow-lg hover:-translate-y-1
        `}
      >
          <div className={`absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity text-${color}-600 transform scale-150 -translate-y-2 translate-x-2`}>
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

  // --- RENDER: HOME VIEW (CLIENT COMMAND CENTER) ---
  if (currentView === 'home') {
      const openTicketCount = clientTickets.filter(t => t.status !== 'RESOLVED').length;

      return (
        <Layout title={t('menu.dashboard')}>
          <SupportModal isOpen={isSupportModalOpen} onClose={handleSupportClose} />
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
              
              {/* 1. HERO SECTION: Welcome & Global Status */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[280px]">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                        
                        <div className="relative z-10 max-w-2xl">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-slate-900/20">
                                    Portal do Cliente
                                </span>
                                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                    <CalendarDays size={12} /> {new Date().toLocaleDateString()}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">
                                {getGreeting()}, {user?.name.split(' ')[0]}.
                            </h1>
                            <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-8">
                                O status da sua conta é {stats.status === 'REGULAR' ? 'Saudável' : 'Requer Atenção'}. 
                                Você possui {stats.subValue} documentos processados e {openTicketCount} chamado{openTicketCount !== 1 ? 's' : ''} em aberto.
                            </p>

                            {/* Intelligent Search Bar */}
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

                        {/* Quick Filter Tags */}
                        <div className="flex flex-wrap gap-2 mt-6 relative z-10">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider py-1.5 mr-2">Acesso Rápido:</span>
                            <button onClick={() => navigate('/dashboard?view=recent')} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm flex items-center gap-1.5"><History size={12}/> Recentes</button>
                            <button onClick={() => navigate('/dashboard?view=favorites')} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:border-yellow-300 hover:text-yellow-600 transition-all shadow-sm flex items-center gap-1.5"><Star size={12}/> Favoritos</button>
                            <button onClick={() => {setFilters(prev => ({...prev, status: 'PENDING'})); navigate('/dashboard?view=files');}} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:border-orange-300 hover:text-orange-600 transition-all shadow-sm flex items-center gap-1.5"><Clock size={12}/> Pendentes</button>
                        </div>
                  </div>

                  {/* Right Column: Key Action & Status */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                      
                      {/* SYSTEM STATUS / MAINTENANCE CARD */}
                      <div className={`flex-1 rounded-3xl p-6 text-white relative overflow-hidden group shadow-xl ${systemStatus.mode === 'SCHEDULED' ? 'bg-gradient-to-br from-orange-600 to-orange-500' : 'bg-gradient-to-br from-slate-800 to-slate-900'}`}>
                          {/* Decorators */}
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

                              {systemStatus.mode === 'SCHEDULED' && systemStatus.scheduledStart ? (
                                   <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm border border-white/10 mt-4 shadow-inner">
                                       <div className="flex items-center gap-2 mb-2 text-white">
                                           <CalendarClock size={18} />
                                           <span className="font-bold text-sm">
                                               {new Date(systemStatus.scheduledStart).toLocaleDateString()} às {new Date(systemStatus.scheduledStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                           </span>
                                       </div>
                                       <p className="text-xs text-white/90 leading-relaxed font-medium">
                                           {systemStatus.message || 'O sistema passará por atualizações programadas. Planeje suas atividades.'}
                                       </p>
                                   </div>
                              ) : (
                                   <div className="mt-6 space-y-4">
                                       <p className="text-sm text-slate-300 leading-relaxed">
                                           Todos os serviços estão operacionais. Nenhuma interrupção prevista para as próximas 24 horas.
                                       </p>
                                       <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/30 w-fit px-3 py-1.5 rounded-full border border-emerald-500/20">
                                           <CheckCircle2 size={14} /> Monitoramento Ativo
                                       </div>
                                   </div>
                              )}
                          </div>
                      </div>

                      {/* Quick Ticket Action */}
                      <button onClick={() => setIsSupportModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-1 shadow-lg group hover:shadow-blue-500/20 transition-all active:scale-[0.98]">
                          <div className="bg-white rounded-[20px] p-4 flex items-center justify-between h-full group-hover:bg-blue-50/50 transition-colors">
                              <div className="flex items-center gap-4">
                                  <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><LifeBuoy size={24}/></div>
                                  <div className="text-left">
                                      <span className="block font-bold text-slate-800">Precisa de Ajuda?</span>
                                      <span className="text-xs text-slate-500">Falar com Qualidade</span>
                                  </div>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                  <Plus size={18} />
                              </div>
                          </div>
                      </button>
                  </div>
              </div>

              {/* 2. KPI GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <KpiCard 
                    icon={FileText} label="Biblioteca Total" value={stats.subValue} subtext="Arquivos" color="blue" 
                    onClick={() => navigate('/dashboard?view=files')}
                  />
                  <KpiCard 
                    icon={Clock} label="Pendências" value={stats.pendingValue} subtext="Aguardando" color="orange" 
                    onClick={() => { setFilters(prev => ({...prev, status: 'PENDING'})); navigate('/dashboard?view=files'); }}
                  />
                  <KpiCard 
                    icon={MessageSquare} label="Meus Chamados" value={clientTickets.filter(t => t.status !== 'RESOLVED').length} subtext="Em aberto" color="indigo" 
                    onClick={() => navigate('/dashboard?view=tickets')}
                  />
              </div>

              {/* 3. INTEGRATED FILE WORKSPACE (FULL WIDTH) */}
              <div className="pb-10 space-y-4">
                  <div className="flex items-center justify-between px-1">
                      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                          <FileCheck size={20} className="text-blue-500" /> Documentos & Certificados
                      </h3>
                      <button onClick={() => navigate('/dashboard?view=files')} className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
                          Biblioteca Completa <ChevronRight size={14} />
                      </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[500px] flex flex-col">
                      <FileExplorer 
                          allowUpload={false} 
                          hideToolbar={false}
                          autoHeight={false} 
                      />
                  </div>
              </div>
          </div>
        </Layout>
      );
  }

  // --- RENDER: OTHER VIEWS (Library, Favorites, etc.) ---
  // Reuse existing layouts but wrapped in Layout
  
  let pageTitle = t('dashboard.libraryTitle');
  let pageIcon = <Filter size={20} className="text-blue-500" />;
  let showFilters = currentView === 'files';

  if (currentView === 'favorites') {
      pageTitle = t('dashboard.favoritesTitle');
      pageIcon = <Star size={20} className="text-yellow-500" fill="currentColor" />;
  } else if (currentView === 'recent') {
      pageTitle = t('dashboard.historyTitle');
      pageIcon = <History size={20} className="text-orange-500" />;
  } else if (currentView === 'tickets') {
      pageTitle = t('dashboard.ticketsTitle');
      pageIcon = <LifeBuoy size={20} className="text-red-500" />;
  }

  return (
    <Layout title={pageTitle}>
        <SupportModal isOpen={isSupportModalOpen} onClose={handleSupportClose} />

        <div className="flex flex-col gap-6 h-[calc(100vh-140px)]">
            
            {/* Advanced Filters Bar - ONLY for Library View */}
            {showFilters && (
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in slide-in-from-top-2">
                    {/* Search Term */}
                    <div className="md:col-span-4 lg:col-span-5 space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.textSearch')}</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder={t('dashboard.searchPlaceholder')}
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="md:col-span-3 lg:col-span-3 space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.period')}</label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <input 
                                    type="date" 
                                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                            </div>
                            <span className="text-slate-400">-</span>
                            <div className="relative flex-1">
                                <input 
                                    type="date" 
                                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="md:col-span-3 lg:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('common.status')}</label>
                        <select 
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                        >
                            <option value="ALL">{t('common.all')}</option>
                            <option value="APPROVED">{t('common.status')} {t('dashboard.active')}</option>
                            <option value="PENDING">{t('common.status')} Pendente</option>
                        </select>
                    </div>

                    {/* Clear Actions */}
                    <div className="md:col-span-2 lg:col-span-2 flex justify-end">
                        {(filters.search || filters.startDate || filters.endDate || filters.status !== 'ALL') && (
                            <button 
                                onClick={clearFilters}
                                className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <XCircle size={16} /> {t('dashboard.clear')}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Results Area */}
            {/* Removed overflow-hidden from wrapper to prevent clipping dropdowns */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col relative">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl z-10 relative">
                    <div className="flex items-center gap-2">
                        {pageIcon}
                        <div className="flex flex-col">
                            <h2 className="font-bold text-slate-700">{pageTitle}</h2>
                            {currentView === 'tickets' && <span className="text-[10px] text-slate-400">{t('dashboard.ticketsIntro')}</span>}
                        </div>
                        {currentView !== 'tickets' && (
                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">
                                {viewFiles.length}
                            </span>
                        )}
                    </div>
                    {currentView === 'favorites' && (
                        <p className="text-xs text-slate-400 hidden sm:block">{t('dashboard.quickAccessItems')}</p>
                    )}
                    {currentView === 'tickets' && (
                        <button 
                            onClick={() => setIsSupportModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
                        >
                            <Plus size={16} /> {t('dashboard.openTicket')}
                        </button>
                    )}
                </div>
                
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : currentView === 'tickets' ? (
                    /* --- TICKETS VIEW RENDER --- */
                    <div className="flex-1 overflow-auto bg-slate-50 p-4 rounded-b-2xl">
                        {clientTickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <MessageSquare size={48} className="mb-4 text-slate-200" />
                                <p className="font-medium">{t('dashboard.noTickets')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {clientTickets.map(ticket => (
                                    <div key={ticket.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getTicketStatusColor(ticket.status)}`}>
                                                    {ticket.status === 'RESOLVED' ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                                                    {t(`admin.tickets.status.${ticket.status}`)}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-mono">#{ticket.id}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">{ticket.createdAt}</span>
                                        </div>
                                        
                                        <h3 className="font-bold text-slate-800 text-sm mb-2 group-hover:text-blue-600 transition-colors">{ticket.subject}</h3>
                                        
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
                                            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                                                {ticket.description}
                                            </p>
                                        </div>

                                        {ticket.resolutionNote && (
                                            <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in">
                                                <p className="text-[10px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                                                    <CheckCircle2 size={10} className="text-emerald-500" /> {t('dashboard.ticketResolution')}
                                                </p>
                                                <p className="text-xs text-slate-600 italic bg-emerald-50/50 p-2 rounded text-emerald-800 border border-emerald-100">
                                                    "{ticket.resolutionNote}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* --- FILES VIEW RENDER --- */
                    <div className="flex-1 flex flex-col min-h-0 rounded-b-2xl">
                        <FileExplorer 
                            allowUpload={false} 
                            externalFiles={viewFiles} 
                            flatMode={true} 
                            onRefresh={fetchData} 
                        />
                    </div>
                )}
            </div>
        </div>
    </Layout>
  );
};

export default Dashboard;
