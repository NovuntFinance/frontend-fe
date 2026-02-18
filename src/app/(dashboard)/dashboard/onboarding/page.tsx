/**
 * Onboarding Page — Neumorphic Feature Showcase
 * Swipeable carousel presenting Novunt's five key features
 * before the user enters the dashboard.
 */

'use client';

import { useRouter } from 'next/navigation';
import OnboardingCarousel from '@/components/onboarding/OnboardingCarousel';

export default function OnboardingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    try {
      localStorage.setItem('novunt-onboarding-completed', 'true');
    } catch {
      // SSR or storage unavailable — silently continue
    }
    router.push('/dashboard');
  };

  return <OnboardingCarousel onGetStarted={handleGetStarted} />;
}
