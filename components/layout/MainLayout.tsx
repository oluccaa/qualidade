
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/authContext.tsx';
import { notificationService, adminService } from '../../lib/services/index.ts';
import { AppNotification, UserRole, SystemStatus, normalizeRole } from '../../types/index.ts';
import { CookieBanner } from '../common/CookieBanner.tsx';
import { PrivacyModal } from '../common/PrivacyModal.tsx';
import { ChangePasswordModal } from '../features/auth/ChangePasswordModal.tsx';
import { MaintenanceBanner } from '../common/MaintenanceBanner.tsx';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { getMenuConfig, getBottomNavItems, getUserMenuItems } from '../../config/navigation.ts'; 

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const LOGO_URL = "https://wtydnzqianhahiiasows.supabase.co/storage/v1/object/public/public_assets/hero/logo.png";

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({ mode: 'ONLINE' });
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (user) {
          fetchNotifications();
          checkSystemStatus();
          const unsubStatus = adminService.subscribeToSystemStatus(setSystemStatus);
          const unsubNotifs = notificationService.subscribeToNotifications(fetchNotifications);
          return () => { unsubStatus(); unsubNotifs(); };
      }
  }, [user]);

  const checkSystemStatus = async () => setSystemStatus(await adminService.getSystemStatus());
  
  const fetchNotifications = async () => {
      if (!user) return;
      setNotifications(await notificationService.getNotifications(user));
      setUnreadCount(await notificationService.getUnreadCount(user));
  };

  const toggleSidebar = () => {
      const newState = !isCollapsed;
      setIsCollapsed(newState);
      localStorage.setItem('sidebar_collapsed', String(newState));
  };

  const role = normalizeRole(user?.role);
  const roleLabel = user ? t(`roles.${role}`) : '';

  const menuSections = getMenuConfig(user, t);
  const bottomNavItems = getBottomNavItems(user, t);
  const userMenuItems = getUserMenuItems(t, { 
    onLogout: logout, 
    onOpenChangePassword: () => setIsChangePasswordOpen(true),
    onOpenPrivacy: () => setIsPrivacyOpen(true)
  });

  const isActive = (path: string, exact = false) => {
      const current = location.pathname + location.search;
      if (exact) return current === path;
      if (path.includes('?')) return current === path;
      return location.pathname === path.split('?')[0];
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <CookieBanner />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />

      <aside className={`hidden md:flex flex-col bg-[#0f172a] text-slate-300 shadow-2xl z-[60] relative transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
        <button onClick={toggleSidebar} className="absolute -right-3 top-8 z-[70] bg-white text-slate-600 border rounded-full h-7 w-7 flex items-center justify-center shadow-lg hover:text-blue-600 transition-all">
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        <div className={`h-24 flex items-center shrink-0 border-b border-slate-800/60 transition-all ${isCollapsed ? 'justify-center' : 'px-6'}`}>
            <img src={LOGO_URL} alt="Logo" className={isCollapsed ? 'h-8' : 'h-12'} />
        </div>
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar px-3">
          {menuSections.map((section, idx) => (
            <div key={idx} className="mb-6">
               {!isCollapsed && <div className="mb-2 px-3 text-[9px] font-bold uppercase tracking-widest text-slate-500">{section.title}</div>}
               <div className="space-y-1">
                 {section.items.map((item) => {
                    const active = isActive(item.path, item.exact);
                    return (
                      <Link key={item.label} to={item.path} className={`flex items-center rounded-xl transition-all ${isCollapsed ? 'justify-center py-3' : 'px-4 py-2.5 gap-3'} ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        <item.icon size={20} className={active ? 'text-white' : 'text-slate-500'} />
                        {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                      </Link>
                    );
                 })}
               </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800/60 bg-[#0f172a]/30">
          <div className={`flex items-center p-2.5 bg-slate-800/40 border border-slate-700/50 rounded-xl gap-3 transition-all ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">{user?.name.charAt(0)}</div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[9px] text-slate-500 uppercase font-black">{roleLabel}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <MaintenanceBanner status={systemStatus} isAdmin={role === UserRole.ADMIN} />
        
        <header className="hidden md:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-8 shrink-0">
            <div>
                <h2 className="text-xl font-bold text-slate-800 leading-tight">{title}</h2>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">
                    <span className="text-blue-600 font-black">{roleLabel}</span>
                    <span className="opacity-30">|</span>
                    <span>{user?.organizationName}</span>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="relative" ref={notifRef}>
                    <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 text-slate-400 hover:text-blue-600 relative transition-colors">
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
                    </button>
                </div>
                <div className="h-8 w-px bg-slate-100"></div>
                <button onClick={logout} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-500 transition-colors">
                    <LogOut size={16} /> {t('common.logout')}
                </button>
            </div>
        </header>

        <header className="md:hidden h-16 bg-[#0f172a] text-white flex items-center justify-between px-4 z-40 shrink-0">
            <img src={LOGO_URL} alt="Logo" className="h-8" />
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2">
                <UserIcon size={24} />
            </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 custom-scrollbar">
            <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                {children}
            </div>
        </main>

        <nav className="md:hidden h-16 bg-white border-t border-slate-200 flex items-center justify-around shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            {bottomNavItems.map((item, idx) => (
                <Link key={idx} to={item.path} className={`flex flex-col items-center gap-1 ${isActive(item.path, item.exact) ? 'text-blue-600' : 'text-slate-400'}`}>
                    <item.icon size={18} />
                    <span className="text-[10px] font-bold">{item.label}</span>
                </Link>
            ))}
        </nav>

        {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-[100] bg-[#0f172a]/60 backdrop-blur-sm p-6 animate-in fade-in">
                <div className="bg-white rounded-3xl h-full flex flex-col p-6 shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold">Meu Perfil</h3>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-full">
                            <ChevronDown size={20}/>
                        </button>
                    </div>
                    <div className="space-y-3">
                        {userMenuItems.map((item, idx) => (
                            <button key={idx} onClick={item.onClick} className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-2xl font-bold text-slate-700">
                                <item.icon size={20} className="text-blue-600"/> {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
