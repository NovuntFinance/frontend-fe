'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Loading from '@/components/ui/loading';
import { adminAuthService } from '@/services/adminAuthService';

type GuardStatus = 'checking' | 'allowed' | 'redirecting';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<GuardStatus>('checking');

  useEffect(() => {
    // Check admin authentication
    const admin = adminAuthService.getCurrentAdmin();
    const isAuthenticated = adminAuthService.isAuthenticated();
    const token = adminAuthService.getToken();

    // Log auth check for debugging
    console.log('[AdminGuard] Auth check:', {
      pathname,
      isAuthenticated,
      hasAdmin: !!admin,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 30) + '...' : 'null',
      adminEmail: admin?.email,
    });

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

  if (status !== 'allowed') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 transition-colors dark:bg-gray-900">
        <Loading label="Checking admin access…" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
