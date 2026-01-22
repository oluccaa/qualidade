
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext.tsx';
import { SidebarQuality } from './SidebarQuality.tsx';
import { SidebarAdmin } from './SidebarAdmin.tsx';
import { SidebarClient } from './SidebarClient.tsx';
import { Header } from './Header.tsx';
import { MobileNavigation } from './MobileNavigation.tsx';
import { CookieBanner } from '../common/CookieBanner.tsx';
import { MaintenanceBanner } from '../common/MaintenanceBanner.tsx';
import { useLayoutState } from './hooks/useLayoutState.ts';
import { useSystemSync } from './hooks/useSystemSync.ts';
import { UserRole, normalizeRole } from '../../types/index.ts';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout, systemStatus: authSystemStatus } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const role = normalizeRole(user?.role);

  const layout = useLayoutState();
  const system = useSystemSync(user, authSystemStatus);

  const handleNavigateBack = () => {
    navigate(-1);
  };

  const handleNavigateToSettingsPage = () => {
    navigate('/settings');
  };

  const commonSidebarProps = {
    user,
    role,
    isCollapsed: layout.sidebarCollapsed,
    onToggle: layout.toggleSidebar,
    onLogout: logout,
    onNavigateToSettings: handleNavigateToSettingsPage,
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      <a href="#main-content" className="skip-link">{t('common.skipToContent') || 'Pular para o conteúdo'}</a>
      <CookieBanner />

      <aside aria-label="Navegação Lateral Principal" className="shrink-0 h-full">
        {role === UserRole.ADMIN && <SidebarAdmin {...commonSidebarProps} />}
        {role === UserRole.QUALITY && <SidebarQuality {...commonSidebarProps} />}
        {role === UserRole.CLIENT && <SidebarClient {...commonSidebarProps} />}
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div role="status" aria-live="polite" className="shrink-0">
          <MaintenanceBanner status={system.status} isAdmin={role === UserRole.ADMIN} />
        </div>
        
        <Header 
          title={title} 
          user={user} 
          role={role} 
          unreadCount={system.unreadCount} 
          onLogout={logout}
          onOpenMobileMenu={layout.openMobileMenu} 
          onNavigateBack={handleNavigateBack}
        />

        <main 
          id="main-content"
          role="main"
          className="flex-1 flex flex-col min-h-0 bg-transparent p-4 md:p-6 lg:p-8 relative overflow-y-auto custom-scrollbar"
          aria-label={title}
        >
          {/* h-full removido para evitar colapso; flex-1 garante que o conteúdo tome o máximo de altura possível */}
          <div className="w-full flex-1 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-3 duration-700 min-h-full">
            {children}
          </div>
        </main>

        <MobileNavigation 
          user={user}
          userRole={role}
          isMenuOpen={layout.mobileMenuOpen}
          onCloseMenu={layout.closeMobileMenu}
          onLogout={logout}
          onNavigateToSettings={handleNavigateToSettingsPage} 
        />
      </div>
    </div>
  );
};
