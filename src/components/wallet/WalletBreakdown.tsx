/**
 * Wallet Breakdown Component
 * Shows funded and earning wallet breakdown using Staking Streak template
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/wallet';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { UserWallet } from '@/services/walletApi';

interface WalletBreakdownProps {
  wallet: UserWallet;
  balanceVisible: boolean;
}

export function WalletBreakdown({
  wallet,
  balanceVisible,
}: WalletBreakdownProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Funded Wallet */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent" />

          {/* Animated Floating Blob */}
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

          <CardHeader className="relative p-4 sm:p-6">
            <div className="mb-2 flex items-center gap-2 sm:gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -10 }}
                className="rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
              >
                <Wallet className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <CardTitle className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                  Funded Wallet
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs">
                  For staking only
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="mb-2 flex items-baseline gap-2 sm:mb-4 sm:gap-3">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-2xl font-black break-words text-transparent sm:text-3xl md:text-4xl lg:text-5xl"
              >
                {balanceVisible
                  ? formatCurrency(wallet.fundedWallet, { showCurrency: false })
                  : '••••'}
              </motion.span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Earning Wallet */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-transparent" />

          {/* Animated Floating Blob */}
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
            className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-emerald-500/30 blur-2xl"
          />

          <CardHeader className="relative p-4 sm:p-6">
            <div className="mb-2 flex items-center gap-2 sm:gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -10 }}
                className="rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
              >
                <TrendingUp className="h-5 w-5 text-emerald-500 sm:h-6 sm:w-6" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <CardTitle className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                  Earning Wallet
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs">
                  Withdrawable
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="mb-2 flex items-baseline gap-2 sm:mb-4 sm:gap-3">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 }}
                className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-2xl font-black break-words text-transparent sm:text-3xl md:text-4xl lg:text-5xl"
              >
                {balanceVisible
                  ? formatCurrency(wallet.earningWallet, {
                      showCurrency: false,
                    })
                  : '••••'}
              </motion.span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
