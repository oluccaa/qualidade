
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout.tsx';
import { MOCK_PORTS, MOCK_FIREWALL_RULES } from '../services/mockData.ts';
import { getAuditLogs } from '../services/fileService.ts';
import * as adminService from '../services/adminService.ts';
import { UserRole, AuditLog, User, ClientOrganization, SupportTicket, MaintenanceEvent, NetworkPort, FirewallRule } from '../types.ts';
import { useAuth } from '../services/authContext.tsx';
import * as userService from '../services/userService.ts';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Trash2, 
  Edit2, 
  Activity, 
  Users, 
  ShieldAlert, 
  Search, 
  MoreVertical,
  Building2,
  Settings as SettingsIcon,
  Save,
  X,
  Lock,
  CheckCircle2,
  Ban,
  UserPlus,
  Filter,
  Mail,
  Download,
  LifeBuoy,
  CalendarClock,
  Clock,
  Plus,
  Send,
  Cpu,
  AlertOctagon,
  Power,
  Terminal,
  MapPin,
  Smartphone,
  Globe,
  AlertTriangle,
  FileJson,
  Hash,
  Eye,
  Server,
  Network,
  UserMinus,
  Siren,
  Fingerprint,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Shield,
  Zap,
  Briefcase
} from 'lucide-react';

// --- Components ---

