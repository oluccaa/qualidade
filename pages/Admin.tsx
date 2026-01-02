
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout.tsx';
import { MOCK_USERS, MOCK_CLIENTS } from '../services/mockData.ts';
import { getAuditLogs } from '../services/fileService.ts';
import { UserRole, AuditLog, User, ClientOrganization } from '../types.ts';
import { useAuth } from '../services/authContext.tsx';
import { 
  Trash2, 
  Edit2, 
  Activity, 
  Users, 
  ShieldAlert, 
  Search, 
  Download, 
  Plus,
  MoreVertical,
  Clock,
  HardDrive,
  AlertCircle,
  Building2,
  Settings as SettingsIcon,
  Save,
  X,
  Lock,
  CheckCircle2,
  Ban
} from 'lucide-react';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'clients' | 'logs' | 'settings'>('users');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  
  // State for Lists
  const [usersList, setUsersList] = useState<User[]>(MOCK_USERS);
  const [clientsList, setClientsList] = useState<ClientOrganization[]>(MOCK_CLIENTS);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form States
  const [formData, setFormData] = useState({ name: '', email: '', role: UserRole.CLIENT, clientId: '', status: 'ACTIVE' });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
      if (user && activeTab === 'logs') {
          getAuditLogs(user).then(setLogs);
      }
  }, [user, activeTab]);

  // Actions
  const handleSaveUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingUser) {
          // Edit Logic
          setUsersList(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData, clientId: formData.role === UserRole.CLIENT ? formData.clientId : undefined } as User : u));
      } else {
          // Create Logic
          const newUser: User = {
              id: `u${Date.now()}`,
              ...formData,
              role: formData.role as UserRole,
              status: 'ACTIVE',
              lastLogin: '-'
          } as User;
          setUsersList([...usersList, newUser]);
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
      resetForm();
  };

  const handleDeleteUser = (userId: string) => {
      if(window.confirm('Tem certeza que deseja remover este usuário?')) {
          setUsersList(prev => prev.filter(u => u.id !== userId));
      }
  };

  const handleBlockUser = (userId: string) => {
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' } as User : u));
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

  const stats = [
    { label: 'Usuários Ativos', value: usersList.filter(u => u.status === 'ACTIVE').length, change: '+2', icon: Users, color: 'blue', desc: 'Acesso regular' },
    { label: 'Empresas Parceiras', value: clientsList.length, change: '0', icon: Building2, color: 'emerald', desc: 'Contratos ativos' },
    { label: 'Uso de Armazenamento', value: '450 GB', change: '24%', icon: HardDrive, color: 'indigo', desc: 'De 2 TB disponíveis' },
  ];

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-purple-100 text-purple-700 border-purple-200';
      case UserRole.QUALITY: return 'bg-blue-100 text-blue-700 border-blue-200';
      case UserRole.CLIENT: return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getClientName = (id?: string) => {
      if (!id) return '-';
      return clientsList.find(c => c.id === id)?.name || 'Desconhecido';
  };

  return (
    <Layout title="Administração do Sistema">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-blue-100 transition-all group relative overflow-hidden">
             <stat.icon className={`absolute -right-4 -bottom-4 text-${stat.color}-50 opacity-50 transform group-hover:scale-110 transition-transform duration-500`} size={120} />
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                        <stat.icon size={24} />
                    </div>
                    {stat.change.includes('%') ? (
                        <span className="text-xs font-semibold text-slate-400">{stat.change} usado</span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-600 px-2 py-1 rounded-full border border-green-100">
                             {stat.change} novos <Activity size={12} />
                        </span>
                    )}
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">{stat.label}</p>
                    <p className="text-xs text-slate-400 mt-2 border-t border-slate-100 pt-2">{stat.desc}</p>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[600px] relative">
        
        {/* Toolbar */}
        <div className="border-b border-slate-100 p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
                {[
                    {id: 'users', label: 'Usuários', icon: Users},
                    {id: 'clients', label: 'Empresas', icon: Building2},
                    {id: 'logs', label: 'Auditoria', icon: ShieldAlert},
                    {id: 'settings', label: 'Configurações', icon: SettingsIcon},
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3">
                 {(activeTab === 'users' || activeTab === 'clients') && (
                     <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar..." 
                            className="pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                 )}
                 {activeTab === 'users' && (
                    <button onClick={() => openModal()} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-slate-900/20 active:scale-95">
                        <Plus size={18} /> Novo Usuário
                    </button>
                 )}
                 {activeTab === 'clients' && (
                    <button onClick={() => alert('Feature mockada')} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-slate-900/20 active:scale-95">
                        <Plus size={18} /> Nova Empresa
                    </button>
                 )}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-x-auto min-h-[400px]">
             
             {/* USERS TAB */}
             {activeTab === 'users' && (
                <table className="w-full text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 text-center">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Perfil</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vínculo (Empresa)</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Último Acesso</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {usersList.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map((u) => (
                            <tr key={u.id} className="group hover:bg-blue-50/30 transition-colors">
                                <td className="px-6 py-4 text-center">
                                    <div className={`w-2.5 h-2.5 rounded-full mx-auto ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-400'}`} title={u.status} />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-300/50 shadow-sm">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{u.name}</p>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${getRoleBadgeStyle(u.role)}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {u.role === UserRole.CLIENT ? (
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <Building2 size={14} className="text-slate-400" />
                                            {getClientName(u.clientId)}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">Interno</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {u.lastLogin}
                                </td>
                                <td className="px-6 py-4 text-right relative">
                                    <button 
                                        onClick={() => setActiveDropdown(activeDropdown === u.id ? null : u.id)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                    
                                    {/* Action Dropdown */}
                                    {activeDropdown === u.id && (
                                        <div className="absolute right-8 top-8 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <button onClick={() => { openModal(u); setActiveDropdown(null); }} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                <Edit2 size={14} /> Editar Dados
                                            </button>
                                            <button onClick={() => { handleBlockUser(u.id); setActiveDropdown(null); }} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                {u.status === 'ACTIVE' ? <><Ban size={14} className="text-orange-500"/> Bloquear Acesso</> : <><CheckCircle2 size={14} className="text-emerald-500"/> Desbloquear</>}
                                            </button>
                                            <button onClick={() => { alert('Email de redefinição enviado.'); setActiveDropdown(null); }} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                <Lock size={14} /> Resetar Senha
                                            </button>
                                            <div className="h-px bg-slate-100 my-1" />
                                            <button onClick={() => { handleDeleteUser(u.id); setActiveDropdown(null); }} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                <Trash2 size={14} /> Excluir Usuário
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             )}

             {/* CLIENTS TAB */}
             {activeTab === 'clients' && (
                <table className="w-full text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Razão Social</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">CNPJ</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contrato</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {clientsList.map((c) => (
                             <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-6 py-4">
                                     <span className={`px-2 py-1 rounded text-[10px] font-bold border ${c.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                         {c.status}
                                     </span>
                                 </td>
                                 <td className="px-6 py-4">
                                     <div className="font-semibold text-slate-900">{c.name}</div>
                                 </td>
                                 <td className="px-6 py-4 font-mono text-sm text-slate-600">
                                     {c.cnpj}
                                 </td>
                                 <td className="px-6 py-4 text-sm text-slate-500">
                                     Desde {c.contractDate}
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                     <button className="text-blue-600 hover:underline text-sm font-medium">Gerenciar</button>
                                 </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
             )}

             {/* SETTINGS TAB */}
             {activeTab === 'settings' && (
                 <div className="p-8 max-w-2xl">
                     <h3 className="text-lg font-bold text-slate-900 mb-6">Configurações Gerais da Plataforma</h3>
                     
                     <div className="space-y-6">
                         <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                             <div>
                                 <h4 className="font-semibold text-slate-800">Modo de Manutenção</h4>
                                 <p className="text-sm text-slate-500">Impede o login de clientes, permitindo apenas Admin.</p>
                             </div>
                             <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-slate-200 cursor-pointer">
                                 <span className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm"></span>
                             </div>
                         </div>

                         <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                             <div>
                                 <h4 className="font-semibold text-slate-800">Autenticação em Dois Fatores (2FA)</h4>
                                 <p className="text-sm text-slate-500">Forçar uso de 2FA para todos os usuários Quality e Admin.</p>
                             </div>
                             <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-emerald-500 cursor-pointer">
                                 <span className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm"></span>
                             </div>
                         </div>

                         <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                             <div>
                                 <h4 className="font-semibold text-slate-800">Notificações por Email</h4>
                                 <p className="text-sm text-slate-500">Enviar alertas de upload automaticamente para clientes.</p>
                             </div>
                             <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-emerald-500 cursor-pointer">
                                 <span className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm"></span>
                             </div>
                         </div>
                     </div>
                 </div>
             )}

             {/* LOGS TAB (Existing View) */}
             {activeTab === 'logs' && (
                <div className="min-w-full">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-48">Horário</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Evento</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Objeto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
                                            <Clock size={14} />
                                            {log.timestamp}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-700">{log.userName}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`
                                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border
                                            ${log.action === 'DELETE' ? 'bg-red-50 text-red-700 border-red-100' : 
                                              log.action === 'UPLOAD' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                              'bg-slate-50 text-slate-700 border-slate-200'}
                                        `}>
                                            {log.action === 'DELETE' && <AlertCircle size={12}/>}
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {log.target}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                     </table>
                </div>
             )}
        </div>
      </div>

      {/* MODAL: Create/Edit User */}
      {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="text-lg font-bold text-slate-800">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
                      <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                      <div className="space-y-1">
                          <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
                          <input 
                              required 
                              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                              placeholder="Ex: Maria Silva"
                              value={formData.name}
                              onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                      </div>
                      <div className="space-y-1">
                          <label className="text-sm font-semibold text-slate-700">Email Corporativo</label>
                          <input 
                              type="email"
                              required 
                              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                              placeholder="Ex: maria@empresa.com"
                              value={formData.email}
                              onChange={e => setFormData({...formData, email: e.target.value})}
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                              <label className="text-sm font-semibold text-slate-700">Perfil de Acesso</label>
                              <select 
                                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                  value={formData.role}
                                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                              >
                                  <option value={UserRole.CLIENT}>Cliente (Externo)</option>
                                  <option value={UserRole.QUALITY}>Analista Qualidade</option>
                                  <option value={UserRole.ADMIN}>Administrador</option>
                              </select>
                          </div>
                          <div className="space-y-1">
                              <label className="text-sm font-semibold text-slate-700">Status</label>
                              <select 
                                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                  value={formData.status}
                                  onChange={e => setFormData({...formData, status: e.target.value})}
                              >
                                  <option value="ACTIVE">Ativo</option>
                                  <option value="BLOCKED">Bloqueado</option>
                              </select>
                          </div>
                      </div>

                      {/* Conditional Client Selector */}
                      {formData.role === UserRole.CLIENT && (
                          <div className="space-y-1 pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                  <Building2 size={16} /> Vínculo Empresarial
                              </label>
                              <select 
                                  required
                                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                  value={formData.clientId}
                                  onChange={e => setFormData({...formData, clientId: e.target.value})}
                              >
                                  <option value="">Selecione uma empresa...</option>
                                  {clientsList.map(c => (
                                      <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                              </select>
                              <p className="text-xs text-slate-500">Este usuário só verá documentos desta empresa.</p>
                          </div>
                      )}

                      <div className="pt-4 flex gap-3 justify-end">
                          <button 
                              type="button" 
                              onClick={() => setIsUserModalOpen(false)}
                              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                          >
                              Cancelar
                          </button>
                          <button 
                              type="submit" 
                              className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2"
                          >
                              <Save size={18} /> Salvar Usuário
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Close dropdown on click outside logic would go here in a full implementation */}
    </Layout>
  );
};

export default Admin;
