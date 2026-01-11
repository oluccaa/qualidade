import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout.tsx';
// Fix: Import from services/index.ts to use the correctly typed and initialized service instances
import { fileService, adminService, userService } from '../services/index.ts';
import { UserRole, AuditLog, User, ClientOrganization, SupportTicket, NetworkPort } from '../types.ts';
import { AdminStatsData } from '../services/interfaces.ts';
import { useAuth } from '../services/authContext.tsx';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Building2, Search, UserPlus, X
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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED' | 'INACTIVE'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'>('ALL');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: UserRole.CLIENT, clientId: '', status: 'ACTIVE', department: '' });

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
          setUsersList(users); 
          setTicketsList(ticketData); 
          setClientsList(clients);
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

  const filteredUsers = useMemo(() => usersList.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
  }), [usersList, searchTerm, roleFilter, statusFilter]);

  const filteredLogs = useMemo(() => logs.filter(l => {
      const matchesSearch = l.userName.toLowerCase().includes(searchTerm.toLowerCase()) || l.action.toLowerCase().includes(searchTerm.toLowerCase()) || l.target.toLowerCase().includes(searchTerm.toLowerCase()) || l.ip.includes(searchTerm);
      const matchesSeverity = severityFilter === 'ALL' || l.severity === severityFilter;
      return matchesSearch && matchesSeverity;
  }), [logs, searchTerm, severityFilter]);

  // Handlers
  const handleSaveUser = async (e: React.FormEvent) => {
      e.preventDefault();
      let generatedPassword = !editingUser ? userService.generateRandomPassword() : undefined;
      const userPayload: User = { id: editingUser ? editingUser.id : `u${Date.now()}`, name: formData.name, email: formData.email, role: formData.role as UserRole, clientId: formData.role === UserRole.CLIENT ? formData.clientId : undefined, status: formData.status as any, department: formData.department, lastLogin: editingUser?.lastLogin || 'Nunca' };
      await userService.saveUser(userPayload, generatedPassword);
      setIsUserModalOpen(false); setEditingUser(null); loadData();
      if (generatedPassword) alert(`Usuário criado com sucesso.\n\nSenha temporária: ${generatedPassword}`);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
      e.preventDefault(); if (!user) return;
      const clientPayload: Partial<ClientOrganization> = { id: editingClient?.id, name: clientFormData.name, cnpj: clientFormData.cnpj, contractDate: clientFormData.contractDate, status: clientFormData.status as any };
      await adminService.saveClient(user, clientPayload);
      setIsClientModalOpen(false); setEditingClient(null); loadData();
  };

  const handleOpenInvestigation = (log: AuditLog) => {
      const related = logs.filter(l => (l.ip === log.ip && l.ip !== '10.0.0.1') || (l.userId === log.userId && l.userId !== 'unknown')).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      let score = log.severity === 'CRITICAL' ? 80 : 20;
      setInvestigationData({ targetLog: log, relatedLogs: related, riskScore: Math.min(score, 100) });
      setIsInvestigationModalOpen(true);
  };

  const openUserModal = (u?: User) => {
      if (u) { setEditingUser(u); setFormData({ name: u.name, email: u.email, role: u.role, clientId: u.clientId || '', status: u.status || 'ACTIVE', department: u.department || '' }); }
      else { setFormData({ name: '', email: '', role: UserRole.CLIENT, clientId: '', status: 'ACTIVE', department: '' }); setEditingUser(null); }
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
          {activeTab !== 'overview' && activeTab !== 'settings' && activeTab !== 'firewall' && (
             <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-xl shadow-sm">
                 <div className="relative group w-full sm:w-auto flex-1 max-w-md">
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

          {activeTab === 'users' && <UserList users={filteredUsers} onEdit={openUserModal} />}

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

// Add default export for React.lazy compatibility
export default Admin;