'use client';

import { useRouter } from 'next/navigation';
import OnboardingCarousel from '@/components/onboarding/OnboardingCarousel';
import styles from '@/styles/onboarding.module.css';

export default function OnboardingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    try {
      localStorage.setItem('novunt-onboarding-completed', 'true');
    } catch {
      // storage unavailable
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
