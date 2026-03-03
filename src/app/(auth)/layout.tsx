'use client';

import React from 'react';
import Link from 'next/link';
import styles from '@/styles/auth.module.css';
import onboardingStyles from '@/styles/onboarding.module.css';
import {
  AuthFooterProvider,
  useAuthFooter,
} from '@/contexts/AuthFooterContext';

// Disable static generation
export const dynamic = 'force-dynamic';

/**
 * Auth Layout Content — Dark Neumorphic Design
 * Matches the onboarding Soft UI system structure
 */
function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  const { footerContent } = useAuthFooter();

  return (
    <main
      className={`${onboardingStyles.neuBase} relative flex min-h-dvh flex-col items-center justify-between overflow-x-hidden overflow-y-auto px-6 py-5 sm:py-8 md:py-10`}
    >
      {/* Subtle ambient glow */}
      <div
        className={`${onboardingStyles.ambientGlow} pointer-events-none absolute top-[-30%] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-[0.05] blur-[160px] transition-all duration-1000`}
      />

      {/* ── Main Content ── */}
      <div className="z-10 flex w-full max-w-md grow flex-col items-center justify-center gap-2 sm:gap-4 md:gap-6">
        {/* Logo Section — compact on mobile to save viewport space */}
        <div className="flex shrink-0 flex-col items-center gap-2 sm:gap-6">
          {/* Raised Icon Container */}
          <Link href="/">
            <div
              className={`${onboardingStyles.neuCardRaised} flex h-28 w-28 items-center justify-center rounded-3xl sm:h-40 sm:w-40 sm:rounded-4xl md:h-48 md:w-48 md:rounded-[2.25rem] ${onboardingStyles.neuFloat}`}
            >
              {/* Inset Icon Socket */}
              <div
                className={`${onboardingStyles.neuSocket} flex h-16 w-16 items-center justify-center rounded-full sm:h-24 sm:w-24 md:h-28 md:w-28`}
              >
                <div
                  className={`h-10 w-10 sm:h-16 sm:w-16 md:h-20 md:w-20 ${styles.neuLogoRotate}`}
                  style={{
                    backgroundColor: '#009bf2',
                    maskImage: 'url(/icons/novunt_short.png)',
                    WebkitMaskImage: 'url(/icons/novunt_short.png)',
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                  }}
                />
              </div>
            </div>
          </Link>
        </div>

        {/* Form Content */}
        <div className="w-full">{children}</div>
      </div>

      {/* ── Footer ── */}
      <div className="z-20 flex w-full max-w-md shrink-0 flex-col gap-3 pt-4 sm:gap-7 sm:pt-0">
        {/* Buttons and Login Link from pages */}
        {footerContent}
      </div>
    </main>
  );
}

/**
 * Auth Layout — Dark Neumorphic Design
 * Matches the onboarding Soft UI system structure
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthFooterProvider>
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </AuthFooterProvider>
  );
}
