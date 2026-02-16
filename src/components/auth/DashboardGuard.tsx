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
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const hasRedirected = useRef(false);
  const isWaitingForRefresh = useRef(false);

  useEffect(() => {
    // Auth check (no sensitive data logged)

    // Wait for store to hydrate before checking auth
    if (!hasHydrated) {
      console.log('[DashboardGuard] Waiting for hydration...');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      // If we have a refreshToken, give axios interceptor time to refresh before redirecting
      if (refreshToken && !isWaitingForRefresh.current) {
        console.log('[DashboardGuard] Not authenticated but refreshToken exists - waiting for token refresh...');
        isWaitingForRefresh.current = true;
        
        // Wait 2 seconds for token refresh attempt
        const refreshTimer = setTimeout(() => {
          const currentState = useAuthStore.getState();
          if (!currentState.isAuthenticated && !hasRedirected.current) {
            console.log('[DashboardGuard] Token refresh failed or timed out - redirecting to login');
            hasRedirected.current = true;
            const returnUrl = encodeURIComponent(pathname);
            router.replace(`/login?redirect=${returnUrl}&reason=auth_required`);
          } else if (currentState.isAuthenticated) {
            console.log('[DashboardGuard] Token refresh succeeded!');
            isWaitingForRefresh.current = false;
          }
        }, 2000);
        
        return () => clearTimeout(refreshTimer);
      } else if (!refreshToken) {
        // No refreshToken and not authenticated - redirect immediately
        console.log('[DashboardGuard] Not authenticated and no refreshToken - redirecting to login');
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          const returnUrl = encodeURIComponent(pathname);
          router.replace(`/login?redirect=${returnUrl}&reason=auth_required`);
        }
      }
    } else {
      console.log('[DashboardGuard] Authenticated! User:', user?.email);
      hasRedirected.current = false;
      isWaitingForRefresh.current = false;
    }
  }, [isAuthenticated, hasHydrated, user, token, refreshToken, router, pathname]);

  // Show loading while checking authentication
  if (!hasHydrated) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Loading label="Loading..." />
      </div>
    );
  }

  // Show loading while attempting token refresh
  if (hasHydrated && !isAuthenticated && refreshToken && isWaitingForRefresh.current) {
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
