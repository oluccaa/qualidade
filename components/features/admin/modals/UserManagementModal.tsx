
import React from 'react';
import { X, UserCheck, Loader2, Save, ShieldAlert } from 'lucide-react';
import { User, ClientOrganization, UserRole, AccountStatus } from '../../../../types/index.ts';
import { useTranslation } from 'react-i18next';

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  organizationId: string;
  department: string; 
  status: AccountStatus;
}

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => Promise<void>;
  onFlagDeletion?: (userId: string) => Promise<void>;
  editingUser: User | null;
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  organizations: ClientOrganization[];
  isSaving?: boolean;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ 
  isOpen, onClose, onSave, onFlagDeletion, editingUser, formData, setFormData, organizations, isSaving = false 
}) => {
  const { t } = useTranslation();

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
                {editingUser ? "Gerenciar Acesso" : "Novo Credenciamento"}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <form onSubmit={onSave} className="pb-4">
            <div className="space-y-1.5 px-8 pt-5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo *</label>
              <input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="Ex: João Silva"
                required 
                disabled={isSaving}
                className="w-full px-4 py-3 rounded-xl outline-none font-semibold text-slate-800 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
            
            <div className="space-y-1.5 px-8 pt-5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo *</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                placeholder="usuario@empresa.com"
                required 
                disabled={!!editingUser || isSaving}
                className="w-full px-4 py-3 rounded-xl outline-none font-semibold text-slate-800 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
              />
            </div>

            {!editingUser && (
              <div className="space-y-1.5 px-8 pt-5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha Temporária *</label>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  placeholder="Mínimo 6 caracteres"
                  minLength={6} 
                  required 
                  disabled={isSaving}
                  className="w-full px-4 py-3 rounded-xl outline-none font-semibold text-slate-800 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-0">
              <div className="space-y-1.5 px-8 pt-5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nível de Permissão</label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                  disabled={isSaving}
                  className="w-full px-4 py-3 rounded-xl font-bold text-slate-800 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50"
                >
                  <option value={UserRole.CLIENT}>Acesso Cliente</option>
                  <option value={UserRole.QUALITY}>Analista Qualidade</option>
                  <option value={UserRole.ADMIN}>Administrador</option>
                </select>
              </div>

              <div className="space-y-1.5 px-8 pt-5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Natureza do Vínculo</label>
                <select 
                  value={formData.department} 
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  disabled={isSaving}
                  className="w-full px-4 py-3 rounded-xl font-bold text-slate-800 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50"
                >
                  <option value="CLIENT_INTERNAL">Equipe do Cliente</option>
                  <option value="VITAL_REPRESENTATIVE">Funcionário Vital</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 px-8 pt-5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Empresa de Atuação</label>
              <select 
                value={formData.organizationId} 
                onChange={e => setFormData({...formData, organizationId: e.target.value})}
                disabled={isSaving}
                className="w-full px-4 py-3 rounded-xl font-bold text-slate-800 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="">Aços Vital (Sede Interna)</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>

            {editingUser && (
               <div className="mx-8 mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert size={14} /> Zona de Governança
                  </p>
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    A exclusão é desativada por auditoria. Você pode sinalizar o usuário para desligamento.
                  </p>
                  <button 
                    type="button"
                    disabled={isSaving}
                    onClick={() => onFlagDeletion && onFlagDeletion(editingUser.id)}
                    className="w-full py-2 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    Sinalizar para Exclusão
                  </button>
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
                  {editingUser ? "Salvar Alterações" : "Efetivar Cadastro"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
