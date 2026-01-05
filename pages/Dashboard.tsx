
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.tsx';
import { FileExplorer } from '../components/FileExplorer.tsx';
import { SupportModal } from '../components/SupportModal.tsx';
import { useAuth } from '../services/authContext.tsx';
import { getRecentFiles, getLibraryFiles, getFileSignedUrl, getFavorites } from '../services/fileService.ts';
import * as adminService from '../services/adminService.ts';
import { FileNode, LibraryFilters, SupportTicket } from '../types.ts';
import { useTranslation } from 'react-i18next';
import { 
    Search, 
    Download, 
    ArrowRight, 
    Filter,
    XCircle,
    Star,
    History,
    CheckCircle2,
    ShieldCheck,
    Shield,
    LifeBuoy,
    Plus,
    Clock,
    AlertCircle,
    MessageSquare
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // View State
  const queryParams = new URLSearchParams(location.search);
  const currentView = queryParams.get('view') || 'home'; // 'home' | 'files' | 'recent' | 'favorites' | 'tickets'

  // --- HOME VIEW STATE ---
  const [quickSearch, setQuickSearch] = useState('');

  // --- DATA STATE ---
  const [viewFiles, setViewFiles] = useState<FileNode[]>([]);
  const [clientTickets, setClientTickets] = useState<SupportTicket[]>([]); // Tickets State
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<LibraryFilters>({
      startDate: '',
      endDate: '',
      status: 'ALL',
      search: ''
  });

  // --- MODAL STATE ---
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Main Data Fetcher based on View
  const fetchData = useCallback(async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
          if (currentView === 'files') {
              const results = await getLibraryFiles(user, filters);
              setViewFiles(results);
          } else if (currentView === 'favorites') {
              const results = await getFavorites(user);
              setViewFiles(results);
          } else if (currentView === 'recent') {
              const results = await getRecentFiles(user, 50); 
              setViewFiles(results);
          } else if (currentView === 'tickets') {
              const results = await adminService.getMyTickets(user);
              // Sort by Date Descending
              results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              setClientTickets(results);
          }
      } finally {
          setIsLoading(false);
      }
  }, [user, currentView, filters]);

  // Trigger fetch when view or filters change
  useEffect(() => {
      if (currentView !== 'home') {
          const timeoutId = setTimeout(fetchData, 300);
          return () => clearTimeout(timeoutId);
      }
  }, [fetchData, currentView]);

  // Close modal and refresh tickets
  const handleSupportClose = () => {
      setIsSupportModalOpen(false);
      if (currentView === 'tickets') fetchData(); 
  };

  const clearFilters = () => {
      setFilters({ startDate: '', endDate: '', status: 'ALL', search: '' });
  };

  const getTicketStatusColor = (status: string) => {
      switch (status) {
          case 'RESOLVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
          case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200';
          default: return 'bg-orange-100 text-orange-700 border-orange-200';
      }
  };

  const getStatusIcon = (status: string) => {
      switch (status) {
          case 'RESOLVED': return <CheckCircle2 size={14} />;
          case 'IN_PROGRESS': return <Clock size={14} />;
          default: return <AlertCircle size={14} />;
      }
  };

  // --- RENDER: HOME VIEW ---
  if (currentView === 'home') {
      return (
        <Layout title={t('menu.dashboard')}>
          
          {/* TOP GRID: SEARCH + STATUS CARD */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              
              {/* HERO / SEARCH SECTION */}
              <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/2"></div>
                  
                  <div className="relative z-10">
                      <h1 className="text-2xl font-bold text-slate-900 mb-2">
                          {t('dashboard.hello')}, {user?.name.split(' ')[0]}. {t('dashboard.whatLookingFor')}
                      </h1>
                      <p className="text-slate-500 mb-6">
                          {t('dashboard.whatLookingFor')}
                      </p>

                      <div className="relative group max-w-2xl">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                          </div>
                          <input
                              type="text"
                              className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm text-lg"
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
                                 className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                               >
                                  <ArrowRight size={20} />
                              </button>
                          </div>
                      </div>
                      
                      <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
                          <span className="font-medium text-slate-400 uppercase text-xs tracking-wider">{t('dashboard.suggestions')}:</span>
                          <button onClick={() => { setFilters(prev => ({...prev, search: 'SAE 1045'})); navigate('/dashboard?view=files'); }} className="hover:text-blue-600 hover:underline decoration-blue-600/30 underline-offset-4">SAE 1045</button>
                          <button onClick={() => { setFilters(prev => ({...prev, status: 'PENDING'})); navigate('/dashboard?view=files'); }} className="hover:text-blue-600 hover:underline decoration-blue-600/30 underline-offset-4">{t('dashboard.pendingCerts')}</button>
                      </div>
                  </div>
              </div>

              {/* STATUS CARD (Moved Up) */}
              <div className="xl:col-span-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl overflow-hidden text-white relative group min-h-[280px] flex flex-col justify-center">
                    {/* Animated Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Shield size={140} />
                    </div>

                    <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck size={16} className="text-emerald-400" /> {t('dashboard.accountStatus')}
                            </h3>
                            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                {t('dashboard.verified')}
                            </span>
                        </div>

                        <div>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-bold text-white tracking-tight">{t('dashboard.regular')}</span>
                                <span className="text-emerald-400 font-medium text-sm flex items-center gap-1">
                                    <CheckCircle2 size={14} /> {t('dashboard.active')}
                                </span>
                            </div>
                            
                            <p className="text-slate-400 text-sm leading-relaxed max-w-[90%]">
                                {t('dashboard.statusDesc')}
                            </p>
                        </div>

                        {/* Progress Section */}
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-medium text-slate-300">{t('dashboard.docCompliance')}</span>
                                <span className="text-xs font-bold text-emerald-400">100%</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-1000" 
                                    style={{ width: '100%' }}
                                ></div>
                            </div>
                        </div>

                        {/* Footer Metrics */}
                        <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-2 gap-4">
                            <div>
                                <span className="block text-2xl font-bold text-white">24</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('dashboard.auditedBatches')}</span>
                            </div>
                            <div className="border-l border-slate-700/50 pl-4">
                                <span className="block text-2xl font-bold text-emerald-400">0</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('dashboard.pendencies')}</span>
                            </div>
                        </div>
                    </div>
              </div>
          </div>

          {/* MAIN CONTENT: FULL WIDTH FILE EXPLORER */}
          <div className="flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Filter size={20} className="text-slate-400" /> 
                        {t('dashboard.folderNav')}
                    </h2>
                    <button 
                        onClick={() => navigate('/dashboard?view=files')}
                        className="text-sm font-medium text-blue-600 hover:underline"
                    >
                        {t('dashboard.viewFullLib')}
                    </button>
                 </div>

                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
                     <FileExplorer allowUpload={false} autoHeight={true} />
                 </div>
          </div>

        </Layout>
      );
  }

  // --- RENDER: LIBRARY / FAVORITES / RECENT / TICKETS VIEW ---
  
  // Also Render Support Modal if open
  
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
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in slide-in-from-top-2">
                    {/* Search Term */}
                    <div className="md:col-span-4 lg:col-span-5 space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.textSearch')}</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
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
                                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                            </div>
                            <span className="text-slate-400">-</span>
                            <div className="relative flex-1">
                                <input 
                                    type="date" 
                                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
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
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
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
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
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
                    <div className="flex-1 overflow-auto bg-slate-50 p-4">
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
                                                    {getStatusIcon(ticket.status)}
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
                    <div className="flex-1 overflow-hidden">
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
