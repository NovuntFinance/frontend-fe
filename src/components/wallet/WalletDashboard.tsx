/**
 * Wallet Dashboard Component
 * Ultra-modern wallet overview with glassmorphism and animations
 * Based on Backend TRD: FRONTEND_WALLET_IMPLEMENTATION_PHASE1.md
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Eye, EyeOff, Loader2, Send, DollarSign } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils/wallet';
import { WithdrawalModal } from './WithdrawalModal';
import { TransferModal } from './modals/TransferModal';
import { WalletBreakdown } from './WalletBreakdown';
import { ShimmerCard } from '@/components/ui/shimmer';
import { useUIStore } from '@/store/uiStore';

import { useStakingDashboard } from '@/lib/queries/stakingQueries';

/**
 * Animated balance counter
 * Counts up from 0 to target value
 */
function AnimatedBalance({ value, isLoading }: { value: number; isLoading: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);

  React.useEffect(() => {
    if (isLoading) {
      setDisplayValue(0);
      return;
    }

    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = value / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, isLoading]);

  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
    >
      ${formatCurrency(displayValue, { showCurrency: false })}
    </motion.span>
  );
}

/**
 * Wallet Dashboard Component
 */
export function WalletDashboard() {
  const { wallet, isLoading, error, refetch } = useWallet();
  const { data: stakingData } = useStakingDashboard();
  const { openModal } = useUIStore();

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  // Calculate total active staked amount to match Stakes Page
  const activeStakes = stakingData?.activeStakes || [];
  const totalActiveStaked = activeStakes.reduce((sum, stake) => sum + (stake.amount || 0), 0);
  const totalEarned = stakingData?.summary?.totalEarnedFromROS || 0;

  if (isLoading) {
    return <WalletDashboardSkeleton />;
  }

  if (error) {
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

  return (
    <div className="space-y-6">
      {/* Main Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10"
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

          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground mb-2">
                  Total Balance
                </CardTitle>
                <div className="flex items-center gap-3">
                  {balanceVisible ? (
                    <AnimatedBalance value={wallet.totalBalance} isLoading={isLoading} />
                  ) : (
                    <span className="text-4xl md:text-5xl font-bold">••••••</span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="rounded-full"
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
            {/* Two-Wallet Breakdown */}
            <WalletBreakdown wallet={wallet} balanceVisible={balanceVisible} />

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => openModal('deposit')}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  size="lg"
                >
                  <ArrowDownRight className="h-5 w-5" />
                  <span>Deposit</span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => setWithdrawalModalOpen(true)}
                  disabled={!wallet.canWithdraw}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 border-2 hover:bg-accent/10 hover:border-accent/50 transition-all duration-300"
                  size="lg"
                >
                  <ArrowUpRight className="h-5 w-5" />
                  <span>Withdraw</span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => setTransferModalOpen(true)}
                  disabled={!wallet.canTransfer}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 border-2 hover:bg-accent/10 hover:border-accent/50 transition-all duration-300"
                  size="lg"
                >
                  <Send className="h-5 w-5" />
                  <span>Transfer</span>
                </Button>
              </motion.div>
            </div>

            {/* Capabilities */}
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Can Stake</p>
                  <p className={`text-sm font-semibold ${wallet.canStake ? 'text-success' : 'text-muted-foreground'}`}>
                    {wallet.canStake ? '✓ Yes' : '✗ No'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Can Withdraw</p>
                  <p className={`text-sm font-semibold ${wallet.canWithdraw ? 'text-success' : 'text-muted-foreground'}`}>
                    {wallet.canWithdraw ? '✓ Yes' : '✗ No'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Can Transfer</p>
                  <p className={`text-sm font-semibold ${wallet.canTransfer ? 'text-success' : 'text-muted-foreground'}`}>
                    {wallet.canTransfer ? '✓ Yes' : '✗ No'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatCard
          label="Total Deposited"
          value={wallet.statistics.totalDeposited}
          icon={<ArrowDownRight className="h-4 w-4" />}
          color="text-success"
        />
        <StatCard
          label="Total Withdrawn"
          value={wallet.statistics.totalWithdrawn}
          icon={<ArrowUpRight className="h-4 w-4" />}
          color="text-destructive"
        />
        <StatCard
          label="Total Staked"
          value={totalActiveStaked}
          icon={<TrendingUp className="h-4 w-4" />}
          color="text-primary"
        />
        <StatCard
          label="Total Earned"
          value={totalEarned}
          icon={<DollarSign className="h-4 w-4" />}
          color="text-emerald-500"
        />
      </motion.div>

      {/* Modals */}
      <WithdrawalModal open={withdrawalModalOpen} onOpenChange={setWithdrawalModalOpen} />
      <TransferModal isOpen={transferModalOpen} onClose={() => setTransferModalOpen(false)} />
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({
  label,
  value,
  icon,
  color,
  className,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <motion.p
                key={value}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className={`text-lg font-bold ${color}`}
              >
                {formatCurrency(value, { showCurrency: false })}
              </motion.p>
            </div>
            <motion.div
              className={`p-2 rounded-lg bg-muted ${color}`}
              whileHover={{ rotate: 5, scale: 1.1 }}
            >
              {icon}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Loading Skeleton
 */
function WalletDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <ShimmerCard className="h-64" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ShimmerCard />
        <ShimmerCard />
        <ShimmerCard />
      </div>
    </div>
  );
}

