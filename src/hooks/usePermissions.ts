import { useState, useEffect } from 'react';
import { rbacService } from '@/services/rbacService';
import { adminAuthService } from '@/services/adminAuthService';

interface UsePermissionsResult {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  role: string | null;
}

export function usePermissions(): UsePermissionsResult {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const admin = adminAuthService.getCurrentAdmin();
      if (!admin) {
        setPermissions([]);
        setRole(null);
        return;
      }

      // Super admins have all permissions
      if (admin.role === 'superAdmin') {
        // Fetch all permissions to get the list
        try {
          const allPermsResponse = await rbacService.getAllPermissions();
          const allKeys = allPermsResponse.data.map((p) => p.key);
          setPermissions(allKeys);
          setRole('superAdmin');
        } catch {
          // If we can't fetch all permissions, just mark as super admin
          // Super admin bypasses permission checks anyway
          setPermissions(['*']); // Special marker for "all permissions"
          setRole('superAdmin');
        }
      } else {
        const response = await rbacService.getUserPermissions();
        setPermissions(response.data.permissions);
        setRole(response.data.role.name);
      }
    } catch (err: any) {
      setError(err);
      setPermissions([]);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const hasPermission = (permission: string): boolean => {
    const admin = adminAuthService.getCurrentAdmin();
    if (admin?.role === 'superAdmin') return true;
    if (permissions.includes('*')) return true; // Super admin marker
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: string[]): boolean => {
    const admin = adminAuthService.getCurrentAdmin();
    if (admin?.role === 'superAdmin') return true;
    if (permissions.includes('*')) return true;
    return perms.some((p) => permissions.includes(p));
  };

  const hasAllPermissions = (perms: string[]): boolean => {
    const admin = adminAuthService.getCurrentAdmin();
    if (admin?.role === 'superAdmin') return true;
    if (permissions.includes('*')) return true;
    return perms.every((p) => permissions.includes(p));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loading,
    error,
    refresh: fetchPermissions,
    role,
  };
}
