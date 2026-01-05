
import React from 'react';
import { AlertTriangle, Hammer } from 'lucide-react';
import { SystemStatus } from '../types.ts';

interface MaintenanceBannerProps {
    status: SystemStatus;
    isAdmin: boolean;
}

export const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({ status, isAdmin }) => {
    if (status.mode === 'ONLINE') return null;

    if (status.mode === 'MAINTENANCE') {
        if (!isAdmin) return null; // Non-admins are blocked by Middleware, no banner needed there.
        return (
            <div className="bg-red-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md relative z-[100]">
                <Hammer size={14} className="animate-pulse" />
                MODO DE MANUTENÇÃO ATIVO - Acesso exclusivo para Administradores.
            </div>
        );
    }

    if (status.mode === 'SCHEDULED') {
        return (
            <div className="bg-orange-500 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md relative z-[100]">
                <AlertTriangle size={14} />
                Aviso: Manutenção agendada para {new Date(status.scheduledStart!).toLocaleString()}. O sistema ficará indisponível.
            </div>
        );
    }

    return null;
};
