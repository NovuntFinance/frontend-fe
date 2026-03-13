'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Loading from '@/components/ui/loading';
import { adminAuthService } from '@/services/adminAuthService';
import { usePermissions } from '@/hooks/usePermissions';
import { getAdminMenuItemForPath } from '@/components/admin/adminMenuConfig';

type GuardStatus = 'checking' | 'allowed' | 'redirecting';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<GuardStatus>('checking');
  const { role, can, loading: permissionsLoading } = usePermissions();
  const isSupportAgent = role === 'support_agent';

  useEffect(() => {
    // Check admin authentication
    const admin = adminAuthService.getCurrentAdmin();
    const isAuthenticated = adminAuthService.isAuthenticated();
    const token = adminAuthService.getToken();

    // Auth check (no sensitive data logged)

    if (!isAuthenticated || !admin) {
      // Not authenticated as admin - redirect to admin login
      console.log('[AdminGuard] Not authenticated, redirecting to login');
      setStatus('redirecting');
      router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Admin is authenticated - allow access
    console.log('[AdminGuard] Authenticated, allowing access');
    setStatus('allowed');
  }, [router, pathname]);

  // Still checking auth or permissions
  if (status !== 'allowed' || permissionsLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 transition-colors dark:bg-gray-900">
        <Loading label="Checking admin access…" />
      </div>
    );
  }

  // Special behavior: support_agent is "Support-only admin"
  const isSupportRoute =
    pathname.startsWith('/admin/support') || pathname === '/admin';

  if (isSupportAgent && !isSupportRoute) {
    // Either redirect to support dashboard or show 403-style message
    router.replace('/admin/support');
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 transition-colors dark:bg-gray-900">
        <Loading label="Redirecting to Support…" />
      </div>
    );
  }

  // Permission-driven guard for other roles using centralized menu config
  const menuItem = getAdminMenuItemForPath(pathname);
  if (menuItem?.requiredPermissions && !can(menuItem.requiredPermissions)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 transition-colors dark:bg-gray-900">
        <div className="max-w-md rounded-lg bg-white p-6 text-center shadow dark:bg-gray-800">
          <h1 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Not authorized
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            You don&apos;t have permission to access this admin section.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
