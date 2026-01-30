
import React, { useState } from 'react';
import { Hammer, X, CalendarClock } from 'lucide-react';
import { SystemStatus } from '../../types/index.ts';

interface MaintenanceBannerProps {
    status: SystemStatus;
    isAdmin: boolean;
}

const formatMaintenanceWindow = (start?: string, end?: string) => {
    if (!start) return null;
    try {
        const startDate = new Date(start);
        const endDate = end ? new Date(end) : null;
        
        return {
            date: startDate.toLocaleDateString('pt-BR'),
            start: startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            end: endDate ? endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '...'
        };
    } catch {
        return null;
    }
};

export const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({ status, isAdmin }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (status.mode === 'ONLINE' || !isVisible) return null;

    if (status.mode === 'MAINTENANCE' && isAdmin) {
        return <CriticalBanner onClose={() => setIsVisible(false)} />;
    }

    if (status.mode === 'SCHEDULED') {
        return <ScheduledBanner status={status} onClose={() => setIsVisible(false)} />;
    }

    return null;
};

const CriticalBanner = ({ onClose }: { onClose: () => void }) => (
    <div className="bg-red-600 text-white relative z-30 shadow-lg shadow-red-500/20 animate-in slide-in-from-top-4">
        <div className="px-4 py-2 flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
                <Hammer size={16} className="animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-widest">Modo de Manutenção Ativo (Acesso Admin)</span>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors">
                <X size={14} />
            </button>
        </div>
    </div>
);

const ScheduledBanner = ({ status, onClose }: { status: SystemStatus, onClose: () => void }) => {
    const window = formatMaintenanceWindow(status.scheduledStart, status.scheduledEnd);
    if (!window) return null;
    
    return (
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white relative z-30 shadow-lg shadow-orange-500/20 animate-in slide-in-from-top-4">
            <div className="px-4 py-2 flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <CalendarClock size={16} />
                    <div className="flex flex-col sm:flex-row sm:gap-2 items-start sm:items-center">
                        <span className="text-[9px] font-black uppercase bg-black/20 px-2 py-0.5 rounded tracking-widest">Aviso</span>
                        <span className="text-xs font-bold">Manutenção Programada: {window.date} ({window.start} - {window.end})</span>
                    </div>
                </div>
                <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors">
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};
