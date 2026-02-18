'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Loading from '@/components/ui/loading';

interface DashboardGuardProps {
  children: React.ReactNode;
}

/**
 * DashboardGuard Component
 * Protects dashboard routes from unauthenticated access
 * Redirects non-authenticated users to login page
 */
export function DashboardGuard({ children }: DashboardGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const hasRedirected = useRef(false);
  const isWaitingForRefresh = useRef(false);

  useEffect(() => {
    // CRITICAL: Never redirect while isLoading (handoff doc)
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      // If we have a refreshToken, give axios interceptor time to refresh before redirecting
      if (refreshToken && !isWaitingForRefresh.current) {
        isWaitingForRefresh.current = true;

        const refreshTimer = setTimeout(() => {
          const currentState = useAuthStore.getState();
          if (!currentState.isAuthenticated && !hasRedirected.current) {
            hasRedirected.current = true;
            const returnUrl = encodeURIComponent(pathname);
            router.replace(`/login?redirect=${returnUrl}&reason=auth_required`);
          } else if (currentState.isAuthenticated) {
            isWaitingForRefresh.current = false;
          }
        }, 2000);

        return () => clearTimeout(refreshTimer);
      } else if (!refreshToken) {
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          const returnUrl = encodeURIComponent(pathname);
          router.replace(`/login?redirect=${returnUrl}&reason=auth_required`);
        }
      }
    } else {
      hasRedirected.current = false;
      isWaitingForRefresh.current = false;
    }
    return;
  }, [isAuthenticated, hasHydrated, refreshToken, router, pathname]);

  // Show loading while checking authentication
  if (!hasHydrated) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Loading label="Loading..." />
      </div>
    );
  }

  // Show loading while attempting token refresh
  if (
    hasHydrated &&
    !isAuthenticated &&
    refreshToken &&
    isWaitingForRefresh.current
  ) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Loading label="Refreshing session..." />
      </div>
    );
  }

  // Show loading while redirecting (only after hydration and no refresh attempt)
  if (hasHydrated && !isAuthenticated && !refreshToken) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Loading label="Checking authentication..." />
      </div>
    );
  }

  // User is authenticated - render children
  return <>{children}</>;
}
