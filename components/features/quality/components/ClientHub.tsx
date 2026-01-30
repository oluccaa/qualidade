import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, AlertCircle, CheckCircle2, User, Loader2, Settings2, MoreVertical, Trash2, ShieldAlert } from 'lucide-react';
import { ClientOrganization } from '../../../../types/index.ts';

interface ClientHubProps {
  clients: ClientOrganization[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectClient: (client: ClientOrganization) => void;
  onEditClient?: (client: ClientOrganization) => void;
  onFlagDeletion?: (clientId: string) => void;
  viewMode: 'grid' | 'list';
  sortKey: string;
}

export const ClientHub: React.FC<ClientHubProps> = ({ 
  clients, isLoading, onSelectClient, onEditClient, onFlagDeletion, viewMode, isLoadingMore, hasMore, onLoadMore 
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  if (isLoading) return <LoadingPortfolio />;

  return (
    <div className="flex-1 w-full animate-in fade-in duration-500 overflow-visible flex flex-col">
      {viewMode === 'list' ? (
        <div className="flex-1 overflow-visible">
            <table className="w-full text-left table-auto border-separate border-spacing-y-2">
              <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-20">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Organização</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden lg:table-cell">Responsável</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status Técnico</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Compliance</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y-0">
                {clients.map((client, index) => (
                  <ClientRow 
                    key={client.id} 
                    client={client} 
                    isLast={index === clients.length - 1}
                    onSelect={() => onSelectClient(client)} 
                    onEdit={onEditClient ? () => onEditClient(client) : undefined}
                    onFlagDeletion={onFlagDeletion ? () => onFlagDeletion(client.id) : undefined}
                    isDropdownOpen={activeDropdown === client.id}
                    onToggleDropdown={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === client.id ? null : client.id);
                    }}
                  />
                ))}
              </tbody>
            </table>
          {hasMore && <LoadMoreButton loading={isLoadingMore} onClick={onLoadMore} />}
        </div>
      ) : (
        <div className="flex-1 overflow-visible p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
            {clients.map(client => (
              <ClientCard 
                key={client.id} 
                client={client} 
                onSelect={() => onSelectClient(client)} 
                onEdit={onEditClient ? () => onEditClient(client) : undefined}
                onFlagDeletion={onFlagDeletion ? () => onFlagDeletion(client.id) : undefined}
                isDropdownOpen={activeDropdown === client.id}
                onToggleDropdown={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === client.id ? null : client.id);
                }}
              />
            ))}
            {hasMore && <div className="col-span-full py-4 flex justify-center"><LoadMoreButton loading={isLoadingMore} onClick={onLoadMore} /></div>}
          </div>
        </div>
      )}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-[80] bg-transparent" 
          onClick={() => setActiveDropdown(null)} 
        />
      )}
    </div>
  );
};

