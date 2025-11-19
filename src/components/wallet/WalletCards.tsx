'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Lock, ShieldCheck, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWalletBalance } from '@/lib/queries';
import { Skeleton } from '@/components/ui/skeleton';
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
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-gradient-to-br
        ${isDeposit 
          ? 'from-card via-card to-accent/5 border-accent/20' 
          : 'from-card via-card to-secondary/5 border-secondary/20'
        }
        border shadow-lg hover:shadow-xl
        transition-all duration-300
      `}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`
              p-3 rounded-xl
              ${isDeposit ? 'bg-accent/10' : 'bg-secondary/10'}
            `}>
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">
                  {title}
                </h3>
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
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>

          {/* Lock Icon */}
          <div className={`
            p-2 rounded-lg
            ${isDeposit ? 'bg-accent/10' : 'bg-secondary/10'}
          `}>
            {isDeposit ? (
              <Lock className={`h-4 w-4 ${isDeposit ? 'text-accent' : 'text-secondary'}`} />
            ) : (
              <ShieldCheck className={`h-4 w-4 ${isDeposit ? 'text-accent' : 'text-secondary'}`} />
            )}
          </div>
        </div>

        {/* Balance */}
        <div className="mb-6">
          <motion.p
            key={balance}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-foreground mb-1"
          >
            ${balance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </motion.p>
          <p className="text-sm text-muted-foreground">
            USDT Balance
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={onAction}
          disabled={actionDisabled}
          className={`
            w-full group
            ${isDeposit 
              ? 'bg-accent hover:bg-accent/90' 
              : 'bg-secondary hover:bg-secondary/90'
            }
          `}
        >
          <span>{actionLabel}</span>
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Usage Stats */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {isDeposit ? 'Can withdraw' : 'Can withdraw'}
            </span>
            <span className={`font-semibold ${
              isDeposit ? 'text-destructive' : 'text-success'
            }`}>
              {isDeposit ? '❌ No' : '✅ Yes'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">
              {isDeposit ? 'Can stake' : 'Can stake'}
            </span>
            <span className="font-semibold text-success">
              ✅ Yes
            </span>
          </div>
        </div>
      </div>

      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const depositWallet = wallet?.funded?.balance || 0;
  const earningsWallet = wallet?.earnings?.balance || 0;

  const handleCreateStake = () => {
    // Navigate to stakes page where user can open the create stake modal
    router.push('/dashboard/stakes');
  };

  const handleWithdraw = () => {
    // Navigate to wallets page where withdraw modal can be opened
    // The QuickActions component on the wallets page handles the modal
    router.push('/dashboard/wallets');
    // Note: The actual modal opening is handled by QuickActions component
    // This navigation ensures user is on the right page
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* Deposit Wallet */}
      <WalletCard
        title="Deposit Wallet"
        balance={depositWallet}
        description="For staking only"
        icon={<Wallet className="h-6 w-6 text-accent" />}
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
        icon={<TrendingUp className="h-6 w-6 text-secondary" />}
        actionLabel="Withdraw Funds"
        onAction={handleWithdraw}
        actionDisabled={earningsWallet === 0}
        variant="earnings"
        tooltip="Receives ROS earnings, referral commissions, and bonuses. Can be withdrawn, transferred, or used for staking."
      />
    </motion.div>
  );
}

