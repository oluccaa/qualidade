import React, { useState } from 'react';
import { User, UserRole, AccountStatus } from '../../../../types/index.ts';
import { MoreVertical, Edit2, Building2, Briefcase, Clock, ShieldAlert, BadgeInfo } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
}

export const UserList: React.FC<UserListProps> = ({ users, onEdit }) => {
  const { t } = useTranslation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (id: string) => {
    setActiveDropdown(current => current === id ? null : id);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-3xl shadow-sm overflow-visible animate-in fade-in duration-300">
      <div className="w-full overflow-visible">
        <table className="w-full text-left border-collapse table-auto">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 z-20">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">Identidade</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">Vínculo</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider hidden lg:table-cell">Corporativo</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider hidden md:table-cell">Acesso</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider">{t('common.status')}</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <UserRow 
                key={user.id} 
                user={user} 
                isDropdownOpen={activeDropdown === user.id}
                onToggleDropdown={() => toggleDropdown(user.id)}
                onEdit={() => { onEdit(user); setActiveDropdown(null); }}
              />
            ))}
          </tbody>
        </table>
      </div>
      {activeDropdown && (
          <div className="fixed inset-0 z-[80] bg-transparent" onClick={() => setActiveDropdown(null)} />
      )}
    </div>
  );
};

const UserRow: React.FC<{ 
  user: User, isDropdownOpen: boolean, onToggleDropdown: () => void, onEdit: () => void 
}> = ({ user, isDropdownOpen, onToggleDropdown, onEdit }) => {
  const { t } = useTranslation();
  const isVitalStaff = user.department === 'VITAL_REPRESENTATIVE';
  const isPendingDeletion = user.department === 'PENDING_DELETION' || user.status === AccountStatus.INACTIVE;

  return (
    <tr className={`hover:bg-slate-50/80 transition-colors group ${isPendingDeletion ? 'opacity-70 grayscale-[0.5]' : ''}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold border shadow-sm shrink-0 text-xs ${isVitalStaff ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-xs truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{user.email || t('common.na')}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
            <RoleBadge role={user.role} />
            {isPendingDeletion && (
                <span className="text-[8px] font-black text-red-600 uppercase animate-pulse">Exclusão Pendente</span>
            )}
        </div>
      </td>
      <td className="px-6 py-4 text-xs font-bold text-slate-600 hidden lg:table-cell">
        <div className="flex items-center gap-2 truncate max-w-[180px]">
          <Building2 size={12} className="text-slate-300 shrink-0" />
          <span className="truncate">{user.organizationName || t('common.na')}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-[10px] font-mono text-slate-400 hidden md:table-cell">
        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : t('common.na')}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={user.status} />
      </td>
      <td className="px-6 py-4 text-right relative overflow-visible">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleDropdown(); }} 
          className={`p-2 rounded-xl transition-all relative z-[95] ${isDropdownOpen ? 'bg-slate-900 text-white shadow-lg scale-110' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-200'}`}
        >
          <MoreVertical size={18} strokeWidth={3} />
        </button>
        
        {isDropdownOpen && (
          <div className="absolute right-12 top-full mt-[-10px] w-60 bg-white border border-slate-200 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] z-[100] py-3 animate-in slide-in-from-top-2 fade-in duration-200 text-left overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-50 mb-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">Ações de Acesso</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[11px] text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-black uppercase tracking-wider transition-all"
              >
                  <Edit2 size={16} /> Gerenciar Perfil
              </button>
              {isPendingDeletion && (
                  <div className="px-4 py-2 mt-1 bg-red-50 text-[9px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                      <ShieldAlert size={12} /> Bloqueio de Segurança Ativo
                  </div>
              )}
          </div>
        )}
      </td>
    </tr>
  );
};

const ROLE_VARIANTS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'bg-purple-50 text-purple-700 border-purple-100',
  [UserRole.QUALITY]: 'bg-blue-50 text-blue-700 border-blue-100',
  [UserRole.CLIENT]: 'bg-slate-50 text-slate-600 border-slate-200'
};

const RoleBadge = ({ role }: { role: UserRole }) => {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${ROLE_VARIANTS[role] || ROLE_VARIANTS[UserRole.CLIENT]}`}>
      {t(`roles.${role}`)}
    </span>
  );
};

const StatusBadge = ({ status }: { status?: AccountStatus }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase border transition-all ${
    status === AccountStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100 shadow-sm'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${status === AccountStatus.ACTIVE ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
    {status === AccountStatus.ACTIVE ? 'ATIVO' : status === AccountStatus.INACTIVE ? 'INATIVO' : 'BLOQUEADO'}
  </span>
);