const ClientRow: React.FC<{ 
    client: ClientOrganization; 
    isLast: boolean;
    onSelect: () => void; 
    onEdit?: () => void; 
    onFlagDeletion?: () => void;
    isDropdownOpen: boolean;
    onToggleDropdown: (e: React.MouseEvent) => void;
}> = ({ client, isLast, onSelect, onEdit, onFlagDeletion, isDropdownOpen, onToggleDropdown }) => (
  <tr 
    className={`bg-white hover:bg-slate-50 transition-all cursor-pointer group shadow-sm border border-slate-100 rounded-xl relative ${isLast ? 'mb-20' : ''}`} 
    onClick={onSelect}
  >
    <td className="px-6 py-5 first:rounded-l-2xl border-y border-l border-slate-100">
      <div className="flex items-center gap-4 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm shrink-0 border transition-all ${client.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            {client.name?.[0] || '?'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-800 truncate">{client.name}</p>
          <p className="text-[10px] text-slate-400 font-mono tracking-tighter">{client.cnpj}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-5 hidden lg:table-cell border-y border-slate-100">
      <div className="flex items-center gap-2 text-slate-600 text-[11px] font-bold truncate max-w-[150px]">
        <User size={12} className="text-slate-300" />
        <span className="truncate">{client.qualityAnalystName || "N/A"}</span>
      </div>
    </td>
    <td className="px-6 py-5 text-center border-y border-slate-100">
      <StatusBadge count={client.pendingDocs || 0} isInactive={client.status === 'INACTIVE'} />
    </td>
    <td className="px-6 py-5 text-center border-y border-slate-100">
      <div className="flex flex-col items-center gap-1.5">
          <span className={`text-[9px] font-black uppercase tracking-widest ${client.status === 'ACTIVE' ? 'text-emerald-600' : 'text-red-600'}`}>
            {client.status === 'ACTIVE' ? 'Operante' : 'Inativo'}
          </span>
          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${client.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: '100%' }}></div>
          </div>
      </div>
    </td>
    <td className="px-6 py-5 text-right last:rounded-r-2xl border-y border-r border-slate-100 relative overflow-visible">
      <div className="flex items-center justify-end gap-3">
        <button 
            onClick={onToggleDropdown}
            className={`p-2.5 rounded-xl transition-all relative z-[95] ${isDropdownOpen ? 'bg-slate-900 text-white shadow-lg scale-110' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}
        >
            <MoreVertical size={18} strokeWidth={3} />
        </button>
        <ChevronRight size={18} className="text-slate-200 group-hover:text-blue-500 transition-colors" />

        {isDropdownOpen && (
            <div className="absolute right-12 top-full mt-[-10px] w-60 bg-white border border-slate-200 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] z-[100] py-3 animate-in slide-in-from-top-2 fade-in duration-200 text-left overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-50 mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Ações Técnicas</p>
                </div>
                {onEdit && (
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-black uppercase tracking-wider transition-all">
                        <Settings2 size={16} /> Gerenciar Cadastro
                    </button>
                )}
                {onFlagDeletion && (
                    <button onClick={(e) => { e.stopPropagation(); onFlagDeletion(); }} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] text-red-600 hover:bg-red-50 font-black uppercase tracking-wider transition-all border-t border-slate-50 mt-1">
                        <Trash2 size={16} /> Sinalizar Exclusão
                    </button>
                )}
            </div>
        )}
      </div>
    </td>
  </tr>
);

const ClientCard: React.FC<{ 
    client: ClientOrganization; 
    onSelect: () => void; 
    onEdit?: () => void; 
    onFlagDeletion?: () => void;
    isDropdownOpen: boolean;
    onToggleDropdown: (e: React.MouseEvent) => void;
}> = ({ client, onSelect, onEdit, onFlagDeletion, isDropdownOpen, onToggleDropdown }) => (
  <div onClick={onSelect} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-500/30 transition-all cursor-pointer group relative overflow-visible h-fit">
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg group-hover:scale-105 transition-transform border ${client.status === 'ACTIVE' ? 'bg-[#132659] text-white border-blue-900' : 'bg-red-600 text-white border-red-700'}`}>
            {client.name?.[0] || '?'}
        </div>
        <div className="relative overflow-visible">
            <button 
                onClick={onToggleDropdown}
                className={`p-2.5 rounded-xl transition-all relative z-[95] ${isDropdownOpen ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-200'}`}
            >
                <MoreVertical size={20} strokeWidth={3} />
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] z-[100] py-3 animate-in slide-in-from-top-4 duration-300 text-left">
                    <div className="px-4 py-2 border-b border-slate-50 mb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Painel Técnico</p>
                    </div>
                    {onEdit && (
                        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-black uppercase tracking-wider transition-all">
                            <Settings2 size={16} /> Editar Cadastro
                        </button>
                    )}
                    {onFlagDeletion && (
                        <button onClick={(e) => { e.stopPropagation(); onFlagDeletion(); }} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] text-red-600 hover:bg-red-50 font-black uppercase tracking-wider border-t border-slate-50 mt-1 transition-all">
                            <Trash2 size={16} /> Sinalizar Exclusão
                        </button>
                    )}
                </div>
            )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
         <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border shadow-inner ${client.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            {client.status === 'ACTIVE' ? 'Operante' : 'Inativo'}
         </span>
         {client.status === 'INACTIVE' && <ShieldAlert size={14} className="text-red-500 animate-pulse" />}
      </div>

      <h4 className="text-base font-black text-[#132659] leading-tight truncate">{client.name}</h4>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 mb-6">{client.cnpj}</p>
      
      <div className="flex items-center justify-between pt-5 border-t border-slate-50">
        <div>
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Docs. Pendentes</p>
          <p className={`text-2xl font-black mt-1 ${(client.pendingDocs || 0) > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
            {client.pendingDocs || 0}
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg transition-all">
          <ChevronRight size={18} strokeWidth={3} />
        </div>
      </div>
    </div>
  </div>
);

const StatusBadge: React.FC<{ count: number; isInactive?: boolean }> = ({ count, isInactive }) => (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all ${
        isInactive 
          ? 'bg-slate-100 text-slate-400 border-slate-200' 
          : count > 0 ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-sm' : 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm'
    }`}>
        {isInactive ? <ShieldAlert size={12} /> : count > 0 ? <AlertCircle size={12} className="animate-pulse" /> : <CheckCircle2 size={12} />}
        {isInactive ? "Sinalizado" : count}
    </span>
);

const LoadingPortfolio = () => (
  <div className="flex-1 w-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 animate-pulse">
    <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
    <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Sincronizando Portfólio...</p>
  </div>
);

const LoadMoreButton: React.FC<{ loading: boolean; onClick: () => void }> = ({ loading, onClick }) => (
  <div className="p-8 text-center shrink-0">
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} disabled={loading} className="px-10 py-3 bg-white border-2 border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 hover:border-blue-600 transition-all shadow-sm active:scale-95">
      {loading ? "Sincronizando..." : "Carregar Mais Empresas"}
    </button>
  </div>
);