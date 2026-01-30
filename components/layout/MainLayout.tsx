
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext.tsx';
import { useLayoutState } from './hooks/useLayoutState.ts';
import { useSystemSync } from './hooks/useSystemSync.ts';
import { UserRole, normalizeRole } from '../../types/index.ts';

// Components
import { SidebarQuality } from './SidebarQuality.tsx';
import { SidebarAdmin } from './SidebarAdmin.tsx';
import { SidebarClient } from './SidebarClient.tsx';
import { TopNavigation } from './TopNavigation.tsx';
import { MobileNavigation } from './MobileNavigation.tsx';
import { CookieBanner } from '../common/CookieBanner.tsx';
import { MaintenanceBanner } from '../common/MaintenanceBanner.tsx';
import { ClientDock } from './ClientDock.tsx';

// --- Types ---

interface ClientNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  clientNav?: ClientNavProps;
}

// --- Sidebar Factory ---

const SIDEBAR_REGISTRY = {
  [UserRole.ADMIN]: SidebarAdmin,
  [UserRole.QUALITY]: SidebarQuality,
  [UserRole.CLIENT]: SidebarClient,
};

export const Layout: React.FC<AppLayoutProps> = ({ children, title, clientNav }) => {
  const { user, logout, systemStatus: authSystemStatus } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const role = normalizeRole(user?.role);
  const layout = useLayoutState();
  const system = useSystemSync(user, authSystemStatus);

  const SidebarComponent = SIDEBAR_REGISTRY[role] || SidebarClient;

  const handleNavigateToSettings = () => navigate('/settings');

  const commonSidebarProps = {
    user,
    role,
    isCollapsed: layout.sidebarCollapsed,
    onToggle: layout.toggleSidebar,
    onLogout: logout,
    onNavigateToSettings: handleNavigateToSettings,
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      <a href="#main-content" className="skip-link">
        {t('common.skipToContent') || 'Pular para conteúdo'}
      </a>
      
      <CookieBanner />

      {/* Sidebar Desktop */}
      <aside aria-label="Navegação Principal" className="shrink-0 h-full z-50 hidden md:block">
        <SidebarComponent {...commonSidebarProps} />
      </aside>

      {/* Área de Conteúdo - Flex Coluna Total */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        
        {/* Banner de Manutenção (Topo) */}
        <div role="status" aria-live="polite" className="shrink-0 z-50">
          <MaintenanceBanner status={system.status} isAdmin={role === UserRole.ADMIN} />
        </div>
        
        {/* Main: Ocupa o restante da tela, mas NÃO rola. A View interna decidirá o scroll. */}
        <main 
          id="main-content"
          role="main"
          className="flex-1 flex flex-col min-h-0 bg-slate-50 relative overflow-hidden"
          aria-label={title}
        >
          {/* Header Superior (Sticky/Static) */}
          <TopNavigation />

          {/* 
             CONTAINER DE CONTEÚDO:
             Removido paddings pb-24 e md:pb-8 que causavam o espaço branco no fundo.
             Agora o children (a view) tem controle total da altura.
          */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {children}
          </div>
        </main>

        {/* Navegação Mobile */}
        <MobileNavigation 
          user={user}
          userRole={role}
          isMenuOpen={layout.mobileMenuOpen}
          onCloseMenu={layout.closeMobileMenu}
          onLogout={logout}
          onNavigateToSettings={handleNavigateToSettings} 
        />

        {role === UserRole.CLIENT && clientNav && (
          <ClientDock 
            activeView={clientNav.activeView} 
            onViewChange={clientNav.onViewChange}
          />
        )}
      </div>
    </div>
  );
};
