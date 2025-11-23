'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaFacebook, FaInstagram, FaYoutube, FaTelegram } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';

// Dynamically import components to avoid SSR issues
const Typing = dynamic(() => import('@/components/ui/typing'), { ssr: false });
const ChatWidget = dynamic(() => import('@/components/ui/chat-widget'), { ssr: false });

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

// Get day of year to determine which background to show
const getDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

// Floating particle component
function FloatingParticle({ delay = 0, size = 4 }: { delay?: number; size?: number }) {
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
  return <div className={`pointer-events-none absolute rounded-full opacity-40 blur-3xl ${className}`} />;
}

// Social button component with wiggle animation (matching dashboard)
function SocialButton({ icon: Icon, href, label }: { icon: React.ElementType; href: string; label: string }) {
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
      className="h-10 w-10 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors bg-white/5 border border-white/10"
    >
      <Icon className="h-5 w-5" />
    </motion.a>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const imgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Parallax effect for background
  useEffect(() => {
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

  // Get daily background image
  const dailyBgIndex = getDayOfYear() % BACKGROUND_IMAGES.length;
  const currentBgImage = BACKGROUND_IMAGES[dailyBgIndex];

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white">
      {/* Background Layer with Daily Rotating Image */}
      <div className="absolute inset-0 pointer-events-none -z-30">
        {/* Background image with parallax */}
        <div className="absolute inset-0 -z-30">
          <div ref={imgRef} className="relative w-full h-full will-change-transform">
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
          <GradientBlob className="bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 left-[-20%] top-[-10%] w-[70vmax] h-[70vmax] animate-pulse" />
          <GradientBlob className="bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 right-[-20%] top-[20%] w-[60vmax] h-[60vmax] animate-pulse [animation-delay:2s]" />
          <GradientBlob className="bg-gradient-to-tl from-purple-500 via-pink-500 to-rose-500 left-[30%] bottom-[-20%] w-[50vmax] h-[50vmax] animate-pulse [animation-delay:4s]" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {mounted && Array.from({ length: 30 }).map((_, i) => (
            <FloatingParticle key={i} delay={i * 0.2} size={2 + Math.random() * 4} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Navigation - Glassmorphism */}
        <motion.nav
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8 sm:mb-12 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-indigo-500/10"
        >
          <Link href="/" className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur-lg opacity-0 group-hover:opacity-30 transition-opacity" />
            <Image
              src="/icons/novunt.png"
              alt="Novunt - No limits to value, net worth, and growth"
              width={180}
              height={48}
              className="relative h-8 w-auto sm:h-10 md:h-12 object-contain transition-transform group-hover:scale-105 brightness-0 invert drop-shadow-lg"
              priority
            />
          </Link>
          <div className="flex items-center gap-2 sm:gap-6">
            <a
              href="#learn"
              className="text-xs sm:text-sm text-indigo-200 hover:text-white transition-colors relative group px-2 py-1"
            >
              Learn More
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:w-full transition-all duration-300" />
            </a>
            <Link
              href="/login"
              className="text-xs sm:text-sm text-indigo-200 hover:text-white transition-colors hidden sm:inline relative group px-2 py-1"
            >
              Sign In
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="/signup"
              className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all hover:scale-105 active:scale-95 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">Get Started</span>
            </Link>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <section className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="lg:col-span-7 order-2 lg:order-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
                <div className="min-h-[3rem] sm:min-h-[4rem] md:min-h-[6rem] lg:min-h-[10rem] w-full flex items-center justify-center lg:justify-start">
                  {mounted && (
                    <Typing
                      phrases={['Build Wealth.', 'Protect your future.', 'Stake smart.', 'Earn reliably.']}
                      typingSpeed={50}
                      deleteSpeed={35}
                      pause={1500}
                      className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-lg"
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
                className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-indigo-100/90 max-w-2xl leading-relaxed mx-auto lg:mx-0 drop-shadow-md"
              >
                Stake USDT and grow with Novunt. Earn up to 200% ROS, tap into Performance and Premium Pool rewards,
                and secure NLP tokens ahead of the blockchain launch.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start"
              >
                <Link
                  href="/signup"
                  className="group relative inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-4 text-base sm:text-lg font-bold shadow-2xl shadow-indigo-500/50 transition-all hover:shadow-indigo-500/80 hover:scale-105 active:scale-95 overflow-hidden"
                >
                  {/* Animated shine effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                  {/* 10% Bonus Badge */}
                  <span className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-lg ring-4 ring-white/30">
                    10% BONUS
                  </span>

                  <span className="relative z-10">Get Started Free</span>
                  <svg
                    className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a
                  href="#learn"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm px-8 py-4 text-base sm:text-lg font-semibold text-indigo-100 hover:bg-white/20 hover:text-white transition-all border border-white/20 hover:border-white/40 hover:scale-105 active:scale-95"
                >
                  Learn more
                </a>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, rotateX: 10 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative group"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />

              {/* Image Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02]">
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
                      className="w-full backdrop-blur-xl bg-white/5 rounded-2xl p-4 sm:p-6 border border-white/10"
                    >
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                        Smart Wealth Building
                      </h3>
                      <p className="text-sm text-white/80 mb-4">
                        Join thousands growing their wealth with Novunt&apos;s innovative staking platform
                      </p>
                      <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 hover:text-white transition-colors group/link"
                      >
                        Start Your Journey
                        <svg
                          className="w-4 h-4 group-hover/link:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </motion.div>
                  </div>

                  {/* Decorative Corner Accent */}
                  <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-xl opacity-60 animate-pulse" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="learn" className="mt-20 sm:mt-28 lg:mt-32 scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 mb-4">
              Why Choose Novunt?
            </h2>
            <p className="text-base sm:text-lg text-indigo-200/80 max-w-2xl mx-auto lg:mx-0">
              Everything you need to grow your wealth with confidence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Feature 1: Registration Bonus */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl border border-green-400/20 hover:border-green-400/40 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/20 overflow-hidden"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/0 via-green-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-lg">
                LIMITED OFFER
              </div>
              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                  🎁
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Earn Up to 100,000 USDT Bonus</h3>
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                    Get an instant 10% bonus on your first stake, with potential rewards up to 100,000 USDT. Start
                    earning from day one with Novunt&apos;s welcome offer.
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
              className="group relative p-6 sm:p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/0 via-indigo-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Smart Goal Staking</h3>
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                    Set clear financial goals with progress tracking toward 200% returns. Stake multiple times and
                    collect weekly ROS directly to your Earning Wallet.
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
              className="group relative p-6 sm:p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 via-purple-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                  💎
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Performance & Premium Pools</h3>
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                    Maximize earnings by participating in Performance and Premium pools. Earn additional profit shares
                    from Novunt&apos;s success beyond your base stake returns.
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
              className="group relative p-6 sm:p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 via-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                  🚀
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">NXP to NLP Conversion</h3>
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                    Earn Novunt Experience Points (NXP) through platform activity and engagement. Convert NXP to Novunt
                    Legacy Points (NLP) when our blockchain launches—secure your early adopter advantage.
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
          className="mt-20 sm:mt-28 lg:mt-32 relative rounded-3xl bg-gradient-to-r from-indigo-600/80 via-purple-600/80 to-pink-600/80 backdrop-blur-2xl p-8 sm:p-10 lg:p-12 shadow-2xl border border-white/10 overflow-hidden"
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-50 animate-pulse" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Ready to start earning?</h3>
              <p className="text-sm sm:text-base text-indigo-100">
                Join Novunt today and start staking with up to 10% bonus rewards.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <Link
                href="/signup"
                className="w-full sm:w-auto rounded-2xl bg-white px-8 py-4 text-base sm:text-lg text-indigo-900 font-bold hover:bg-indigo-50 transition-all active:scale-95 text-center whitespace-nowrap shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Create Free Account
              </Link>
              <a
                href="https://t.me/NovuntAssistantBot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm sm:text-base text-white/90 hover:text-white transition-colors font-medium"
              >
                Contact Support
              </a>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="relative mt-8 pt-8 border-t border-white/20">
            <p className="text-sm text-white/70 mb-4 text-center">You can also keep up with us here</p>
            <div className="flex justify-center items-center gap-3 flex-wrap">
              <SocialButton
                icon={FaFacebook}
                href="https://www.facebook.com/share/16oLeHcQkH/"
                label="Facebook"
              />
              <SocialButton
                icon={FaInstagram}
                href="https://www.instagram.com/novunt_hq?igsh=bGxoaGV3d3B0MWd5"
                label="Instagram"
              />
              <SocialButton
                icon={SiTiktok}
                href="https://www.tiktok.com/@novuntofficial?_t=ZS-8ymrJsyJBk9&_r=1"
                label="TikTok"
              />
              <SocialButton
                icon={FaYoutube}
                href="https://youtube.com/@novunthq?si=yWDR_Qv9RE9sIam4"
                label="YouTube"
              />
              <SocialButton
                icon={FaTelegram}
                href="https://t.me/novunt"
                label="Telegram"
              />
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="mt-16 sm:mt-20 py-8 text-center text-sm text-indigo-200/60">
          © {new Date().getFullYear()} Novunt — No limits to value, net worth and growth.
        </footer>
      </div>

      {/* Chat Widget */}
      {mounted && <ChatWidget />}
    </main>
  );
}
