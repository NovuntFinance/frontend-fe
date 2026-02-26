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
      className={`${onboardingStyles.neuBase} relative flex min-h-[100dvh] flex-col items-center justify-between overflow-hidden px-6 py-5 sm:py-8 md:py-10`}
    >
      {/* Subtle ambient glow */}
      <div
        className={`${onboardingStyles.ambientGlow} pointer-events-none absolute top-[-30%] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-[0.05] blur-[160px] transition-all duration-1000`}
      />

      {/* ── Main Content ── */}
      <div className="z-10 flex w-full max-w-md grow flex-col items-center justify-center gap-2 sm:gap-4 md:gap-6">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-3 sm:gap-6">
          {/* Raised Icon Container */}
          <Link href="/">
            <div
              className={`${onboardingStyles.neuCardRaised} flex h-40 w-40 items-center justify-center rounded-[2rem] sm:h-48 sm:w-48 sm:rounded-[2.25rem] md:h-56 md:w-56 md:rounded-[2.5rem] ${onboardingStyles.neuFloat}`}
            >
              {/* Inset Icon Socket */}
              <div
                className={`${onboardingStyles.neuSocket} flex h-24 w-24 items-center justify-center rounded-full sm:h-28 sm:w-28 md:h-36 md:w-36`}
              >
                <div
                  className={`h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 ${styles.neuLogoRotate}`}
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
      <div className="z-20 flex w-full max-w-md flex-col gap-4 sm:gap-7">
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
