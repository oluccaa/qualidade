import React, { useMemo } from 'react';
import { Search, Users, Building2, ChevronRight, Loader2, ArrowDownCircle } from 'lucide-react';
import { ClientOrganization } from '../../types.ts';

interface ClientHubProps {
    clients: ClientOrganization[];
    clientSearch: string;
    setClientSearch: (val: string) => void;
    clientStatus: 'ALL' | 'ACTIVE' | 'INACTIVE';
    setClientStatus: (status: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
    onSelectClient: (client: ClientOrganization) => void;
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
}

export const ClientHub: React.FC<ClientHubProps> = ({ 
    clients, 
    clientSearch, 
    setClientSearch, 
    clientStatus,
    setClientStatus,
    onSelectClient,
    isLoading,
    isLoadingMore,
    hasMore,
    onLoadMore
}) => {
    
    // Agrupa dinamicamente apenas o que já está carregado
    const clientGroups = useMemo(() => {
        const groups: Record<string, ClientOrganization[]> = {};
        clients.forEach(c => {
            const name = c.name || "Sem Nome";
            const letter = name.charAt(0).toUpperCase();
            if (!groups[letter]) groups[letter] = [];
            groups[letter].push(c);
        });
        return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    }, [clients]);

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in duration-300">
            {/* Barra de Busca e Filtros */}
            <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full max-w-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar cliente por nome ou CNPJ..." 
                        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
                        value={clientSearch} 
                        onChange={e => setClientSearch(e.target.value)} 
                    />
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                        {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setClientStatus(status)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    clientStatus === status 
                                    ? 'bg-white text-slate-900 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {status === 'ALL' ? 'Todos' : status === 'ACTIVE' ? 'Ativos' : 'Inativos'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Lista com Infinite Scroll/Paginação */}
            <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar">
                {isLoading && clients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader2 size={40} className="animate-spin text-blue-500" />
                        <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Acessando carteira...</p>
                    </div>
                ) : clients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                        <Users size={48} className="mb-4 opacity-20" />
                        <p className="font-medium">Nenhum cliente encontrado para os filtros atuais.</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {clientGroups.map(([letter, groupClients]) => (
                            <div key={letter} className="space-y-4">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="h-px flex-1 bg-slate-200"></div>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-[4px]">{letter}</span>
                                    <div className="h-px flex-1 bg-slate-200"></div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {groupClients.map(c => (
                                        <div 
                                            key={c.id} 
                                            onClick={() => onSelectClient(c)} 
                                            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all group relative overflow-hidden"
                                        >
                                            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all">
                                                <Building2 size={120} />
                                            </div>
                                            
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-3 rounded-xl transition-all shadow-sm ${
                                                    c.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-slate-50 text-slate-400'
                                                }`}>
                                                    <Users size={24}/>
                                                </div>
                                                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-300 group-hover:text-blue-500 transition-colors">
                                                    <ChevronRight size={18} />
                                                </div>
                                            </div>

                                            <h3 className="font-bold text-slate-800 text-sm truncate pr-2 group-hover:text-blue-700 transition-colors" title={c.name}>{c.name}</h3>
                                            <p className="text-[10px] text-slate-400 font-mono mt-1 tracking-wider uppercase">{c.cnpj}</p>
                                            
                                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                                                    c.status === 'ACTIVE' 
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}>
                                                    {c.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">Desde {new Date(c.contractDate).getFullYear()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Botão Carregar Mais */}
                        {hasMore && (
                            <div className="pt-8 flex justify-center pb-4">
                                <button 
                                    onClick={onLoadMore}
                                    disabled={isLoadingMore}
                                    className="flex items-center gap-3 bg-white border border-slate-200 px-8 py-3 rounded-2xl text-slate-600 font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm group active:scale-95 disabled:opacity-50"
                                >
                                    {isLoadingMore ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <ArrowDownCircle size={18} className="group-hover:translate-y-1 transition-transform" />
                                    )}
                                    {isLoadingMore ? 'Carregando Chunks...' : 'Carregar mais clientes'}
                                </button>
                            </div>
                        )}
                        
                        {!hasMore && clients.length > 0 && (
                            <div className="pt-8 text-center pb-4">
                                <p className="text-xs font-black text-slate-300 uppercase tracking-[4px]">Fim da Carteira • {clients.length} Empresas</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};