
import React, { useState, useEffect } from 'react';
import { X, User, Shield, Building2, Calendar, AlertTriangle, Check, Loader2, Mail, Lock, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { User as UserType, UserRole, ClientOrganization, MaintenanceEvent } from '../../../types/index';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSaving?: boolean;
}

// MODAL DE USUÁRIOS
interface UserModalProps extends ModalProps {
  onSave: (e: React.FormEvent) => void;
  editingUser: UserType | null;
  formData: any;
  setFormData: (data: any) => void;
  organizations: ClientOrganization[];
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, editingUser, formData, setFormData, organizations, isSaving }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><User size={20} /></div>
            <h2 className="text-lg font-bold text-slate-800">{editingUser ? t('admin.users.editTitle') : t('admin.users.createTitle')}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={onSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t('admin.users.name')}</label>
            <input 
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t('admin.users.email')}</label>
            <input 
              type="email"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {!editingUser && (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t('login.passwordLabel')}</label>
              <input 
                type="password"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t('admin.users.roleLabel')}</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-pointer"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value={UserRole.CLIENT}>{t('roles.CLIENT')}</option>
                <option value={UserRole.QUALITY}>{t('roles.QUALITY')}</option>
                <option value={UserRole.ADMIN}>{t('roles.ADMIN')}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t('common.status')}</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-pointer"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="ACTIVE">{t('common.statusActive')}</option>
                <option value="BLOCKED">{t('common.statusBlocked')}</option>
              </select>
            </div>
          </div>

          {formData.role === UserRole.CLIENT && (
            <div className="space-y-1 animate-in slide-in-from-top-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t('admin.users.orgLink')}</label>
              <select 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-pointer"
                value={formData.organizationId}
                onChange={e => setFormData({...formData, organizationId: e.target.value})}
              >
                <option value="">{t('signup.select')}</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t('admin.users.department')}</label>
            <input 
              placeholder={t('admin.users.departmentPlaceholder')}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              value={formData.department}
              onChange={e => setFormData({...formData, department: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors uppercase text-[10px] tracking-widest">{t('common.cancel')}</button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> {t('common.save')}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// MODAL DE EMPRESAS (CLIENTS)
interface ClientModalProps extends ModalProps {
  onSave: (e: React.FormEvent, confirmEmail?: string, confirmPassword?: string) => void;
  editingClient: ClientOrganization | null;
  clientFormData: any;
  setClientFormData: (data: any) => void;
  qualityAnalysts: UserType[];
  onDelete?: (client: ClientOrganization) => void;
  requiresConfirmation?: boolean;
}

export const ClientModal: React.FC<ClientModalProps> = ({ 
  isOpen, onClose, onSave, editingClient, clientFormData, setClientFormData, qualityAnalysts, isSaving, requiresConfirmation 
}) => {
  const { t } = useTranslation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requiresConfirmation) {
      setShowConfirmation(true);
    } else {
      onSave(e);
    }
  };

  const handleFinalConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(e, confirmEmail, confirmPassword);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Building2 size={20} /></div>
            <h2 className="text-lg font-bold text-slate-800">{editingClient ? t('admin.clients.editTitle') : t('admin.clients.createTitle')}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>

        {!showConfirmation ? (
          <form onSubmit={handleInitialSubmit} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t('dashboard.organization')}</label>
              <input 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                value={clientFormData.name}
                onChange={e => setClientFormData({...clientFormData, name: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t('dashboard.fiscalID')} (CNPJ)</label>
              <input 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                value={clientFormData.cnpj}
                onChange={e => setClientFormData({...clientFormData, cnpj: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Analista de Qualidade Responsável</label>
              <select 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-pointer"
                value={clientFormData.qualityAnalystId}
                onChange={e => setClientFormData({...clientFormData, qualityAnalystId: e.target.value})}
              >
                <option value="">{t('signup.select')}</option>
                {qualityAnalysts.map(qa => (
                  <option key={qa.id} value={qa.id}>{qa.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t('dashboard.contractDate')}</label>
                <input 
                  type="date"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                  value={clientFormData.contractDate}
                  onChange={e => setClientFormData({...clientFormData, contractDate: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t('common.status')}</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-pointer"
                  value={clientFormData.status}
                  onChange={e => setClientFormData({...clientFormData, status: e.target.value})}
                >
                  <option value="ACTIVE">{t('common.statusActive')}</option>
                  <option value="INACTIVE">{t('common.statusInactive')}</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors uppercase text-[10px] tracking-widest">{t('common.cancel')}</button>
              <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                <Check size={16} /> {editingClient ? t('common.save') : t('common.create')}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleFinalConfirm} className="p-8 space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto">
              <Shield size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{t('quality.confirmActionTitle')}</h3>
              <p className="text-sm text-slate-500 font-medium">Esta alteração afeta a governança técnica do cliente.</p>
            </div>
            
            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t('quality.confirmEmailLabel')}</label>
                <input 
                  type="email" required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  value={confirmEmail}
                  onChange={e => setConfirmEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t('quality.confirmPasswordLabel')}</label>
                <input 
                  type="password" required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowConfirmation(false)} className="flex-1 px-4 py-3 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 uppercase text-[10px] tracking-widest">{t('common.back')}</button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 shadow-lg shadow-orange-900/20 uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : t('common.confirm')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// MODAL DE MANUTENÇÃO
interface ScheduleModalProps extends ModalProps {
  onSave: (eventData: any) => void;
}

export const ScheduleMaintenanceModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, onSave, isSaving }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '22:00',
    durationMinutes: 60,
    description: '',
    predefined: 'routineMaintenance'
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Calendar size={20} /></div>
            <h2 className="text-lg font-bold text-slate-800">{t('maintenanceSchedule.title')}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t('maintenanceSchedule.eventTitle')}</label>
            <input 
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              placeholder={t('maintenanceSchedule.eventTitlePlaceholder')}
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t('maintenanceSchedule.date')}</label>
              <input 
                type="date" required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                value={formData.scheduledDate}
                onChange={e => setFormData({...formData, scheduledDate: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t('maintenanceSchedule.time')}</label>
              <input 
                type="time" required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                value={formData.scheduledTime}
                onChange={e => setFormData({...formData, scheduledTime: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t('maintenanceSchedule.predefinedMessage')}</label>
            <select 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm cursor-pointer"
              value={formData.predefined}
              onChange={e => setFormData({...formData, predefined: e.target.value})}
            >
              <option value="routineMaintenance">{t('maintenanceSchedule.predefined.routineMaintenance')}</option>
              <option value="criticalUpdate">{t('maintenanceSchedule.predefined.criticalUpdate')}</option>
              <option value="infraUpgrade">{t('maintenanceSchedule.predefined.infraUpgrade')}</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t('maintenanceSchedule.customMessage')}</label>
            <textarea 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm h-24 resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors uppercase text-[10px] tracking-widest">{t('common.cancel')}</button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-900/20 uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : t('maintenanceSchedule.scheduleButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
