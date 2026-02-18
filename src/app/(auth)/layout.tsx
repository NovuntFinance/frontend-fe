'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaFacebook, FaInstagram, FaYoutube, FaTelegram } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
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
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <main
      className={`${styles.neuAuthBase} relative flex h-screen flex-col overflow-hidden`}
    >
      {/* Subtle ambient glow */}
      <div
        className={`${styles.ambientGlow} pointer-events-none absolute top-[-30%] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-[0.04] blur-[160px]`}
      />

      {/* Noise texture overlay */}
      <div className={styles.neuNoiseOverlay} />

      {/* Main Content Area */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex w-full max-w-md flex-col justify-center">
          {/* Single Unified Card - No overlapping divs */}
          <div className={styles.neuUnifiedCard}>
            {/* Logo Flow */}
            <Link href="/" className={styles.neuLogoFlowContainer}>
              {/* Inset Icon Socket - Directly in unified card, no wrapper div */}
              <div className={styles.neuLogoSocket}>
                <Image
                  src="/icons/novunt_short.png"
                  alt="Novunt"
                  width={48}
                  height={48}
                  className="object-contain"
                  style={{
                    filter:
                      'brightness(0) saturate(100%) invert(60%) sepia(100%) saturate(2000%) hue-rotate(183deg) brightness(1.05) contrast(1.1)',
                  }}
                  priority
                />
              </div>
              {/* Text */}
              <div className="flex flex-col items-center gap-1">
                <h1 className={styles.neuLogoTitle}>
                  {isLoginPage ? 'GOOD TO SEE YOU AGAIN' : 'HELLO, FRIEND!'}
                </h1>
                <p className={styles.neuLogoSubtitle}>
                  {isLoginPage
                    ? 'Continue Your Financial Journey'
                    : 'Start Growing Your Funds'}
                </p>
              </div>
            </Link>

            {/* Form Content - Directly in unified card, no wrapper div */}
            {children}

            {/* Social Media Icons - Directly in unified card, no separate footer div */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <a
                href="https://www.facebook.com/share/16oLeHcQkH/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={styles.neuFooterSocialBtn}
              >
                <FaFacebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/novunt_hq?igsh=bGxoaGV3d3B0MWd5"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={styles.neuFooterSocialBtn}
              >
                <FaInstagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@novuntofficial?_t=ZS-8ymrJsyJBk9&_r=1"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className={styles.neuFooterSocialBtn}
              >
                <SiTiktok className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com/@novunthq?si=yWDR_Qv9RE9sIam4"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className={styles.neuFooterSocialBtn}
              >
                <FaYoutube className="h-5 w-5" />
              </a>
              <a
                href="https://t.me/novunt"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className={styles.neuFooterSocialBtn}
              >
                <FaTelegram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
