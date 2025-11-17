/**
 * useHydration Hook
 * Ensures Zustand store is hydrated before rendering
 */

import { useAuthStore } from '@/store/authStore';

export function useHydration() {
  return useAuthStore((state) => state._hasHydrated);
}
