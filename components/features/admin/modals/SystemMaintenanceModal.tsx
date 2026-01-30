
import React, { useState } from 'react';
import { X, CalendarClock, Loader2 } from 'lucide-react';
import { MaintenanceEvent } from '../../../../types/index.ts';
import { useTranslation } from 'react-i18next';

interface SystemMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<MaintenanceEvent> & { scheduledTime: string }) => Promise<void>;
  isSaving: boolean;
}

export const SystemMaintenanceModal: React.FC<SystemMaintenanceModalProps> = ({ 
  isOpen, onClose, onSave, isSaving 
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    scheduledDate: '',
    scheduledTime: '',
    durationMinutes: 60,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
                <CalendarClock size={22} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{t('maintenanceSchedule.title')}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24}/></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <form onSubmit={handleSubmit} className="pb-4">
            <div className="space-y-1.5 px-8 pt-5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('maintenanceSchedule.eventTitle')} *</label>
              <input 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder={t('maintenanceSchedule.eventTitlePlaceholder')}
                required 
                disabled={isSaving}
                className="w-full px-4 py-3 rounded-xl outline-none font-semibold text-slate-800 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-0">
              <div className="space-y-1.5 px-8 pt-5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('maintenanceSchedule.date')} *</label>
                <input 
                  type="date" 
                  value={formData.scheduledDate} 
                  onChange={e => setFormData({...formData, scheduledDate: e.target.value})} 
                  required 
                  disabled={isSaving}
                  className="w-full px-4 py-3 rounded-xl outline-none font-semibold text-slate-800 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5 px-8 pt-5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('maintenanceSchedule.time')} *</label>
                <input 
                  type="time" 
                  value={formData.scheduledTime} 
                  onChange={e => setFormData({...formData, scheduledTime: e.target.value})} 
                  required 
                  disabled={isSaving}
                  className="w-full px-4 py-3 rounded-xl outline-none font-semibold text-slate-800 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1.5 px-8 pt-5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('maintenanceSchedule.duration')} *</label>
              <input 
                type="number" 
                value={formData.durationMinutes.toString()} 
                onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value) || 0})} 
                required 
                disabled={isSaving}
                className="w-full px-4 py-3 rounded-xl outline-none font-semibold text-slate-800 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5 px-8 pt-5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('maintenanceSchedule.customMessage')}</label>
              <textarea 
                disabled={isSaving}
                className="w-full px-4 py-2.5 rounded-lg font-medium text-slate-900 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white transition-all min-h-[100px] outline-none disabled:opacity-50"
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>

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
                className="px-10 py-3 bg-[#081437] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center gap-2 disabled:opacity-70"
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                {t('maintenanceSchedule.scheduleButton')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
