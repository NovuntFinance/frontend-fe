/**
 * Authentication Store
 * Manages user authentication state, tokens, and auth-related actions
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/user';
import { tokenManager } from '@/lib/api';

const normalizeRole = (role?: string | null) =>
  role
    ?.toLowerCase()
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-\s_]/g, '') ?? '';

/** Cookie domain so session persists on both novunt.com and www.novunt.com */
function getAuthCookieDomain(): string {
  if (typeof window === 'undefined') return '';
  const h = window.location.hostname.toLowerCase();
  if (h === 'novunt.com' || h.endsWith('.novunt.com'))
    return '; domain=.novunt.com';
  return '';
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;

  // Actions
  setUser: (user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;

  // Helpers
  hasRole: (role: string | string[]) => boolean;
  isAdmin: () => boolean;
  isVerified: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      // Set user and mark as authenticated
      setUser: (user) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // Set authentication tokens. Never log tokens or expose to window.
      setTokens: (token, refreshToken) => {
        tokenManager.setToken(token);
        tokenManager.setRefreshToken(refreshToken);

        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          const maxAge = 7 * 24 * 60 * 60; // 7 days
          // CRITICAL: Secure flag required for HTTPS (production) - cookies without it may not persist
          const secureFlag =
            window.location?.protocol === 'https:' ? '; Secure' : '';
          const domain = getAuthCookieDomain();
          document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}${domain}`;
          document.cookie = `authToken=${token}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}${domain}`;
          document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}${domain}`;
        }

        set({
          token,
          refreshToken,
          isAuthenticated: true,
        });
      },

      // Update user data (partial update)
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },

      // Logout user and clear all auth data
      logout: () => {
        tokenManager.clearTokens();

        // Clear cookies (use same domain as set so they are actually removed)
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          const domain = getAuthCookieDomain();
          document.cookie = `auth_token=; path=/; max-age=0${domain}`;
          document.cookie = `authToken=; path=/; max-age=0${domain}`;
          document.cookie = `refreshToken=; path=/; max-age=0${domain}`;
        }

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Clear auth state (used for errors)
      clearAuth: () => {
        tokenManager.clearTokens();

        // Clear cookies (use same domain as set so they are actually removed)
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          const domain = getAuthCookieDomain();
          document.cookie = `auth_token=; path=/; max-age=0${domain}`;
          document.cookie = `authToken=; path=/; max-age=0${domain}`;
          document.cookie = `refreshToken=; path=/; max-age=0${domain}`;
        }

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Set loading state
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Set hydration state
      setHasHydrated: (hasHydrated) => {
        set({ _hasHydrated: hasHydrated });
      },

      // Check if user has specific role(s)
      hasRole: (role) => {
        const user = get().user;
        if (!user) return false;

        const userRole = normalizeRole(user.role);

        if (Array.isArray(role)) {
          return role.some(
            (candidate) => normalizeRole(candidate) === userRole
          );
        }

        return normalizeRole(role) === userRole;
      },

      // Check if user is admin
      isAdmin: () => {
        const user = get().user;
        const userRole = normalizeRole(user?.role);
        return userRole === 'admin' || userRole === 'superadmin';
      },

      // Check if user email is verified
      isVerified: () => {
        const user = get().user;
        return user?.emailVerified ?? false;
      },
    }),
    {
      name: 'novunt-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('[AuthStore] 🔄 Rehydrating auth state...');

        if (typeof window === 'undefined') {
          state?.setHasHydrated(true);
          return;
        }

        // Helper function to check if token is expired
        const isTokenExpired = (token: string): boolean => {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = Date.now() >= payload.exp * 1000;
            if (isExpired) {
              console.log(
                '[AuthStore] ⏰ Token expired at:',
                new Date(payload.exp * 1000).toISOString()
              );
            }
            return isExpired;
          } catch {
            console.log(
              '[AuthStore] ❌ Token decode failed - treating as expired'
            );
            return true;
          }
        };

        // Step 1: Check if tokens in state (from localStorage persistence) are expired
        if (state && state.token) {
          console.log('[AuthStore] Checking token from state/localStorage...');
          if (isTokenExpired(state.token)) {
            console.log('[AuthStore] ⚠️ AccessToken expired');

            // Check if we have a refreshToken
            if (state.refreshToken) {
              console.log(
                '[AuthStore] ✅ RefreshToken exists - keeping it for token refresh'
              );
              // Don't clear refreshToken! Keep it so axios interceptor can use it
              // Just clear the expired accessToken and set isAuthenticated=false temporarily
              state.token = null;
              state.isAuthenticated = false;

              // Clear only the expired accessToken from localStorage and cookies
              localStorage.removeItem('accessToken');
              const domainClear = getAuthCookieDomain();
              document.cookie = `auth_token=; path=/; max-age=0${domainClear}`;
              document.cookie = `authToken=; path=/; max-age=0${domainClear}`;

              // Keep refreshToken, user data - axios interceptor will attempt refresh
              console.log(
                '[AuthStore] Kept refreshToken for automatic refresh attempt'
              );
            } else {
              console.log(
                '[AuthStore] ❌ No refreshToken - clearing all auth data'
              );
              // No refreshToken means we can't refresh - clear everything
              state.token = null;
              state.refreshToken = null;
              state.user = null;
              state.isAuthenticated = false;

              // Clear localStorage completely
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');

              // Clear all cookies
              const domainClearAll = getAuthCookieDomain();
              document.cookie = `auth_token=; path=/; max-age=0${domainClearAll}`;
              document.cookie = `authToken=; path=/; max-age=0${domainClearAll}`;
              document.cookie = `refreshToken=; path=/; max-age=0${domainClearAll}`;
            }
          } else {
            console.log('[AuthStore] ✅ Token from state is valid');
            // CRITICAL: Sync token to cookies so middleware can read it
            // Middleware only reads cookies - without this, redirect loop occurs
            if (state.token && typeof document !== 'undefined') {
              const maxAge = 7 * 24 * 60 * 60;
              const secureFlag =
                typeof window !== 'undefined' &&
                window.location?.protocol === 'https:'
                  ? '; Secure'
                  : '';
              const domainSync = getAuthCookieDomain();
              document.cookie = `auth_token=${state.token}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}${domainSync}`;
              document.cookie = `authToken=${state.token}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}${domainSync}`;
              if (state.refreshToken) {
                document.cookie = `refreshToken=${state.refreshToken}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}${domainSync}`;
              }
              console.log(
                '[AuthStore] ✅ Synced token to cookies for middleware'
              );
            }
          }
        }

        // Step 2: If no token in state, check cookies as fallback
        if (state && !state.token) {
          console.log('[AuthStore] No token in state, checking cookies...');
          const cookies = document.cookie.split(';').reduce(
            (acc, cookie) => {
              const [key, value] = cookie.trim().split('=');
              acc[key] = value;
              return acc;
            },
            {} as Record<string, string>
          );

          const cookieToken = cookies['authToken'];
          const cookieRefreshToken = cookies['refreshToken'];

          if (cookieToken && cookieRefreshToken) {
            console.log(
              '[AuthStore] Found tokens in cookies, checking expiry...'
            );

            if (!isTokenExpired(cookieToken)) {
              console.log(
                '[AuthStore] ✅ Cookie token valid, restoring auth state'
              );
              try {
                const payload = JSON.parse(atob(cookieToken.split('.')[1]));

                localStorage.setItem('accessToken', cookieToken);
                localStorage.setItem('refreshToken', cookieRefreshToken);

                const user = {
                  _id: payload.userId,
                  id: payload.userId,
                  email: payload.email,
                  username: payload.username,
                  firstName: payload.fname || payload.username,
                  lastName: payload.lname || '',
                  fname: payload.fname || payload.username,
                  lname: payload.lname || '',
                  role: payload.role || 'user',
                  emailVerified: true,
                  isActive: true,
                };

                state.token = cookieToken;
                state.refreshToken = cookieRefreshToken;
                state.user = user as User;
                state.isAuthenticated = true;
              } catch (e) {
                console.error(
                  '[AuthStore] ❌ Error restoring from cookies:',
                  e
                );
              }
            } else {
              console.log('[AuthStore] ⚠️ Cookie accessToken expired');

              // Check if we have a refreshToken cookie
              if (cookieRefreshToken) {
                console.log(
                  '[AuthStore] ✅ Cookie refreshToken exists - keeping it for token refresh'
                );
                // Keep the refreshToken cookie, only clear expired accessToken
                const domainExpired = getAuthCookieDomain();
                document.cookie = `auth_token=; path=/; max-age=0${domainExpired}`;
                document.cookie = `authToken=; path=/; max-age=0${domainExpired}`;

                // Store refreshToken in state for axios interceptor
                state.refreshToken = cookieRefreshToken;
                localStorage.setItem('refreshToken', cookieRefreshToken);
                state.isAuthenticated = false;

                console.log(
                  '[AuthStore] Kept cookie refreshToken for automatic refresh attempt'
                );
              } else {
                console.log(
                  '[AuthStore] ❌ No cookie refreshToken - clearing all cookies'
                );
                const domainNoRefresh = getAuthCookieDomain();
                document.cookie = `auth_token=; path=/; max-age=0${domainNoRefresh}`;
                document.cookie = `authToken=; path=/; max-age=0${domainNoRefresh}`;
                document.cookie = `refreshToken=; path=/; max-age=0${domainNoRefresh}`;
              }
            }
          } else {
            console.log('[AuthStore] No tokens in cookies');
          }
        }

        console.log(
          '[AuthStore] ✅ Rehydration complete. isAuthenticated:',
          state?.isAuthenticated
        );
        state?.setHasHydrated(true);
      },
    }
  )
);
