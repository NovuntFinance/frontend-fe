/**
 * Zustand Store Selectors
 * Optimized selectors to prevent unnecessary re-renders
 */

import { useAuthStore } from './authStore';
import { useUIStore } from './uiStore';
import { shallow } from 'zustand/shallow';

/**
 * Auth Store Selectors
 * Use these instead of directly accessing useAuthStore()
 */

// Get only user data (doesn't re-render when token changes)
export const useUser = () => useAuthStore(state => state.user);

// Get only authentication status
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);

// Get only loading state
export const useAuthLoading = () => useAuthStore(state => state.isLoading);

// Get only token (rarely needed in components)
export const useToken = () => useAuthStore(state => state.token);

// Get auth actions only (never causes re-renders)
export const useAuthActions = () =>
    useAuthStore(
        state => ({
            login: state.login,
            logout: state.logout,
            setUser: state.setUser,
            setTokens: state.setTokens,
        }),
        shallow
    );

// Combined selectors for common patterns
export const useAuthState = () =>
    useAuthStore(
        state => ({
            user: state.user,
            isAuthenticated: state.isAuthenticated,
            isLoading: state.isLoading,
        }),
        shallow
    );

// Role-based selectors
export const useIsAdmin = () =>
    useAuthStore(state => state.user?.role === 'admin');

export const useIsVerified = () =>
    useAuthStore(state => state.user?.emailVerified === true);

/**
 * UI Store Selectors
 */

// Get only theme
export const useTheme = () => useUIStore(state => state.theme);

// Get only sidebar state
export const useSidebarOpen = () => useUIStore(state => state.sidebarOpen);

// Get UI actions
export const useUIActions = () =>
    useUIStore(
        state => ({
            setTheme: state.setTheme,
            toggleSidebar: state.toggleSidebar,
            openModal: state.openModal,
            closeModal: state.closeModal,
        }),
        shallow
    );

// Get modal state
export const useModalState = (modalId: string) =>
    useUIStore(state => ({
        isOpen: state.openModals.includes(modalId),
        open: () => state.openModal(modalId),
        close: () => state.closeModal(modalId),
    }));

/**
 * Usage Examples:
 * 
 * // Bad - causes re-render on ANY auth state change
 * const { user, token, isLoading } = useAuthStore();
 * 
 * // Good - only re-renders when user changes
 * const user = useUser();
 * 
 * // Good - only re-renders when isAuthenticated changes
 * const isAuthenticated = useIsAuthenticated();
 * 
 * // Good - get actions without subscribing to state
 * const { logout } = useAuthActions();
 */
