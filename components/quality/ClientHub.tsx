
import React from 'react';
import { Search, Users } from 'lucide-react';
import { ClientOrganization } from '../../types.ts';

interface ClientHubProps {
    clientGroups: Record<string, ClientOrganization[]>;
    clientSearch: string;
    setClientSearch: (val: string) => void;
    onSelectClient: (client: ClientOrganization) => void;
}

export const ClientHub: React.FC<ClientHubProps> = ({ clientGroups, clientSearch, setClientSearch, onSelectClient }) => {
    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in duration-300">
            <div className="bg-white p-3 rounded-xl border shadow-sm flex justify-between items-center">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Buscar cliente por nome ou CNPJ..." 
                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20" 
                        value={clientSearch} 
                        onChange={e => setClientSearch(e.target.value)} 
                    />
                </div>
                <div className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Diretório B2B
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar">
                {Object.keys(clientGroups).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 italic">
                        Nenhum cliente encontrado para sua busca.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Fix: Casting Object.entries to correct type to avoid 'unknown' inference error */}
                        {(Object.entries(clientGroups) as [string, ClientOrganization[]][]).map(([key, clients]) => (
                            <React.Fragment key={key}>
                                {clients.map(c => (
                                    <div 
                                        key={c.id} 
                                        onClick={() => onSelectClient(c)} 
                                        className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:scale-110 transition-transform">
                                            <Users size={80} />
                                        </div>
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mb-4 w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                                            <Users size={24}/>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-sm truncate pr-2" title={c.name}>{c.name}</h3>
                                        <p className="text-[10px] text-slate-400 font-mono mt-1 tracking-wider">{c.cnpj}</p>
                                        
                                        <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${c.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                                {c.status}
                                            </span>
                                            <span className="text-[10px] text-slate-400">Desde {c.contractDate}</span>
                                        </div>
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
