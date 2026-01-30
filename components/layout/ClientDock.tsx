
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Library, ClipboardList } from 'lucide-react';

interface ClientDockProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const ClientDock: React.FC<ClientDockProps> = ({ activeView, onViewChange }) => {
  const { t } = useTranslation();

  const navItems = [
    { id: 'home', label: t('client.home'), icon: LayoutDashboard },
    { id: 'audit_flow', label: t('client.flux'), icon: ClipboardList },
    { id: 'library', label: t('menu.library'), icon: Library },
  ];

  return (
    <div className="fixed bottom-6 inset-x-0 z-[80] flex justify-center md:hidden pointer-events-none">
      <nav 
        className="flex items-center gap-1 bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl shadow-black/20 pointer-events-auto scale-100 animate-in slide-in-from-bottom-6 duration-500" 
        role="navigation" 
        aria-label={t('menu.sections.main')}
      >
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                relative flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 group
                ${isActive
                  ? 'bg-white text-[#0f172a] shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} 
              />
              {isActive && (
                <span className="text-[10px] font-black uppercase tracking-wider animate-in fade-in slide-in-from-left-2 duration-300 whitespace-nowrap">
                  {item.label}
                </span>
              )}
              
              {/* Active Indicator Dot */}
              {!isActive && (
                 <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/0 group-hover:bg-white/50 transition-colors" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
