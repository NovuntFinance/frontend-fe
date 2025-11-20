'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Moon, Sun, TrendingUp, Gift, Star, Shield, Users } from 'lucide-react';

// Disable static generation
export const dynamic = 'force-dynamic';

/**
 * Auth Layout - Modern Design
 * Split-screen with animated gradients, floating elements, and premium styling
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    { icon: Shield, text: 'Bank-grade security with 2FA' },
    { icon: TrendingUp, text: 'Up to 200% return on stakes' },
    { icon: Gift, text: '5-level referral rewards' },
    { icon: Star, text: 'Instant deposits & fast withdrawals' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Info */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90"
      >
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/20 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 5,
            }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-secondary/30 to-transparent rounded-full blur-3xl"
          />
          
          {/* Floating Particles - Fixed positions to avoid hydration mismatch */}
          {mounted && [
            { top: 15, left: 25, delay: 0, duration: 8 },
            { top: 45, left: 75, delay: 1, duration: 7 },
            { top: 70, left: 15, delay: 2, duration: 9 },
            { top: 30, left: 85, delay: 0.5, duration: 6 },
            { top: 85, left: 45, delay: 3, duration: 8 },
            { top: 20, left: 55, delay: 1.5, duration: 7 },
            { top: 60, left: 90, delay: 2.5, duration: 9 },
            { top: 50, left: 10, delay: 0.8, duration: 6 },
            { top: 10, left: 65, delay: 3.5, duration: 8 },
            { top: 75, left: 35, delay: 1.2, duration: 7 },
            { top: 40, left: 50, delay: 2.8, duration: 9 },
            { top: 55, left: 20, delay: 0.3, duration: 6 },
            { top: 25, left: 80, delay: 3.2, duration: 8 },
            { top: 90, left: 60, delay: 1.8, duration: 7 },
            { top: 35, left: 40, delay: 2.2, duration: 9 },
          ].map((particle, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, 20, -20],
                x: [-10, 10, -10],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: particle.delay,
              }}
              className="absolute w-2 h-2 bg-white/40 rounded-full blur-sm"
              style={{
                top: `${particle.top}%`,
                left: `${particle.left}%`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <Link href="/" className="group inline-flex">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Image
              src="/icons/novunt.png"
              alt="Novunt"
              width={180}
              height={48}
                className="h-10 w-auto object-contain transition-transform brightness-0 invert"
            />
            </motion.div>
          </Link>

          {/* Main Message */}
          <div className="space-y-8 max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-5xl font-bold leading-tight mb-4">
                Build Your Wealth,
                <br />
                <span className="text-white/90">One Stake at a Time</span>
              </h1>
              <p className="text-xl text-white/80 leading-relaxed">
                Join thousands of investors earning up to 200% returns through smart staking.
                Secure, transparent, and designed for your financial growth.
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 gap-4"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                  >
                    <div className="p-2 rounded-lg bg-white/20 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-white/90 font-medium">{feature.text}</span>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center gap-6 pt-6 border-t border-white/20"
            >
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-white/80" />
                <div className="text-sm">
                  <p className="font-bold text-white">10,000+</p>
                  <p className="text-white/60">Active Users</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-white/80" />
                <div className="text-sm">
                  <p className="font-bold text-white">$2M+</p>
                  <p className="text-white/60">Total Staked</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-white/60">
            <p>&copy; 2025 Novunt. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col relative bg-background">
        {/* Theme Toggle */}
        {mounted && (
          <div className="absolute top-6 right-6 z-20">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors shadow-lg border border-border/50"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-foreground" />
              )}
            </motion.button>
          </div>
        )}

        {/* Mobile Logo */}
        <div className="lg:hidden pt-8 px-6">
          <Link href="/">
            <Image
              src="/icons/novunt.png"
              alt="Novunt"
              width={160}
              height={42}
              className="h-8 w-auto object-contain dark:brightness-0 dark:invert"
            />
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md"
          >
            {children}
          </motion.div>
        </div>

        {/* Mobile Footer */}
        <div className="lg:hidden p-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Novunt. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
