
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../services/authContext.tsx';
import * as notificationService from '../services/notificationService.ts';
import { AppNotification, UserRole } from '../types.ts';
import { CookieBanner } from './CookieBanner.tsx';
import { PrivacyModal } from './PrivacyModal.tsx';
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
  HelpCircle,
  Phone,
  FileBadge,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Check,
  History,
  Star,
  Home,
  Library,
  Shield,
  Globe
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
        if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
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

  // Configuração de Menus
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

    // ADMIN
    return [
      {
        title: t('menu.management'),
        items: [
          { label: t('menu.generalPanel'), icon: LayoutDashboard, path: '/admin' },
          { label: t('menu.files'), icon: FolderOpen, path: '/quality' },
        ]
      },
      {
        title: t('menu.system'),
        items: [
          { label: t('menu.settings'), icon: Settings, path: '/settings' }
        ]
      }
    ];
  };

  const menuSections = getMenuConfig();

  const isActive = (path: string) => {
      if (path.includes('?')) return location.search.includes(path.split('?')[1]);
      return location.pathname === path && location.search === '';
  };

  // Helper for notification icons
  const getNotifIcon = (type: AppNotification['type']) => {
      switch (type) {
          case 'SUCCESS': return <CheckCircle2 size={16} className="text-emerald-500" />;
          case 'WARNING': return <AlertTriangle size={16} className="text-orange-500" />;
          case 'ALERT': return <AlertCircle size={16} className="text-red-500" />;
          default: return <Info size={16} className="text-blue-500" />;
      }
  };

  // Widget de Suporte (Renderizado condicionalmente baseado no colapso)
  const renderClientSupportWidget = () => {
    if (isCollapsed) return null; // Hide completely when collapsed
    
    return (
      <div className="mx-4 mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 relative overflow-hidden group animate-in fade-in duration-300">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck size={48} className="text-blue-400" />
          </div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('menu.help')}?</h4>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Dúvidas sobre um certificado ou lote específico?
          </p>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Phone size={14} /> {t('menu.support')}
          </button>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Global Components */}
      <CookieBanner />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {/* Sidebar - Desktop */}
      <aside 
        className={`
          hidden md:flex flex-col 
          bg-slate-900 text-slate-300 
          shadow-2xl z-[60] relative transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-72'}
          overflow-visible
        `}
      >
        {/* Toggle Button (Floating) */}
        <button 
            onClick={toggleSidebar}
            className="absolute -right-4 top-9 z-[70] bg-white text-slate-600 border border-slate-200 rounded-full h-8 w-8 flex items-center justify-center shadow-lg hover:text-blue-600 hover:border-blue-400 hover:scale-110 transition-all cursor-pointer ring-4 ring-slate-50/50"
            title={isCollapsed ? "Expandir" : "Recolher"}
        >
            {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
        </button>

        {/* Brand Area */}
        <div className={`h-20 flex items-center border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-sm shrink-0 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-2.5 rounded-xl shadow-lg shadow-blue-900/20 shrink-0">
              <ShieldCheck size={24} className="text-white" />
            </div>
            
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <span className="font-bold text-lg text-white tracking-tight leading-none whitespace-nowrap">Aços Vital</span>
              <span className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold mt-1 whitespace-nowrap">Portal da Qualidade</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
          
          {menuSections.map((section, idx) => (
            <div key={idx} className="px-3">
               {/* Section Title - Hide if collapsed */}
               {!isCollapsed && section.title && (
                 <div className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 animate-in fade-in duration-300">
                    {section.title}
                 </div>
               )}
               
               {/* Separator for collapsed mode if needed */}
               {isCollapsed && section.title && idx > 0 && (
                   <div className="my-2 border-t border-slate-800 mx-2" />
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
                          py-3 text-sm font-medium rounded-xl transition-all duration-200
                          ${isCollapsed ? 'justify-center px-0' : 'px-4 gap-3'}
                          ${active 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
                            : 'hover:bg-slate-800 hover:text-white'}
                        `}
                      >
                        <item.icon size={20} className={`shrink-0 transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                        
                        {/* Label - Hide if collapsed */}
                        <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}`}>
                            {item.label}
                        </span>

                        {/* Tooltip for Collapsed State */}
                        {isCollapsed && (
                            <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-700">
                                {item.label}
                                {/* Arrow */}
                                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700"></div>
                            </div>
                        )}
                      </Link>
                    );
                 })}
               </div>
            </div>
          ))}

          {/* Área Específica para Clientes: Widget de Suporte */}
          {user?.role === UserRole.CLIENT && renderClientSupportWidget()}
          
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/30 shrink-0" ref={userMenuRef}>
          <div 
             onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
             className={`
                flex items-center rounded-xl transition-colors relative
                ${isCollapsed ? 'justify-center p-0' : 'p-3 bg-slate-800/50 border border-slate-700/50 gap-3 cursor-pointer hover:border-slate-600 group'}
          `}>
            {/* Avatar */}
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold shadow-inner border border-slate-600 shrink-0">
              {user?.name.charAt(0)}
            </div>

            {/* User Info - Hidden if collapsed */}
            <div className={`flex-1 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}`}>
              <p className="text-sm font-semibold text-white truncate group-hover:text-blue-200 transition-colors">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[10px] text-slate-400 truncate uppercase tracking-wide">{roleLabel}</p>
              </div>
            </div>

            {/* User Dropdown Menu */}
            {!isCollapsed && isUserMenuOpen && (
                <div className="absolute bottom-full left-0 mb-3 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50">
                    <button onClick={() => setIsPrivacyOpen(true)} className="w-full text-left px-4 py-3 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2">
                        <Shield size={14} /> {t('common.privacy')}
                    </button>
                    <div className="h-px bg-slate-700" />
                    <button onClick={logout} className="w-full text-left px-4 py-3 text-xs font-medium text-red-400 hover:bg-red-900/20 flex items-center gap-2">
                        <LogOut size={14} /> {t('common.logout')}
                    </button>
                </div>
            )}
            
            {/* Settings Icon (Visible if collapsed) */}
            {isCollapsed && (
                <div className="p-2 text-slate-400 hover:text-white transition-colors absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
                    <Settings size={16} />
                </div>
            )}
          </div>

           {/* Explicit Logout for Collapsed State */}
           {isCollapsed && (
             <button 
                onClick={logout}
                className="mt-3 w-full flex justify-center items-center py-2 text-slate-500 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors group relative"
            >
                <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50 w-full min-w-0">
        
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-slate-900 text-white flex items-center justify-between px-4 shadow-md z-20 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-blue-400" />
            <span className="font-bold">Aços Vital</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 active:scale-95 transition-transform">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
           <div className="md:hidden absolute inset-0 bg-slate-900/95 z-50 p-6 flex flex-col animate-in fade-in slide-in-from-top-5 duration-200">
              <div className="flex justify-between items-center mb-8">
                 <span className="text-xl font-bold text-white">{t('menu.main')}</span>
                 <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} className="text-white"/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-8">
                {menuSections.map((section, idx) => (
                    <div key={idx} className="space-y-2">
                        {section.title && <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{section.title}</div>}
                        {section.items.map((item) => (
                          <Link
                            key={item.label}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-4 px-4 py-4 text-lg font-medium rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent hover:border-slate-700"
                          >
                            <item.icon size={24} />
                            {item.label}
                          </Link>
                        ))}
                    </div>
                ))}
              </div>

               {/* Mobile Language Switcher */}
               <div className="flex bg-slate-800 rounded-lg p-2 mb-4">
                     {['pt', 'en', 'es'].map(lang => (
                         <button 
                            key={lang}
                            onClick={() => changeLanguage(lang)}
                            className={`flex-1 text-sm font-bold uppercase py-2 rounded transition-colors ${i18n.language === lang ? 'bg-slate-600 text-white' : 'text-slate-500 hover:text-white'}`}
                         >
                             {lang}
                         </button>
                     ))}
               </div>

              <div className="mt-auto pt-6 border-t border-slate-800 space-y-3">
                 <button
                    onClick={() => { setIsPrivacyOpen(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium w-full text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl"
                 >
                    <Shield size={20} /> {t('common.privacy')}
                 </button>
                 <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium w-full text-red-400 hover:bg-red-900/20 rounded-xl"
                >
                  <LogOut size={20} /> {t('common.logout')}
                </button>
              </div>
           </div>
        )}

        {/* Desktop Topbar */}
        <header className="hidden md:flex h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-40 shrink-0 transition-all">
            {/* Context/Breadcrumb Area */}
            <div className="flex flex-col justify-center animate-in fade-in slide-in-from-left-2 duration-300">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Portal Aços Vital</span>
                    <span className="text-slate-300">/</span>
                    <span className="font-medium text-blue-600 flex items-center gap-1">
                        {user?.role === UserRole.CLIENT && <FileBadge size={12}/>}
                        {roleLabel}
                    </span>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                {/* Global Search */}
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder={t('common.search')}
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 group-focus-within:w-80"
                    />
                </div>

                <div className="h-8 w-px bg-slate-200" />
                
                {/* Language Switcher (Top Header) */}
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

                {/* NOTIFICATION CENTER */}
                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className={`relative p-2 rounded-lg transition-colors ${isNotifOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-blue-600'}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>

                    {/* Dropdown Panel */}
                    {isNotifOpen && (
                        <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800">Notificações</h3>
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={handleMarkAllRead}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                        <Check size={14} /> Marcar todas como lidas
                                    </button>
                                )}
                            </div>
                            
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                                        <Bell size={32} className="mb-2 opacity-20" />
                                        <p className="text-sm">Nenhuma notificação nova.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {notifications.map(notif => (
                                            <div 
                                                key={notif.id}
                                                onClick={() => handleMarkAsRead(notif.id, notif.link)}
                                                className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer relative group ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                                            >
                                                {!notif.isRead && (
                                                    <div className="absolute left-2 top-6 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                )}
                                                <div className="flex gap-3 pl-2">
                                                    <div className="mt-1 flex-shrink-0">
                                                        {getNotifIcon(notif.type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                                                            {notif.title}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                            {notif.message}
                                                        </p>
                                                        <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                                                            {notif.timestamp}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 custom-scrollbar">
            {/* Added animation wrapper for content changes */}
            <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10 min-h-full">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
};
