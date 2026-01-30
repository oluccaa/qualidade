
import React, { useEffect, useState, useMemo } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastNotificationProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
  duration?: number;
}

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    classes: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    progressColor: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    classes: 'bg-red-50 border-red-200 text-red-700',
    progressColor: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-orange-50 border-orange-200 text-orange-700',
    progressColor: 'bg-orange-500',
  },
  info: {
    icon: Info,
    classes: 'bg-blue-50 border-blue-200 text-blue-700',
    progressColor: 'bg-blue-500',
  },
};

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  id,
  message,
  type,
  onClose,
  duration = 5000,
}) => {
  const [progress, setProgress] = useState(100);
  const style = useMemo(() => TOAST_STYLES[type] || TOAST_STYLES.info, [type]);
  const Icon = style.icon;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining === 0) {
        onClose(id);
        clearInterval(interval);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [id, duration, onClose]);

  return (
    <div
      className={`relative w-80 min-h-[70px] p-4 rounded-xl shadow-xl border ${style.classes} animate-in fade-in slide-in-from-right-8 duration-300 overflow-hidden flex flex-col justify-center`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3 relative z-10">
        <Icon size={20} className="shrink-0 mt-0.5" strokeWidth={2.5} />
        <p className="flex-1 text-xs font-bold leading-relaxed">{message}</p>
        <button
          onClick={() => onClose(id)}
          className="p-1 -mr-2 -mt-2 rounded-full hover:bg-black/5 transition-colors opacity-60 hover:opacity-100"
          aria-label="Fechar notificação"
        >
          <X size={14} />
        </button>
      </div>
      
      <div className="absolute bottom-0 left-0 h-1 w-full bg-black/5">
        <div
          className={`h-full ${style.progressColor} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
