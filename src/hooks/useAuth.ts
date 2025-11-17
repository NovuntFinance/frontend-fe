/**
 * useAuth Hook
 * Centralized authentication logic and state
 */

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
    hasRole,
    isAdmin,
    isVerified,
  } = useAuthStore();
  
  /**
   * NOTE: User data comes from login response and is stored in authStore.
   * No need to fetch profile separately - the backend doesn't have /auth/profile endpoint.
   * User data is already available from authStore after successful login.
   */
  
  // Redirect to login if not authenticated
  const requireAuth = (redirectTo = '/login') => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
      return false;
    }
    return true;
  };
  
  // Redirect to dashboard if already authenticated
  const requireGuest = (redirectTo = '/dashboard') => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
      return false;
    }
    return true;
  };
  
  // Require specific role
  const requireRole = (role: string | string[], redirectTo = '/dashboard') => {
    if (!isLoading && !hasRole(role)) {
      router.push(redirectTo);
      return false;
    }
    return true;
  };
  
  // Require admin
  const requireAdmin = (redirectTo = '/dashboard') => {
    if (!isLoading && !isAdmin()) {
      router.push(redirectTo);
      return false;
    }
    return true;
  };
  
  // Require email verification
  const requireVerification = (redirectTo = '/verify-email') => {
    if (!isLoading && !isVerified()) {
      router.push(redirectTo);
      return false;
    }
    return true;
  };
  
  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    hasRole,
    isAdmin: isAdmin(),
    isVerified: isVerified(),
    requireAuth,
    requireGuest,
    requireRole,
    requireAdmin,
    requireVerification,
  };
}
