
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout.tsx';
import { fileService, adminService, userService } from '../services/index.ts';
import { UserRole, AuditLog, User, ClientOrganization, SupportTicket, NetworkPort } from '../types.ts';
import { AdminStatsData } from '../services/interfaces.ts';
import { useAuth } from '../services/authContext.tsx';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Building2, Search, UserPlus, X, RefreshCw
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
  const [isInvestigationModalOpen, setIsInvestigationModalOpen] = useState(false);
  const [investigationData, setInvestigationData] = useState<{ targetLog: AuditLog | null; relatedLogs: AuditLog[]; riskScore: number; }>({ targetLog: null, relatedLogs: [], riskScore: 0 });

  const [usersList, setUsersList] = useState<User[]>([]);
  const [clientsList, setClientsList] = useState<ClientOrganization[]>([]);
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
          const [users, clients, stats] = await Promise.all([
              userService.getUsers(), 
              adminService.getClients(), 
              adminService.getAdminStats()
          ]);
          setUsersList(users); 
          setClientsList(clients);
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
      try {
        const userPayload: User = { 
            id: editingUser ? editingUser.id : `new`, // ID is handled by Supabase for new users usually via Auth, but here we update profile
            name: formData.name, 
            email: formData.email, 
            role: formData.role as UserRole, 
            clientId: formData.role === UserRole.CLIENT ? formData.clientId : undefined, 
            status: formData.status as any, 
            department: formData.department 
        };
        
        await userService.saveUser(userPayload);
        setIsUserModalOpen(false); 
        setEditingUser(null); 
        loadData();
      } catch (err: any) {
          alert(err.message);
      }
  };

  const handleSaveClient = async (e: React.FormEvent) => {
      e.preventDefault(); if (!user) return;
      try {
        const clientPayload: Partial<ClientOrganization> = { 
            id: editingClient?.id, 
            name: clientFormData.name, 
            cnpj: clientFormData.cnpj, 
            contractDate: clientFormData.contractDate, 
            status: clientFormData.status as any 
        };
        await adminService.saveClient(user, clientPayload);
        setIsClientModalOpen(false); 
        setEditingClient(null); 
        loadData();
      } catch (err: any) {
          alert(err.message);
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
          setFormData({ name: u.name, email: u.email, role: u.role, clientId: u.clientId || '', status: u.status || 'ACTIVE', department: u.department || '' }); 
      } else { 
          setFormData({ name: '', email: '', role: UserRole.CLIENT, clientId: '', status: 'ACTIVE', department: '' }); 
          setEditingUser(null); 
      }
      setIsUserModalOpen(true);
  };

  const openClientModal = (c?: ClientOrganization) => {
      if (c) { 
          setEditingClient(c); 
          setClientFormData({ name: c.name, cnpj: c.cnpj, contractDate: c.contractDate, status: c.status }); 
      } else { 
          setClientFormData({ name: '', cnpj: '', contractDate: new Date().toISOString().split('T')[0], status: 'ACTIVE' }); 
          setEditingClient(null); 
      }
      setIsClientModalOpen(true);
  };

  return (
    <Layout title={t('menu.management')}>
      <div className="flex flex-col relative w-full gap-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-slate-800">
                {activeTab === 'overview' ? 'Dashboard Administrativo' : 
                 activeTab === 'users' ? 'Gestão de Acessos' : 
                 activeTab === 'clients' ? 'Cadastro de Empresas' : 'Segurança'}
            </h2>
            <button onClick={loadData} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 transition-all">
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {activeTab !== 'overview' && activeTab !== 'settings' && (
             <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-2xl shadow-sm">
                 <div className="relative group w-full sm:w-auto flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input type="text" placeholder={t('common.search')} className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-blue-500/20" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                 </div>
                 <div className="flex gap-2 w-full sm:w-auto justify-end">
                     {activeTab === 'users' && (
                        <button onClick={() => openUserModal()} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95">
                            <UserPlus size={16} /> {t('admin.users.newAccess')}
                        </button>
                     )}
                     {activeTab === 'clients' && (
                        <button onClick={() => openClientModal()} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95">
                            <Building2 size={16} /> Nova Empresa
                        </button>
                     )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {clientsList.map(client => (
                      <div key={client.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                              <Building2 size={100} />
                          </div>
                          <div className="flex justify-between items-start mb-4">
                              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shadow-sm">
                                  <Building2 size={24}/>
                              </div>
                              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${client.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                  {client.status}
                              </span>
                          </div>
                          <h3 className="font-bold text-slate-800 mb-1">{client.name}</h3>
                          <p className="text-xs text-slate-400 font-mono tracking-wider">{client.cnpj}</p>
                          <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Contrato: {new Date(client.contractDate).toLocaleDateString()}</span>
                              <button onClick={() => openClientModal(client)} className="text-blue-600 hover:text-blue-800 text-xs font-bold">Editar</button>
                          </div>
                      </div>
                  ))}
                  {clientsList.length === 0 && !isLoading && (
                      <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                          Nenhuma empresa cadastrada.
                      </div>
                  )}
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
    </Layout>
  );
};

export default Admin;
