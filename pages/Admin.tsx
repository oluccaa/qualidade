import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout.tsx';
import { MOCK_USERS } from '../services/mockData.ts';
import { getAuditLogs } from '../services/fileService.ts';
import { UserRole, AuditLog } from '../types.ts';
import { useAuth } from '../services/authContext.tsx';
import { 
  Trash2, 
  Edit2, 
  Activity, 
  Users, 
  ShieldAlert, 
  Search, 
  Filter, 
  Download, 
  Plus,
  MoreVertical,
  Clock,
  FileText,
  HardDrive,
  AlertCircle
} from 'lucide-react';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
      if (user && activeTab === 'logs') {
          getAuditLogs(user).then(setLogs);
      }
  }, [user, activeTab]);

  const stats = [
    { label: 'Usuários Totais', value: MOCK_USERS.length, change: '+12%', icon: Users, color: 'blue', desc: 'Ativos na plataforma' },
    { label: 'Score de Segurança', value: '98/100', change: '+2.4%', icon: ShieldAlert, color: 'emerald', desc: 'Auditoria ISO 27001' },
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

  return (
    <Layout title="Visão Geral do Sistema">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-blue-100 transition-all group relative overflow-hidden">
             {/* Decorative Background Icon */}
             <stat.icon className={`absolute -right-4 -bottom-4 text-${stat.color}-50 opacity-50 transform group-hover:scale-110 transition-transform duration-500`} size={120} />
             
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                        <stat.icon size={24} />
                    </div>
                    {stat.change.includes('%') ? (
                         <span className="flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-600 px-2 py-1 rounded-full border border-green-100">
                             {stat.change} <Activity size={12} />
                         </span>
                    ) : (
                        <span className="text-xs font-semibold text-slate-400">{stat.change} usado</span>
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
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        
        {/* Toolbar */}
        <div className="border-b border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {['users', 'logs'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                            activeTab === tab 
                            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        {tab === 'users' ? 'Usuários & Permissões' : 'Logs de Auditoria'}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3">
                 <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Filtrar registros..." 
                        className="pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 {activeTab === 'users' && (
                    <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-slate-900/20 active:scale-95">
                        <Plus size={18} /> Novo Usuário
                    </button>
                 )}
                  {activeTab === 'logs' && (
                    <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
                        <Download size={18} /> Exportar
                    </button>
                 )}
            </div>
        </div>

        {/* Table View */}
        <div className="flex-1 overflow-x-auto">
             {activeTab === 'users' ? (
                <table className="w-full text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 text-center">
                                #
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Identificação</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Perfil de Acesso</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Opções</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {MOCK_USERS.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map((u) => (
                            <tr key={u.id} className="group hover:bg-blue-50/30 transition-colors">
                                <td className="px-6 py-4 text-center">
                                    <div className="w-2 h-2 rounded-full bg-slate-300 mx-auto group-hover:bg-blue-500 transition-colors" />
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
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex h-2.5 w-2.5">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                        </div>
                                        <span className="text-sm font-medium text-slate-600">Conectado</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             ) : (
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
    </Layout>
  );
};

export default Admin;