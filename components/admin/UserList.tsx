
import React, { useState } from 'react';
import { User, UserRole } from '../../types.ts';
import { MoreVertical, Edit2, Trash2, Mail, Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserListProps {
    users: User[];
    onEdit: (user: User) => void;
    onDelete?: (user: User) => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const isActive = status === 'ACTIVE';
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );
};

export const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-300">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.users.identity')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.users.role')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('admin.users.org')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{t('common.status')}</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">{t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 shrink-0">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 text-sm whitespace-nowrap">{u.name}</p>
                                            <p className="text-xs text-slate-500">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${u.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                        {t(`roles.${u.role}`)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {u.clientId || 'Interno'}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={u.status || 'ACTIVE'} />
                                </td>
                                <td className="px-6 py-4 text-right relative">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === u.id ? null : u.id); }}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    {activeDropdown === u.id && (
                                        <div className="absolute right-8 top-8 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <button 
                                                onClick={() => { onEdit(u); setActiveDropdown(null); }}
                                                className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                            >
                                                <Edit2 size={14} /> {t('common.edit')}
                                            </button>
                                            <button 
                                                className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                            >
                                                <Mail size={14} /> Enviar Convite
                                            </button>
                                            {onDelete && (
                                                <button 
                                                    onClick={() => { onDelete(u); setActiveDropdown(null); }}
                                                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50"
                                                >
                                                    <Trash2 size={14} /> {t('common.delete')}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
