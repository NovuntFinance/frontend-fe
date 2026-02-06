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
          document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
          document.cookie = `authToken=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
          document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
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

        // Clear cookies
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          document.cookie = 'auth_token=; path=/; max-age=0';
          document.cookie = 'authToken=; path=/; max-age=0';
          document.cookie = 'refreshToken=; path=/; max-age=0';
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

        // Clear cookies
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          document.cookie = 'auth_token=; path=/; max-age=0';
          document.cookie = 'authToken=; path=/; max-age=0';
          document.cookie = 'refreshToken=; path=/; max-age=0';
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
        // After Zustand rehydrates, check if tokens exist in cookies but not in store
        if (state && !state.token && typeof window !== 'undefined') {
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
            try {
              const payload = JSON.parse(atob(cookieToken.split('.')[1]));
              const isExpired = Date.now() >= payload.exp * 1000;

              if (!isExpired) {
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
              } else {
                document.cookie = 'auth_token=; path=/; max-age=0';
                document.cookie = 'authToken=; path=/; max-age=0';
                document.cookie = 'refreshToken=; path=/; max-age=0';
              }
            } catch {
              // Token decode failed; ignore — user will need to log in
            }
          }
        }

        state?.setHasHydrated(true);
      },
    }
  )
);
