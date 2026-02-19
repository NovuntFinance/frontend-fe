'use client';

import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaYoutube, FaTelegram } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
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

        {/* Social Media Icons */}
        <div className="flex items-center justify-center gap-3">
          <a
            href="https://www.facebook.com/share/16oLeHcQkH/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-[#009bf2] transition-colors hover:text-[#009bf2]/80"
          >
            <FaFacebook className="h-5 w-5" />
          </a>
          <a
            href="https://www.instagram.com/novunt_hq?igsh=bGxoaGV3d3B0MWd5"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-[#009bf2] transition-colors hover:text-[#009bf2]/80"
          >
            <FaInstagram className="h-5 w-5" />
          </a>
          <a
            href="https://www.tiktok.com/@novuntofficial?_t=ZS-8ymrJsyJBk9&_r=1"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="text-[#009bf2] transition-colors hover:text-[#009bf2]/80"
          >
            <SiTiktok className="h-5 w-5" />
          </a>
          <a
            href="https://youtube.com/@novunthq?si=yWDR_Qv9RE9sIam4"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="text-[#009bf2] transition-colors hover:text-[#009bf2]/80"
          >
            <FaYoutube className="h-5 w-5" />
          </a>
          <a
            href="https://t.me/novunt"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="text-[#009bf2] transition-colors hover:text-[#009bf2]/80"
          >
            <FaTelegram className="h-5 w-5" />
          </a>
        </div>
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
