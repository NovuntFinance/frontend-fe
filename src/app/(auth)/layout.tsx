'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/styles/auth.module.css';

// Disable static generation
export const dynamic = 'force-dynamic';

/**
 * Auth Layout — Dark Neumorphic Design
 * Matches the onboarding Soft UI system
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className={`${styles.neuAuthBase} relative min-h-screen overflow-hidden`}
    >
      {/* Subtle ambient glow */}
      <div
        className={`${styles.ambientGlow} pointer-events-none absolute top-[-30%] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-[0.04] blur-[160px]`}
      />

      {/* Noise texture overlay */}
      <div className={styles.neuNoiseOverlay} />

      {/* Navigation */}
      <nav
        className={`${styles.neuNav} relative z-50 mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-6`}
      >
        <Link href="/" className="group">
          <Image
            src="/icons/novunt.png"
            alt="Novunt"
            width={140}
            height={40}
            className="h-8 w-auto object-contain brightness-0 invert transition-transform group-hover:scale-105 sm:h-10"
            priority
          />
        </Link>
      </nav>

      {/* Form Container */}
      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Footer */}
      <footer className={`${styles.neuFooter} relative z-10 py-6`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <p className={`text-sm ${styles.neuTextMuted}`}>
              © {new Date().getFullYear()} Novunt — No limits to value, net
              worth and growth.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className={styles.neuNavLink}>
                Privacy
              </Link>
              <Link href="/terms" className={styles.neuNavLink}>
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
