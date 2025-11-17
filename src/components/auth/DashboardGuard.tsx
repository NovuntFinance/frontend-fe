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
  const hasRedirected = useRef(false);

  useEffect(() => {
    console.log('[DashboardGuard] Auth check:', { 
      hasHydrated, 
      isAuthenticated, 
      hasUser: !!user, 
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 30) + '...' : 'null',
      pathname 
    });
    
    // Wait for store to hydrate before checking auth
    if (!hasHydrated) {
      console.log('[DashboardGuard] Waiting for hydration...');
      return;
    }

    // Check if user is authenticated
    // Only check isAuthenticated flag - middleware handles token validation
    if (!isAuthenticated) {
      console.log('[DashboardGuard] Not authenticated, redirecting to login');
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        // Redirect to login with return URL
        const returnUrl = encodeURIComponent(pathname);
        router.replace(`/login?redirect=${returnUrl}&reason=auth_required`);
      }
    } else {
      console.log('[DashboardGuard] Authenticated! User:', user?.email);
      hasRedirected.current = false;
    }
  }, [isAuthenticated, hasHydrated, user, token, router, pathname]);

  // Show loading while checking authentication
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loading label="Loading..." />
      </div>
    );
  }

  // Show loading while redirecting (only after hydration)
  if (hasHydrated && !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loading label="Checking authentication..." />
      </div>
    );
  }

  // User is authenticated - render children
  return <>{children}</>;
}

