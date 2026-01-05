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
  DollarSign,
  Wallet as WalletIcon,
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
import { StatCard } from './StatCard';
import { WalletDashboardSkeleton } from './WalletDashboardSkeleton';
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';
import { walletLogger } from '@/lib/logger';
import { prefersReducedMotion } from '@/lib/accessibility';
import { slideUp, hoverAnimation } from '@/design-system/animations';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useActiveStakes, useDashboardOverview } from '@/lib/queries';

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
  const { data: activeStakes } = useActiveStakes();
  const { data: overview } = useDashboardOverview();

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  // Get statistics directly from backend - no calculations needed
  // Backend provides all statistics in wallet.statistics
  const baseStatistics = wallet?.statistics || {
    totalDeposited: 0,
    totalWithdrawn: 0,
    totalTransferReceived: 0,
    totalTransferSent: 0,
    totalStaked: 0,
    totalStakeReturns: 0,
    totalEarned: 0,
  };

  // Calculate totalStaked similar to dashboard page
  // Priority: overview > activeStakes calculation > wallet statistics
  const activeStakesArray = Array.isArray(activeStakes)
    ? activeStakes
    : (activeStakes as any)?.data?.activeStakes ||
      (activeStakes as any)?.activeStakes ||
      [];

  const totalStakedFromOverview = overview?.staking?.totalStaked;
  const totalStakedFromActiveStakes =
    activeStakesArray.length > 0
      ? activeStakesArray.reduce((sum: number, stake: any) => {
          const amount = Number(stake?.amount || stake?.stakeAmount || 0);
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0)
      : 0;

  const calculatedTotalStaked =
    totalStakedFromOverview ??
    totalStakedFromActiveStakes ??
    baseStatistics.totalStaked ??
    0;

  // Merge statistics with calculated totalStaked
  const statistics = {
    ...baseStatistics,
    totalStaked: calculatedTotalStaked,
  };

  const toggleBalanceVisibility = useCallback(() => {
    setBalanceVisible((prev) => !prev);
  }, []);

  if (isLoading) {
    return <WalletDashboardSkeleton />;
  }

  if (error) {
    walletLogger.error('Failed to load wallet', error);
    return (
      <UserFriendlyError
        error={error}
        onRetry={() => refetch()}
        variant="card"
      />
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
      <motion.div {...slideUp(0.1)}>
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
                  {...hoverAnimation()}
                  className="rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                >
                  <WalletIcon className="h-5 w-5 text-purple-500 sm:h-6 sm:w-6" />
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
              <QuickActions />
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

      {/* Statistics Cards - 2x2 Grid Matching Dashboard */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={reducedMotion ? false : { opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
      >
        <StatCard
          label="Total Earned"
          value={statistics.totalEarned}
          icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />}
          colorTheme="emerald"
        />
        <StatCard
          label="Total Staked"
          value={statistics.totalStaked}
          icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />}
          colorTheme="orange"
        />
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
