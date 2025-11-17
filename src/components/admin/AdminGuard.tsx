'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Loading from '@/components/ui/loading';
import { useAuthStore } from '@/store/authStore';

type GuardStatus = 'checking' | 'allowed' | 'redirecting';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const [status, setStatus] = useState<GuardStatus>('checking');

  const redirectTarget = useMemo(() => {
    if (!isAuthenticated) {
      return `/login?redirect=${encodeURIComponent(pathname)}`;
    }

    if (!isAdmin) {
      return '/dashboard';
    }

    return null;
  }, [isAuthenticated, isAdmin, pathname]);

  useEffect(() => {
    if (!hasHydrated || status !== 'checking') {
      return;
    }

    if (redirectTarget) {
      setStatus('redirecting');
      router.replace(redirectTarget);
      return;
    }

    setStatus('allowed');
  }, [hasHydrated, redirectTarget, router, status]);

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
