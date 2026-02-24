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
      className={`${onboardingStyles.neuBase} relative flex min-h-[100dvh] flex-col items-center justify-between overflow-hidden px-6 py-10`}
    >
      {/* Subtle ambient glow */}
      <div
        className={`${onboardingStyles.ambientGlow} pointer-events-none absolute top-[-30%] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-[0.05] blur-[160px] transition-all duration-1000`}
      />

      {/* ── Main Content ── */}
      <div className="z-10 flex w-full max-w-md grow flex-col items-center justify-center gap-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-6">
          {/* Raised Icon Container */}
          <Link href="/">
            <div
              className={`${onboardingStyles.neuCardRaised} flex h-56 w-56 items-center justify-center rounded-[2.5rem] ${onboardingStyles.neuFloat}`}
            >
              {/* Inset Icon Socket */}
              <div
                className={`${onboardingStyles.neuSocket} flex h-36 w-36 items-center justify-center rounded-full`}
              >
                <div
                  style={{
                    width: '6rem',
                    height: '6rem',
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
                  className={styles.neuLogoRotate}
                />
              </div>
            </div>
          </Link>
        </div>

        {/* Form Content */}
        <div className="w-full">{children}</div>
      </div>

      {/* ── Footer ── */}
      <div className="z-20 flex w-full max-w-md flex-col gap-7">
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
