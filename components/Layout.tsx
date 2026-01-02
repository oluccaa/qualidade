import React, { useState } from 'react';
import { useAuth } from '../services/authContext.tsx';
import { 
  LogOut, 
  LayoutDashboard, 
  FolderOpen, 
  Settings, 
  ShieldCheck,
  User as UserIcon,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  HelpCircle,
  Briefcase,
  Clock,
  Star,
  FileText
} from 'lucide-react';
import { UserRole } from '../types.ts';
import { useLocation, Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const roleLabel = {
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.QUALITY]: 'Analista de Qualidade',
    [UserRole.CLIENT]: 'Cliente Parceiro'
  }[user?.role || UserRole.CLIENT];

  const menuItems = [
    // Client Specific Menu
    ...(user?.role === UserRole.CLIENT ? [
      { label: 'Visão Geral', icon: LayoutDashboard, path: '/dashboard' },
      { label: 'Todos os Arquivos', icon: FolderOpen, path: '/dashboard?view=files' }, // Visual alias
      { label: 'Recentes', icon: Clock, path: '/dashboard?view=recent' }, // Visual alias
      { label: 'Favoritos', icon: Star, path: '/dashboard?view=favorites' } // Visual alias
    ] : []),
    
    // Quality Specific Menu
    ...(user?.role === UserRole.QUALITY ? [
      { label: 'Gestão de Documentos', icon: FolderOpen, path: '/quality' },
      { label: 'Dashboard Operacional', icon: LayoutDashboard, path: '/dashboard' }
    ] : []),
    
    // Admin Specific Menu
    ...(user?.role === UserRole.ADMIN ? [
      { label: 'Painel Geral', icon: LayoutDashboard, path: '/admin' },
      { label: 'Gestão de Arquivos', icon: FolderOpen, path: '/quality' },
      { label: 'Configurações', icon: Settings, path: '/settings' }
    ] : [])
  ];

  const isActive = (path: string) => {
      // Simple match for demo purposes
      if (path.includes('?')) return location.search.includes(path.split('?')[1]);
      return location.pathname === path && location.search === '';
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className={`
        hidden md:flex flex-col w-72 
        bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 
        text-slate-300 shadow-2xl transition-all z-30
      `}>
        {/* Brand Area */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-2.5 rounded-xl shadow-lg shadow-blue-900/20">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white tracking-tight leading-none">Aços Vital</span>
              <span className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold mt-1">Portal da Qualidade</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Navegação</div>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`
                  group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${active 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 translate-x-1' 
                    : 'hover:bg-slate-800 hover:text-white hover:translate-x-1'}
                `}
              >
                <item.icon size={20} className={`transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {item.label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
              </Link>
            );
          })}

          {/* Secondary Links */}
          <div className="px-4 mt-8 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Suporte</div>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all hover:translate-x-1">
              <Briefcase size={20} /> <span className="flex-1 text-left">Falar com Comercial</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all hover:translate-x-1">
              <HelpCircle size={20} /> <span className="flex-1 text-left">Ajuda Técnica</span>
          </button>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/30">
          <div className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 border border-slate-700/50 hover:border-slate-600 transition-colors group cursor-pointer relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold shadow-inner">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate group-hover:text-blue-200 transition-colors">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{roleLabel}</p>
            </div>
            <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" 
                title="Sair"
            >
                <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-slate-900 text-white flex items-center justify-between px-4 shadow-md z-20">
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
                 <span className="text-xl font-bold text-white">Menu</span>
                 <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} className="text-white"/></button>
              </div>
              <div className="space-y-2">
                {menuItems.map((item) => (
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
              <div className="mt-auto">
                 <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-4 text-lg font-medium w-full text-red-400 hover:bg-red-900/20 rounded-xl"
                >
                  <LogOut size={24} /> Sair do Sistema
                </button>
              </div>
           </div>
        )}

        {/* Desktop Topbar */}
        <header className="hidden md:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-10">
            {/* Context/Breadcrumb Area */}
            <div className="flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>Portal</span>
                    <span className="text-slate-300">/</span>
                    <span className="font-medium text-blue-600">{roleLabel}</span>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                {/* Global Search */}
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Pesquisar em todo o portal..." 
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">⌘K</span>
                    </div>
                </div>

                <div className="h-8 w-px bg-slate-200" />

                <button className="relative p-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-auto bg-slate-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
};