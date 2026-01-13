import { 
  Home, 
  Library, 
  Star, 
  History, 
  ShieldCheck, 
  Building2, 
  Users, 
  Activity, 
  Settings,
  LogOut,
  Lock,
  FileText,
  LayoutDashboard,
  ShieldAlert
} from 'lucide-react';
import { User, UserRole, normalizeRole } from '../types/index.ts';

export const getMenuConfig = (user: User | null, t: any) => {
  if (!user) return [];

  const sections = [];
  const role = normalizeRole(user.role);

  // MÓDULO OPERACIONAL
  const mainItems = [];
  if (role === UserRole.ADMIN) {
    mainItems.push({ label: "Command Center", path: '/admin/dashboard', icon: LayoutDashboard, exact: true });
    mainItems.push({ label: "Base de Usuários", path: '/admin?tab=users', icon: Users });
    mainItems.push({ label: "Portfólio B2B", path: '/admin?tab=clients', icon: Building2 });
  } else if (role === UserRole.QUALITY) {
    mainItems.push({ label: t('quality.overview'), path: '/quality/dashboard', icon: Activity, exact: true });
    mainItems.push({ label: t('quality.b2bPortfolio'), path: '/quality?view=clients', icon: Building2 });
  } else if (role === UserRole.CLIENT) {
    mainItems.push({ label: t('menu.home'), path: '/client/dashboard', icon: Home, exact: true });
    mainItems.push({ label: t('menu.library'), path: '/client/dashboard?view=files', icon: Library });
  }
  
  sections.push({ title: "OPERACIONAL", items: mainItems });

  // MÓDULO DE GOVERNANÇA (ADMIN EXCLUSIVO)
  if (role === UserRole.ADMIN) {
    sections.push({
      title: "GOVERNANÇA",
      items: [
        { label: "Logs de Auditoria", path: '/admin?tab=logs', icon: ShieldAlert },
        { label: "Painel de Segurança", path: '/admin?tab=settings', icon: ShieldCheck },
      ]
    });
  } else if (role === UserRole.QUALITY) {
    sections.push({
      title: "GOVERNANÇA",
      items: [
        { label: t('quality.myAuditLog'), path: '/quality?view=audit-log', icon: FileText }
      ]
    });
  }

  // ACESSO RÁPIDO (CLIENTE)
  if (role === UserRole.CLIENT) {
    sections.push({
      title: t('menu.quickAccess'),
      items: [
        { label: t('menu.favorites'), path: '/client/dashboard?view=favorites', icon: Star },
        { label: t('menu.recent'), path: '/client/dashboard?view=recent', icon: History },
      ]
    });
  }

  return sections;
};

export const getBottomNavItems = (user: User | null, t: any) => {
  if (!user) return [];
  const role = normalizeRole(user.role);

  if (role === UserRole.ADMIN) {
    return [
      { label: "Dash", path: '/admin/dashboard', icon: LayoutDashboard, exact: true },
      { label: "Usuários", path: '/admin?tab=users', icon: Users },
      { label: "Logs", path: '/admin?tab=logs', icon: ShieldAlert },
    ];
  }
  
  if (role === UserRole.QUALITY) {
    return [
        { label: "Resumo", path: '/quality/dashboard', icon: Activity, exact: true },
        { label: "Clientes", path: '/quality?view=clients', icon: Building2 },
        { label: "Auditoria", path: '/quality?view=audit-log', icon: FileText },
    ];
  }

  return [
    { label: t('menu.home'), path: '/client/dashboard', icon: Home, exact: true },
    { label: t('menu.library'), path: '/client/dashboard?view=files', icon: Library },
    { label: t('menu.favorites'), path: '/client/dashboard?view=favorites', icon: Star },
  ];
};

export const getUserMenuItems = (t: any, hooks: { onLogout: () => void, onOpenChangePassword: () => void, onOpenPrivacy: () => void }) => [
  { label: t('common.changePassword'), icon: Lock, onClick: hooks.onOpenChangePassword },
  { label: t('common.privacy'), icon: ShieldCheck, onClick: hooks.onOpenPrivacy },
  { label: t('common.logout'), icon: LogOut, onClick: hooks.onLogout },
];