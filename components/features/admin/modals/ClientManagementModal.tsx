
import React, { useState } from 'react';
import { X, UserCheck, Loader2, Save, Info, ShieldAlert, Trash2 } from 'lucide-react';
import { User, ClientOrganization, AccountStatus, UserRole, normalizeRole } from '../../../../types/index.ts';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../context/authContext.tsx';

export interface ClientFormData {
  name: string;
  cnpj: string;
  contractDate: string;
  status: AccountStatus;
  qualityAnalystId: string;
}

interface ClientManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent, confirmEmail?: string, confirmPassword?: string) => Promise<void>;
  onFlagDeletion?: (clientId: string) => Promise<void>;
  editingClient: ClientOrganization | null;
  clientFormData: ClientFormData;
  setClientFormData: (data: ClientFormData) => void;
  qualityAnalysts: User[];
  requiresConfirmation?: boolean;
  isSaving?: boolean;
}

export const ClientManagementModal: React.FC<ClientManagementModalProps> = ({ 
  isOpen, onClose, onSave, onFlagDeletion, editingClient, clientFormData, setClientFormData, qualityAnalysts, requiresConfirmation = false, isSaving = false
}) => {
  const { t } = useTranslation();
  const { user: operator } = useAuth();
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isRoot = normalizeRole(operator?.role) === UserRole.ADMIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    requiresConfirmation ? await onSave(e, confirmEmail, confirmPassword) : await onSave(e);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
                <UserCheck size={22} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                {editingClient ? t('admin.clients.editTitle') : t('admin.clients.createTitle')}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24}/></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <form onSubmit={handleSubmit} className="pb-4">
            <div className="space-y-1.5 px-8 pt-5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('dashboard.organization')} *</label>
              <input 
                value={clientFormData.name} 
                onChange={e => setClientFormData({...clientFormData, name: e.target.value})} 
                required 
                disabled={isSaving}
                className="w-full px-4 py-3 rounded-xl outline-none font-semibold text-slate-800 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5 px-8 pt-5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('dashboard.fiscalID')} *</label>
              <input 
                value={clientFormData.cnpj} 
                onChange={e => setClientFormData({...clientFormData, cnpj: e.target.value})} 
                required 
                disabled={isSaving}
                className="w-full px-4 py-3 rounded-xl outline-none font-semibold text-slate-800 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-0">
              <div className="space-y-1.5 px-8 pt-5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('dashboard.contractDate')} *</label>
                <input 
                  type="date" 
                  value={clientFormData.contractDate} 
                  onChange={e => setClientFormData({...clientFormData, contractDate: e.target.value})} 
                  required 
                  disabled={isSaving}
                  className="w-full px-4 py-3 rounded-xl outline-none font-semibold text-slate-800 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5 px-8 pt-5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('common.status')}</label>
                <select 
                  value={clientFormData.status} 
                  onChange={e => setClientFormData({...clientFormData, status: e.target.value as AccountStatus})}
                  disabled={isSaving}
                  className="w-full px-4 py-3 rounded-xl font-bold text-slate-800 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50"
                >
                  <option value={AccountStatus.ACTIVE}>{t('common.statusActive')}</option>
                  <option value={AccountStatus.INACTIVE}>{t('common.statusInactive')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 px-8 pt-5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Analista de Qualidade</label>
              <select 
                value={clientFormData.qualityAnalystId} 
                onChange={e => setClientFormData({...clientFormData, qualityAnalystId: e.target.value})}
                disabled={isSaving}
                className="w-full px-4 py-3 rounded-xl font-bold text-slate-800 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="">{t('common.na')}</option>
                {qualityAnalysts.map(qa => <option key={qa.id} value={qa.id}>{qa.name}</option>)}
              </select>
            </div>

            {editingClient && onFlagDeletion && isRoot && (
               <div className="mx-8 mt-6 p-4 bg-red-50 rounded-2xl border-2 border-red-100 space-y-3">
                  <p className="text-[10px] font-black text-red-700 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert size={14} /> Protocolo ROOT Ativo
                  </p>
                  <p className="text-xs text-red-800 font-medium leading-relaxed">
                    A exclusão definitiva removerá permanentemente a organização, todos os seus usuários vinculados e arquivos do Vault.
                  </p>
                  <button 
                    type="button"
                    disabled={isSaving}
                    onClick={() => onFlagDeletion(editingClient.id)}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                  >
                    <Trash2 size={14} /> Expurgar Organização
                  </button>
               </div>
            )}

            {requiresConfirmation && (
              <div className="mx-8 mt-6 p-5 bg-blue-50 text-blue-700 text-sm rounded-2xl border border-blue-100 space-y-3">
                <h4 className="font-bold flex items-center gap-2"><Info size={16} /> Confirmar Ação Técnica</h4>
                <input 
                  type="email" 
                  placeholder="Confirme seu E-mail" 
                  value={confirmEmail} 
                  onChange={e => setConfirmEmail(e.target.value)} 
                  required 
                  disabled={isSaving}
                  className="w-full px-4 py-2 rounded-xl outline-none border border-blue-200 bg-white"
                />
                <input 
                  type="password" 
                  placeholder="Confirme sua Senha" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  required 
                  disabled={isSaving}
                  className="w-full px-4 py-2 rounded-xl outline-none border border-blue-200 bg-white"
                />
              </div>
            )}

            <div className="mt-8 px-8 py-6 sticky bottom-0 bg-white border-t border-slate-100 flex justify-end gap-3 z-10">
              <button 
                type="button" 
                onClick={onClose} 
                disabled={isSaving}
                className="px-6 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-10 py-3 bg-[#081437] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:opacity-70 flex items-center gap-2"
              >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {editingClient ? "Atualizar Empresa" : "Criar Empresa"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
