
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Server, 
  ShieldCheck, 
  Settings as SettingsIcon, 
  CalendarClock, 
  AlertTriangle,
  History,
  Lock,
  Globe
} from 'lucide-react';
import { SystemStatus } from '../../../types/index';
import { ScheduleMaintenanceModal } from '../modals/AdminModals.tsx';
import { useAdminSystemManagement } from '../hooks/useAdminSystemManagement.ts';

interface AdminSettingsProps {
  systemStatus: SystemStatus;
  setSystemStatus: React.Dispatch<React.SetStateAction<SystemStatus | null>>;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ systemStatus, setSystemStatus, setIsSaving }) => {
  const { t } = useTranslation();

  const {
    systemStatus: internalSystemStatus,
    handleUpdateMaintenance,
    isScheduleMaintenanceModalOpen,
    setIsScheduleMaintenanceModalOpen,
    handleScheduleMaintenance,
  } = useAdminSystemManagement({
    setIsSaving,
    initialSystemStatus: systemStatus,
    setPageSystemStatus: setSystemStatus,
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <ScheduleMaintenanceModal
        isOpen={isScheduleMaintenanceModalOpen}
        onClose={() => setIsScheduleMaintenanceModalOpen(false)}
        onSave={handleScheduleMaintenance}
        isSaving={false}
      />

      {/* Status Atual do Sistema */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className={`p-8 flex items-center justify-between gap-6 ${
          internalSystemStatus?.mode === 'ONLINE' ? 'bg-emerald-50/50' : 'bg-orange-50/50'
        }`}>
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
              internalSystemStatus?.mode === 'ONLINE' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'
            }`}>
              {internalSystemStatus?.mode === 'ONLINE' ? <Globe size={32} /> : <AlertTriangle size={32} />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Sistema está {internalSystemStatus?.mode === 'ONLINE' ? 'Totalmente Operacional' : 'em Modo Restrito'}
              </h2>
              <p className="text-slate-500 text-sm font-medium mt-1">
                {internalSystemStatus?.mode === 'ONLINE' 
                  ? 'Todos os módulos estão acessíveis para clientes e analistas.' 
                  : 'Apenas administradores podem acessar o portal neste momento.'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
           <button
              onClick={() => handleUpdateMaintenance('ONLINE')}
              disabled={internalSystemStatus?.mode === 'ONLINE'}
              className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all border ${
                internalSystemStatus?.mode === 'ONLINE' 
                ? 'bg-white text-emerald-600 border-emerald-200 cursor-default opacity-60' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-500 hover:text-emerald-600 shadow-sm active:scale-95'
              }`}
            >
              <ShieldCheck size={20} /> Colocar Sistema Online
            </button>

            <button
              onClick={() => handleUpdateMaintenance('MAINTENANCE')}
              disabled={internalSystemStatus?.mode === 'MAINTENANCE'}
              className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all border ${
                internalSystemStatus?.mode === 'MAINTENANCE' 
                ? 'bg-white text-red-600 border-red-200 cursor-default opacity-60' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-red-500 hover:text-red-600 shadow-sm active:scale-95'
              }`}
            >
              <Lock size={20} /> Ativar Modo Manutenção
            </button>
        </div>
      </div>

      {/* Agendamento Técnico */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <CalendarClock size={24} className="text-blue-400" /> Janelas de Downtime Técnico
              </h3>
              <p className="text-slate-400 text-sm max-w-md">
                Configure avisos prévios para seus clientes sobre atualizações programadas. O sistema exibirá um banner informativo no topo de todas as telas.
              </p>
            </div>
            <button 
              onClick={() => setIsScheduleMaintenanceModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 active:scale-95 whitespace-nowrap"
            >
              Agendar Manutenção
            </button>
          </div>
      </div>

      {/* Histórico de Atividades (Placeholders para futura implementação) */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-[4px] text-slate-400 flex items-center gap-2 ml-1">
          <History size={14} /> Histórico de Configurações
        </h4>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <p className="text-slate-400 text-sm font-medium italic">O histórico de alterações globais está sendo sincronizado com os Logs de Auditoria.</p>
        </div>
      </div>
    </div>
  );
};