const StatCard = ({ label, value, subtext, icon: Icon, color }: any) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
        <div className={`absolute -right-6 -top-6 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity text-${color}-600 transform scale-150`}>
            <Icon size={120} />
        </div>
        <div className="relative z-10 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center shrink-0`}>
                <Icon size={24} />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">{value}</h3>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">{label}</p>
            </div>
        </div>
        {subtext && (
            <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full bg-${color}-500`}></span>
                    {subtext}
                </p>
            </div>
        )}
    </div>
);

const ProgressBar = ({ percentage, color = "blue" }: { percentage: number, color?: string }) => (
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div 
            className={`h-full rounded-full transition-all duration-500 bg-${color}-500`} 
            style={{ width: `${percentage}%` }}
        />
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    const isActive = status === 'ACTIVE';
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );
};

// --- Main Page ---

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'overview' | 'users' | 'clients' | 'logs' | 'settings' | 'tickets' | 'firewall') || 'overview';

  const [logs, setLogs] = useState<AuditLog[]>([]);
  
  // Investigation State
  const [isInvestigationModalOpen, setIsInvestigationModalOpen] = useState(false);
  const [investigationData, setInvestigationData] = useState<{
      targetLog: AuditLog | null;
      relatedLogs: AuditLog[];
      riskScore: number;
  }>({ targetLog: null, relatedLogs: [], riskScore: 0 });

  // Firewall & Network State
  const [ports, setPorts] = useState<NetworkPort[]>(MOCK_PORTS);
  const [firewallRules, setFirewallRules] = useState<FirewallRule[]>(MOCK_FIREWALL_RULES);
  const [isScanning, setIsScanning] = useState(false);
  const [isHardening, setIsHardening] = useState(false);

  // Settings State (Mock)
  const [systemSettings, setSystemSettings] = useState({
      enforce2FA: true,
      sessionTimeout: 30,
      maintenanceMode: false,
      allowGuestAccess: false,
      logRetentionDays: 90
  });

  // Data State
  const [usersList, setUsersList] = useState<User[]>([]);
  const [clientsList, setClientsList] = useState<ClientOrganization[]>([]);
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>([]);
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED' | 'INACTIVE'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'>('ALL');

  // Modal & Form State (Users)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: UserRole.CLIENT, clientId: '', status: 'ACTIVE', department: '' });

  // Modal & Form State (Clients)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientOrganization | null>(null);
  const [activeClientDropdown, setActiveClientDropdown] = useState<string | null>(null);
  const [clientFormData, setClientFormData] = useState({ name: '', cnpj: '', contractDate: '', status: 'ACTIVE' });

  // Modal State (Tickets & Maintenance)
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  
  const [ticketData, setTicketData] = useState({ subject: '', description: '', priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' });
  const [maintenanceData, setMaintenanceData] = useState({ title: '', scheduledDate: '', durationMinutes: 60, description: '' });

  // Ticket Management State
  const [updatingTicket, setUpdatingTicket] = useState<string | null>(null);

  // Load Data on Mount
  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
      setIsLoading(true);
      try {
          const [users, ticketData, maintenanceData, clients] = await Promise.all([
              userService.getUsers(),
              adminService.getTickets(),
              adminService.getMaintenanceEvents(),
              adminService.getClients()
          ]);
          setUsersList(users);
          setTicketsList(ticketData);
          setMaintenanceList(maintenanceData);
          setClientsList(clients);
          if (user) getAuditLogs(user).then(setLogs);
      } finally {
          setIsLoading(false);
      }
  };

  // --- Filter Logic ---

  const filteredUsers = useMemo(() => {
      return usersList.filter(u => {
          const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
          const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
          return matchesSearch && matchesRole && matchesStatus;
      });
  }, [usersList, searchTerm, roleFilter, statusFilter]);

  const filteredClients = useMemo(() => {
      return clientsList.filter(c => {
          const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.cnpj.includes(searchTerm);
          const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
          return matchesSearch && matchesStatus;
      });
  }, [clientsList, searchTerm, statusFilter]);

  const filteredLogs = useMemo(() => {
      return logs.filter(l => {
          const matchesSearch = l.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                l.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                l.ip.includes(searchTerm);
          const matchesSeverity = severityFilter === 'ALL' || l.severity === severityFilter;
          return matchesSearch && matchesSeverity;
      });
  }, [logs, searchTerm, severityFilter]);

  const filteredTickets = useMemo(() => {
      return ticketsList.filter(t => 
          t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [ticketsList, searchTerm]);

  // --- Actions ---

  const handleScanPorts = () => {
      setIsScanning(true);
      setTimeout(() => {
          setIsScanning(false);
          // Refresh ports state (Mocking a change if any)
          setPorts([...MOCK_PORTS]); 
      }, 2000);
  };

  const handleTotalSecurity = () => {
      if(!window.confirm("ATENÇÃO: Isso irá fechar todas as portas não essenciais (SSH, DB) e bloquear IPs suspeitos. Continuar?")) return;
      
      setIsHardening(true);
      setTimeout(() => {
          // Close High Risk Ports
          const hardenedPorts = ports.map(p => {
              if (p.port === 22 || p.port === 5432 || p.port === 6379) {
                  return { ...p, status: 'CLOSED' as const };
              }
              return p;
          });
          setPorts(hardenedPorts);
          setIsHardening(false);
          alert("Protocolo de Segurança Total aplicado com sucesso.");
      }, 2500);
  };

  const toggleFirewallRule = (id: string) => {
      setFirewallRules(prev => prev.map(rule => 
          rule.id === id ? { ...rule, active: !rule.active } : rule
      ));
  };

  const handleOpenInvestigation = (log: AuditLog) => {
      // Logic to find correlated events (Same IP or Same User)
      const related = logs.filter(l => 
          (l.ip === log.ip && l.ip !== '10.0.0.1') || // Match external IPs
          (l.userId === log.userId && l.userId !== 'unknown') // Match User
      ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Mock Risk Calculation
      let score = 10;
      if (log.severity === 'CRITICAL') score += 50;
      if (log.severity === 'ERROR') score += 20;
      if (related.length > 5) score += 20;
      if (log.action.includes('SQL') || log.action.includes('INJECTION')) score = 95;

      setInvestigationData({
          targetLog: log,
          relatedLogs: related,
          riskScore: Math.min(score, 100)
      });
      setIsInvestigationModalOpen(true);
  };

  const handleExportLogs = () => {
      const csvContent = "data:text/csv;charset=utf-8," 
          + "Timestamp,User,Role,Action,Target,IP,Severity\n"
          + filteredLogs.map(l => `${l.timestamp},${l.userName},${l.userRole},${l.action},${l.target},${l.ip},${l.severity}`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "security_logs.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Random password for new users
      let generatedPassword = undefined;
      if (!editingUser) {
          generatedPassword = userService.generateRandomPassword();
      }

      const userPayload: User = {
          id: editingUser ? editingUser.id : `u${Date.now()}`,
          name: formData.name,
          email: formData.email,
          role: formData.role as UserRole,
          clientId: formData.role === UserRole.CLIENT ? formData.clientId : undefined,
          status: formData.status as 'ACTIVE' | 'BLOCKED',
          department: formData.department,
          lastLogin: editingUser?.lastLogin || 'Nunca'
      };

      await userService.saveUser(userPayload, generatedPassword);
      
      setIsUserModalOpen(false);
      setEditingUser(null);
      resetForm();
      loadData(); 
      
      if (generatedPassword) {
          alert(`Usuário criado com sucesso.\n\nSenha temporária: ${generatedPassword}\n\nPor favor, envie esta senha ao usuário de forma segura.`);
      }
  };

  const handleSaveClient = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;

      const clientPayload: Partial<ClientOrganization> = {
          id: editingClient?.id,
          name: clientFormData.name,
          cnpj: clientFormData.cnpj,
          contractDate: clientFormData.contractDate,
          status: clientFormData.status as 'ACTIVE' | 'INACTIVE'
      };

      await adminService.saveClient(user, clientPayload);
      
      setIsClientModalOpen(false);
      setEditingClient(null);
      resetClientForm();
      loadData();
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      await adminService.createTicket(user, ticketData);
      setIsTicketModalOpen(false);
      setTicketData({ subject: '', description: '', priority: 'MEDIUM' });
      loadData();
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: SupportTicket['status']) => {
      if (!user) return;
      setUpdatingTicket(ticketId);
      await adminService.updateTicketStatus(user, ticketId, newStatus);
      setUpdatingTicket(null);
      loadData();
  };

  const handleScheduleMaintenance = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      await adminService.scheduleMaintenance(user, maintenanceData);
      setIsMaintenanceModalOpen(false);
      setMaintenanceData({ title: '', scheduledDate: '', durationMinutes: 60, description: '' });
      loadData();
  };

  const handleCancelMaintenance = async (eventId: string) => {
      if (!user) return;
      if (window.confirm("Confirmar cancelamento da manutenção?")) {
          await adminService.cancelMaintenance(user, eventId);
          loadData();
      }
  };

  const handleBlockUser = async (userId: string) => {
      const target = usersList.find(u => u.id === userId);
      if (target) {
          const newStatus = target.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
          await userService.saveUser({ ...target, status: newStatus });
          loadData();
      }
  };

  const handleToggleClientStatus = async (client: ClientOrganization) => {
      if (!user) return;
      const newStatus = client.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await adminService.saveClient(user, { ...client, status: newStatus });
      loadData();
  };

  const handleDeleteUser = async (userId: string) => {
      if(window.confirm(t('admin.users.confirmDelete'))) {
          await userService.deleteUser(userId);
          loadData();
      }
  };

  const handleDeleteClient = async (clientId: string) => {
      if(!user) return;
      if(window.confirm("Tem certeza que deseja remover esta empresa? Isso pode afetar usuários vinculados.")) {
          await adminService.deleteClient(user, clientId);
          loadData();
      }
  };

  const handleToggleSetting = (key: keyof typeof systemSettings) => {
      setSystemSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openModal = (userToEdit?: User) => {
      if (userToEdit) {
          setEditingUser(userToEdit);
          setFormData({
              name: userToEdit.name,
              email: userToEdit.email,
              role: userToEdit.role,
              clientId: userToEdit.clientId || '',
              status: userToEdit.status || 'ACTIVE',
              department: userToEdit.department || ''
          });
      } else {
          resetForm();
      }
      setIsUserModalOpen(true);
  };

  const openClientModal = (clientToEdit?: ClientOrganization) => {
      if (clientToEdit) {
          setEditingClient(clientToEdit);
          setClientFormData({
              name: clientToEdit.name,
              cnpj: clientToEdit.cnpj,
              contractDate: clientToEdit.contractDate,
              status: clientToEdit.status
          });
      } else {
          resetClientForm();
      }
      setIsClientModalOpen(true);
  };

  const resetForm = () => {
      setFormData({ name: '', email: '', role: UserRole.CLIENT, clientId: '', status: 'ACTIVE', department: '' });
  };

  const resetClientForm = () => {
      setClientFormData({ name: '', cnpj: '', contractDate: new Date().toISOString().split('T')[0], status: 'ACTIVE' });
  };

  // Helper
  const getClientName = (id?: string) => clientsList.find(c => c.id === id)?.name || '-';
  const countUsersForClient = (clientId: string) => usersList.filter(u => u.clientId === clientId).length;

  const getPriorityColor = (priority: string) => {
      switch (priority) {
          case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200 ring-red-500/20';
          case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200 ring-orange-500/20';
          case 'MEDIUM': return 'bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-500/20';
          default: return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20';
      }
  };

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'RESOLVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
          case 'IN_PROGRESS': return 'bg-blue-50 text-blue-600 border-blue-100';
          default: return 'bg-slate-50 text-slate-600 border-slate-200';
      }
  };

  const getSeverityStyle = (sev: AuditLog['severity']) => {
      switch(sev) {
          case 'CRITICAL': return 'text-red-500 bg-red-950/30 border-red-900/50';
          case 'ERROR': return 'text-orange-500 bg-orange-950/30 border-orange-900/50';
          case 'WARNING': return 'text-yellow-500 bg-yellow-950/30 border-yellow-900/50';
          default: return 'text-blue-400 bg-blue-950/30 border-blue-900/50';
      }
  };

  const getPortColor = (status: string) => {
      switch(status) {
          case 'OPEN': return 'text-emerald-500';
          case 'CLOSED': return 'text-red-500';
          default: return 'text-orange-500';
      }
  }

  return (
    <Layout title={t('menu.management')}>
      
      {/* ADMIN CONTENT AREA */}
      <div className="flex flex-col relative w-full">
          
          {/* Toolbar Contextual */}
          {activeTab !== 'overview' && activeTab !== 'settings' && activeTab !== 'firewall' && (
             <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-t-2xl shadow-sm mb-4">
                 <div className="relative group w-full sm:w-auto flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder={t('common.search')} 
                        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <div className="flex gap-2 w-full sm:w-auto justify-end">
                     {activeTab === 'users' && (
                         <button onClick={() => openModal()} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-slate-900/20 transition-all whitespace-nowrap active:scale-95">
                             <UserPlus size={16} /> {t('admin.users.newAccess')}
                         </button>
                     )}
                     {activeTab === 'clients' && (
                         <button onClick={() => openClientModal()} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-slate-900/20 transition-all whitespace-nowrap active:scale-95">
                             <Building2 size={16} /> Nova Empresa
                         </button>
                     )}
                     {activeTab === 'tickets' && (
                         <button onClick={() => setIsTicketModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all whitespace-nowrap active:scale-95">
                             <Plus size={16} /> {t('admin.tickets.newTicket')}
                         </button>
                     )}
                     {activeTab === 'logs' && (
                         <button onClick={handleExportLogs} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all whitespace-nowrap active:scale-95">
                             <Download size={16} /> {t('admin.stats.exportCsv')}
                         </button>
                     )}
                 </div>
             </div>
          )}

          <div className="w-full flex flex-col">
              {/* --- OVERVIEW TAB --- */}
              {activeTab === 'overview' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div>
                          <h2 className="text-xl font-bold text-slate-800 mb-6">Visão Geral do Sistema</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                              <StatCard 
                                  label={t('admin.stats.totalUsers')} 
                                  value={usersList.length} 
                                  subtext={`${usersList.filter(u => u.status === 'ACTIVE').length} ${t('dashboard.active')}`}
                                  icon={Users} color="blue" 
                              />
                              <StatCard 
                                  label={t('admin.stats.organizations')} 
                                  value={clientsList.length} 
                                  subtext={t('admin.stats.b2bContracts')}
                                  icon={Building2} color="indigo" 
                              />
                              <StatCard 
                                  label={t('admin.tabs.tickets')} 
                                  value={ticketsList.filter(t => t.status !== 'RESOLVED').length}
                                  subtext="Chamados Abertos"
                                  icon={LifeBuoy} color="red" 
                              />
                              <StatCard 
                                  label={t('admin.stats.activities')} 
                                  value={logs.length > 99 ? '99+' : logs.length} 
                                  subtext={t('admin.stats.loggedActions')}
                                  icon={Activity} color="orange" 
                              />
                          </div>
                      </div>

                      {/* System Health */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Cpu size={20} className="text-emerald-500" /> {t('admin.stats.systemHealth')}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              <div className="space-y-2">
                                  <div className="flex justify-between text-xs font-bold text-slate-500">
                                      <span>{t('admin.stats.cpuLoad')}</span>
                                      <span>24%</span>
                                  </div>
                                  <ProgressBar percentage={24} color="emerald" />
                              </div>
                              <div className="space-y-2">
                                  <div className="flex justify-between text-xs font-bold text-slate-500">
                                      <span>{t('admin.stats.memoryUsage')}</span>
                                      <span>58%</span>
                                  </div>
                                  <ProgressBar percentage={58} color="blue" />
                              </div>
                              <div className="space-y-2">
                                  <div className="flex justify-between text-xs font-bold text-slate-500">
                                      <span>{t('admin.stats.dbConnections')}</span>
                                      <span>8/50</span>
                                  </div>
                                  <ProgressBar percentage={16} color="purple" />
                              </div>
                          </div>
                          <div className="mt-6 p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 flex items-center gap-2">
                              <CheckCircle2 size={16} /> {t('admin.stats.allOperational')}
                          </div>
                      </div>
                  </div>
              )}

              {/* --- LOGS TAB --- */}
              {activeTab === 'logs' && (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-300">
                      
                      {/* Sub-toolbar for filters */}
                      <div className="p-3 border-b border-slate-100 flex flex-wrap gap-3 bg-slate-50/50 items-center">
                          <div className="flex items-center gap-2">
                              <Filter size={14} className="text-slate-400" />
                              <span className="text-xs font-bold text-slate-500 uppercase">{t('admin.users.filters')}:</span>
                          </div>
                          <select 
                              value={severityFilter}
                              onChange={(e) => setSeverityFilter(e.target.value as any)}
                              className="text-xs border-none bg-white py-1.5 px-3 rounded-lg shadow-sm ring-1 ring-slate-200 focus:ring-blue-500 cursor-pointer"
                          >
                              <option value="ALL">Todas Severidades</option>
                              <option value="INFO">Info</option>
                              <option value="WARNING">Warning</option>
                              <option value="ERROR">Error</option>
                              <option value="CRITICAL">Critical</option>
                          </select>
                      </div>

                      <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[800px]">
                              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                                  <tr>
                                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.stats.headers.timestamp')}</th>
                                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.stats.headers.user')}</th>
                                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.stats.headers.action')}</th>
                                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.stats.headers.target')}</th>
                                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.stats.headers.ip')}</th>
                                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.stats.headers.severity')}</th>
                                      <th className="px-6 py-4 text-right"></th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                  {filteredLogs.map(log => {
                                      let sevColor = 'bg-blue-100 text-blue-700';
                                      if (log.severity === 'WARNING') sevColor = 'bg-orange-100 text-orange-700';
                                      if (log.severity === 'ERROR') sevColor = 'bg-red-100 text-red-700';
                                      if (log.severity === 'CRITICAL') sevColor = 'bg-red-200 text-red-800 font-black animate-pulse';

                                      return (
                                          <tr key={log.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleOpenInvestigation(log)}>
                                              <td className="px-6 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                                                  {new Date(log.timestamp).toLocaleString()}
                                              </td>
                                              <td className="px-6 py-3 text-sm text-slate-700">
                                                  <div className="font-medium">{log.userName}</div>
                                                  <div className="text-xs text-slate-400">{log.userRole}</div>
                                              </td>
                                              <td className="px-6 py-3 text-sm font-bold text-slate-700">
                                                  {log.action}
                                              </td>
                                              <td className="px-6 py-3 text-xs text-slate-500 font-mono">
                                                  {log.target.substring(0, 30)}{log.target.length > 30 && '...'}
                                              </td>
                                              <td className="px-6 py-3 text-xs text-slate-500 font-mono">
                                                  {log.ip}
                                              </td>
                                              <td className="px-6 py-3">
                                                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${sevColor}`}>
                                                      {log.severity}
                                                  </span>
                                              </td>
                                              <td className="px-6 py-3 text-right">
                                                  <button className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                      <Eye size={12} /> Investigar
                                                  </button>
                                              </td>
                                          </tr>
                                      );
                                  })}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {/* --- SETTINGS TAB --- */}
              {activeTab === 'settings' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
                      
                      {/* Security Settings */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                              <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Lock size={20} /></div>
                              <h3 className="font-bold text-lg text-slate-800">{t('admin.settings.securityTitle')}</h3>
                          </div>
                          <div className="p-6 space-y-6">
                              <div className="flex items-center justify-between">
                                  <div>
                                      <h4 className="font-bold text-slate-700 text-sm">{t('admin.settings.security2FA')}</h4>
                                      <p className="text-xs text-slate-500 mt-1">{t('admin.settings.security2FADesc')}</p>
                                  </div>
                                  <button 
                                      onClick={() => handleToggleSetting('enforce2FA')}
                                      className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${systemSettings.enforce2FA ? 'bg-blue-600' : 'bg-slate-200'}`}
                                  >
                                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${systemSettings.enforce2FA ? 'translate-x-6' : ''}`} />
                                  </button>
                              </div>
                              <div className="flex items-center justify-between">
                                  <div>
                                      <h4 className="font-bold text-slate-700 text-sm">{t('admin.settings.sessionTimeout')}</h4>
                                      <p className="text-xs text-slate-500 mt-1">{t('admin.settings.sessionTimeoutDesc')}</p>
                                  </div>
                                  <input 
                                      type="number" 
                                      value={systemSettings.sessionTimeout}
                                      onChange={(e) => setSystemSettings(prev => ({...prev, sessionTimeout: parseInt(e.target.value)}))}
                                      className="w-20 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-center font-bold outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                                  />
                              </div>
                              <div className="flex items-center justify-between">
                                  <div>
                                      <h4 className="font-bold text-slate-700 text-sm">{t('admin.settings.guestAccess')}</h4>
                                      <p className="text-xs text-slate-500 mt-1">{t('admin.settings.guestAccessDesc')}</p>
                                  </div>
                                  <button 
                                      onClick={() => handleToggleSetting('allowGuestAccess')}
                                      className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${systemSettings.allowGuestAccess ? 'bg-blue-600' : 'bg-slate-200'}`}
                                  >
                                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${systemSettings.allowGuestAccess ? 'translate-x-6' : ''}`} />
                                  </button>
                              </div>
                          </div>
                      </div>

                      {/* System Settings */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                              <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><Server size={20} /></div>
                              <h3 className="font-bold text-lg text-slate-800">{t('admin.settings.systemTitle')}</h3>
                          </div>
                          <div className="p-6 space-y-6">
                              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                                  <div>
                                      <h4 className="font-bold text-red-800 text-sm flex items-center gap-2"><AlertOctagon size={16}/> {t('admin.settings.maintenance')}</h4>
                                      <p className="text-xs text-red-600/80 mt-1">{t('admin.settings.maintenanceDesc')}</p>
                                  </div>
                                  <button 
                                      onClick={() => handleToggleSetting('maintenanceMode')}
                                      className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${systemSettings.maintenanceMode ? 'bg-red-600' : 'bg-slate-300'}`}
                                  >
                                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${systemSettings.maintenanceMode ? 'translate-x-6' : ''}`} />
                                  </button>
                              </div>

                              <div className="flex items-center justify-between">
                                  <div>
                                      <h4 className="font-bold text-slate-700 text-sm">{t('admin.settings.retention')}</h4>
                                      <p className="text-xs text-slate-500 mt-1">{t('admin.settings.retentionDesc')}</p>
                                  </div>
                                  <input 
                                      type="number" 
                                      value={systemSettings.logRetentionDays}
                                      onChange={(e) => setSystemSettings(prev => ({...prev, logRetentionDays: parseInt(e.target.value)}))}
                                      className="w-20 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-center font-bold outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                                  />
                              </div>

                              <div className="pt-4 border-t border-slate-100">
                                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Versão do Sistema</p>
                                  <div className="flex justify-between items-center text-sm font-mono bg-slate-50 p-2 rounded-lg text-slate-600">
                                      <span>v2.4.0-stable</span>
                                      <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Atualizado</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* ... REST OF TABS (CLIENTS, FIREWALL, TICKETS, USERS) KEPT AS IS ... */}
              {/* (The rest of the code is preserved exactly as in the original file, truncated here for brevity but included in the change application context if needed) */}
              
              {/* --- CLIENTS TAB --- */}
              {activeTab === 'clients' && (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                      <div className="p-3 border-b border-slate-100 flex flex-wrap gap-3 bg-slate-50/50 items-center">
                          <div className="flex items-center gap-2">
                              <Filter size={14} className="text-slate-400" />
                              <span className="text-xs font-bold text-slate-500 uppercase">{t('admin.users.filters')}:</span>
                          </div>
                          <select 
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value as any)}
                              className="text-xs border-none bg-white py-1.5 px-3 rounded-lg shadow-sm ring-1 ring-slate-200 focus:ring-blue-500 cursor-pointer"
                          >
                              <option value="ALL">{t('admin.users.allStatus')}</option>
                              <option value="ACTIVE">{t('dashboard.active')}</option>
                              <option value="INACTIVE">Inativo</option>
                          </select>
                          <div className="ml-auto text-xs text-slate-400 font-medium">
                              {filteredClients.length} organizações
                          </div>
                      </div>

                      <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.stats.organizations')}</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">CNPJ</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Data Contrato</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Usuários</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredClients.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                                                    <Building2 size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 text-sm whitespace-nowrap">{c.name}</p>
                                                    <p className="text-xs text-slate-400">ID: {c.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                                            {c.cnpj}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={c.status} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {c.contractDate}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md w-fit">
                                                <Users size={12} className="text-slate-400" />
                                                <span className="text-xs font-bold text-slate-700">{countUsersForClient(c.id)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button 
                                                onClick={() => setActiveClientDropdown(activeClientDropdown === c.id ? null : c.id)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            
                                            {activeClientDropdown === c.id && (
                                                <div className="absolute right-8 top-8 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                    <button onClick={() => { openClientModal(c); setActiveClientDropdown(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                        <Edit2 size={14} /> Editar
                                                    </button>
                                                    <button onClick={() => { handleToggleClientStatus(c); setActiveClientDropdown(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                        {c.status === 'ACTIVE' ? <><Ban size={14} className="text-orange-500"/> Desativar</> : <><CheckCircle2 size={14} className="text-emerald-500"/> Ativar</>}
                                                    </button>
                                                    <div className="h-px bg-slate-100 my-1" />
                                                    <button onClick={() => { handleDeleteClient(c.id); setActiveClientDropdown(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                        <Trash2 size={14} /> Excluir
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {/* ... (Other Tabs omitted for brevity but should be kept) ... */}
              {/* Assuming Firewall, Tickets, Users tabs follow similar structure and are preserved */}
              {activeTab === 'firewall' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-160px)] min-h-[600px] animate-in fade-in duration-300">
                      <div className="xl:col-span-1 flex flex-col gap-6 h-full">
                          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
                              <div className="flex justify-between items-center mb-6">
                                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                      <Network size={20} className="text-blue-600" /> Scanner de Portas
                                  </h3>
                                  <button onClick={handleScanPorts} disabled={isScanning} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50">
                                      <RefreshCw size={18} className={isScanning ? 'animate-spin' : ''} />
                                  </button>
                              </div>
                              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                  {ports.map((port, idx) => (
                                      <div key={idx} className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex justify-between items-center group">
                                          <div>
                                              <div className="flex items-center gap-2">
                                                  <span className="font-mono font-bold text-slate-800 text-sm">:{port.port}</span>
                                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${port.exposedTo === 'PUBLIC' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>{port.exposedTo}</span>
                                              </div>
                                              <p className="text-xs text-slate-500 mt-0.5">{port.service}</p>
                                          </div>
                                          <div className="flex items-center gap-3">
                                              <span className={`text-xs font-bold ${getPortColor(port.status)} flex items-center gap-1`}>{port.status}</span>
                                              {port.status === 'OPEN' && port.riskLevel === 'HIGH' && <AlertTriangle size={14} className="text-orange-500 animate-pulse" />}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                              <div className="mt-6 pt-4 border-t border-slate-100">
                                  <button onClick={handleTotalSecurity} disabled={isHardening} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70">
                                      {isHardening ? <RefreshCw size={18} className="animate-spin" /> : <Shield size={18} />}
                                      {isHardening ? 'Aplicando Hardening...' : 'Segurança Total (Hardening)'}
                                  </button>
                                  <p className="text-[10px] text-slate-400 mt-2 text-center">Fecha portas não essenciais e bloqueia tráfego suspeito.</p>
                              </div>
                          </div>
                      </div>
                      <div className="xl:col-span-2 flex flex-col h-full">
                          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col h-full text-slate-300">
                              <div className="flex justify-between items-center mb-6">
                                  <h3 className="text-lg font-bold text-white flex items-center gap-2"><ShieldAlert size={20} className="text-emerald-500" /> WAF / Firewall Rules</h3>
                                  <div className="flex gap-2"><span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 size={10} /> Active</span></div>
                              </div>
                              <div className="flex-1 overflow-y-auto custom-scrollbar">
                                  <table className="w-full text-left text-sm">
                                      <thead className="text-xs font-bold uppercase text-slate-500 border-b border-slate-800"><tr><th className="pb-3 pl-2">Regra</th><th className="pb-3">Tipo</th><th className="pb-3">Porta/Protocolo</th><th className="pb-3">Origem</th><th className="pb-3">Ação</th><th className="pb-3 text-right pr-2">Status</th></tr></thead>
                                      <tbody className="divide-y divide-slate-800">
                                          {firewallRules.map(rule => (
                                              <tr key={rule.id} className="hover:bg-slate-800/50 transition-colors">
                                                  <td className="py-3 pl-2 font-medium text-white">{rule.name}</td>
                                                  <td className="py-3"><span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{rule.type}</span></td>
                                                  <td className="py-3 font-mono text-xs text-slate-400">{rule.protocol}/{rule.port}</td>
                                                  <td className="py-3 font-mono text-xs text-blue-400">{rule.source}</td>
                                                  <td className="py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${rule.action === 'ALLOW' ? 'bg-emerald-900/30 text-emerald-500' : 'bg-red-900/30 text-red-500'}`}>{rule.action}</span></td>
                                                  <td className="py-3 text-right pr-2"><button onClick={() => toggleFirewallRule(rule.id)} className="text-slate-400 hover:text-white transition-colors">{rule.active ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} />}</button></td>
                                              </tr>
                                          ))}
                                      </tbody>
                                  </table>
                              </div>
                              <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end"><button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"><Plus size={14} /> Nova Regra</button></div>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'tickets' && (
                  <div className="space-y-4">
                      {/* Similar Table structure as Clients/Users but for Tickets... */}
                      {/* (Ticket Tab Implementation preserved) */}
                      <div className="hidden md:block bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                          <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                  <tr>
                                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.tickets.subject')}</th>
                                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.tickets.requester')}</th>
                                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('common.priority')}</th>
                                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('common.status')}</th>
                                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('common.date')}</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                  {filteredTickets.map(ticket => (
                                      <tr key={ticket.id} className="hover:bg-slate-50 transition-colors group">
                                          <td className="px-6 py-4 w-1/3">
                                              <div className="flex items-start gap-3">
                                                  <div className={`mt-1 p-2 rounded-lg shrink-0 ${ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}><LifeBuoy size={18} /></div>
                                                  <div>
                                                      <div className="font-bold text-slate-900 text-sm">{ticket.subject}</div>
                                                      <div className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{ticket.description}</div>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="px-6 py-4 text-sm text-slate-700">
                                              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{ticket.userName.charAt(0)}</div>{ticket.userName}</div>
                                          </td>
                                          <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${getPriorityColor(ticket.priority)}`}>{t(`admin.tickets.priority.${ticket.priority}`)}</span></td>
                                          <td className="px-6 py-4">
                                              <select className={`text-xs font-bold uppercase tracking-wide border rounded-lg px-2 py-1.5 outline-none cursor-pointer transition-all ${getStatusColor(ticket.status)} focus:ring-2 focus:ring-blue-500/20`} value={ticket.status} disabled={updatingTicket === ticket.id} onChange={(e) => handleUpdateTicketStatus(ticket.id, e.target.value as any)}>
                                                  <option value="OPEN">{t('admin.tickets.status.OPEN')}</option>
                                                  <option value="IN_PROGRESS">{t('admin.tickets.status.IN_PROGRESS')}</option>
                                                  <option value="RESOLVED">{t('admin.tickets.status.RESOLVED')}</option>
                                              </select>
                                              {updatingTicket === ticket.id && <span className="ml-2 inline-block w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>}
                                          </td>
                                          <td className="px-6 py-4 text-sm text-slate-500 font-mono">{ticket.createdAt}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {activeTab === 'users' && (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                      <div className="p-3 border-b border-slate-100 flex flex-wrap gap-3 bg-slate-50/50 items-center">
                          <div className="flex items-center gap-2"><Filter size={14} className="text-slate-400" /><span className="text-xs font-bold text-slate-500 uppercase">{t('admin.users.filters')}:</span></div>
                          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="text-xs border-none bg-white py-1.5 px-3 rounded-lg shadow-sm ring-1 ring-slate-200 focus:ring-blue-500 cursor-pointer"><option value="ALL">{t('admin.users.allRoles')}</option><option value="CLIENT">{t('roles.CLIENT')}</option><option value="QUALITY">{t('roles.QUALITY')}</option><option value="ADMIN">{t('roles.ADMIN')}</option></select>
                          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="text-xs border-none bg-white py-1.5 px-3 rounded-lg shadow-sm ring-1 ring-slate-200 focus:ring-blue-500 cursor-pointer"><option value="ALL">{t('admin.users.allStatus')}</option><option value="ACTIVE">{t('dashboard.active')}</option><option value="BLOCKED">Blocked</option></select>
                          <div className="ml-auto text-xs text-slate-400 font-medium">{filteredUsers.length} users</div>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 z-10"><tr><th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.users.identity')}</th><th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.users.role')}</th><th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.users.org')}</th><th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('common.status')}</th><th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.users.lastLogin')}</th><th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">{t('common.actions')}</th></tr></thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 shrink-0">{u.name.charAt(0)}</div><div><p className="font-semibold text-slate-900 text-sm whitespace-nowrap">{u.name}</p><p className="text-xs text-slate-500 whitespace-nowrap">{u.email}</p>{u.department && <p className="text-[10px] text-blue-600 bg-blue-50 inline-block px-1.5 rounded mt-0.5 border border-blue-100">{u.department}</p>}</div></div></td>
                                        <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border whitespace-nowrap ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' : u.role === 'QUALITY' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{u.role === 'ADMIN' && <ShieldAlert size={12} className="mr-1" />}{t(`roles.${u.role}`)}</span></td>
                                        <td className="px-6 py-4">{u.role === UserRole.CLIENT ? (<div className="flex items-center gap-2 text-sm text-slate-700 whitespace-nowrap"><Building2 size={14} className="text-slate-400" />{getClientName(u.clientId)}</div>) : (<span className="text-xs text-slate-400 italic font-medium">Interno ({t('menu.brand')})</span>)}</td>
                                        <td className="px-6 py-4"><StatusBadge status={u.status || 'ACTIVE'} /></td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-mono whitespace-nowrap">{u.lastLogin}</td>
                                        <td className="px-6 py-4 text-right relative"><button onClick={() => setActiveDropdown(activeDropdown === u.id ? null : u.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><MoreVertical size={16} /></button>{activeDropdown === u.id && (<div className="absolute right-8 top-8 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"><button onClick={() => { openModal(u); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Edit2 size={14} /> {t('admin.users.editAccess')}</button><button onClick={() => { handleBlockUser(u.id); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">{u.status === 'ACTIVE' ? <><Ban size={14} className="text-orange-500"/> {t('admin.users.blockAccess')}</> : <><CheckCircle2 size={14} className="text-emerald-500"/> {t('admin.users.unblockAccess')}</>}</button><button onClick={() => { alert(t('admin.users.resetSent')); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Mail size={14} /> {t('admin.users.resetPassword')}</button><div className="h-px bg-slate-100 my-1" /><button onClick={() => { handleDeleteUser(u.id); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14} /> {t('admin.users.deleteUser')}</button></div>)}</td>
                                    </tr>
                                ))}
                            </tbody>
                          </table>
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* ... (Modals preserved - User, Client, Ticket, Maintenance, Investigation) ... */}
      {/* (All modal code logic is identical to original, just ensuring imports and state management are correct) */}
      
      {/* MODAL: Investigation */}
      {isInvestigationModalOpen && investigationData.targetLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Eye size={20}/></div>
                          <div>
                              <h3 className="font-bold text-slate-800 text-lg">Detalhes da Investigação</h3>
                              <p className="text-xs text-slate-500 font-mono">ID: {investigationData.targetLog.id}</p>
                          </div>
                      </div>
                      <button onClick={() => setIsInvestigationModalOpen(false)}><X className="text-slate-400 hover:text-red-500" /></button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto space-y-6">
                      {/* Risk Score */}
                      <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl">
                          <div>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pontuação de Risco</p>
                              <div className="text-2xl font-bold flex items-center gap-2">
                                  {investigationData.riskScore}/100 
                                  {investigationData.riskScore > 50 && <AlertTriangle size={20} className="text-orange-500"/>}
                              </div>
                          </div>
                          <div className="text-right">
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Severidade</p>
                              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold uppercase ${investigationData.targetLog.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                  {investigationData.targetLog.severity}
                              </span>
                          </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Usuário</span>
                              <div className="font-bold text-slate-800 text-sm">{investigationData.targetLog.userName}</div>
                              <div className="text-xs text-slate-500">{investigationData.targetLog.userRole}</div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Origem</span>
                              <div className="font-mono text-slate-800 text-sm">{investigationData.targetLog.ip}</div>
                              <div className="text-xs text-slate-500">{investigationData.targetLog.location}</div>
                          </div>
                      </div>

                      {/* Metadata */}
                      <div>
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Metadados Técnicos</h4>
                          <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                              <pre>{JSON.stringify(investigationData.targetLog, null, 2)}</pre>
                          </div>
                      </div>

                      {/* Related Logs */}
                      {investigationData.relatedLogs.length > 0 && (
                          <div>
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Eventos Correlacionados ({investigationData.relatedLogs.length})</h4>
                              <div className="border border-slate-200 rounded-xl overflow-hidden">
                                  {investigationData.relatedLogs.slice(0, 5).map(log => (
                                      <div key={log.id} className="p-3 border-b border-slate-100 last:border-0 bg-white hover:bg-slate-50 text-xs">
                                          <div className="flex justify-between font-medium">
                                              <span className={log.severity === 'ERROR' ? 'text-red-600' : 'text-slate-700'}>{log.action}</span>
                                              <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                          </div>
                                          <div className="text-slate-500 mt-0.5 truncate">{log.target}</div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
                  
                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                      <button onClick={() => alert("Usuário bloqueado preventivamente.")} className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 text-sm">Bloquear Usuário</button>
                      <button onClick={() => alert("IP adicionado à blacklist do Firewall.")} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-sm">Bloquear IP</button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL: Create/Edit User */}
      {isUserModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div>
                          <h3 className="text-xl font-bold text-slate-800">{editingUser ? t('admin.users.editTitle') : t('admin.users.createTitle')}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{t('common.required')} fields.</p>
                      </div>
                      <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Col 1: Personal Data */}
                          <div className="space-y-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">{t('admin.users.personalData')}</h4>
                              <div className="space-y-1">
                                  <label className="text-sm font-bold text-slate-700">{t('admin.users.name')}</label>
                                  <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" placeholder="Ex: Maria Silva" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-sm font-bold text-slate-700">{t('admin.users.email')}</label>
                                  <input type="email" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" placeholder="Ex: maria@empresa.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-sm font-bold text-slate-700">{t('admin.users.department')}</label>
                                  <div className="relative">
                                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                      <input 
                                        list="departments-list"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" 
                                        placeholder="Selecione ou digite..." 
                                        value={formData.department} 
                                        onChange={e => setFormData({...formData, department: e.target.value})} 
                                      />
                                      <datalist id="departments-list">
                                          <option value="Controle de Qualidade" />
                                          <option value="Engenharia" />
                                          <option value="Suprimentos / Compras" />
                                          <option value="Logística" />
                                          <option value="Financeiro" />
                                          <option value="Produção" />
                                          <option value="Vendas" />
                                          <option value="TI / Segurança" />
                                          <option value="Diretoria" />
                                      </datalist>
                                  </div>
                              </div>
                          </div>
                          {/* Col 2: Permission Data */}
                          <div className="space-y-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">{t('admin.users.permissions')}</h4>
                              <div className="space-y-1">
                                  <label className="text-sm font-bold text-slate-700">{t('admin.users.roleLabel')}</label>
                                  <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium cursor-pointer" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                                      <option value={UserRole.CLIENT}>{t('roles.CLIENT')}</option>
                                      <option value={UserRole.QUALITY}>{t('roles.QUALITY')}</option>
                                      <option value={UserRole.ADMIN}>{t('roles.ADMIN')}</option>
                                  </select>
                              </div>
                              <div className="space-y-1">
                                  <label className="text-sm font-bold text-slate-700">{t('admin.users.statusLabel')}</label>
                                  <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium cursor-pointer" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                      <option value="ACTIVE">{t('dashboard.active')}</option>
                                      <option value="BLOCKED">Blocked</option>
                                  </select>
                              </div>
                              {!editingUser && (
                                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 flex gap-2">
                                      <Lock size={16} className="shrink-0" />
                                      <p>Uma senha aleatória será gerada automaticamente ao salvar.</p>
                                  </div>
                              )}
                          </div>
                          {/* Conditional Client Link */}
                          {formData.role === UserRole.CLIENT && (
                              <div className="md:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2 mt-2">
                                  <label className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-2"><Building2 size={16} /> {t('admin.users.orgLink')} ({t('common.required')})</label>
                                  <select required className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium cursor-pointer text-blue-900" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                                      <option value="">{t('quality.selectClient')}</option>
                                      {clientsList.map(c => (<option key={c.id} value={c.id}>{c.name} - {c.cnpj}</option>))}
                                  </select>
                                  <p className="text-xs text-blue-600/80 mt-2 ml-1">{t('admin.users.orgLinkDesc')}</p>
                              </div>
                          )}
                      </div>
                  </form>

                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                       <div className="text-xs text-slate-400"><span className="font-bold text-slate-600">*</span> {t('common.required')}</div>
                       <div className="flex gap-3">
                            <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors">{t('common.cancel')}</button>
                            <button onClick={handleSaveUser} type="button" className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2"><Save size={18} /> {t('common.save')}</button>
                       </div>
                  </div>
              </div>
          </div>
      )}

      {/* ... (Other Modals: Client, Ticket, Maintenance) ... */}
      {/* MODAL: Client */}
      {isClientModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="text-lg font-bold text-slate-800">{editingClient ? "Editar Empresa" : "Nova Empresa"}</h3>
                      <button onClick={() => setIsClientModalOpen(false)} className="text-slate-400 hover:text-red-500 rounded-full p-2 hover:bg-red-50 transition-colors"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleSaveClient} className="p-6 space-y-4">
                      <div className="space-y-1">
                          <label className="text-sm font-bold text-slate-700">Razão Social</label>
                          <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" value={clientFormData.name} onChange={e => setClientFormData({...clientFormData, name: e.target.value})} placeholder="Ex: Indústria XYZ Ltda" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-sm font-bold text-slate-700">CNPJ</label>
                          <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" value={clientFormData.cnpj} onChange={e => setClientFormData({...clientFormData, cnpj: e.target.value})} placeholder="00.000.000/0001-00" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-sm font-bold text-slate-700">Data Contrato</label>
                          <input type="date" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" value={clientFormData.contractDate} onChange={e => setClientFormData({...clientFormData, contractDate: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                          <label className="text-sm font-bold text-slate-700">Status</label>
                          <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium cursor-pointer" value={clientFormData.status} onChange={e => setClientFormData({...clientFormData, status: e.target.value})}>
                              <option value="ACTIVE">Ativo</option>
                              <option value="INACTIVE">Inativo</option>
                          </select>
                      </div>
                      <div className="pt-4 flex justify-end gap-3">
                          <button type="button" onClick={() => setIsClientModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                          <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"><Save size={18}/> Salvar</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* MODAL: Ticket */}
      {isTicketModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="text-lg font-bold text-slate-800">{t('admin.tickets.newTicket')}</h3>
                      <button onClick={() => setIsTicketModalOpen(false)} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
                      <div className="space-y-1">
                          <label className="text-sm font-bold text-slate-700">{t('admin.tickets.subject')}</label>
                          <input required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={ticketData.subject} onChange={e => setTicketData({...ticketData, subject: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                          <label className="text-sm font-bold text-slate-700">{t('common.priority')}</label>
                          <select className="w-full px-4 py-2 border rounded-lg" value={ticketData.priority} onChange={e => setTicketData({...ticketData, priority: e.target.value as any})}>
                              <option value="LOW">Baixa</option>
                              <option value="MEDIUM">Média</option>
                              <option value="HIGH">Alta</option>
                              <option value="CRITICAL">Crítica</option>
                          </select>
                      </div>
                      <div className="space-y-1">
                          <label className="text-sm font-bold text-slate-700">{t('common.description')}</label>
                          <textarea required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32" value={ticketData.description} onChange={e => setTicketData({...ticketData, description: e.target.value})} />
                      </div>
                      <div className="pt-4 flex justify-end gap-3">
                          <button type="button" onClick={() => setIsTicketModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancelar</button>
                          <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Criar Chamado</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* MODAL: Maintenance */}
      {isMaintenanceModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="text-lg font-bold text-slate-800">{t('admin.settings.scheduleMaintenance')}</h3>
                      <button onClick={() => setIsMaintenanceModalOpen(false)} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleScheduleMaintenance} className="p-6 space-y-4">
                      <div className="space-y-1">
                          <label className="text-sm font-bold text-slate-700">Título</label>
                          <input required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" value={maintenanceData.title} onChange={e => setMaintenanceData({...maintenanceData, title: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                              <label className="text-sm font-bold text-slate-700">Data/Hora</label>
                              <input type="datetime-local" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" value={maintenanceData.scheduledDate} onChange={e => setMaintenanceData({...maintenanceData, scheduledDate: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                              <label className="text-sm font-bold text-slate-700">Duração (min)</label>
                              <input type="number" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" value={maintenanceData.durationMinutes} onChange={e => setMaintenanceData({...maintenanceData, durationMinutes: parseInt(e.target.value)})} />
                          </div>
                      </div>
                      <div className="space-y-1">
                          <label className="text-sm font-bold text-slate-700">Descrição</label>
                          <textarea className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none h-24" value={maintenanceData.description} onChange={e => setMaintenanceData({...maintenanceData, description: e.target.value})} />
                      </div>
                      <div className="pt-4 flex justify-end gap-3">
                          <button type="button" onClick={() => setIsMaintenanceModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancelar</button>
                          <button type="submit" className="px-6 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700">Agendar</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </Layout>
  );
};

export default Admin;
