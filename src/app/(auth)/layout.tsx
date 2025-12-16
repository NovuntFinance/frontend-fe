'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Disable static generation
export const dynamic = 'force-dynamic';

function GradientBlob({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full opacity-60 blur-3xl ${className}`}
    />
  );
}

/**
 * Auth Layout - Premium Design matching home page
 * Full-screen with animated gradients and glassmorphism
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white">
      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <GradientBlob className="top-[-20%] left-[-10%] h-[80vh] w-[80vw] animate-pulse bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500" />
        <GradientBlob className="top-[40%] right-[-10%] h-[60vh] w-[60vw] bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500" />
        <GradientBlob className="bottom-[-10%] left-[20%] h-[50vh] w-[50vw] bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500" />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-50 mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-6"
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
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/50 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* Form Container */}
      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 py-6 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} Novunt — No limits to value, net
              worth and growth.
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-white/60 transition-colors hover:text-white"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-white/60 transition-colors hover:text-white"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
