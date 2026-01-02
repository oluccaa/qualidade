
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.tsx';
import { FileExplorer } from '../components/FileExplorer.tsx';
import { useAuth } from '../services/authContext.tsx';
import { getRecentFiles, getLibraryFiles, getFileSignedUrl, getFavorites } from '../services/fileService.ts';
import { FileNode, LibraryFilters } from '../types.ts';
import { 
    Search, 
    Download, 
    Clock, 
    ArrowRight,
    Shield,
    Filter,
    FileCheck,
    Calendar,
    XCircle,
    Star,
    History
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // View State
  const queryParams = new URLSearchParams(location.search);
  const currentView = queryParams.get('view') || 'home'; // 'home' | 'files' | 'recent' | 'favorites'

  // --- HOME VIEW STATE ---
  const [recentFiles, setRecentFiles] = useState<FileNode[]>([]);
  const [quickSearch, setQuickSearch] = useState('');

  // --- LIBRARY / FAVORITES / RECENT VIEW STATE ---
  const [viewFiles, setViewFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<LibraryFilters>({
      startDate: '',
      endDate: '',
      status: 'ALL',
      search: ''
  });

  // Load Recent Files for Home Widget
  useEffect(() => {
    if (user && currentView === 'home') {
        getRecentFiles(user, 5).then(setRecentFiles);
    }
  }, [user, currentView]);

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
              const results = await getRecentFiles(user, 50); // Fetch more history for dedicated page
              setViewFiles(results);
          }
      } finally {
          setIsLoading(false);
      }
  }, [user, currentView, filters]);

  // Trigger fetch when view or filters change
  useEffect(() => {
      if (currentView !== 'home') {
          // Debounce slightly for search/filter inputs
          const timeoutId = setTimeout(fetchData, 300);
          return () => clearTimeout(timeoutId);
      }
  }, [fetchData, currentView]);

  // Handlers
  const handleQuickDownload = async (file: FileNode) => {
      if(!user) return;
      try {
        await getFileSignedUrl(user, file.id);
        alert(`Download rápido iniciado: ${file.name}`);
      } catch (err) {
        alert("Erro ao baixar arquivo.");
      }
  };

  const clearFilters = () => {
      setFilters({ startDate: '', endDate: '', status: 'ALL', search: '' });
  };

  // --- RENDER: HOME VIEW ---
  if (currentView === 'home') {
      return (
        <Layout title="Portal do Cliente">
          
          {/* HERO */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 max-w-3xl">
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">
                      Olá, {user?.name.split(' ')[0]}. O que você procura hoje?
                  </h1>
                  <p className="text-slate-500 mb-6">
                      Localize certificados de qualidade pelo número do lote, corrida ou nota fiscal.
                  </p>

                  <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      </div>
                      <input
                          type="text"
                          className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm text-lg"
                          placeholder="Digite o Nº do Lote, Corrida ou Nota Fiscal..."
                          value={quickSearch}
                          onChange={(e) => setQuickSearch(e.target.value)}
                          onKeyDown={(e) => {
                              if (e.key === 'Enter' && quickSearch) {
                                  // Switch to library view with pre-filled search
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
                      <span className="font-medium text-slate-400 uppercase text-xs tracking-wider">Sugestões:</span>
                      <button onClick={() => { setFilters(prev => ({...prev, search: 'SAE 1045'})); navigate('/dashboard?view=files'); }} className="hover:text-blue-600 hover:underline decoration-blue-600/30 underline-offset-4">SAE 1045</button>
                      <button onClick={() => { setFilters(prev => ({...prev, status: 'PENDING'})); navigate('/dashboard?view=files'); }} className="hover:text-blue-600 hover:underline decoration-blue-600/30 underline-offset-4">Certificados Pendentes</button>
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* FILE EXPLORER (Quick Browse) */}
              <div className="xl:col-span-2 flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Filter size={20} className="text-slate-400" /> 
                        Navegação por Pastas
                    </h2>
                    <button 
                        onClick={() => navigate('/dashboard?view=files')}
                        className="text-sm font-medium text-blue-600 hover:underline"
                    >
                        Ver biblioteca completa
                    </button>
                 </div>

                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
                     <FileExplorer allowUpload={false} />
                 </div>
              </div>

              {/* QUICK ACCESS */}
              <div className="xl:col-span-1 space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                          <h3 className="font-bold text-slate-800 flex items-center gap-2">
                              <Clock size={18} className="text-blue-600" /> Recentes
                          </h3>
                          <button onClick={() => navigate('/dashboard?view=recent')} className="text-xs text-blue-600 font-medium hover:underline">Ver tudo</button>
                      </div>
                      <div className="divide-y divide-slate-100">
                          {recentFiles.length === 0 ? (
                              <div className="p-8 text-center text-slate-400 text-sm">Nenhum histórico recente.</div>
                          ) : (
                              recentFiles.map(file => (
                                  <div key={file.id} className="p-4 hover:bg-slate-50 transition-colors group">
                                      <div className="flex items-start justify-between mb-1">
                                          <div className="flex items-center gap-2 overflow-hidden">
                                              <FileCheck size={16} className="text-emerald-500 flex-shrink-0" />
                                              <span className="text-sm font-medium text-slate-700 truncate" title={file.name}>{file.name}</span>
                                          </div>
                                      </div>
                                      <div className="flex items-center justify-between mt-2">
                                          <div className="flex flex-col">
                                              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Lote</span>
                                              <span className="text-xs text-slate-600 font-mono">{file.metadata?.batchNumber || '-'}</span>
                                          </div>
                                          <button 
                                            onClick={() => handleQuickDownload(file)}
                                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            title="Baixar Agora"
                                          >
                                              <Download size={14} />
                                          </button>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                      <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-4 text-blue-300">
                              <Shield size={20} />
                              <span className="font-bold text-sm tracking-wide uppercase">Status da Conta</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-bold">Regular</span>
                          </div>
                          <p className="text-slate-400 text-xs mt-2">100% dos lotes com certificados aprovados.</p>
                      </div>
                  </div>
              </div>
          </div>
        </Layout>
      );
  }

  // --- RENDER: LIBRARY / FAVORITES / RECENT VIEW ---
  
  let pageTitle = "Biblioteca de Laudos";
  let pageIcon = <Filter size={20} className="text-blue-500" />;
  let showFilters = currentView === 'files';

  if (currentView === 'favorites') {
      pageTitle = "Meus Favoritos";
      pageIcon = <Star size={20} className="text-yellow-500" fill="currentColor" />;
  } else if (currentView === 'recent') {
      pageTitle = "Histórico de Acesso";
      pageIcon = <History size={20} className="text-orange-500" />;
  }

  return (
    <Layout title={pageTitle}>
        <div className="flex flex-col gap-6 h-[calc(100vh-140px)]">
            
            {/* Advanced Filters Bar - ONLY for Library View */}
            {showFilters && (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in slide-in-from-top-2">
                    {/* Search Term */}
                    <div className="md:col-span-4 lg:col-span-5 space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Busca Textual</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="Lote, Nota Fiscal, Produto..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="md:col-span-3 lg:col-span-3 space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Período</label>
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
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                        <select 
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                        >
                            <option value="ALL">Todos os Status</option>
                            <option value="APPROVED">Aprovados ✅</option>
                            <option value="PENDING">Em Análise ⏳</option>
                        </select>
                    </div>

                    {/* Clear Actions */}
                    <div className="md:col-span-2 lg:col-span-2 flex justify-end">
                        {(filters.search || filters.startDate || filters.endDate || filters.status !== 'ALL') && (
                            <button 
                                onClick={clearFilters}
                                className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                <XCircle size={16} /> Limpar
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
                        <h2 className="font-bold text-slate-700">{pageTitle}</h2>
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">
                            {viewFiles.length}
                        </span>
                    </div>
                    {currentView === 'favorites' && (
                        <p className="text-xs text-slate-400 hidden sm:block">Itens marcados para acesso rápido</p>
                    )}
                </div>
                
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden">
                        <FileExplorer 
                            allowUpload={false} 
                            externalFiles={viewFiles} 
                            flatMode={true} 
                            onRefresh={fetchData} // Allow FileExplorer to trigger a refresh (e.g. after unfavoriting)
                        />
                    </div>
                )}
            </div>
        </div>
    </Layout>
  );
};

export default Dashboard;
