/**
 * Wallet Dashboard Component
 * Ultra-modern wallet overview with glassmorphism and animations
 * Based on Backend TRD: FRONTEND_WALLET_IMPLEMENTATION_PHASE1.md
 */

'use client';

import React, { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Send,
  DollarSign,
  Wallet,
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WithdrawalModal } from './WithdrawalModal';
import { TransferModal } from './modals/TransferModal';
import { WalletBreakdown } from './WalletBreakdown';
import { useUIStore } from '@/store/uiStore';
import { StatCard } from './StatCard';
import { WalletDashboardSkeleton } from './WalletDashboardSkeleton';
import { walletLogger } from '@/lib/logger';
import { prefersReducedMotion } from '@/lib/accessibility';

/**
 * Quick Actions Component
 * Matching dashboard QuickActions style
 */
const QuickActions = memo(function QuickActions({
  onDeposit,
  onWithdraw,
  onTransfer,
  canWithdraw,
  canTransfer,
}: {
  onDeposit: () => void;
  onWithdraw: () => void;
  onTransfer: () => void;
  canWithdraw: boolean;
  canTransfer: boolean;
}) {
  const reducedMotion = prefersReducedMotion();
  const motionProps = reducedMotion
    ? {}
    : {
        whileHover: { scale: 1.02, y: -2 },
        whileTap: { scale: 0.98 },
        transition: { type: 'spring' as const, stiffness: 400, damping: 17 },
      };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <motion.button
        {...motionProps}
        onClick={onDeposit}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 transition-all duration-200 hover:shadow-lg dark:border-emerald-800 dark:bg-emerald-900/20"
      >
        <div className="rounded-full bg-white p-3 shadow-sm dark:bg-gray-800">
          <ArrowDownRight className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <span className="font-semibold text-gray-900 dark:text-white">
          Deposit
        </span>
      </motion.button>
      <motion.button
        {...motionProps}
        onClick={onWithdraw}
        disabled={!canWithdraw}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-amber-200 bg-amber-50 p-4 transition-all duration-200 hover:shadow-lg disabled:opacity-50 dark:border-amber-800 dark:bg-amber-900/20"
      >
        <div className="rounded-full bg-white p-3 shadow-sm dark:bg-gray-800">
          <ArrowUpRight className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <span className="font-semibold text-gray-900 dark:text-white">
          Withdraw
        </span>
      </motion.button>
      <motion.button
        {...motionProps}
        onClick={onTransfer}
        disabled={!canTransfer}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-purple-200 bg-purple-50 p-4 transition-all duration-200 hover:shadow-lg disabled:opacity-50 dark:border-purple-800 dark:bg-purple-900/20"
      >
        <div className="rounded-full bg-white p-3 shadow-sm dark:bg-gray-800">
          <Send className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <span className="font-semibold text-gray-900 dark:text-white">
          Transfer
        </span>
      </motion.button>
      <motion.button
        {...motionProps}
        onClick={() => (window.location.href = '/dashboard/stake')}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 p-4 transition-all duration-200 hover:shadow-lg dark:border-blue-800 dark:bg-blue-900/20"
      >
        <div className="rounded-full bg-white p-3 shadow-sm dark:bg-gray-800">
          <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <span className="font-semibold text-gray-900 dark:text-white">
          Stake
        </span>
      </motion.button>
    </div>
  );
});

/**
 * Wallet Capabilities Component - Staking Streak Template
 */
