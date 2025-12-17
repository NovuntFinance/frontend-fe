import { Permission } from '@/services/rbacService';

export interface GroupedPermissions {
  [category: string]: Permission[];
}

/**
 * Group permissions by category for better UI organization
 */
export function groupPermissionsByCategory(
  permissions: Permission[]
): GroupedPermissions {
  return permissions.reduce((acc, perm) => {
    const category = perm.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(perm);
    return acc;
  }, {} as GroupedPermissions);
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    user: 'User Management',
    transaction: 'Transaction Management',
    settings: 'Settings Management',
    admin: 'Admin Management',
    financial: 'Financial Operations',
    security: 'Security & Monitoring',
    system: 'System Operations',
    other: 'Other',
  };
  return (
    names[category] || category.charAt(0).toUpperCase() + category.slice(1)
  );
}
