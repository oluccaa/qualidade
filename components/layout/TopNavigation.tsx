
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NotificationsDropdown } from '../features/notifications/NotificationsDropdown.tsx';
import { useNotifications } from '../features/notifications/hooks/useNotifications.ts';

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";
const CORPORATE_BLUE_FILTER = "brightness(0) saturate(100%) invert(8%) sepia(35%) saturate(5833%) hue-rotate(222deg) brightness(95%) contrast(106%)";

export const TopNavigation: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isDashboard = ['/admin/dashboard', '/quality/dashboard', '/client/portal'].includes(location.pathname.split('?')[0]);

  // Detecção de Scroll no container principal
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const handleScroll = () => {
      const scrollTop = mainContent.scrollTop;
      setIsScrolled(scrollTop > 10);
    };

    mainContent.addEventListener('scroll', handleScroll);
    return () => mainContent.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`
        sticky top-0 z-40 w-full px-4 md:px-8 flex justify-between items-center transition-all duration-300 border-b
        ${isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-slate-200 py-3' 
          : 'bg-slate-50 border-transparent py-5'}
      `}
    >
      {/* Lado Esquerdo: Logo ou Voltar (Mobile) / Contexto (Desktop) */}
      <div className="flex items-center gap-4">
        {/* Mobile: Lógica de Voltar vs Logo */}
        <div className="md:hidden">
          {!isDashboard ? (
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 -ml-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <img 
              src={LOGO_URL} 
              alt="Aços Vital" 
              className="h-8 object-contain" 
              style={{ filter: CORPORATE_BLUE_FILTER }} 
            />
          )}
        </div>

        {/* Desktop: Sempre mostra contexto ou título da página se necessário */}
        <div className="hidden md:block">
           {/* Espaço reservado para Breadcrumbs ou Título Dinâmico no futuro */}
        </div>
      </div>

      {/* Lado Direito: Ações Globais */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
              className={`p-2.5 rounded-xl transition-all relative group overflow-visible
                  ${isNotificationsOpen 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'}
              `}
          >
              <Bell size={20} strokeWidth={2.5} className={unreadCount > 0 && !isNotificationsOpen ? 'animate-swing' : ''} />
              {unreadCount > 0 && (
              <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
              )}
          </button>

          <div className="absolute right-0 top-full pt-2">
              <NotificationsDropdown 
                isOpen={isNotificationsOpen} 
                onClose={() => setIsNotificationsOpen(false)} 
              />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes swing {
            0%, 100% { transform: rotate(0); }
            20% { transform: rotate(15deg); }
            40% { transform: rotate(-15deg); }
            60% { transform: rotate(10deg); }
            80% { transform: rotate(-10deg); }
        }
        .animate-swing { animation: swing 2s infinite ease-in-out; }
      `}</style>
    </header>
  );
};
