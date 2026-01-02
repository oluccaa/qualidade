
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from '../components/Layout.tsx';
import { MOCK_CLIENTS } from '../services/mockData.ts';
import { getAuditLogs } from '../services/fileService.ts';
import { UserRole, AuditLog, User, ClientOrganization } from '../types.ts';
import { useAuth } from '../services/authContext.tsx';
import * as userService from '../services/userService.ts';
import { useTranslation } from 'react-i18next';
import { 
  Trash2, 
  Edit2, 
  Activity, 
  Users, 
  ShieldAlert, 
  Search, 
  MoreVertical,
  HardDrive,
  Building2,
  Settings as SettingsIcon,
  Save,
  X,
  Lock,
  CheckCircle2,
  Ban,
  UserPlus,
  BarChart3,
  Filter,
  FileText,
  Zap,
  Mail,
  Server,
  Download
} from 'lucide-react';

// --- Components ---

const StatCard = ({ label, value, subtext, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-${color}-600`}>
            <Icon size={80} />
        </div>
        <div className="relative z-10">
            <div className={`w-10 h-10 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center mb-4`}>
                <Icon size={20} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            {subtext && <p className="text-xs text-slate-400 mt-2 border-t border-slate-100 pt-2">{subtext}</p>}
        </div>
    </div>
);

const ProgressBar = ({ percentage, color = "blue" }: { percentage: number, color?: string }) => (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div 
            className={`h-full rounded-full transition-all duration-500 bg-${color}-500`} 
            style={{ width: `${percentage}%` }}
        />
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    const isActive = status === 'ACTIVE';
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {isActive ? 'Active' : 'Blocked'}
        </span>
    );
};

// --- Main Page ---

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'clients' | 'logs' | 'settings'>('overview');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  
  // Data State
  const [usersList, setUsersList] = useState<User[]>([]);
  const [clientsList, setClientsList] = useState<ClientOrganization[]>(MOCK_CLIENTS);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED' | 'INACTIVE'>('ALL');

  // Modal & Form State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: UserRole.CLIENT, clientId: '', status: 'ACTIVE' });

  // Load Users on Mount
  useEffect(() => {
    loadUsers();
    if (user) {
        getAuditLogs(user).then(setLogs);
    }
  }, [user]);

  const loadUsers = async () => {
      setIsLoading(true);
      try {
          const data = await userService.getUsers();
          setUsersList(data);
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
      return logs.filter(l => 
          l.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
          l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.target.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [logs, searchTerm]);

  // --- Actions ---

  const handleSaveUser = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const userPayload: User = {
          id: editingUser ? editingUser.id : `u${Date.now()}`,
          name: formData.name,
          email: formData.email,
          role: formData.role as UserRole,
          clientId: formData.role === UserRole.CLIENT ? formData.clientId : undefined,
          status: formData.status as 'ACTIVE' | 'BLOCKED',
          lastLogin: editingUser?.lastLogin || 'Nunca'
      };

      await userService.saveUser(userPayload);
      
      setIsUserModalOpen(false);
      setEditingUser(null);
      resetForm();
      loadUsers(); // Refresh list
  };

  const handleBlockUser = async (userId: string) => {
      const target = usersList.find(u => u.id === userId);
      if (target) {
          const newStatus = target.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
          await userService.saveUser({ ...target, status: newStatus });
          loadUsers();
      }
  };

  const handleDeleteUser = async (userId: string) => {
      if(window.confirm('Atenção: Esta ação é irreversível. Deseja excluir este usuário?')) {
          await userService.deleteUser(userId);
          loadUsers();
      }
  };

  const openModal = (userToEdit?: User) => {
      if (userToEdit) {
          setEditingUser(userToEdit);
          setFormData({
              name: userToEdit.name,
              email: userToEdit.email,
              role: userToEdit.role,
              clientId: userToEdit.clientId || '',
              status: userToEdit.status || 'ACTIVE'
          });
      } else {
          resetForm();
      }
      setIsUserModalOpen(true);
  };

  const resetForm = () => {
      setFormData({ name: '', email: '', role: UserRole.CLIENT, clientId: '', status: 'ACTIVE' });
  };

  // Helper
  const getClientName = (id?: string) => clientsList.find(c => c.id === id)?.name || '-';
  const countUsersForClient = (clientId: string) => usersList.filter(u => u.clientId === clientId).length;

  return (
    <Layout title={t('menu.management')}>
      
      {/* 1. TOP NAVIGATION & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          
          {/* Navigation Tabs (Pill Style) */}
          <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex overflow-x-auto no-scrollbar max-w-full w-full md:w-auto">
              {[
                  { id: 'overview', label: t('admin.tabs.overview'), icon: BarChart3 },
                  { id: 'users', label: t('admin.tabs.users'), icon: Users },
                  { id: 'clients', label: t('admin.tabs.clients'), icon: Building2 },
                  { id: 'logs', label: t('admin.tabs.logs'), icon: ShieldAlert },
                  { id: 'settings', label: t('admin.tabs.settings'), icon: SettingsIcon },
              ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setSearchTerm(''); }}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap
                        ${activeTab === tab.id 
                            ? 'bg-slate-900 text-white shadow-md' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}
                    `}
                  >
                      <tab.icon size={16} />
                      {tab.label}
                  </button>
              ))}
          </div>

          {/* Contextual Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
             {activeTab !== 'overview' && activeTab !== 'settings' && (
                 <div className="relative group flex-1 md:flex-none w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={16} />
                    <input 
                        type="text" 
                        placeholder={t('common.search')} 
                        className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                 </div>
             )}
             
             {activeTab === 'users' && (
                 <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95 whitespace-nowrap shrink-0">
                     <UserPlus size={18} /> {t('admin.users.newAccess')}
                 </button>
             )}
          </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}

      {/* --- OVERVIEW TAB --- */}
      {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                      label={t('admin.stats.totalUsers')} 
                      value={usersList.length} 
                      subtext={`${usersList.filter(u => u.status === 'ACTIVE').length} active`}
                      icon={Users} color="blue" 
                  />
                  <StatCard 
                      label={t('admin.stats.organizations')} 
                      value={clientsList.length} 
                      subtext="B2B Contracts"
                      icon={Building2} color="indigo" 
                  />
                  <StatCard 
                      label={t('admin.stats.storage')} 
                      value="450 GB" 
                      subtext="22% of 2TB"
                      icon={HardDrive} color="emerald" 
                  />
                  <StatCard 
                      label={t('admin.stats.activities')} 
                      value="127" 
                      subtext="Logged actions"
                      icon={Activity} color="orange" 
                  />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity Mini-Feed */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Activity size={18} className="text-blue-500" /> {t('admin.stats.recentActivity')}
                      </h3>
                      <div className="space-y-4">
                          {logs.slice(0, 5).map(log => (
                              <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                  <div className={`mt-1 p-1.5 rounded-full bg-slate-100 text-slate-500`}>
                                      {log.action === 'DELETE' ? <Trash2 size={12} className="text-red-500" /> : 
                                       log.action === 'UPLOAD' ? <FileText size={12} className="text-blue-500" /> : 
                                       <Zap size={12} />}
                                  </div>
                                  <div>
                                      <p className="text-sm font-medium text-slate-800">
                                          <span className="font-bold">{log.userName}</span> {log.action.toLowerCase()} <span className="text-slate-500">"{log.target}"</span>
                                      </p>
                                      <p className="text-xs text-slate-400 mt-0.5">{log.timestamp}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* System Health */}
                  <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                      <div className="relative z-10">
                          <h3 className="font-bold mb-6 flex items-center gap-2">
                              <Server size={18} className="text-emerald-400" /> {t('admin.stats.systemHealth')}
                          </h3>
                          <div className="space-y-5">
                              <div>
                                  <div className="flex justify-between text-xs mb-1 text-slate-400">
                                      <span>CPU Load</span>
                                      <span>12%</span>
                                  </div>
                                  <ProgressBar percentage={12} color="emerald" />
                              </div>
                              <div>
                                  <div className="flex justify-between text-xs mb-1 text-slate-400">
                                      <span>Memory Usage</span>
                                      <span>4.2GB / 8GB</span>
                                  </div>
                                  <ProgressBar percentage={52} color="blue" />
                              </div>
                              <div>
                                  <div className="flex justify-between text-xs mb-1 text-slate-400">
                                      <span>Database Connections</span>
                                      <span>45 / 100</span>
                                  </div>
                                  <ProgressBar percentage={45} color="indigo" />
                              </div>
                          </div>
                          <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
                              <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                  All services operational
                              </span>
                              <span className="text-xs text-slate-500">v2.4.0 (Stable)</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- USERS TAB --- */}
      {activeTab === 'users' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
              
              {/* Table Toolbar */}
              <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 bg-slate-50/50 items-center">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Filter size={14} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-500 uppercase">{t('admin.users.filters')}:</span>
                  </div>
                  
                  <div className="flex flex-1 gap-2 flex-wrap">
                    <select 
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as any)}
                        className="text-sm border-none bg-white py-1.5 px-3 rounded-lg shadow-sm ring-1 ring-slate-200 focus:ring-blue-500 cursor-pointer flex-1 sm:flex-none min-w-[120px]"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="CLIENT">{t('roles.CLIENT')}</option>
                        <option value="QUALITY">{t('roles.QUALITY')}</option>
                        <option value="ADMIN">{t('roles.ADMIN')}</option>
                    </select>

                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="text-sm border-none bg-white py-1.5 px-3 rounded-lg shadow-sm ring-1 ring-slate-200 focus:ring-blue-500 cursor-pointer flex-1 sm:flex-none min-w-[120px]"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">{t('dashboard.active')}</option>
                        <option value="BLOCKED">Blocked</option>
                    </select>
                  </div>

                  <div className="ml-auto text-xs text-slate-400 font-medium self-center hidden sm:block">
                      {isLoading ? t('common.loading') : `${filteredUsers.length} users`}
                  </div>
              </div>

              {/* Users Table */}
              <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.users.identity')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.users.role')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.users.org')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('common.status')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.users.lastLogin')}</th>
                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 shrink-0">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm whitespace-nowrap">{u.name}</p>
                                            <p className="text-xs text-slate-500 whitespace-nowrap">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`
                                        inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border whitespace-nowrap
                                        ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                          u.role === 'QUALITY' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                          'bg-slate-50 text-slate-600 border-slate-200'}
                                    `}>
                                        {u.role === 'ADMIN' && <ShieldAlert size={12} className="mr-1" />}
                                        {t(`roles.${u.role}`)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {u.role === UserRole.CLIENT ? (
                                        <div className="flex items-center gap-2 text-sm text-slate-700 whitespace-nowrap">
                                            <Building2 size={14} className="text-slate-400" />
                                            {getClientName(u.clientId)}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic font-medium">Interno (Aços Vital)</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={u.status || 'ACTIVE'} />
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500 font-mono whitespace-nowrap">
                                    {u.lastLogin}
                                </td>
                                <td className="px-6 py-4 text-right relative">
                                    <button 
                                        onClick={() => setActiveDropdown(activeDropdown === u.id ? null : u.id)}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    
                                    {activeDropdown === u.id && (
                                        <div className="absolute right-8 top-8 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <button onClick={() => { openModal(u); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                <Edit2 size={14} /> {t('admin.users.editAccess')}
                                            </button>
                                            <button onClick={() => { handleBlockUser(u.id); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                {u.status === 'ACTIVE' ? <><Ban size={14} className="text-orange-500"/> {t('admin.users.blockAccess')}</> : <><CheckCircle2 size={14} className="text-emerald-500"/> {t('admin.users.unblockAccess')}</>}
                                            </button>
                                            <button onClick={() => { alert('Email de redefinição enviado.'); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                <Mail size={14} /> {t('admin.users.resetPassword')}
                                            </button>
                                            <div className="h-px bg-slate-100 my-1" />
                                            <button onClick={() => { handleDeleteUser(u.id); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                <Trash2 size={14} /> {t('admin.users.deleteUser')}
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                  </table>
                  {!isLoading && filteredUsers.length === 0 && (
                      <div className="p-12 text-center text-slate-400">
                          <Users size={48} className="mx-auto mb-3 opacity-20" />
                          <p>{t('files.noItems')}</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* --- CLIENTS TAB --- */}
      {activeTab === 'clients' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider w-1/3">{t('preview.client')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('common.status')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider w-1/4">{t('admin.stats.storage')} (Mock)</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.tabs.users')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredClients.map(c => {
                             const userCount = countUsersForClient(c.id);
                             // Mock random storage usage for demo
                             const storagePercent = Math.floor(Math.random() * 80) + 10; 
                             
                             return (
                                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                                {c.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900 text-sm whitespace-nowrap">{c.name}</div>
                                                <div className="text-xs text-slate-500 font-mono mt-0.5">{c.cnpj}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={c.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-full max-w-xs min-w-[120px]">
                                            <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-semibold">
                                                <span>{storagePercent}GB Used</span>
                                                <span>1TB Total</span>
                                            </div>
                                            <ProgressBar percentage={storagePercent / 10} color={storagePercent > 80 ? 'red' : 'blue'} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Users size={14} className="text-slate-400" />
                                            <span className="font-semibold">{userCount}</span> users
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-xs font-bold text-blue-600 hover:text-blue-800 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                            {t('common.edit')}
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

      {/* --- LOGS TAB --- */}
      {activeTab === 'logs' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
               <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                   <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                       <ShieldAlert size={16} /> Audit Trail
                   </h3>
                   <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                       <Download size={12} /> Export CSV
                   </button>
               </div>
               <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-white border-b border-slate-200 text-slate-500">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider w-48">Timestamp</th>
                                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Target</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-sm">
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3 text-slate-500 text-xs whitespace-nowrap">
                                        {log.timestamp}
                                    </td>
                                    <td className="px-6 py-3 font-sans text-slate-700 font-medium whitespace-nowrap">
                                        {log.userName}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`
                                            inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold border uppercase
                                            ${log.action === 'DELETE' ? 'bg-red-50 text-red-700 border-red-200' : 
                                              log.action === 'UPLOAD' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                              log.action === 'LOGIN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                              'bg-slate-50 text-slate-600 border-slate-200'}
                                        `}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600 truncate max-w-xs" title={log.target}>
                                        {log.target}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
               </div>
          </div>
      )}

      {/* --- SETTINGS TAB --- */}
      {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                  {/* Security Panel */}
                  <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Lock size={20} className="text-blue-600" /> Security
                      </h3>
                      <div className="space-y-4">
                         <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                             <div>
                                 <h4 className="font-semibold text-slate-800 text-sm">2FA Enforcement</h4>
                                 <p className="text-xs text-slate-500 mt-1">Force 2FA for all admins and quality staff.</p>
                             </div>
                             <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-emerald-500 cursor-pointer">
                                 <span className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm"></span>
                             </div>
                         </div>
                         <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                             <div>
                                 <h4 className="font-semibold text-slate-800 text-sm">Session Timeout</h4>
                                 <p className="text-xs text-slate-500 mt-1">Log out inactive users after 30 minutes.</p>
                             </div>
                             <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-emerald-500 cursor-pointer">
                                 <span className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm"></span>
                             </div>
                         </div>
                      </div>
                  </section>

                  {/* System Panel */}
                  <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Server size={20} className="text-indigo-600" /> {t('menu.system')}
                      </h3>
                      <div className="space-y-4">
                         <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                             <div>
                                 <h4 className="font-semibold text-slate-800 text-sm">Maintenance Mode</h4>
                                 <p className="text-xs text-slate-500 mt-1">Block external access. Admins only.</p>
                             </div>
                             <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-slate-300 cursor-pointer">
                                 <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm"></span>
                             </div>
                         </div>
                      </div>
                  </section>
              </div>

              {/* Side Panel Info */}
              <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                      <h4 className="font-bold text-blue-900 mb-2">Technical Support</h4>
                      <p className="text-xs text-blue-700 leading-relaxed mb-4">
                          For critical infrastructure changes, contact N3 support.
                      </p>
                      <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                          Open Ticket
                      </button>
                  </div>
                  <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center">
                      <p className="text-xs text-slate-400">Portal Version: v2.4.5</p>
                      <p className="text-xs text-slate-400 mt-1">Build: 20231027-PROD</p>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL: Create/Edit User (Enhanced Layout) */}
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
                                  <input 
                                      required 
                                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                                      placeholder="Ex: Maria Silva"
                                      value={formData.name}
                                      onChange={e => setFormData({...formData, name: e.target.value})}
                                  />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-sm font-bold text-slate-700">{t('admin.users.email')}</label>
                                  <input 
                                      type="email"
                                      required 
                                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                                      placeholder="Ex: maria@empresa.com"
                                      value={formData.email}
                                      onChange={e => setFormData({...formData, email: e.target.value})}
                                  />
                              </div>
                          </div>

                          {/* Col 2: Permission Data */}
                          <div className="space-y-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">{t('admin.users.permissions')}</h4>

                              <div className="space-y-1">
                                  <label className="text-sm font-bold text-slate-700">{t('admin.users.roleLabel')}</label>
                                  <select 
                                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium cursor-pointer"
                                      value={formData.role}
                                      onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                                  >
                                      <option value={UserRole.CLIENT}>{t('roles.CLIENT')}</option>
                                      <option value={UserRole.QUALITY}>{t('roles.QUALITY')}</option>
                                      <option value={UserRole.ADMIN}>{t('roles.ADMIN')}</option>
                                  </select>
                              </div>

                              <div className="space-y-1">
                                  <label className="text-sm font-bold text-slate-700">{t('admin.users.statusLabel')}</label>
                                  <select 
                                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium cursor-pointer"
                                      value={formData.status}
                                      onChange={e => setFormData({...formData, status: e.target.value})}
                                  >
                                      <option value="ACTIVE">{t('dashboard.active')}</option>
                                      <option value="BLOCKED">Blocked</option>
                                  </select>
                              </div>
                          </div>

                          {/* Full Width: Conditional Client Link */}
                          {formData.role === UserRole.CLIENT && (
                              <div className="md:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2 mt-2">
                                  <label className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-2">
                                      <Building2 size={16} /> {t('admin.users.orgLink')} ({t('common.required')})
                                  </label>
                                  <select 
                                      required
                                      className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium cursor-pointer text-blue-900"
                                      value={formData.clientId}
                                      onChange={e => setFormData({...formData, clientId: e.target.value})}
                                  >
                                      <option value="">Select company...</option>
                                      {clientsList.map(c => (
                                          <option key={c.id} value={c.id}>{c.name} - {c.cnpj}</option>
                                      ))}
                                  </select>
                                  <p className="text-xs text-blue-600/80 mt-2 ml-1">
                                      {t('admin.users.orgLinkDesc')}
                                  </p>
                              </div>
                          )}
                      </div>
                  </form>

                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                       <div className="text-xs text-slate-400">
                           <span className="font-bold text-slate-600">*</span> {t('common.required')}
                       </div>
                       <div className="flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setIsUserModalOpen(false)}
                                className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                {t('common.cancel')}
                            </button>
                            <button 
                                onClick={handleSaveUser}
                                type="button" 
                                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2"
                            >
                                <Save size={18} /> {t('common.save')}
                            </button>
                       </div>
                  </div>
              </div>
          </div>
      )}
    </Layout>
  );
};

export default Admin;