const WalletCapabilities = memo(function WalletCapabilities({
  canStake,
  canWithdraw,
  canTransfer,
}: {
  canStake: boolean;
  canWithdraw: boolean;
  canTransfer: boolean;
}) {
  return (
    <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent" />

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
        className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-orange-500/30 blur-2xl"
      />

      <CardHeader className="relative p-4 sm:p-6">
        <div className="mb-2 flex items-center gap-2 sm:gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -10 }}
            className="rounded-xl bg-gradient-to-br from-orange-500/30 to-amber-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
          >
            <DollarSign className="h-5 w-5 text-orange-500 sm:h-6 sm:w-6" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <CardTitle className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
              Wallet Capabilities
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">
              Your wallet permissions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-muted-foreground mb-2 text-xs sm:text-sm">
              Can Stake
            </p>
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-2xl ${canStake ? 'bg-emerald-500/20 text-emerald-500' : 'bg-muted text-muted-foreground'}`}
            >
              {canStake ? '✓' : '✗'}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground mb-2 text-xs sm:text-sm">
              Can Withdraw
            </p>
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-2xl ${canWithdraw ? 'bg-emerald-500/20 text-emerald-500' : 'bg-muted text-muted-foreground'}`}
            >
              {canWithdraw ? '✓' : '✗'}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground mb-2 text-xs sm:text-sm">
              Can Transfer
            </p>
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-2xl ${canTransfer ? 'bg-emerald-500/20 text-emerald-500' : 'bg-muted text-muted-foreground'}`}
            >
              {canTransfer ? '✓' : '✗'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Wallet Dashboard Component
 */
export function WalletDashboard() {
  const { wallet, isLoading, error, refetch } = useWallet();
  const { openModal } = useUIStore();

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  // Get statistics directly from backend - no calculations needed
  // Backend provides all statistics in wallet.statistics
  const statistics = wallet?.statistics || {
    totalDeposited: 0,
    totalWithdrawn: 0,
    totalTransferReceived: 0,
    totalTransferSent: 0,
    totalStaked: 0,
    totalStakeReturns: 0,
    totalEarned: 0,
  };

  // Memoize callbacks
  const handleDeposit = useCallback(() => {
    walletLogger.info('Opening deposit modal');
    openModal('deposit');
  }, [openModal]);

  const handleWithdraw = useCallback(() => {
    walletLogger.info('Opening withdrawal modal');
    setWithdrawalModalOpen(true);
  }, []);

  const handleTransfer = useCallback(() => {
    walletLogger.info('Opening transfer modal');
    setTransferModalOpen(true);
  }, []);

  const toggleBalanceVisibility = useCallback(() => {
    setBalanceVisible((prev) => !prev);
  }, []);

  if (isLoading) {
    return <WalletDashboardSkeleton />;
  }

  if (error) {
    walletLogger.error('Failed to load wallet', error);
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load wallet</p>
            <Button onClick={() => refetch()} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!wallet) {
    return null;
  }

  // Debug logging for statistics cards (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('[WalletDashboard] Statistics Cards Data:', {
      statistics,
      walletStatistics: wallet?.statistics,
    });
  }

  const reducedMotion = prefersReducedMotion();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Balance Card - Staking Streak Template */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={reducedMotion ? false : { opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card className="bg-card/50 group relative overflow-visible border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-transparent" />

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
              className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-purple-500/30 blur-2xl"
            />
          )}

          <CardHeader className="relative p-4 sm:p-6">
            <div className="mb-2 flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  className="rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                >
                  <Wallet className="h-5 w-5 text-purple-500 sm:h-6 sm:w-6" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                    Total Balance
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">
                    Your complete wallet balance
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleBalanceVisibility}
                className="h-8 w-8 shrink-0 rounded-full"
                aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
              >
                {balanceVisible ? (
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
            {/* Balance Display */}
            <div className="mb-4 flex w-full min-w-0 items-baseline gap-2 sm:mb-6 sm:gap-3">
              {balanceVisible ? (
                <motion.span
                  initial={reducedMotion ? false : { opacity: 0, scale: 0.5 }}
                  animate={reducedMotion ? false : { opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  key={wallet.totalBalance}
                  className="overflow-visible bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-2xl leading-tight font-black whitespace-nowrap text-transparent sm:text-3xl md:text-4xl lg:text-5xl"
                  style={{ wordBreak: 'keep-all' }}
                >
                  $
                  {wallet.totalBalance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </motion.span>
              ) : (
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-2xl font-black text-transparent sm:text-3xl md:text-4xl lg:text-5xl">
                  ••••••
                </span>
              )}
            </div>

            <WalletBreakdown wallet={wallet} balanceVisible={balanceVisible} />

            <div className="mt-6">
              <QuickActions
                onDeposit={handleDeposit}
                onWithdraw={handleWithdraw}
                onTransfer={handleTransfer}
                canWithdraw={wallet.canWithdraw}
                canTransfer={wallet.canTransfer}
              />
            </div>

            <div className="mt-6">
              <WalletCapabilities
                canStake={wallet.canStake}
                canWithdraw={wallet.canWithdraw}
                canTransfer={wallet.canTransfer}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={reducedMotion ? false : { opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-4 md:gap-6"
      >
        <StatCard
          label="Total Deposited"
          value={statistics.totalDeposited}
          icon={<ArrowDownRight className="h-5 w-5 sm:h-6 sm:w-6" />}
          colorTheme="purple"
        />
        <StatCard
          label="Total Withdrawn"
          value={statistics.totalWithdrawn}
          icon={<ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6" />}
          colorTheme="blue"
        />
        <StatCard
          label="Total Staked"
          value={statistics.totalStaked}
          icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />}
          colorTheme="orange"
        />
        <StatCard
          label="Total Earned"
          value={statistics.totalEarned}
          icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />}
          colorTheme="emerald"
        />
      </motion.div>

      {/* Modals */}
      <WithdrawalModal
        open={withdrawalModalOpen}
        onOpenChange={setWithdrawalModalOpen}
      />
      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
      />
    </div>
  );
}
