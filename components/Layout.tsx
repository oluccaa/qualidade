
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../services/authContext.tsx';
import * as notificationService from '../services/notificationService.ts';
import { AppNotification, UserRole } from '../types.ts';
import { CookieBanner } from './CookieBanner.tsx';
import { PrivacyModal } from './PrivacyModal.tsx';
import { SupportModal } from './SupportModal.tsx';
import { N3SupportModal } from './N3SupportModal.tsx';
import { ChangePasswordModal } from './ChangePasswordModal.tsx';
import { useTranslation } from 'react-i18next';
import { 
  LogOut, 
  LayoutDashboard, 
  FolderOpen, 
  Settings, 
  ShieldCheck,
  Menu,
  X,
  Bell,
  Search,
  Phone,
  FileBadge,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Check,
  History,
  Star,
  Home,
  Library,
  Shield,
  User as UserIcon,
  MoreHorizontal,
  FileSearch,
  Info,
  ArrowLeft,
  Command,
  BarChart3,
  Users,
  Building2,
  LifeBuoy,
  ShieldAlert,
  Server,
  Network,
  Lock
} from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

type MenuItem = {
  label: string;
  icon: React.ElementType;
  path: string;
};

type MenuSection = {
  title?: string;
  items: MenuItem[];
};

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  // State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isN3SupportOpen, setIsN3SupportOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Persist collapsed state
  const [isCollapsed, setIsCollapsed] = useState(() => {
      const stored = localStorage.getItem('sidebar_collapsed');
      return stored === 'true';
  });

  // Notification State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
      if (user) {
          fetchNotifications();
      }
  }, [user]);

  // Click Outside to close notifications & user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        const isMobileView = window.innerWidth < 768;
        if (!isMobileView && notifRef.current && !notifRef.current.contains(event.target as Node)) {
            setIsNotifOpen(false);
        }
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
            setIsUserMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
      if (!user) return;
      const data = await notificationService.getNotifications(user);
      const count = await notificationService.getUnreadCount(user);
      setNotifications(data);
      setUnreadCount(count);
  };

  const handleMarkAsRead = async (id: string, link?: string) => {
      await notificationService.markAsRead(id);
      fetchNotifications();
      if (link) {
          setIsNotifOpen(false);
          navigate(link);
      }
  };

  const handleMarkAllRead = async () => {
      if (!user) return;
      await notificationService.markAllAsRead(user);
      fetchNotifications();
  };

  const toggleSidebar = () => {
      const newState = !isCollapsed;
      setIsCollapsed(newState);
      localStorage.setItem('sidebar_collapsed', String(newState));
  };

  const changeLanguage = (lng: string) => {
      i18n.changeLanguage(lng);
  };

  const roleLabel = user ? t(`roles.${user.role}`) : '';

  // Configuração de Menus (Desktop)
  const getMenuConfig = (): MenuSection[] => {
    const role = user?.role;

    if (role === UserRole.CLIENT) {
      return [
        {
          title: t('menu.main'),
          items: [
            { label: t('menu.home'), icon: Home, path: '/dashboard' },
            { label: t('menu.library'), icon: Library, path: '/dashboard?view=files' },
          ]
        },
        {
          title: t('menu.quickAccess'),
          items: [
            { label: t('menu.tickets'), icon: LifeBuoy, path: '/dashboard?view=tickets' },
            { label: t('menu.recent'), icon: History, path: '/dashboard?view=recent' },
            { label: t('menu.favorites'), icon: Star, path: '/dashboard?view=favorites' },
          ]
        }
      ];
    }

    if (role === UserRole.QUALITY) {
      return [
        {
          title: t('menu.operation'),
          items: [
            { label: t('menu.dashboard'), icon: LayoutDashboard, path: '/dashboard' },
            { label: t('menu.documents'), icon: FolderOpen, path: '/quality' },
          ]
        }
      ];
    }

    // ADMIN - Expanded Menu Merged directly here
    return [
      {
        title: t('menu.management'),
        items: [
          { label: t('admin.tabs.overview'), icon: BarChart3, path: '/admin?tab=overview' },
          { label: t('admin.tabs.users'), icon: Users, path: '/admin?tab=users' },
          { label: t('admin.tabs.clients'), icon: Building2, path: '/admin?tab=clients' },
          { label: t('admin.tabs.tickets'), icon: LifeBuoy, path: '/admin?tab=tickets' },
        ]
      },
      {
        title: t('menu.system'),
        items: [
          { label: t('admin.tabs.logs'), icon: ShieldAlert, path: '/admin?tab=logs' },
          { label: t('admin.tabs.settings'), icon: Settings, path: '/admin?tab=settings' }
        ]
      }
    ];
  };

  const getBottomNavItems = () => {
      const role = user?.role;
      const items = [
          { label: t('menu.home'), icon: Home, path: '/dashboard', exact: true },
      ];

      if (role === UserRole.CLIENT) {
          items.push({ label: t('menu.library'), icon: Library, path: '/dashboard?view=files', exact: false });
          items.push({ label: 'Chamados', icon: LifeBuoy, path: '/dashboard?view=tickets', exact: false });
      } else if (role === UserRole.ADMIN) {
          items.push({ label: 'Admin', icon: BarChart3, path: '/admin', exact: false });
      } else {
          items.push({ label: t('menu.documents'), icon: FolderOpen, path: '/quality', exact: false });
      }

      return items;
  };

  const menuSections = getMenuConfig();
  const bottomNavItems = getBottomNavItems();

  const isActive = (path: string, exact = false) => {
      if (exact) return location.pathname === path && location.search === '';
      if (path.includes('?')) return (location.pathname + location.search) === path;
      return location.pathname.startsWith(path);
  };

  const getNotifStyle = (type: AppNotification['type']) => {
      switch (type) {
          case 'SUCCESS': return { icon: CheckCircle2, bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' };
          case 'WARNING': return { icon: AlertTriangle, bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' };
          case 'ALERT': return { icon: AlertCircle, bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' };
          default: return { icon: Info, bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' };
      }
  };

  const renderClientSupportWidget = () => {
    if (isCollapsed) return null; 
    
    return (
      <div className="mx-3 mt-4 p-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 relative overflow-hidden group animate-in fade-in duration-300">
          <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck size={40} className="text-blue-400" />
          </div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('menu.help')}?</h4>
          <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
              {t('layout.supportQuestion')}
          </p>
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40"
          >
              <Phone size={12} /> {t('menu.support')}
          </button>
      </div>
    );
  };

  // NEW: Render Admin N3 Support Button
  const renderAdminSupportWidget = () => {
      if (isCollapsed) return null;
      return (
          <div className="mx-3 mt-4 pt-3 border-t border-slate-800/50 relative z-10">
              <button 
                onClick={() => setIsN3SupportOpen(true)} 
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 p-0.5 rounded-xl group relative overflow-hidden shadow-lg hover:shadow-orange-900/40 transition-all"
              >
                  <div className="bg-slate-950 rounded-[10px] p-2.5 flex items-center gap-2 relative z-10 group-hover:bg-opacity-90 transition-all">
                      <div className="p-1.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg text-white shadow-inner shrink-0">
                          <Server size={14} />
                      </div>
                      <div className="text-left min-w-0">
                          <span className="font-bold text-white text-xs block truncate">{t('admin.settings.techSupport')}</span>
                          <span className="text-[9px] text-slate-400 block">Equipe Externa</span>
                      </div>
                  </div>
              </button>
          </div>
      );
  };

  const NotificationButton = ({ mobile = false }) => {
    const renderNotificationList = () => (
        <div className="flex flex-col h-full bg-white md:bg-transparent">
             <div className={`${mobile ? 'p-4 mt-safe-top shadow-sm' : 'p-4'} border-b border-slate-100 flex justify-between items-center bg-white/95 backdrop-blur shrink-0 z-10`}>
                <div className="flex items-center gap-3">
                    {mobile && (
                        <button onClick={() => setIsNotifOpen(false)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full active:scale-95 transition-transform">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h3 className="font-bold text-slate-800 text-lg">{t('notifications.title')}</h3>
                </div>
                {unreadCount > 0 && (
                    <button 
                        onClick={handleMarkAllRead}
                        className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors active:scale-95"
                    >
                        <Check size={14} /> <span className="hidden sm:inline">{t('notifications.markAll')}</span>
                    </button>
                )}
            </div>
            
            <div className={`overflow-y-auto custom-scrollbar ${mobile ? 'flex-1 bg-slate-50 p-3' : 'max-h-[400px]'}`}>
                {notifications.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Bell size={24} className="opacity-20" />
                        </div>
                        <p className="text-sm font-medium">{t('notifications.empty')}</p>
                    </div>
                ) : (
                    <div className={`${mobile ? 'space-y-3' : 'divide-y divide-slate-100'}`}>
                        {notifications.map(notif => {
                            const style = getNotifStyle(notif.type);
                            const Icon = style.icon;

                            return (
                                <div 
                                    key={notif.id}
                                    onClick={() => handleMarkAsRead(notif.id, notif.link)}
                                    className={`
                                        group cursor-pointer transition-all
                                        ${mobile 
                                            ? `p-4 rounded-2xl border shadow-sm active:scale-[0.99] ${!notif.isRead ? 'bg-white border-blue-200 shadow-blue-500/5 ring-1 ring-blue-50' : 'bg-white border-slate-200'}`
                                            : `p-4 hover:bg-slate-50 ${!notif.isRead ? 'bg-blue-50/20' : ''}`
                                        }
                                    `}
                                >
                                    <div className="flex gap-4">
                                        <div className={`shrink-0 mt-0.5 w-10 h-10 rounded-full flex items-center justify-center ${style.bg} ${style.text}`}>
                                            <Icon size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className={`text-sm leading-snug ${!notif.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                    {notif.title}
                                                </h4>
                                                <div className="flex flex-col items-end shrink-0 gap-1.5 pt-0.5">
                                                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                                        {notif.timestamp}
                                                    </span>
                                                    {!notif.isRead && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm ring-2 ring-white" />
                                                    )}
                                                </div>
                                            </div>
                                            <p className={`text-xs leading-relaxed line-clamp-2 ${!notif.isRead ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                                                {notif.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="relative" ref={notifRef}>
            <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2 rounded-lg transition-colors ${
                    mobile 
                    ? 'text-white hover:bg-slate-800 active:bg-slate-700' 
                    : isNotifOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-blue-600'
                }`}
            >
                <Bell size={mobile ? 24 : 20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm"></span>
                )}
            </button>
            {isNotifOpen && (
                <>
                    {mobile ? (
                        <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col animate-in slide-in-from-right duration-300">
                             {renderNotificationList()}
                        </div>
                    ) : (
                        <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-[100] origin-top-right">
                            {renderNotificationList()}
                        </div>
                    )}
                </>
            )}
        </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Global Components */}
      <CookieBanner />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      <N3SupportModal isOpen={isN3SupportOpen} onClose={() => setIsN3SupportOpen(false)} user={user} />
      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />

      {/* --- SIDEBAR (DESKTOP ONLY) - COMPACT UPGRADE --- */}
      <aside 
        className={`
          hidden md:flex flex-col 
          bg-[#0f172a] text-slate-300 
          shadow-2xl z-[60] relative transition-all duration-500 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-72'} 
          overflow-visible h-screen
        `}
      >
        {/* Background Gradient for Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0f172a] to-[#0f172a] pointer-events-none"></div>

        <button 
            onClick={toggleSidebar}
            className="absolute -right-3 top-8 z-[70] bg-white text-slate-600 border border-slate-200 rounded-full h-6 w-6 flex items-center justify-center shadow-lg hover:text-blue-600 hover:border-blue-400 hover:scale-110 transition-all cursor-pointer ring-2 ring-slate-50/50"
            title={isCollapsed ? t('common.expand') : t('common.collapse')}
        >
            {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
        </button>

        {/* LOGO AREA - MORE COMPACT */}
        <div className={`h-20 flex items-center border-b border-slate-800/60 bg-[#0f172a]/50 backdrop-blur-sm shrink-0 transition-all duration-500 relative z-10 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
          <div className="flex items-center gap-3">
            <div className={`bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-900/30 shrink-0 transition-transform duration-500 ${isCollapsed ? 'scale-110' : 'scale-100'}`}>
              <ShieldCheck size={24} className="text-white" strokeWidth={2.5} />
            </div>
            
            <div className={`flex flex-col overflow-hidden transition-all duration-500 ${isCollapsed ? 'w-0 opacity-0 absolute' : 'w-auto opacity-100'}`}>
              <span className="font-bold text-lg text-white tracking-tight leading-none whitespace-nowrap">{t('menu.brand')}</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-blue-400 font-bold mt-1 whitespace-nowrap">{t('menu.portalName')}</span>
            </div>
          </div>
        </div>

        {/* MENU ITEMS - SCROLLABLE (But Compact) */}
        <nav className="flex-1 py-3 space-y-1 relative z-10 overflow-y-auto custom-scrollbar overflow-x-hidden min-h-0">
          {menuSections.map((section, idx) => (
            <div key={idx} className="px-3">
               {!isCollapsed && section.title && (
                 <div className="mb-2 px-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 animate-in fade-in duration-500 mt-2">
                    {section.title}
                 </div>
               )}
               
               {isCollapsed && section.title && idx > 0 && (
                   <div className="my-3 border-t border-slate-800/50 mx-2" />
               )}

               <div className="space-y-1">
                 {section.items.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.label}
                        to={item.path}
                        className={`
                          group flex items-center relative
                          py-2.5 rounded-xl transition-all duration-300 ease-out
                          ${isCollapsed ? 'justify-center px-0 mx-1' : 'px-4 gap-3'}
                          ${active 
                            ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] border border-white/5 backdrop-blur-md' 
                            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}
                        `}
                      >
                        {/* Active Indicator Line (Left) */}
                        {active && !isCollapsed && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
                        )}

                        <item.icon 
                            size={isCollapsed ? 20 : 18} 
                            className={`shrink-0 transition-all duration-300 ${active ? 'text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]' : 'group-hover:text-white group-hover:scale-110'}`} 
                            strokeWidth={active ? 2.5 : 2}
                        />
                        
                        <span className={`whitespace-nowrap text-sm font-medium transition-all duration-500 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}`}>
                            {item.label}
                        </span>

                        {/* Collapsed Tooltip */}
                        {isCollapsed && (
                            <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 border border-slate-700 translate-x-2 group-hover:translate-x-0">
                                {item.label}
                                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-slate-800 rotate-45 border-l border-b border-slate-700"></div>
                            </div>
                        )}
                      </Link>
                    );
                 })}
               </div>
            </div>
          ))}
          
          {(user?.role === UserRole.CLIENT || user?.role === UserRole.QUALITY) && renderClientSupportWidget()}
          {user?.role === UserRole.ADMIN && renderAdminSupportWidget()}
        </nav>

        {/* USER PROFILE FOOTER - COMPACT */}
        <div className="p-4 border-t border-slate-800/60 bg-[#0f172a]/30 shrink-0 relative z-10" ref={userMenuRef}>
          <div 
             onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
             className={`
                flex items-center rounded-xl transition-all duration-300 relative
                ${isCollapsed ? 'justify-center p-0' : 'p-2.5 bg-slate-800/40 border border-slate-700/50 gap-3 cursor-pointer hover:border-slate-600 hover:bg-slate-800/60 group'}
          `}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold shadow-inner border border-slate-500/30 shrink-0 text-sm">
              {user?.name.charAt(0)}
            </div>
            <div className={`flex-1 overflow-hidden transition-all duration-500 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}`}>
              <p className="text-xs font-semibold text-white truncate group-hover:text-blue-200 transition-colors">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                  <p className="text-[9px] text-slate-400 truncate uppercase tracking-wider font-bold">{roleLabel}</p>
              </div>
            </div>
            
            {!isCollapsed && isUserMenuOpen && (
                <div className="absolute bottom-full left-0 mb-4 w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 z-50">
                    <button onClick={() => setIsChangePasswordOpen(true)} className="w-full text-left px-5 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-3 transition-colors">
                        <Lock size={14} className="text-blue-500" /> {t('common.changePassword')}
                    </button>
                    <div className="h-px bg-slate-700/50" />
                    <button onClick={() => setIsPrivacyOpen(true)} className="w-full text-left px-5 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-3 transition-colors">
                        <Shield size={14} className="text-blue-500" /> {t('common.privacy')}
                    </button>
                    <div className="h-px bg-slate-700/50" />
                    <button onClick={logout} className="w-full text-left px-5 py-3 text-xs font-bold text-red-400 hover:bg-red-900/20 flex items-center gap-3 transition-colors">
                        <LogOut size={14} /> {t('common.logout')}
                    </button>
                </div>
            )}
            
            {isCollapsed && (
                <div className="absolute right-0 top-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0f172a] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            )}
          </div>
           {isCollapsed && (
             <button onClick={logout} className="mt-3 w-full flex justify-center items-center py-2 text-slate-500 hover:text-red-400 hover:bg-red-900/10 rounded-xl transition-all group relative">
                <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50 w-full min-w-0">
        
        {/* MOBILE HEADER (Minimalist) */}
        <header className="md:hidden h-16 bg-slate-900 text-white flex items-center justify-between px-4 shadow-md z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-1.5 rounded-lg shadow-sm">
                <ShieldCheck size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
                 <span className="font-bold text-sm leading-tight">{t('menu.brand')}</span>
                 <span className="text-[10px] text-slate-400 uppercase tracking-widest">{t('dashboard.regular')}</span>
            </div>
          </div>
          <NotificationButton mobile={true} />
        </header>

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl border-t border-slate-200 z-40 flex items-center justify-around pb-2 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            {bottomNavItems.map((item, idx) => {
                const active = isActive(item.path, item.exact);
                return (
                    <Link
                        key={idx}
                        to={item.path}
                        className={`
                            flex flex-col items-center justify-center w-16 h-full space-y-1 transition-all
                            ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}
                        `}
                    >
                        <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-blue-50 scale-110' : ''}`}>
                            <item.icon size={24} strokeWidth={active ? 2.5 : 2} />
                        </div>
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                )
            })}
            
            <button 
                onClick={() => {
                   navigate(user?.role === UserRole.CLIENT ? '/dashboard?view=files' : '/quality'); 
                }}
                className={`flex flex-col items-center justify-center w-16 h-full space-y-1 text-slate-400 hover:text-slate-600`}
            >
                <div className="p-1.5 rounded-xl"><Search size={24} /></div>
                <span className="text-[10px] font-medium">{t('common.search')}</span>
            </button>

            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${isMobileMenuOpen ? 'text-blue-600' : 'text-slate-400'}`}
            >
                 <div className="p-1.5 rounded-xl">
                    <UserIcon size={24} />
                 </div>
                 <span className="text-[10px] font-medium">{t('common.menu')}</span>
            </button>
        </nav>

        {/* MOBILE BOTTOM SHEET */}
        {isMobileMenuOpen && (
           <>
               <div className="md:hidden fixed inset-0 bg-slate-900/50 z-50 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsMobileMenuOpen(false)} />
               
               <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[60] p-6 pb-24 shadow-2xl animate-in slide-in-from-bottom-full duration-300 border-t border-slate-100">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-600 border border-slate-200">
                            {user?.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">{user?.name}</h3>
                            <p className="text-sm text-slate-500">{user?.email}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-md border border-blue-100">
                                {roleLabel}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {['pt', 'en', 'es'].map(lang => (
                                <button 
                                    key={lang}
                                    onClick={() => changeLanguage(lang)}
                                    className={`py-2 text-sm font-bold uppercase rounded-xl border transition-all ${i18n.language === lang ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>

                        {/* Admin N3 Support Mobile */}
                        {user?.role === UserRole.ADMIN && (
                            <button
                                onClick={() => { setIsN3SupportOpen(true); setIsMobileMenuOpen(false); }}
                                className="flex items-center gap-4 px-4 py-4 w-full text-slate-600 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all font-medium"
                            >
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Server size={20} /></div>
                                {t('admin.settings.techSupport')}
                            </button>
                        )}

                        <button
                            onClick={() => { setIsSupportOpen(true); setIsMobileMenuOpen(false); }}
                            className="flex items-center gap-4 px-4 py-4 w-full text-slate-600 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all font-medium"
                        >
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Phone size={20} /></div>
                            {t('menu.support')}
                        </button>

                        <button
                            onClick={() => { setIsChangePasswordOpen(true); setIsMobileMenuOpen(false); }}
                            className="flex items-center gap-4 px-4 py-4 w-full text-slate-600 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all font-medium"
                        >
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Lock size={20} /></div>
                            {t('common.changePassword')}
                        </button>

                        <button
                            onClick={() => { setIsPrivacyOpen(true); setIsMobileMenuOpen(false); }}
                            className="flex items-center gap-4 px-4 py-4 w-full text-slate-600 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all font-medium"
                        >
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Shield size={20} /></div>
                            {t('common.privacy')}
                        </button>
                        
                        <button
                            onClick={logout}
                            className="flex items-center gap-4 px-4 py-4 w-full text-red-600 hover:bg-red-50 rounded-2xl border border-transparent hover:border-red-100 transition-all font-medium"
                        >
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><LogOut size={20} /></div>
                            {t('common.logout')}
                        </button>
                    </div>
               </div>
           </>
        )}

        <header className="hidden md:flex h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-40 shrink-0 transition-all">
            <div className="flex flex-col justify-center animate-in fade-in slide-in-from-left-2 duration-300">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{t('menu.portalName')}</span>
                    <span className="text-slate-300">/</span>
                    <span className="font-medium text-blue-600 flex items-center gap-1">
                        {user?.role === UserRole.CLIENT && <FileBadge size={12}/>}
                        {roleLabel}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder={t('common.search')}
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 group-focus-within:w-80"
                    />
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                    {['pt', 'en', 'es'].map(lang => (
                        <button 
                        key={lang}
                        onClick={() => changeLanguage(lang)}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-colors ${i18n.language === lang ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <NotificationButton mobile={false} />
            </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 custom-scrollbar pb-24 md:pb-10">
            <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 min-h-full">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
};
