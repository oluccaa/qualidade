
import React, { useState } from 'react';
import { User, UserRole } from '../../../types/index';
import { MoreVertical, Edit2, ShieldAlert, Mail, Building2, Briefcase, Clock, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserListProps {
    users: User[];
    onEdit: (user: User) => void;
    onDelete?: (user: User) => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const { t } = useTranslation();
    const isActive = status === 'ACTIVE';
    const statusText = isActive ? t('common.statusActive') : t('common.statusBlocked');
    const bgColor = isActive ? 'bg-emerald-50' : 'bg-red-50';
    const textColor = isActive ? 'text-emerald-600' : 'text-red-600';
    const borderColor = isActive ? 'border-emerald-100' : 'border-red-100';
    const dotColor = isActive ? 'bg-emerald-500' : 'bg-red-500';

    return (
        <span 
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${bgColor} ${textColor} ${borderColor}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
            {statusText}
        </span>
    );
};

export const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-300">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">{t('admin.users.identity')}</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">{t('admin.users.role')}</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">{t('admin.users.department')}</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Organização</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Acesso</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">{t('common.status')}</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-20 text-center text-slate-400 italic text-sm">
                                    {t('admin.users.noUsersFound')}
                                </td>
                            </tr>
                        ) : (
                            users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-200 shrink-0 shadow-sm">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 text-sm truncate">{u.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium truncate">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-black border uppercase tracking-wider ${
                                            u.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                            u.role === UserRole.QUALITY ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            'bg-slate-50 text-slate-600 border-slate-200'
                                        }`}>
                                            {t(`roles.${u.role}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Briefcase size={14} className="text-slate-400" />
                                            <span className="text-xs font-medium">{u.department || t('common.na')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"> 
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Building2 size={14} className="text-slate-400" />
                                            <span className="text-xs font-semibold">{u.organizationName || 'Aços Vital'}</span> 
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"> 
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Clock size={14} className="text-slate-400" />
                                            <span className="text-[10px] font-mono">{u.lastLogin || 'Nunca'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={u.status || 'ACTIVE'} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                          onClick={() => onEdit(u)}
                                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                          <Edit2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
