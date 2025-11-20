'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Dynamically import components to avoid SSR issues
const Typing = dynamic(() => import('@/components/ui/typing'), { ssr: false });
const ProgressDeposit = dynamic(() => import('@/components/ui/progress-deposit'), { ssr: false });
const ChatWidget = dynamic(() => import('@/components/ui/chat-widget'), { ssr: false });

function GradientBlob({ className = '' }: { className?: string }) {
  return <div className={`pointer-events-none absolute rounded-full opacity-60 blur-3xl ${className}`} />;
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const imgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-primary/80 to-background text-white">
      <div className="absolute inset-0 pointer-events-none -z-30">
        {/* Background image layer: drop your image into public/vault-bg.jpg */}
        <div className="absolute inset-0 pointer-events-none -z-30">
          {/* Background image layer with subtle parallax */}
          <div ref={imgRef as React.RefObject<HTMLDivElement>} className="relative w-full h-full will-change-transform">
            <Image src="/vault-bg.jpg" alt="Vault background" fill className="object-cover" priority quality={75} />
            <div className="absolute inset-0 vault-overlay pointer-events-none -z-10" />
          </div>
        </div>

        {/* subtle gradient blobs on top of the image */}
        <div className="absolute inset-0 -z-20">
          <GradientBlob className="bg-gradient-to-tr from-indigo-400 via-purple-500 to-pink-400 left-[-10%] top-[-15%] w-[60vmax] h-[60vmax]" />
          <GradientBlob className="bg-gradient-to-tr from-cyan-300 via-sky-400 left-[60%] top-[10%] w-[40vmax] h-[40vmax]" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-20">
        <nav className="flex items-center justify-between mb-4 sm:mb-0">
          <Link href="/" className="group">
            <Image 
              src="/icons/novunt.png" 
              alt="Novunt - No limits to value, net worth, and growth" 
              width={180} 
              height={48}
              className="h-8 w-auto sm:h-10 md:h-12 object-contain transition-transform group-hover:scale-105 brightness-0 invert"
              priority
            />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="#learn" className="text-xs sm:text-sm text-indigo-100 hover:text-white transition-colors">Learn More</a>
            <Link href="/login" className="text-xs sm:text-sm text-indigo-100 hover:text-white transition-colors hidden sm:inline">Sign In</Link>
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium hover:bg-white/20 transition-all">Get Started</Link>
          </div>
        </nav>

        <section className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1 text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight"
            >
              <div className="mt-0 sm:mt-1 min-h-[2.5rem] sm:min-h-[3.5rem] md:min-h-[5rem] lg:min-h-[8rem] flex justify-center lg:justify-start">
                {mounted && <Typing
                  phrases={["Build Wealth.", "Protect your future.", "Stake smart.", "Earn reliably."]}
                  typingSpeed={50}
                  deleteSpeed={35}
                  pause={1500}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300"
                  cursor="▌"
                  emoji=""
                />}
              </div>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-indigo-100 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              Stake USDT and grow with Novunt. Earn up to 200% ROS, tap into Performance and Premium Pool rewards, and secure NLP tokens ahead of the blockchain launch.
            </motion.p>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row flex-wrap gap-3 justify-center lg:justify-start">
              <Link href="/signup" className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-white font-semibold shadow-lg transition-all active:scale-95 overflow-hidden">
                {/* Animated shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                
                {/* 10% Bonus Badge */}
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full animate-pulse shadow-lg ring-2 ring-white/30">
                  10% BONUS
                </span>
                
                <span className="relative z-10">Get Started Free</span>
                <svg className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a href="#learn" className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base text-indigo-100 hover:bg-white/20 transition-all">Learn more</a>
            </div>

            {/* Stats grid removed as requested */}
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} className="relative rounded-xl sm:rounded-2xl bg-white/5 p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
              {mounted && <ProgressDeposit startAmount={1000} multiplier={2} duration={6000} />}
            </motion.div>
          </div>
        </section>

        <section id="learn" className="mt-12 sm:mt-16 lg:mt-20 scroll-mt-20">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center lg:text-left mb-3">Why Choose Novunt?</h2>
          <p className="text-sm sm:text-base text-indigo-200/80 text-center lg:text-left max-w-2xl mb-6 sm:mb-8">Everything you need to grow your wealth with confidence</p>
            
            <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* 1. MOST IMPORTANT: Registration Bonus - Immediate value */}
                <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-sm hover:from-green-500/30 hover:to-emerald-500/20 transition-all border border-green-400/30 relative overflow-hidden group">
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    LIMITED OFFER
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">🎁</div>
                    <div className="flex-1">
                      <div className="text-lg sm:text-xl font-semibold text-white mb-2">Earn Up to 100,000 USDT Bonus</div>
                      <p className="text-xs sm:text-sm text-white/90 leading-relaxed">Get an instant 10% bonus on your first stake, with potential rewards up to 100,000 USDT. Start earning from day one with Novunt&apos;s welcome offer.</p>
                    </div>
                  </div>
                </div>

                {/* 2. Core Feature: Goal-Based Staking */}
                <div className="p-5 sm:p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all border border-white/5 group">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">🎯</div>
                    <div className="flex-1">
                      <div className="text-lg sm:text-xl font-semibold text-white mb-2">Goal-Based Staking</div>
                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed">Set clear financial goals with progress tracking toward 200% returns. Stake multiple times and collect weekly ROS directly to your Earning Wallet.</p>
                    </div>
                  </div>
                </div>

                {/* 3. Additional Earnings: Performance & Premium Pools */}
                <div className="p-5 sm:p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all border border-white/5 group">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">💎</div>
                    <div className="flex-1">
                      <div className="text-lg sm:text-xl font-semibold text-white mb-2">Performance & Premium Pools</div>
                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed">Maximize earnings by participating in Performance and Premium pools. Earn additional profit shares from Novunt&apos;s success beyond your base stake returns.</p>
                    </div>
                  </div>
                </div>

                {/* 4. Future Value: NXP to NLP Conversion */}
                <div className="p-5 sm:p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all border border-white/5 group">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">🚀</div>
                    <div className="flex-1">
                      <div className="text-lg sm:text-xl font-semibold text-white mb-2">NXP to NLP Conversion</div>
                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed">Earn Novunt Experience Points (NXP) through platform activity and engagement. Convert NXP to Novunt Legacy Points (NLP) when our blockchain launches—secure your early adopter advantage.</p>
                    </div>
                  </div>
                </div>
            </div>
        </section>

        <section id="contact" className="mt-12 sm:mt-16 lg:mt-20 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-5 sm:p-6 lg:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="text-center md:text-left">
              <div className="text-base sm:text-lg lg:text-xl font-semibold">Ready to start earning?</div>
              <div className="text-xs sm:text-sm text-indigo-100 mt-1 sm:mt-2">Join Novunt today and start staking with up to 10% bonus rewards.</div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <Link href="/signup" className="w-full sm:w-auto rounded-full bg-white px-5 py-2.5 sm:py-3 text-sm sm:text-base text-indigo-800 font-semibold hover:bg-indigo-50 transition-all active:scale-95 text-center whitespace-nowrap">Create Free Account</Link>
              <a href="https://t.me/NovuntAssistantBot" target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base text-white/90 hover:text-white transition-colors">Contact Support</a>
            </div>
          </div>
          
          {/* Social Media Links */}
          <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-white/20">
            <div className="flex justify-center items-center gap-4 sm:gap-6 flex-wrap">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white/80 transition-colors hover:scale-110 active:scale-95" title="Follow us on Facebook">
                <svg width="20" height="20" className="sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white/80 transition-colors hover:scale-110 active:scale-95" title="Follow us on Instagram">
                <svg width="20" height="20" className="sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.011 3.584-.069 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.011-4.85-.069c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.131 4.602.425 3.635 1.392 2.668 2.359 2.374 3.532 2.315 4.809 2.256 6.089 2.243 6.498 2.243 12c0 5.502.013 5.911.072 7.191.059 1.277.353 2.45 1.32 3.417.967.967 2.14 1.261 3.417 1.32C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.277-.059 2.45-.353 3.417-1.32.967-.967 1.261-2.14 1.32-3.417.059-1.28.072-1.689.072-7.191 0-5.502-.013-5.911-.072-7.191-.059-1.277-.353-2.45-1.32-3.417C19.398.425 18.225.131 16.948.072 15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-white/80 transition-colors hover:scale-110 active:scale-95" title="Follow us on TikTok">
                <svg width="20" height="20" className="sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.004 2c2.21 0 4.01 1.79 4.01 4.01v7.98c0 2.21-1.8 4.01-4.01 4.01-2.21 0-4.01-1.8-4.01-4.01V6.01C7.994 3.8 9.794 2 12.004 2zm0-2C8.13 0 5 3.13 5 7.01v7.98C5 20.87 8.13 24 12.004 24c3.87 0 7.01-3.13 7.01-7.01V7.01C19.014 3.13 15.874 0 12.004 0zm0 4.01c1.1 0 2 .9 2 2v7.98c0 1.1-.9 2-2 2s-2-.9-2-2V6.01c0-1.1.9-2 2-2z"/></svg>
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="hover:text-white/80 transition-colors hover:scale-110 active:scale-95" title="Join us on Telegram">
                <svg width="20" height="20" className="sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.372 0 0 5.373 0 12c0 6.627 5.372 12 12 12s12-5.373 12-12c0-6.627-5.372-12-12-12zm5.707 8.293l-1.414 8.485c-.104.624-.51.78-1.032.485l-2.857-2.107-1.378 1.327c-.152.152-.28.28-.573.28l.205-2.902 5.29-4.78c.23-.205-.05-.32-.357-.115l-6.545 4.12-2.82-.882c-.613-.19-.624-.613.128-.907l11.025-4.253c.512-.19.96.115.797.902z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-white/80 transition-colors hover:scale-110 active:scale-95" title="Subscribe on YouTube">
                <svg width="20" height="20" className="sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.454 3.5 12 3.5 12 3.5s-7.454 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.12 0 12 0 12s0 3.88.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.546 20.5 12 20.5 12 20.5s7.454 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.88 24 12 24 12s0-3.88-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </section>

        <footer className="mt-12 sm:mt-16 py-6 text-center text-xs sm:text-sm text-indigo-200">
          © {new Date().getFullYear()} Novunt — No limits to value, net worth and growth.
        </footer>
      </div>
      {mounted && <ChatWidget />}
    </main>
  );
}

