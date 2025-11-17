'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWalletBalance } from '@/lib/queries';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Hero Section - Total Portfolio Balance
 * Premium animated display with Novunt branding
 */
export function WalletHero() {
  const { data: wallet, isLoading, refetch, isRefetching } = useWalletBalance();
  const [showBalance, setShowBalance] = React.useState(true);

  const totalBalance = wallet?.total || 0;
  const depositWallet = wallet?.funded?.balance || 0;
  const earningsWallet = wallet?.earnings?.balance || 0;

  // Calculate percentage change (mock for now - implement based on historical data)
  const percentageChange = 12.5;
  const isPositive = percentageChange >= 0;

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-foreground/10 p-8">
        <Skeleton className="h-32 w-full bg-primary-foreground/20" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-novunt-blue-700 p-8 shadow-2xl"
    >
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-24 -right-24 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent/10 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with Controls */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium mb-1">
              Total Portfolio Value
            </p>
            <div className="flex items-center gap-3">
              {showBalance ? (
                <motion.h2
                  key="balance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl font-bold text-primary-foreground tracking-tight"
                >
                  ${totalBalance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </motion.h2>
              ) : (
                <motion.div
                  key="hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl font-bold text-primary-foreground"
                >
                  ••••••
                </motion.div>
              )}
              <span className="text-xl text-primary-foreground/60 font-medium">
                USDT
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBalance(!showBalance)}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              {showBalance ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <RefreshCw
                className={`h-5 w-5 ${isRefetching ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6">
          {/* Percentage Change */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                isPositive
                  ? 'bg-success/20 text-success'
                  : 'bg-danger/20 text-danger'
              }`}
            >
              <TrendingUp
                className={`h-4 w-4 ${!isPositive && 'rotate-180'}`}
              />
              <span className="text-sm font-semibold">
                {isPositive && '+'}
                {percentageChange}%
              </span>
            </div>
            <span className="text-sm text-primary-foreground/60">
              Today
            </span>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-primary-foreground/20" />

          {/* Quick Wallet Breakdown */}
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-primary-foreground/60">Deposit: </span>
              <span className="text-primary-foreground font-semibold">
                ${depositWallet.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-primary-foreground/60">Earnings: </span>
              <span className="text-primary-foreground font-semibold">
                ${earningsWallet.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Glass Morphism Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}

