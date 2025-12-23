'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { WalletDashboard, TransactionHistory } from '@/components/wallet';
import { useUIStore } from '@/store/uiStore';
import { prefersReducedMotion } from '@/lib/accessibility';
import { useResponsive } from '@/hooks/useResponsive';

/**
 * Modern Wallet Dashboard Page
 * Merged overview and transactions in a single scrollable page
 * Premium finance platform design with Novunt branding
 */
export default function WalletPage() {
  const { openModal } = useUIStore();
  const reducedMotion = prefersReducedMotion();
  const { isMobile, breakpoint } = useResponsive();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header - Staking Streak Template */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: -20 }}
        animate={reducedMotion ? false : { opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent" />

          {/* Animated Floating Blob */}
          {!reducedMotion && (
            <motion.div
              animate={{
                x: [0, -15, 0],
                y: [0, 10, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-blue-500/30 blur-2xl"
            />
          )}

          <CardHeader className="relative p-4 sm:p-6">
            <div className="mb-2 flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  className="rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                >
                  <Wallet className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                    Wallet
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">
                    Manage your funds, deposits, and withdrawals
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Main Content - Merged Overview and Transactions */}
      <WalletDashboard />

      {/* Transaction History Section */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={reducedMotion ? false : { opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <TransactionHistory />
      </motion.div>
    </div>
  );
}
