'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  Lock,
  ShieldCheck,
  Info,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWalletBalance } from '@/lib/queries';
import { ShimmerCard } from '@/components/ui/shimmer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface WalletCardProps {
  title: string;
  balance: number;
  description: string;
  icon: React.ReactNode;
  actionLabel: string;
  onAction: () => void;
  actionDisabled?: boolean;
  variant: 'deposit' | 'earnings';
  tooltip: string;
}

const WalletCard: React.FC<WalletCardProps> = ({
  title,
  balance,
  description,
  icon,
  actionLabel,
  onAction,
  actionDisabled = false,
  variant,
  tooltip,
}) => {
  const isDeposit = variant === 'deposit';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 ${
        isDeposit
          ? 'from-card via-card to-accent/5 border-accent/20'
          : 'from-card via-card to-secondary/5 border-secondary/20'
      } border shadow-lg transition-all duration-300 hover:shadow-xl`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-xl p-3 ${isDeposit ? 'bg-accent/10' : 'bg-secondary/10'} `}
            >
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          </div>

          {/* Lock Icon */}
          <div
            className={`rounded-lg p-2 ${isDeposit ? 'bg-accent/10' : 'bg-secondary/10'} `}
          >
            {isDeposit ? (
              <Lock
                className={`h-4 w-4 ${isDeposit ? 'text-accent' : 'text-secondary'}`}
              />
            ) : (
              <ShieldCheck
                className={`h-4 w-4 ${isDeposit ? 'text-accent' : 'text-secondary'}`}
              />
            )}
          </div>
        </div>

        {/* Balance */}
        <div className="mb-6">
          <motion.p
            key={balance}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-foreground mb-1 text-4xl font-bold"
          >
            $
            {balance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </motion.p>
          <p className="text-muted-foreground text-sm">USDT Balance</p>
        </div>

        {/* Action Button */}
        <Button
          onClick={onAction}
          disabled={actionDisabled}
          className={`group w-full ${
            isDeposit
              ? 'bg-accent hover:bg-accent/90'
              : 'bg-secondary hover:bg-secondary/90'
          } `}
        >
          <span>{actionLabel}</span>
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>

        {/* Usage Stats */}
        <div className="border-border/50 mt-4 border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {isDeposit ? 'Can withdraw' : 'Can withdraw'}
            </span>
            <span
              className={`font-semibold ${
                isDeposit ? 'text-destructive' : 'text-success'
              }`}
            >
              {isDeposit ? '❌ No' : '✅ Yes'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {isDeposit ? 'Can stake' : 'Can stake'}
            </span>
            <span className="text-success font-semibold">✅ Yes</span>
          </div>
        </div>
      </div>

      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 5,
        }}
        style={{ width: '50%' }}
      />
    </motion.div>
  );
};

/**
 * Wallet Cards Component
 * Displays both Deposit and Earnings wallets with clear distinction
 */
export function WalletCards() {
  const router = useRouter();
  const { data: wallet, isLoading } = useWalletBalance();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ShimmerCard className="h-48" />
        <ShimmerCard className="h-48" />
      </div>
    );
  }

  const depositWallet = wallet?.funded?.availableBalance ?? 0;
  const earningsWallet = wallet?.earnings?.availableBalance ?? 0;

  const handleCreateStake = () => {
    router.push('/dashboard/stakes/new');
  };

  const handleWithdraw = () => {
    router.push('/dashboard/withdrawals');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 gap-6 md:grid-cols-2"
    >
      {/* Deposit Wallet */}
      <WalletCard
        title="Deposit Wallet"
        balance={depositWallet}
        description="For staking only"
        icon={<Wallet className="text-accent h-6 w-6" />}
        actionLabel="Create Stake"
        onAction={handleCreateStake}
        actionDisabled={depositWallet === 0}
        variant="deposit"
        tooltip="Receives deposits and P2P transfers. Funds can only be used for staking, not for withdrawals."
      />

      {/* Earnings Wallet */}
      <WalletCard
        title="Earnings Wallet"
        balance={earningsWallet}
        description="Withdrawable funds"
        icon={<TrendingUp className="text-secondary h-6 w-6" />}
        actionLabel="Withdraw Funds"
        onAction={handleWithdraw}
        actionDisabled={earningsWallet === 0}
        variant="earnings"
        tooltip="Receives ROS earnings, referral commissions, and bonuses. Can be withdrawn, transferred, or used for staking."
      />
    </motion.div>
  );
}
