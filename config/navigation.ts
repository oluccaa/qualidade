
import { 
  Home, 
  Library, 
  Star, 
  History, 
  ShieldCheck, 
  Users, 
  Activity, 
  LogOut,
  Lock,
  FileText,
  LayoutDashboard,
  ShieldAlert,
  Clock,
  Settings, 
  BarChart3, 
  Bell 
} from 'lucide-react';
import { User, UserRole, normalizeRole } from '../types/index.ts';

export interface NavItem {
  label: string;
  path: string;
  icon: any;
  exact?: boolean;
  subItems?: NavItem[]; 
  onClick?: () => void; 
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

const getAdminNavigation = (t: any): NavSection[] => [
  {
    title: t('menu.sections.operational'),
    items: [
      { label: "Command Center", path: '/admin/dashboard', icon: LayoutDashboard, exact: true },
      { label: t('admin.tabs.users'), path: '/admin?tab=users', icon: Users },
    ]
  },
  {
    title: t('menu.sections.governance'),
    items: [
      { label: t('admin.tabs.logs'), path: '/admin?tab=logs', icon: ShieldAlert },
      { label: t('admin.tabs.settings'), path: '/admin?tab=settings', icon: ShieldCheck },
    ]
  }
];

const getQualityNavigation = (t: any): NavSection[] => [
  {
    title: t('menu.sections.operational'),
    items: [
      { label: t('quality.overview'), path: '/quality/dashboard', icon: Activity, exact: true },
    ]
  },
  {
    title: t('menu.sections.governance'),
    items: [
      { label: t('quality.myAuditLog'), path: '/quality?view=audit-log', icon: FileText }
    ]
  }
];

export const getClientSidebarMenuConfig = (t: any): NavSection[] => [
  {
    title: t('menu.sections.main'),
    items: [
      { label: t('menu.dashboard'), path: '/client/dashboard', icon: LayoutDashboard, exact: true },
    ]
  },
  {
    title: t('menu.sections.documents'),
    items: [
      {
        label: t('menu.certificates'), 
        icon: Library,
        path: '/client/dashboard?view=files', 
        subItems: [
          { label: t('menu.library'), path: '/client/dashboard?view=files', icon: Library, exact: false },
        ],
      },
    ]
  },
];


export const getMenuConfig = (user: User | null, t: any): NavSection[] => {
  if (!user) return [];
  const role = normalizeRole(user.role);
  const navigationMap: Record<UserRole, (t: any) => NavSection[]> = {
    [UserRole.ADMIN]: getAdminNavigation,
    [UserRole.QUALITY]: getQualityNavigation,
    [UserRole.CLIENT]: getClientSidebarMenuConfig, 
  };
  return navigationMap[role]?.(t) || [];
};

export const getBottomNavItems = (user: User | null, t: any): NavItem[] => {
  if (!user) return [];
  const role = normalizeRole(user.role);

  if (role === UserRole.ADMIN) {
    return [
      { label: "Dash", path: '/admin/dashboard', icon: LayoutDashboard, exact: true },
      { label: t('admin.tabs.users'), path: '/admin?tab=users', icon: Users },
      { label: t('admin.tabs.logs'), path: '/admin?tab=logs', icon: ShieldAlert },
    ];
  }

  if (role === UserRole.CLIENT) {
    return []; 
  }
  
  return [
      { label: t('quality.overview'), path: '/quality/dashboard', icon: Activity, exact: true },
      { label: "Auditoria", path: '/quality?view=audit-log', icon: FileText },
  ];
};

export const getUserMenuItems = (t: any, hooks: { onLogout: () => void, onNavigateToSettings: () => void }) => [
  { label: t('menu.settings'), icon: Settings, onClick: hooks.onNavigateToSettings },
  { label: t('common.logout'), icon: LogOut, onClick: hooks.onLogout },
];
