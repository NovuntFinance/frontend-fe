import type { ReactNode } from 'react';

export type AdminMenuItemId =
  | 'overview'
  | 'users'
  | 'transactions'
  | 'analytics'
  | 'daily-declaration-returns'
  | 'support'
  | 'settings';

export interface AdminMenuItem {
  id: AdminMenuItemId;
  name: string;
  path: string;
  /**
   * Permission key(s) required to see/access this section.
   * When multiple keys are provided, treat as OR (any is enough).
   */
  requiredPermissions?: string | string[];
  /**
   * Sidebar icon renderer. Optional so other callers (e.g. route guards)
   * don't have to care about UI concerns.
   */
  icon?: (className: string) => ReactNode;
}

export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    id: 'overview',
    name: 'Overview',
    path: '/admin/overview',
  },
  {
    id: 'users',
    name: 'Users',
    path: '/admin/users',
    requiredPermissions: 'users.view',
  },
  {
    id: 'transactions',
    name: 'Transactions',
    path: '/admin/transactions',
    // Support both new and legacy permission keys
    requiredPermissions: ['transactions.view', 'transactions.read'],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    path: '/admin/analytics',
    requiredPermissions: 'analytics.view',
  },
  {
    id: 'daily-declaration-returns',
    name: 'Daily Declaration Returns',
    path: '/admin/daily-declaration-returns',
    requiredPermissions: 'financial.declare',
  },
  {
    id: 'support',
    name: 'Support',
    path: '/admin/support',
    requiredPermissions: 'tickets.view',
  },
  {
    id: 'settings',
    name: 'Settings',
    path: '/admin/settings',
    requiredPermissions: 'settings.view',
  },
];

/**
 * Find the matching admin menu item for a given pathname.
 * This keeps route guards and navigation in sync.
 */
export function getAdminMenuItemForPath(
  pathname: string
): AdminMenuItem | undefined {
  return ADMIN_MENU_ITEMS.find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`)
  );
}
