
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout.tsx';
import { fileService, adminService, userService } from '../services/index.ts';
import { UserRole, AuditLog, User, ClientOrganization, SupportTicket, NetworkPort } from '../types.ts';
import { AdminStatsData } from '../services/interfaces.ts';
import { useAuth } from '../services/authContext.tsx';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Building2, Search, UserPlus, X, Edit2, Trash2, Mail, ExternalLink, MessageSquare, Clock, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';

// Sub-components
import { AdminStats } from '../components/admin/AdminStats.tsx';
import { AuditLogsTable } from '../components/admin/AuditLogsTable.tsx';
import { UserList } from '../components/admin/UserList.tsx';
import { UserModal, ClientModal } from '../components/admin/modals/AdminModals.tsx';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as any) || 'overview';

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [ports, setPorts] = useState<NetworkPort[]>([]);
  const [isInvestigationModalOpen, setIsInvestigationModalOpen] = useState(false);
  const [investigationData, setInvestigationData] = useState<{ targetLog: AuditLog | null; relatedLogs: AuditLog[]; riskScore: number; }>({ targetLog: null, relatedLogs: [], riskScore: 0 });

  const [usersList, setUsersList] = useState<User[]>([]);
  const [clientsList, setClientsList] = useState<ClientOrganization[]>([]);
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED' | 'INACTIVE'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'>('ALL');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: UserRole.CLIENT, 
    clientId: '', 
    status: 'ACTIVE', 
    department: '' 
  });

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientOrganization | null>(null);
  const [clientFormData, setClientFormData] = useState({ name: '', cnpj: '', contractDate: '', status: 'ACTIVE' });

  useEffect(() => { loadData(); }, [user, activeTab]);

  const loadData = async () => {
      setIsLoading(true);
      try {
          const [users, ticketData, clients, networkPorts, stats] = await Promise.all([
              userService.getUsers(), 
              adminService.getTickets(), 
              adminService.getClients(), 
              adminService.getPorts(),
              adminService.getAdminStats()
          ]);
          
          // Garantir que o estado receba a lista completa
          setUsersList([...users]); 
          setTicketsList(ticketData); 
          // Access .items because getClients now returns a PaginatedResponse
          setClientsList(clients.items);
          setPorts(networkPorts);
          setAdminStats(stats);
          
          if (user) {
              const auditLogs = await fileService.getAuditLogs(user);
              setLogs(auditLogs);
          }
      } catch (err) {
          console.error("Erro ao carregar dados administrativos:", err);
      } finally { setIsLoading(false); }
  };

  const filteredUsers = useMemo(() => {
      // Se não houver usuários carregados, retorna vazio para evitar flash de tela
      if (!usersList) return [];
      
      return usersList.filter(u => {
          const matchesSearch = (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
          const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
          const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
          return matchesSearch && matchesRole && matchesStatus;
      });
  }, [usersList, searchTerm, roleFilter, statusFilter]);

  const filteredClients = useMemo(() => clientsList.filter(c => {
      const term = searchTerm.toLowerCase();
      return (c.name || "").toLowerCase().includes(term) || (c.cnpj || "").includes(term);
  }), [clientsList, searchTerm]);

  const filteredTickets = useMemo(() => ticketsList.filter(t => {
      const term = searchTerm.toLowerCase();
      return (t.subject || "").toLowerCase().includes(term) || (t.userName || "").toLowerCase().includes(term);
  }), [ticketsList, searchTerm]);

  const filteredLogs = useMemo(() => logs.filter(l => {
      const matchesSearch = l.userName.toLowerCase().includes(searchTerm.toLowerCase()) || l.action.toLowerCase().includes(searchTerm.toLowerCase()) || l.target.toLowerCase().includes(searchTerm.toLowerCase()) || l.ip.includes(searchTerm);
      const matchesSeverity = severityFilter === 'ALL' || l.severity === severityFilter;
      return matchesSearch && matchesSeverity;
  }), [logs, searchTerm, severityFilter]);

  const handleSaveUser = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      try {
          if (!editingUser) {
              await userService.signUp(
                  formData.email,
                  formData.password,
                  formData.name,
                  formData.clientId || undefined,
                  formData.department
              );
          } else {
              const userPayload: User = { 
                  id: editingUser.id, 
                  name: formData.name, 
                  email: formData.email, 
                  role: formData.role as UserRole, 
                  clientId: (formData.role === UserRole.CLIENT && formData.clientId && formData.clientId !== 'Interno') ? formData.clientId : undefined, 
                  status: formData.status as any, 
                  department: formData.department, 
                  lastLogin: editingUser?.lastLogin || 'Nunca' 
              };
              await userService.saveUser(userPayload);
          }
          
          setIsUserModalOpen(false); 
          setEditingUser(null);
          setSearchTerm(''); // Limpa busca para ver o novo usuário na lista completa
          
          // Aguarda um curto intervalo para o trigger do Supabase processar (evita lista vazia pós-signUp)
          setTimeout(() => {
              loadData();
              setIsSaving(false);
          }, 800);

      } catch (err: any) {
          console.error("Erro ao salvar usuário:", err);
          alert(`Erro ao salvar usuário: ${err.message || 'Verifique se os dados estão corretos.'}`);
          setIsSaving(false);
      }
  };

  const handleSaveClient = async (e: React.FormEvent) => {
      e.preventDefault(); if (!user) return;
      setIsSaving(true);
      try {
        const clientPayload: Partial<ClientOrganization> = { 
            id: editingClient?.id, 
            name: clientFormData.name, 
            cnpj: clientFormData.cnpj, 
            contractDate: clientFormData.contractDate, 
            status: clientFormData.status as any 
        };
        await adminService.saveClient(user, clientPayload);
        setIsClientModalOpen(false); setEditingClient(null); 
        setTimeout(() => { loadData(); setIsSaving(false); }, 500);
      } catch (err: any) {
        alert(`Erro ao salvar empresa: ${err.message}`);
        setIsSaving(false);
      }
  };

  const handleOpenInvestigation = (log: AuditLog) => {
      const related = logs.filter(l => (l.ip === log.ip && l.ip !== '10.0.0.1') || (l.userId === log.userId && l.userId !== 'unknown')).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      let score = log.severity === 'CRITICAL' ? 80 : 20;
      setInvestigationData({ targetLog: log, relatedLogs: related, riskScore: Math.min(score, 100) });
      setIsInvestigationModalOpen(true);
  };

  const openUserModal = (u?: User) => {
      if (u) { 
        setEditingUser(u); 
        setFormData({ 
            name: u.name, 
            email: u.email, 
            password: '', 
            role: u.role, 
            clientId: u.clientId || '', 
            status: u.status || 'ACTIVE', 
            department: u.department || '' 
        }); 
      }
      else { 
        setFormData({ 
            name: '', 
            email: '', 
            password: '', 
            role: UserRole.CLIENT, 
            clientId: '', 
            status: 'ACTIVE', 
            department: '' 
        }); 
        setEditingUser(null); 
      }
      setIsUserModalOpen(true);
  };

  const openClientModal = (c?: ClientOrganization) => {
      if (c) { setEditingClient(c); setClientFormData({ name: c.name, cnpj: c.cnpj, contractDate: c.contractDate, status: c.status }); }
      else { setClientFormData({ name: '', cnpj: '', contractDate: new Date().toISOString().split('T')[0], status: 'ACTIVE' }); setEditingClient(null); }
      setIsClientModalOpen(true);
  };

  return (
    <Layout title={t('menu.management')}>
      <div className="flex flex-col relative w-full gap-6">
          {(isSaving || isLoading) && activeTab !== 'overview' && (
              <div className="fixed top-4 right-1/2 translate-x-1/2 z-[110] bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
                  <Loader2 size={14} className="animate-spin" /> Atualizando base de dados...
              </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'settings' && (
             <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-xl shadow-sm">
                 <div className="relative group w-full sm:w-auto flex-1 max-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input type="text" placeholder={t('common.search')} className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                 </div>
                 <div className="flex gap-2 w-full sm:w-auto justify-end">
                     {activeTab === 'users' && <button onClick={() => openUserModal()} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"><UserPlus size={16} /> {t('admin.users.newAccess')}</button>}
                     {activeTab === 'clients' && <button onClick={() => openClientModal()} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"><Building2 size={16} /> Nova Empresa</button>}
                 </div>
             </div>
          )}

          {activeTab === 'overview' && adminStats && (
              <AdminStats 
                  usersCount={adminStats.totalUsers} 
                  activeUsersCount={adminStats.activeUsers}
                  clientsCount={adminStats.activeClients}
                  ticketsCount={adminStats.openTickets}
                  logsCount={adminStats.logsLast24h}
              />
          )}

          {activeTab === 'users' && (
              <UserList users={filteredUsers} onEdit={openUserModal} />
          )}

          {activeTab === 'clients' && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-300">
                  <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                              <tr>
                                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Empresa / Razão Social</th>
                                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">CNPJ</th>
                                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Início Contrato</th>
                                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                                  <th className="px-6 py-4 text-right"></th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                              {filteredClients.map(c => (
                                  <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100 shrink-0">
                                                  <Building2 size={18} />
                                              </div>
                                              <p className="font-semibold text-slate-900 text-sm">{c.name}</p>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">{c.cnpj}</td>
                                      <td className="px-6 py-4 text-sm text-slate-500">{c.contractDate}</td>
                                      <td className="px-6 py-4">
                                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${c.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                              {c.status}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          <button onClick={() => openClientModal(c)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
                                      </td>
                                  </tr>
                              ))}
                              {filteredClients.length === 0 && (
                                  <tr>
                                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Nenhuma organização encontrada no Supabase.</td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {activeTab === 'tickets' && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-300">
                  <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                              <tr>
                                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Solicitante</th>
                                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Assunto</th>
                                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Prioridade</th>
                                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                                  <th className="px-6 py-4 text-right"></th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                              {filteredTickets.map(t => (
                                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-6 py-4">
                                          <p className="text-sm font-semibold text-slate-900">{t.userName}</p>
                                          <p className="text-[10px] text-slate-400">{t.createdAt}</p>
                                      </td>
                                      <td className="px-6 py-4 text-sm font-medium text-slate-700">{t.subject}</td>
                                      <td className="px-6 py-4">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                              t.priority === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-100' : 
                                              t.priority === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-50 text-slate-500'
                                          }`}>
                                              {t.priority}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${
                                              t.status === 'RESOLVED' ? 'text-emerald-600' : t.status === 'IN_PROGRESS' ? 'text-blue-600' : 'text-orange-600'
                                          }`}>
                                              {t.status === 'RESOLVED' ? <CheckCircle2 size={12}/> : t.status === 'IN_PROGRESS' ? <Clock size={12}/> : <AlertCircle size={12}/>}
                                              {t.status}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          <button className="p-2 text-slate-400 hover:text-blue-600"><ExternalLink size={16} /></button>
                                      </td>
                                  </tr>
                              ))}
                              {filteredTickets.length === 0 && (
                                  <tr>
                                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Sem chamados técnicos registrados.</td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {activeTab === 'logs' && (
              <AuditLogsTable 
                  logs={filteredLogs} 
                  severityFilter={severityFilter} 
                  onSeverityChange={setSeverityFilter} 
                  onInvestigate={handleOpenInvestigation} 
              />
          )}
      </div>

      <UserModal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
        onSave={handleSaveUser} 
        editingUser={editingUser} 
        formData={formData} 
        setFormData={setFormData}
        clients={clientsList}
      />

      <ClientModal 
        isOpen={isClientModalOpen} 
        onClose={() => setIsClientModalOpen(false)} 
        onSave={handleSaveClient} 
        editingClient={editingClient} 
        clientFormData={clientFormData} 
        setClientFormData={setClientFormData} 
      />

      {isInvestigationModalOpen && investigationData.targetLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 text-lg tracking-tight">Investigação: {investigationData.targetLog.action}</h3>
                      <button onClick={() => setIsInvestigationModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
                  </div>
                  <div className="p-6 overflow-y-auto space-y-6">
                      <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between shadow-inner">
                          <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Score de Risco</p><div className="text-3xl font-bold">{investigationData.riskScore}/100</div></div>
                          <div className="text-right"><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">IP Origem</p><div className="font-mono text-blue-400 text-lg">{investigationData.targetLog.ip}</div></div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs overflow-x-auto shadow-sm">
                          <pre className="text-slate-700 leading-relaxed">{JSON.stringify(investigationData.targetLog, null, 2)}</pre>
                      </div>
                  </div>
                  <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                      <button onClick={() => setIsInvestigationModalOpen(false)} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:bg-slate-800 transition-all">Concluído</button>
                  </div>
              </div>
          </div>
      )}
    </Layout>
  );
};

export default Admin;
