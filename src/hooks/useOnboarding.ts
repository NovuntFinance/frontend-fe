/**
 * Onboarding Hook
 * Manages onboarding state and checks if user needs onboarding
 */

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from './useUser';

const ONBOARDING_STORAGE_KEY = 'novunt-onboarding-completed';

export function useOnboarding() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    // Don't show onboarding if:
    // 1. User data is still loading
    // 2. Already on onboarding page
    // 3. On auth pages
    // 4. Already completed onboarding
    if (
      isLoading ||
      pathname?.includes('/onboarding') ||
      pathname?.includes('/login') ||
      pathname?.includes('/signup') ||
      pathname?.includes('/register')
    ) {
      setShouldShowOnboarding(false);
      return;
    }

    // Check if onboarding was already completed
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (completed === 'true') {
      setShouldShowOnboarding(false);
      return;
    }

    // Show onboarding for new users (first time on dashboard)
    if (user && pathname?.startsWith('/dashboard')) {
      // Check if user is new (e.g., account created recently or no activity)
      const isNewUser = !user.firstName;

      if (isNewUser) {
        setShouldShowOnboarding(true);
        router.push('/dashboard/onboarding');
      }
    }
  }, [user, isLoading, pathname, router]);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setShouldShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setShouldShowOnboarding(false);
  };

  return {
    shouldShowOnboarding,
    completeOnboarding,
    skipOnboarding,
  };
}
