'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Dynamically import components to avoid SSR issues
const Typing = dynamic(() => import('@/components/ui/typing'), { ssr: false });
const ChatWidget = dynamic(() => import('@/components/ui/chat-widget'), {
  ssr: false,
});

// Background images array for daily rotation
const BACKGROUND_IMAGES = [
  'https://res.cloudinary.com/dfpulrssa/image/upload/v1763819598/Novunt_BGI8_exyk9p.jpg',
  'https://res.cloudinary.com/dfpulrssa/image/upload/v1763819598/Novunt_BGI3_x9oels.jpg',
  'https://res.cloudinary.com/dfpulrssa/image/upload/v1763819598/Novunt_BGI5_zg9vpl.jpg',
  'https://res.cloudinary.com/dfpulrssa/image/upload/v1763819598/Novunt_BGI6_giqtce.jpg',
  'https://res.cloudinary.com/dfpulrssa/image/upload/v1763819597/Novunt_BGI4_h4hlrn.jpg',
  'https://res.cloudinary.com/dfpulrssa/image/upload/v1763819597/Novunt_BGI7_wh2trj.jpg',
  'https://res.cloudinary.com/dfpulrssa/image/upload/v1763819596/Novunt_BGI2_qkjznq.jpg',
];

// Floating particle component
function FloatingParticle({
  delay = 0,
  size = 4,
}: {
  delay?: number;
  size?: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full bg-white/20"
      style={{
        width: size,
        height: size,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, Math.random() * 20 - 10, 0],
        opacity: [0.1, 0.3, 0.1],
      }}
      transition={{
        duration: 8 + Math.random() * 4,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

function GradientBlob({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full opacity-40 blur-3xl ${className}`}
    />
  );
}

// Social button component with wiggle animation (matching dashboard)
function SocialButton({
  icon: Icon,
  href,
  label,
}: {
  icon: React.ElementType;
  href: string;
  label: string;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        x: [0, 2, 0, -2, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
    >
      <Icon className="h-5 w-5" />
    </motion.a>
  );
}

export default function LandingPageContent() {
  const [mounted, setMounted] = useState(false);
  const [currentBgImage, setCurrentBgImage] = useState(BACKGROUND_IMAGES[0]);
  const [Icons, setIcons] = useState<{
    FaFacebook: React.ElementType;
    FaInstagram: React.ElementType;
    FaYoutube: React.ElementType;
    FaTelegram: React.ElementType;
    SiTiktok: React.ElementType;
  } | null>(null);
  const imgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMounted(true);
      // Get day of year to determine which background to show (only on client)
      const getDayOfYear = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - start.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
      };
      const dailyBgIndex = getDayOfYear() % BACKGROUND_IMAGES.length;
      setCurrentBgImage(BACKGROUND_IMAGES[dailyBgIndex]);

      // Dynamically import icons only on client
      import('react-icons/fa').then((fa) => {
        import('react-icons/si').then((si) => {
          setIcons({
            FaFacebook: fa.FaFacebook,
            FaInstagram: fa.FaInstagram,
            FaYoutube: fa.FaYoutube,
            FaTelegram: fa.FaTelegram,
            SiTiktok: si.SiTiktok,
          });
        });
      });
    }
  }, []);

  // Parallax effect for background
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let raf = 0;
    const onScroll = () => {
      const offset = window.scrollY || 0;
      if (imgRef.current) {
        imgRef.current.style.transform = `translateY(${offset * 0.15}px) scale(1.05)`;
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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white">
      {/* Background Layer with Daily Rotating Image */}
      <div className="pointer-events-none absolute inset-0 -z-30">
        {/* Background image with parallax */}
        <div className="absolute inset-0 -z-30">
          <div
            ref={imgRef}
            className="relative h-full w-full will-change-transform"
          >
            <Image
              src={currentBgImage}
              alt="Novunt background"
              fill
              sizes="100vw"
              className="object-cover opacity-30"
              priority
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-indigo-950/80 to-slate-900/90" />
          </div>
        </div>

        {/* Animated gradient blobs */}
        <div className="absolute inset-0 -z-20 overflow-hidden">
          <GradientBlob className="top-[-10%] left-[-20%] h-[70vmax] w-[70vmax] animate-pulse bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500" />
          <GradientBlob className="top-[20%] right-[-20%] h-[60vmax] w-[60vmax] animate-pulse bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 [animation-delay:2s]" />
          <GradientBlob className="bottom-[-20%] left-[30%] h-[50vmax] w-[50vmax] animate-pulse bg-gradient-to-tl from-purple-500 via-pink-500 to-rose-500 [animation-delay:4s]" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {mounted &&
            Array.from({ length: 30 }).map((_, i) => (
              <FloatingParticle
                key={i}
                delay={i * 0.2}
                size={2 + Math.random() * 4}
              />
            ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        {/* Navigation - Glassmorphism */}
        <motion.nav
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl sm:mb-12"
        >
          <Link href="/" className="group relative">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 blur-lg transition-opacity group-hover:opacity-30" />
            <Image
              src="/icons/novunt.png"
              alt="Novunt - No limits to value, net worth, and growth"
              width={180}
              height={48}
              className="relative h-8 w-auto object-contain brightness-0 drop-shadow-lg invert transition-transform group-hover:scale-105 sm:h-10 md:h-12"
              priority
            />
          </Link>
          <div className="flex items-center gap-2 sm:gap-6">
            <a
              href="#learn"
              className="group relative px-2 py-1 text-xs text-indigo-200 transition-colors hover:text-white sm:text-sm"
            >
              Learn More
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-300 group-hover:w-full" />
            </a>
            <Link
              href="/login"
              className="group relative hidden px-2 py-1 text-xs text-indigo-200 transition-colors hover:text-white sm:inline sm:text-sm"
            >
              Sign In
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link
              href="/signup"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/50 active:scale-95 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative">Get Started</span>
            </Link>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <section className="mt-8 grid grid-cols-1 items-center gap-8 sm:mt-12 lg:grid-cols-12 lg:gap-12">
          {/* Left Column - Text Content */}
          <div className="order-2 text-center lg:order-1 lg:col-span-7 lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-3xl leading-tight font-black sm:text-4xl md:text-6xl lg:text-7xl">
                <div className="flex min-h-[3rem] w-full items-center justify-center sm:min-h-[4rem] md:min-h-[6rem] lg:min-h-[10rem] lg:justify-start">
                  {mounted && (
                    <Typing
                      phrases={[
                        'Build Wealth.',
                        'Protect your future.',
                        'Stake smart.',
                        'Earn reliably.',
                      ]}
                      typingSpeed={50}
                      deleteSpeed={35}
                      pause={1500}
                      className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg"
                      cursor="▌"
                      emoji=""
                    />
                  )}
                </div>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-indigo-100/90 drop-shadow-md sm:mt-6 sm:text-lg lg:mx-0 lg:text-xl"
              >
                Stake USDT and grow with Novunt. Earn up to 200% ROS, tap into
                Performance and Premium Pool rewards, and secure NLP tokens
                ahead of the blockchain launch.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 flex flex-col flex-wrap justify-center gap-4 sm:mt-8 sm:flex-row lg:justify-start"
              >
                <Link
                  href="/signup"
                  className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-4 text-base font-bold shadow-2xl shadow-indigo-500/50 transition-all hover:scale-105 hover:shadow-indigo-500/80 active:scale-95 sm:text-lg"
                >
                  {/* Animated shine effect */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                  {/* 10% Bonus Badge */}
                  <span className="absolute -top-3 -right-3 animate-pulse rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg ring-4 ring-white/30">
                    10% BONUS
                  </span>

                  <span className="relative z-10">Get Started Free</span>
                  <svg
                    className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1"
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
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-indigo-100 backdrop-blur-sm transition-all hover:scale-105 hover:border-white/40 hover:bg-white/20 hover:text-white active:scale-95 sm:text-lg"
                >
                  Learn more
                </a>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="order-1 lg:order-2 lg:col-span-5">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, rotateX: 10 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="group relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur-2xl transition-opacity group-hover:opacity-50" />

              {/* Image Card */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-all hover:scale-[1.02] hover:border-white/20">
                {/* Main Image */}
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="https://res.cloudinary.com/dfpulrssa/image/upload/v1763819598/Novunt_BGI8_exyk9p.jpg"
                    alt="Novunt Platform"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    priority
                    quality={90}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                  {/* Glassmorphism Overlay with CTA */}
                  <div className="absolute inset-0 flex items-end p-6 sm:p-8">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-6"
                    >
                      <h3 className="mb-2 text-lg font-bold text-white sm:text-xl">
                        Smart Wealth Building
                      </h3>
                      <p className="mb-4 text-sm text-white/80">
                        Join thousands growing their wealth with Novunt&apos;s
                        innovative staking platform
                      </p>
                      <Link
                        href="/signup"
                        className="group/link inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 transition-colors hover:text-white"
                      >
                        Start Your Journey
                        <svg
                          className="h-4 w-4 transition-transform group-hover/link:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </motion.div>
                  </div>

                  {/* Decorative Corner Accent */}
                  <div className="absolute top-4 right-4 h-12 w-12 animate-pulse rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 opacity-60 blur-xl" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="learn" className="mt-20 scroll-mt-20 sm:mt-28 lg:mt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center lg:text-left"
          >
            <h2 className="mb-4 bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-3xl font-black text-transparent sm:text-4xl lg:text-5xl">
              Why Choose Novunt?
            </h2>
            <p className="mx-auto max-w-2xl text-base text-indigo-200/80 sm:text-lg lg:mx-0">
              Everything you need to grow your wealth with confidence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
            {/* Feature 1: Registration Bonus */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative overflow-hidden rounded-3xl border border-green-400/20 bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:border-green-400/40 hover:shadow-2xl hover:shadow-green-500/20 sm:p-8"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 via-green-400/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="absolute top-3 right-3 animate-pulse rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                LIMITED OFFER
              </div>
              <div className="relative flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-3xl shadow-lg transition-transform group-hover:scale-110">
                  🎁
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
                    Earn Up to 100,000 USDT Bonus
                  </h3>
                  <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                    Get an instant 10% bonus on your first stake, with potential
                    rewards up to 100,000 USDT. Start earning from day one with
                    Novunt&apos;s welcome offer.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 2: Smart Goal Staking */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/20 sm:p-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/0 via-indigo-400/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 text-3xl shadow-lg transition-transform group-hover:scale-110">
                  🎯
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
                    Smart Goal Staking
                  </h3>
                  <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                    Set clear financial goals with progress tracking toward 200%
                    returns. Stake multiple times and collect weekly ROS
                    directly to your Earning Wallet.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 3: Performance & Premium Pools */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/20 sm:p-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 via-purple-400/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 text-3xl shadow-lg transition-transform group-hover:scale-110">
                  💎
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
                    Performance & Premium Pools
                  </h3>
                  <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                    Maximize earnings by participating in Performance and
                    Premium pools. Earn additional profit shares from
                    Novunt&apos;s success beyond your base stake returns.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 4: NXP to NLP Conversion */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:border-white/20 hover:shadow-2xl hover:shadow-cyan-500/20 sm:p-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 via-cyan-400/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-3xl shadow-lg transition-transform group-hover:scale-110">
                  🚀
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
                    NXP to NLP Conversion
                  </h3>
                  <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                    Earn Novunt Experience Points (NXP) through platform
                    activity and engagement. Convert NXP to Novunt Legacy Points
                    (NLP) when our blockchain launches—secure your early adopter
                    advantage.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact/CTA Section */}
        <motion.section
          id="contact"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mt-20 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-600/80 via-purple-600/80 to-pink-600/80 p-8 shadow-2xl backdrop-blur-2xl sm:mt-28 sm:p-10 lg:mt-32 lg:p-12"
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-50" />

          <div className="relative flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-center md:text-left">
              <h3 className="mb-2 text-2xl font-bold sm:text-3xl lg:text-4xl">
                Ready to start earning?
              </h3>
              <p className="text-sm text-indigo-100 sm:text-base">
                Join Novunt today and start staking with up to 10% bonus
                rewards.
              </p>
            </div>
            <div className="flex w-full flex-col items-center gap-4 sm:flex-row md:w-auto">
              <Link
                href="/signup"
                className="w-full rounded-2xl bg-white px-8 py-4 text-center text-base font-bold whitespace-nowrap text-indigo-900 shadow-xl transition-all hover:scale-105 hover:bg-indigo-50 hover:shadow-2xl active:scale-95 sm:w-auto sm:text-lg"
              >
                Create Free Account
              </Link>
              <a
                href="https://t.me/NovuntAssistantBot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-white/90 transition-colors hover:text-white sm:text-base"
              >
                Contact Support
              </a>
            </div>
          </div>

          {/* Social Media Links */}
          {mounted && Icons && (
            <div className="relative mt-8 border-t border-white/20 pt-8">
              <p className="mb-4 text-center text-sm text-white/70">
                You can also keep up with us here
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <SocialButton
                  icon={Icons.FaFacebook}
                  href="https://www.facebook.com/share/16oLeHcQkH/"
                  label="Facebook"
                />
                <SocialButton
                  icon={Icons.FaInstagram}
                  href="https://www.instagram.com/novunt_hq?igsh=bGxoaGV3d3B0MWd5"
                  label="Instagram"
                />
                <SocialButton
                  icon={Icons.SiTiktok}
                  href="https://www.tiktok.com/@novuntofficial?_t=ZS-8ymrJsyJBk9&_r=1"
                  label="TikTok"
                />
                <SocialButton
                  icon={Icons.FaYoutube}
                  href="https://youtube.com/@novunthq?si=yWDR_Qv9RE9sIam4"
                  label="YouTube"
                />
                <SocialButton
                  icon={Icons.FaTelegram}
                  href="https://t.me/novunt"
                  label="Telegram"
                />
              </div>
            </div>
          )}
        </motion.section>

        {/* Footer */}
        <footer className="mt-16 py-8 text-center text-sm text-indigo-200/60 sm:mt-20">
          © {new Date().getFullYear()} Novunt — No limits to value, net worth
          and growth.
        </footer>
      </div>

      {/* Chat Widget */}
      {mounted && <ChatWidget />}
    </main>
  );
}
