
import React from 'react';
import { X, Building2, UserCircle2, Briefcase } from 'lucide-react';
import { User, ClientOrganization, UserRole } from '../../../types.ts';
import { useTranslation } from 'react-i18next';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (e: React.FormEvent) => void;
    editingUser: User | null;
    formData: any;
    setFormData: (data: any) => void;
    clients: ClientOrganization[];
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, editingUser, formData, setFormData, clients }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <UserCircle2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">{editingUser ? t('admin.users.editTitle') : t('admin.users.createTitle')}</h3>
                            <p className="text-xs text-slate-500">Gestão de Perfil do Sistema</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={20}/></button>
                </div>
                <form onSubmit={onSave} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Nome Completo</label>
                        <input required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: João da Silva" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">E-mail de Acesso</label>
                        <input type="email" required disabled={!!editingUser} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium disabled:bg-slate-50 disabled:text-slate-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="usuario@acosvital.com.br" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">{t('admin.users.roleLabel')}</label>
                            <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-medium outline-none focus:border-blue-500" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                                <option value={UserRole.CLIENT}>{t('roles.CLIENT')}</option>
                                <option value={UserRole.QUALITY}>{t('roles.QUALITY')}</option>
                                <option value={UserRole.ADMIN}>{t('roles.ADMIN')}</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Status</label>
                            <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-medium outline-none focus:border-blue-500" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option value="ACTIVE">Ativo</option>
                                <option value="BLOCKED">Bloqueado</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Departamento</label>
                        <input className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="Ex: Suprimentos, Engenharia..." />
                    </div>

                    {formData.role === UserRole.CLIENT && (
                        <div className="space-y-1.5 animate-in slide-in-from-top-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">{t('admin.users.orgLink')}</label>
                            <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-medium outline-none focus:border-blue-500" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                                <option value="">Selecione uma empresa...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors">{t('common.cancel')}</button>
                        <button type="submit" className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                            {editingUser ? 'Atualizar Perfil' : 'Salvar Perfil'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (e: React.FormEvent) => void;
    editingClient: ClientOrganization | null;
    clientFormData: any;
    setClientFormData: (data: any) => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onSave, editingClient, clientFormData, setClientFormData }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">{editingClient ? 'Editar Organização' : 'Nova Organização'}</h3>
                            <p className="text-xs text-slate-500">Cadastro de Cliente B2B</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={20}/></button>
                </div>
                <form onSubmit={onSave} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Razão Social</label>
                        <input required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium" value={clientFormData.name} onChange={e => setClientFormData({...clientFormData, name: e.target.value})} placeholder="Nome da Empresa" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">CNPJ</label>
                        <input required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium font-mono" value={clientFormData.cnpj} onChange={e => setClientFormData({...clientFormData, cnpj: e.target.value})} placeholder="00.000.000/0000-00" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Data de Início</label>
                            <input type="date" required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500" value={clientFormData.contractDate} onChange={e => setClientFormData({...clientFormData, contractDate: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Status Comercial</label>
                            <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-medium outline-none focus:border-indigo-500" value={clientFormData.status} onChange={e => setClientFormData({...clientFormData, status: e.target.value})}>
                                <option value="ACTIVE">Ativo</option>
                                <option value="INACTIVE">Inativo</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors">{t('common.cancel')}</button>
                        <button type="submit" className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
