/**
 * Zustand DevTools Configuration
 * Development tools for Zustand state management
 */

import { devtools, persist } from 'zustand/middleware';
import { StateCreator } from 'zustand';

/**
 * Wrap store with devtools in development
 */
export function withDevtools<T>(
  name: string,
  config: StateCreator<T>
): StateCreator<T> {
  if (process.env.NODE_ENV === 'development') {
    // Cast to any to avoid tight coupling to zustand's internal generics
    return devtools(config as any, { name }) as StateCreator<T>;
  }
  return config;
}

/**
 * Wrap store with both devtools and persistence
 */
export function withDevtoolsAndPersist<T>(
  name: string,
  config: StateCreator<T>,
  persistOptions: Parameters<typeof persist>[1]
): StateCreator<T> {
  if (process.env.NODE_ENV === 'development') {
    return devtools(persist(config as any, persistOptions) as any, {
      name,
    }) as StateCreator<T>;
  }
  return persist(config as any, persistOptions) as StateCreator<T>;
}

/**
 * Example usage in authStore.ts:
 *
 * import { withDevtoolsAndPersist } from '@/lib/zustand-devtools';
 *
 * export const useAuthStore = create<AuthState>()(
 *   withDevtoolsAndPersist(
 *     'AuthStore',
 *     (set, get) => ({
 *       // ... state
 *     }),
 *     {
 *       name: 'auth-storage',
 *       // ... persist options
 *     }
 *   )
 * );
 */

/**
 * Store inspection utilities for development
 */
export const devUtils = {
  /**
   * Log current state of all stores
   */
  logAllStores() {
    if (process.env.NODE_ENV === 'development') {
      console.group('📊 Zustand Store States');
      // Stores will be logged by devtools
      console.groupEnd();
    }
  },

  /**
   * Time travel debugging helper
   */
  enableTimeTravel() {
    if (process.env.NODE_ENV === 'development') {
      console.log('⏰ Time travel enabled in Redux DevTools');
    }
  },
};

/**
 * Install Redux DevTools Extension:
 * Chrome: https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd
 * Firefox: https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/
 *
 * Then inspect stores in browser:
 * 1. Open DevTools
 * 2. Go to Redux tab
 * 3. Select store from dropdown
 * 4. Inspect state, actions, and time-travel
 */
