/**
 * Authentication Store
 * Manages user authentication state, tokens, and auth-related actions
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/user';
import { tokenManager } from '@/lib/api';

const normalizeRole = (role?: string | null) =>
  role?.toLowerCase().replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[-\s_]/g, '') ?? '';

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
      
      // Set authentication tokens
      setTokens: (token, refreshToken) => {
        console.log('[AuthStore] === setTokens CALLED ===');
        console.log('[AuthStore] Token (first 20 chars):', token?.substring(0, 20) + '...');
        console.log('[AuthStore] Token length:', token?.length);
        console.log('[AuthStore] RefreshToken length:', refreshToken?.length);
        
        // Store in tokenManager (for API client compatibility)
        console.log('[AuthStore] Storing in tokenManager (localStorage)...');
        tokenManager.setToken(token);
        tokenManager.setRefreshToken(refreshToken);
        console.log('[AuthStore] tokenManager storage complete');
        
        // CRITICAL: Also store in cookies for middleware authentication
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          console.log('[AuthStore] Setting cookies...');
          // Set cookies with 7-day expiry (matching token expiry)
          const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
          // IMPORTANT: Backend expects 'auth_token' (with underscore) not 'authToken'
          document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
          document.cookie = `authToken=${token}; path=/; max-age=${maxAge}; SameSite=Lax`; // Keep for middleware
          document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
          console.log('[AuthStore] Cookies set successfully');
        }
        
        // Also store in Zustand state (will be persisted)
        console.log('[AuthStore] Updating Zustand state...');
        set({
          token,
          refreshToken,
          isAuthenticated: true,
        });
        console.log('[AuthStore] Zustand state updated');
        
        // Verify storage immediately
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            console.log('[AuthStore] === STORAGE VERIFICATION ===');
            const storedToken = localStorage.getItem('accessToken');
            const storedRefresh = localStorage.getItem('refreshToken');
            const zustandData = localStorage.getItem('novunt-auth-storage');
            const cookies = document.cookie;
            
            console.log('[AuthStore] localStorage accessToken:', storedToken ? storedToken.substring(0, 20) + '...' : 'NOT FOUND');
            console.log('[AuthStore] localStorage refreshToken:', storedRefresh ? 'FOUND' : 'NOT FOUND');
            console.log('[AuthStore] Zustand persist data:', zustandData ? 'FOUND' : 'NOT FOUND');
            console.log('[AuthStore] Cookies:', cookies);
            
            if (zustandData) {
              try {
                const parsed = JSON.parse(zustandData);
                console.log('[AuthStore] Zustand state.token length:', parsed.state?.token?.length);
                console.log('[AuthStore] Zustand state.isAuthenticated:', parsed.state?.isAuthenticated);
              } catch (e) {
                console.error('[AuthStore] Failed to parse Zustand data:', e);
              }
            }
            console.log('[AuthStore] === END VERIFICATION ===');
          }, 100);
        }
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
        console.log('[AuthStore] Cookies cleared on logout');
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
        console.log('[AuthStore] Cookies cleared on clearAuth');
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
          return role.some((candidate) => normalizeRole(candidate) === userRole);
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
          console.log('[AuthStore] Checking for tokens in cookies after hydration...');
          
          // Get tokens from cookies
          const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>);
          
          const cookieToken = cookies['authToken'];
          const cookieRefreshToken = cookies['refreshToken'];
          
          if (cookieToken && cookieRefreshToken) {
            console.log('[AuthStore] Found tokens in cookies, syncing to store...');
            
            // Decode token to get user info
            try {
              const payload = JSON.parse(atob(cookieToken.split('.')[1]));
              console.log('[AuthStore] Token payload:', payload);
              
              // Check if token is expired
              const isExpired = Date.now() >= payload.exp * 1000;
              
              if (!isExpired) {
                console.log('[AuthStore] Token is valid, syncing...');
                
                // Sync to localStorage
                localStorage.setItem('accessToken', cookieToken);
                localStorage.setItem('refreshToken', cookieRefreshToken);
                
                // Create user object from token
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
                  emailVerified: true, // If they can login, email is verified
                  isActive: true,
                };
                
                // Update store
                state.token = cookieToken;
                state.refreshToken = cookieRefreshToken;
                state.user = user as User;
                state.isAuthenticated = true;
                
                console.log('[AuthStore] ✓ Store synced with cookies');
              } else {
                console.log('[AuthStore] Token in cookies is expired, clearing...');
                document.cookie = 'auth_token=; path=/; max-age=0';
                document.cookie = 'authToken=; path=/; max-age=0';
                document.cookie = 'refreshToken=; path=/; max-age=0';
              }
            } catch (error) {
              console.error('[AuthStore] Failed to decode token from cookies:', error);
            }
          }
        }
        
        state?.setHasHydrated(true);
      },
    }
  )
);
