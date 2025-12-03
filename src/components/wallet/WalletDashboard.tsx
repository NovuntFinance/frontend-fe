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
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WithdrawalModal } from './WithdrawalModal';
import { TransferModal } from './modals/TransferModal';
import { WalletBreakdown } from './WalletBreakdown';
import { useUIStore } from '@/store/uiStore';
import { AnimatedBalance } from './AnimatedBalance';
import { StatCard } from './StatCard';
import { WalletDashboardSkeleton } from './WalletDashboardSkeleton';
import { walletLogger } from '@/lib/logger';
import { prefersReducedMotion } from '@/lib/accessibility';

/**
 * Quick Actions Component
 * Memoized to prevent unnecessary re-renders
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
    <div className="mt-6 grid grid-cols-3 gap-3">
      <motion.div {...motionProps}>
        <Button
          onClick={onDeposit}
          className="from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-primary/20 hover:shadow-primary/30 flex w-full items-center justify-center gap-2 bg-gradient-to-r shadow-lg transition-all duration-300 hover:shadow-xl"
          size="lg"
        >
          <ArrowDownRight className="h-5 w-5" />
          <span>Deposit</span>
        </Button>
      </motion.div>
      <motion.div {...motionProps}>
        <Button
          onClick={onWithdraw}
          disabled={!canWithdraw}
          variant="outline"
          className="hover:bg-accent/10 hover:border-accent/50 flex w-full items-center justify-center gap-2 border-2 transition-all duration-300"
          size="lg"
        >
          <ArrowUpRight className="h-5 w-5" />
          <span>Withdraw</span>
        </Button>
      </motion.div>
      <motion.div {...motionProps}>
        <Button
          onClick={onTransfer}
          disabled={!canTransfer}
          variant="outline"
          className="hover:bg-accent/10 hover:border-accent/50 flex w-full items-center justify-center gap-2 border-2 transition-all duration-300"
          size="lg"
        >
          <Send className="h-5 w-5" />
          <span>Transfer</span>
        </Button>
      </motion.div>
    </div>
  );
});

/**
 * Wallet Capabilities Component
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
    <div className="border-border/50 mt-6 border-t pt-6">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-muted-foreground mb-1 text-xs">Can Stake</p>
          <p
            className={`text-3xl font-semibold ${canStake ? 'text-success' : 'text-muted-foreground'}`}
          >
            {canStake ? '🟢' : '🔴'}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1 text-xs">Can Withdraw</p>
          <p
            className={`text-3xl font-semibold ${canWithdraw ? 'text-success' : 'text-muted-foreground'}`}
          >
            {canWithdraw ? '🟢' : '🔴'}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1 text-xs">Can Transfer</p>
          <p
            className={`text-3xl font-semibold ${canTransfer ? 'text-success' : 'text-muted-foreground'}`}
          >
            {canTransfer ? '🟢' : '🔴'}
          </p>
        </div>
      </div>
    </div>
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
    <div className="space-y-6">
      {/* Main Balance Card */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={reducedMotion ? false : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-primary/20 from-card via-card to-primary/5 relative overflow-hidden border-2 bg-gradient-to-br">
          {/* Animated background gradient */}
          {!reducedMotion && (
            <>
              <motion.div
                className="from-primary/10 via-accent/10 to-primary/10 absolute inset-0 bg-gradient-to-r"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              />
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 5,
                }}
                style={{ width: '50%' }}
              />
            </>
          )}

          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-muted-foreground mb-2 text-sm font-medium">
                  Total Balance
                </CardTitle>
                <div className="flex items-center gap-3">
                  {balanceVisible ? (
                    <AnimatedBalance
                      value={wallet.totalBalance}
                      isLoading={isLoading}
                    />
                  ) : (
                    <span className="text-4xl font-bold md:text-5xl">
                      ••••••
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleBalanceVisibility}
                className="rounded-full"
                aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
              >
                {balanceVisible ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="relative z-10">
            <WalletBreakdown wallet={wallet} balanceVisible={balanceVisible} />

            <QuickActions
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
              onTransfer={handleTransfer}
              canWithdraw={wallet.canWithdraw}
              canTransfer={wallet.canTransfer}
            />

            <WalletCapabilities
              canStake={wallet.canStake}
              canWithdraw={wallet.canWithdraw}
              canTransfer={wallet.canTransfer}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={reducedMotion ? false : { opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
      >
        <StatCard
          label="Total Deposited"
          value={statistics.totalDeposited}
          icon={<ArrowDownRight className="h-4 w-4" />}
          color="text-success"
        />
        <StatCard
          label="Total Withdrawn"
          value={statistics.totalWithdrawn}
          icon={<ArrowUpRight className="h-4 w-4" />}
          color="text-destructive"
        />
        <StatCard
          label="Total Staked"
          value={statistics.totalStaked}
          icon={<TrendingUp className="h-4 w-4" />}
          color="text-primary"
        />
        <StatCard
          label="Total Earned"
          value={statistics.totalEarned}
          icon={<DollarSign className="h-4 w-4" />}
          color="text-emerald-500"
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
