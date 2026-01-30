
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LogoutConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutConfirmation: React.FC<LogoutConfirmationProps> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200">
    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
      <div className="p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-orange-100">
          <AlertTriangle size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Encerrar Sessão?</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
            Você precisará de suas credenciais técnicas para acessar o portal Vital novamente.
          </p>
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <button 
            type="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConfirm();
            }}
            className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-red-600/20"
          >
            Confirmar Desconexão
          </button>
          <button 
            type="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCancel();
            }}
            className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Manter Acesso
          </button>
        </div>
      </div>
      <div className="bg-slate-50 py-3 text-center border-t border-slate-100">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[3px]">Segurança Vital Cloud</span>
      </div>
    </div>
  </div>
);
