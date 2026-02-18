/**
 * Root Page — Neumorphic Onboarding Feature Showcase
 * First screen visitors see at novunt.com / localhost:3000
 */

'use client';

import { useRouter } from 'next/navigation';
import OnboardingCarousel from '@/components/onboarding/OnboardingCarousel';
import styles from '@/styles/onboarding.module.css';

export default function RootPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    // Mark onboarding seen, then go to signup
    try {
      localStorage.setItem('novunt-onboarding-completed', 'true');
    } catch {
      // storage unavailable — silently continue
    }
    router.push('/signup');
  };

  return (
    <div className={styles.screen}>
      <div className={styles.shell}>
        <OnboardingCarousel onGetStarted={handleGetStarted} />
      </div>
    </div>
  );
}
