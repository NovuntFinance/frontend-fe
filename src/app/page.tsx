'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Dynamically import components to avoid SSR issues
const Typing = dynamic(() => import('@/components/ui/typing'), { ssr: false });
const ProgressDeposit = dynamic(
  () => import('@/components/ui/progress-deposit'),
  { ssr: false }
);
const ChatWidget = dynamic(() => import('@/components/ui/chat-widget'), {
  ssr: false,
});
('use client');

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Dynamically import components to avoid SSR issues
const Typing = dynamic(() => import('@/components/ui/typing'), { ssr: false });
const ProgressDeposit = dynamic(
  () => import('@/components/ui/progress-deposit'),
  { ssr: false }
);
const ChatWidget = dynamic(() => import('@/components/ui/chat-widget'), {
  ssr: false,
});

function GradientBlob({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full opacity-60 blur-3xl ${className}`}
    />
  );
}

export default function LandingPage() {
  console.log('[LandingPage] Rendering');
  const [mounted, setMounted] = useState(false);
  const imgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    console.log('[LandingPage] Mounted');
    setMounted(true);
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      const offset = window.scrollY || 0;
      if (imgRef.current) {
        imgRef.current.style.transform = `translateY(${offset * 0.12}px) scale(1.02)`;
      }
    };
    const handler = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(onScroll);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => {
      window.removeEventListener('scroll', handler);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <main className="from-primary/80 to-background relative min-h-screen overflow-hidden bg-gradient-to-b text-white">
      <div className="pointer-events-none absolute inset-0 -z-30">
        {/* Background image layer: drop your image into public/vault-bg.jpg */}
        <div className="pointer-events-none absolute inset-0 -z-30">
          {/* Background image layer with subtle parallax */}
          <div
            ref={imgRef as React.RefObject<HTMLDivElement>}
            className="relative h-full w-full will-change-transform"
          >
            <Image
              src="/vault-bg.jpg"
              alt="Vault background"
              fill
              className="object-cover"
              priority
              quality={75}
            />
            <div className="vault-overlay pointer-events-none absolute inset-0 -z-10" />
          </div>
        </div>

        {/* subtle gradient blobs on top of the image */}
        <div className="absolute inset-0 -z-20">
          <GradientBlob className="top-[-15%] left-[-10%] h-[60vmax] w-[60vmax] bg-gradient-to-tr from-indigo-400 via-purple-500 to-pink-400" />
          <GradientBlob className="top-[10%] left-[60%] h-[40vmax] w-[40vmax] bg-gradient-to-tr from-cyan-300 via-sky-400" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-12 lg:px-8 lg:py-20">
        <nav className="mb-4 flex items-center justify-between sm:mb-0">
          <Link href="/" className="group">
            <Image
              src="/icons/novunt.png"
              alt="Novunt - No limits to value, net worth, and growth"
              width={180}
              height={48}
              className="h-8 w-auto object-contain brightness-0 invert transition-transform group-hover:scale-105 sm:h-10 md:h-12"
              priority
            />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="#learn"
              className="text-xs text-indigo-100 transition-colors hover:text-white sm:text-sm"
            >
              Learn More
            </a>
            <Link
              href="/login"
              className="hidden text-xs text-indigo-100 transition-colors hover:text-white sm:inline sm:text-sm"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium transition-all hover:bg-white/20 sm:px-4 sm:py-2 sm:text-sm"
            >
              Get Started
            </Link>
          </div>
        </nav>

        <section className="mt-8 grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
          <div className="order-2 text-center lg:order-1 lg:col-span-7 lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl leading-tight font-extrabold sm:text-3xl md:text-5xl lg:text-6xl"
            >
              <div className="mt-0 flex min-h-[2.5rem] justify-center sm:mt-1 sm:min-h-[3.5rem] md:min-h-[5rem] lg:min-h-[8rem] lg:justify-start">
                {/* {mounted && <Typing
                  phrases={["Build Wealth.", "Protect your future.", "Stake smart.", "Earn reliably."]}
                  typingSpeed={50}
                  deleteSpeed={35}
                  pause={1500}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300"
                  cursor="▌"
                  emoji=""
                />} */}
                <span className="bg-gradient-to-r from-indigo-300 to-pink-300 bg-clip-text text-transparent">
                  Build Wealth.
                </span>
              </div>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-indigo-100 sm:mt-4 sm:text-base lg:mx-0 lg:text-lg"
            >
              Stake USDT and grow with Novunt. Earn up to 200% ROS, tap into
              Performance and Premium Pool rewards, and secure NLP tokens ahead
              of the blockchain launch.
            </motion.p>

            <div className="mt-4 flex flex-col flex-wrap justify-center gap-3 sm:mt-6 sm:flex-row lg:justify-start">
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 active:scale-95 sm:px-6 sm:py-3 sm:text-base"
              >
                {/* Animated shine effect */}
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />

                {/* 10% Bonus Badge */}
                <span className="absolute -top-2 -right-2 animate-pulse rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg ring-2 ring-white/30 sm:text-xs">
                  10% BONUS
                </span>

                <span className="relative z-10">Get Started Free</span>
                <svg
                  className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <a
                href="#learn"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm text-indigo-100 transition-all hover:bg-white/20 sm:px-5 sm:py-3 sm:text-base"
              >
                Learn more
              </a>
            </div>

            {/* Stats grid removed as requested */}
          </div>

          <div className="order-1 lg:order-2 lg:col-span-5">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative rounded-xl bg-white/5 p-4 shadow-2xl backdrop-blur-sm sm:rounded-2xl sm:p-6"
            >
              {/* {mounted && <ProgressDeposit startAmount={1000} multiplier={2} duration={6000} />} */}
              <div className="p-4 text-center text-white">
                Interactive Demo Placeholder
              </div>
            </motion.div>
          </div>
        </section>

        <section id="learn" className="mt-12 scroll-mt-20 sm:mt-16 lg:mt-20">
          <h2 className="mb-3 text-center text-xl font-bold sm:text-2xl lg:text-left lg:text-3xl">
            Why Choose Novunt?
          </h2>
          <p className="mb-6 max-w-2xl text-center text-sm text-indigo-200/80 sm:mb-8 sm:text-base lg:text-left">
            Everything you need to grow your wealth with confidence
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2">
            {/* 1. MOST IMPORTANT: Registration Bonus - Immediate value */}
            <div className="group relative overflow-hidden rounded-xl border border-green-400/30 bg-gradient-to-br from-green-500/20 to-emerald-500/10 p-5 backdrop-blur-sm transition-all hover:from-green-500/30 hover:to-emerald-500/20 sm:p-6">
              <div className="absolute top-2 right-2 animate-pulse rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">
                LIMITED OFFER
              </div>
              <div className="flex items-start gap-3">
                <div className="text-3xl">🎁</div>
                <div className="flex-1">
                  <div className="mb-2 text-lg font-semibold text-white sm:text-xl">
                    Earn Up to 100,000 USDT Bonus
                  </div>
                  <p className="text-xs leading-relaxed text-white/90 sm:text-sm">
                    Get an instant 10% bonus on your first stake, with potential
                    rewards up to 100,000 USDT. Start earning from day one with
                    Novunt&apos;s welcome offer.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Core Feature: Goal-Based Staking */}
            <div className="group rounded-xl border border-white/5 bg-white/10 p-5 backdrop-blur-sm transition-all hover:bg-white/15 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="text-3xl">🎯</div>
                <div className="flex-1">
                  <div className="mb-2 text-lg font-semibold text-white sm:text-xl">
                    Goal-Based Staking
                  </div>
                  <p className="text-xs leading-relaxed text-white/80 sm:text-sm">
                    Set clear financial goals with progress tracking toward 200%
                    returns. Stake multiple times and collect weekly ROS
                    directly to your Earning Wallet.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Additional Earnings: Performance & Premium Pools */}
            <div className="group rounded-xl border border-white/5 bg-white/10 p-5 backdrop-blur-sm transition-all hover:bg-white/15 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="text-3xl">💎</div>
                <div className="flex-1">
                  <div className="mb-2 text-lg font-semibold text-white sm:text-xl">
                    Performance & Premium Pools
                  </div>
                  <p className="text-xs leading-relaxed text-white/80 sm:text-sm">
                    Maximize earnings by participating in Performance and
                    Premium pools. Earn additional profit shares from
                    Novunt&apos;s success beyond your base stake returns.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Future Value: NXP to NLP Conversion */}
            <div className="group rounded-xl border border-white/5 bg-white/10 p-5 backdrop-blur-sm transition-all hover:bg-white/15 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="text-3xl">🚀</div>
                <div className="flex-1">
                  <div className="mb-2 text-lg font-semibold text-white sm:text-xl">
                    NXP to NLP Conversion
                  </div>
                  <p className="text-xs leading-relaxed text-white/80 sm:text-sm">
                    Earn Novunt Experience Points (NXP) through platform
                    activity and engagement. Convert NXP to Novunt Legacy Points
                    (NLP) when our blockchain launches—secure your early adopter
                    advantage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="mt-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-5 shadow-xl sm:mt-16 sm:rounded-2xl sm:p-6 lg:mt-20 lg:p-8"
        >
          <div className="flex flex-col items-center justify-between gap-4 sm:gap-6 md:flex-row">
            <div className="text-center md:text-left">
              <div className="text-base font-semibold sm:text-lg lg:text-xl">
                Ready to start earning?
              </div>
              <div className="mt-1 text-xs text-indigo-100 sm:mt-2 sm:text-sm">
                Join Novunt today and start staking with up to 10% bonus
                rewards.
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-3 sm:flex-row md:w-auto">
              <Link
                href="/signup"
                className="w-full rounded-full bg-white px-5 py-2.5 text-center text-sm font-semibold whitespace-nowrap text-indigo-800 transition-all hover:bg-indigo-50 active:scale-95 sm:w-auto sm:py-3 sm:text-base"
              >
                Create Free Account
              </Link>
              <a
                href="https://t.me/NovuntAssistantBot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/90 transition-colors hover:text-white sm:text-base"
              >
                Contact Support
              </a>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="mt-5 border-t border-white/20 pt-5 sm:mt-6 sm:pt-6">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="transition-colors hover:scale-110 hover:text-white/80 active:scale-95"
                title="Follow us on Facebook"
              >
                <svg
                  width="20"
                  height="20"
                  className="sm:h-6 sm:w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="transition-colors hover:scale-110 hover:text-white/80 active:scale-95"
                title="Follow us on Instagram"
              >
                <svg
                  width="20"
                  height="20"
                  className="sm:h-6 sm:w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.011 3.584-.069 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.011-4.85-.069c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.131 4.602.425 3.635 1.392 2.668 2.359 2.374 3.532 2.315 4.809 2.256 6.089 2.243 6.498 2.243 12c0 5.502.013 5.911.072 7.191.059 1.277.353 2.45 1.32 3.417.967.967 2.14 1.261 3.417 1.32C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.277-.059 2.45-.353 3.417-1.32.967-.967 1.261-2.14 1.32-3.417.059-1.28.072-1.689.072-7.191 0-5.502-.013-5.911-.072-7.191-.059-1.277-.353-2.45-1.32-3.417C19.398.425 18.225.131 16.948.072 15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="transition-colors hover:scale-110 hover:text-white/80 active:scale-95"
                title="Follow us on TikTok"
              >
                <svg
                  width="20"
                  height="20"
                  className="sm:h-6 sm:w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12.004 2c2.21 0 4.01 1.79 4.01 4.01v7.98c0 2.21-1.8 4.01-4.01 4.01-2.21 0-4.01-1.8-4.01-4.01V6.01C7.994 3.8 9.794 2 12.004 2zm0-2C8.13 0 5 3.13 5 7.01v7.98C5 20.87 8.13 24 12.004 24c3.87 0 7.01-3.13 7.01-7.01V7.01C19.014 3.13 15.874 0 12.004 0zm0 4.01c1.1 0 2 .9 2 2v7.98c0 1.1-.9 2-2 2s-2-.9-2-2V6.01c0-1.1.9-2 2-2z" />
                </svg>
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="transition-colors hover:scale-110 hover:text-white/80 active:scale-95"
                title="Join us on Telegram"
              >
                <svg
                  width="20"
                  height="20"
                  className="sm:h-6 sm:w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 0C5.372 0 0 5.373 0 12c0 6.627 5.372 12 12 12s12-5.373 12-12c0-6.627-5.372-12-12-12zm5.707 8.293l-1.414 8.485c-.104.624-.51.78-1.032.485l-2.857-2.107-1.378 1.327c-.152.152-.28.28-.573.28l.205-2.902 5.29-4.78c.23-.205-.05-.32-.357-.115l-6.545 4.12-2.82-.882c-.613-.19-.624-.613.128-.907l11.025-4.253c.512-.19.96.115.797.902z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="transition-colors hover:scale-110 hover:text-white/80 active:scale-95"
                title="Subscribe on YouTube"
              >
                <svg
                  width="20"
                  height="20"
                  className="sm:h-6 sm:w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.454 3.5 12 3.5 12 3.5s-7.454 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.12 0 12 0 12s0 3.88.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.546 20.5 12 20.5 12 20.5s7.454 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.88 24 12 24 12s0-3.88-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        <footer className="mt-12 py-6 text-center text-xs text-indigo-200 sm:mt-16 sm:text-sm">
          © {new Date().getFullYear()} Novunt — No limits to value, net worth
          and growth.
        </footer>
      </div>
      {/* {mounted && <ChatWidget />} */}
    </main>
  );
}
