/**
 * Wallet Dashboard – Neumorphic layout matching reference
 * Mobile: stacked (Total Balance → Wallets → Actions → Capabilities → Earned/Staked → Whitelist → Recent Tx)
 * Desktop: two columns (left: balance + actions + whitelist; right: wallets + earned/staked), bottom: recent tx
 */

'use client';

import React, { useState, useCallback, memo } from 'react';
import {
  TrendingUp,
  Eye,
  EyeOff,
  DollarSign,
  Wallet as WalletIcon,
  Check,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { WithdrawalModal } from './WithdrawalModal';
import { WithdrawalAddressManager } from './WithdrawalAddressManager';
import { TransferModal } from './modals/TransferModal';
import { WalletBreakdown } from './WalletBreakdown';
import { WalletDashboardSkeleton } from './WalletDashboardSkeleton';
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';
import { walletLogger } from '@/lib/logger';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useActiveStakes, useDashboardOverview } from '@/lib/queries';
import { formatCurrency } from '@/lib/utils/wallet';
import { useUIStore } from '@/store/uiStore';
import neuStyles from '@/styles/neumorphic.module.css';
import walletStyles from '@/styles/wallet-page.module.css';

/* Hierarchy via #009BF2 opacity only – no other colors */
const NEU_ACCENT = 'rgba(0,155,242,0.95)';
const NEU_MUTED = 'rgba(0,155,242,0.55)';
const NEU_HIGHLIGHT = 'rgba(0,155,242,0.85)'; /* e.g. positive change */

type StatCardItem = {
  label: string;
  value: number;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
};

function StatCard({
  label,
  value,
  icon: Icon,
  balanceVisible,
  carousel,
}: StatCardItem & { balanceVisible: boolean; carousel?: boolean }) {
  return (
    <div
      className={`rounded-[18px] p-4 ${neuStyles['neu-card']} ${
        carousel ? 'min-w-[260px] flex-shrink-0 snap-center' : ''
      }`}
    >
      <div className="mb-1 flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color: 'var(--neu-accent)' }} />
        <p className={walletStyles.labelUppercase} style={{ color: NEU_MUTED }}>
          {label}
        </p>
      </div>
      <p className="text-lg font-bold sm:text-xl" style={{ color: NEU_ACCENT }}>
        {balanceVisible
          ? `$${formatCurrency(value, { showCurrency: false })}`
          : '••••'}
      </p>
    </div>
  );
}

const WalletCapabilities = memo(function WalletCapabilities({
  canStake,
  canWithdraw,
  canTransfer,
}: {
  canStake: boolean;
  canWithdraw: boolean;
  canTransfer: boolean;
}) {
  const items = [
    { label: 'Can Stake Assets', enabled: canStake },
    { label: 'Can Withdraw Funds', enabled: canWithdraw },
    { label: 'Can Transfer Assets', enabled: canTransfer },
  ];
  return (
    <div className={`rounded-[18px] p-4 ${neuStyles['neu-card']}`}>
      <p
        className={`mb-3 ${walletStyles.labelUppercase}`}
        style={{ color: NEU_MUTED }}
      >
        Wallet Capabilities
      </p>
      <ul className="space-y-2">
        {items.map(({ label, enabled }) => (
          <li key={label} className="flex items-center gap-3">
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
              style={{
                background: enabled ? 'var(--neu-accent)' : 'var(--neu-bg)',
                boxShadow: 'var(--neu-shadow-inset)',
                color: enabled ? 'var(--neu-bg)' : NEU_MUTED,
              }}
            >
              {enabled && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
            </div>
            <span style={{ color: NEU_ACCENT }}>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});

export function WalletDashboard() {
  const { wallet, isLoading, error, refetch } = useWallet();
  const { data: activeStakes } = useActiveStakes();
  const { data: overview } = useDashboardOverview();

  const balanceVisible = useUIStore((s) => s.balanceVisible);
  const toggleBalanceVisible = useUIStore((s) => s.toggleBalanceVisible);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  const baseStatistics = wallet?.statistics || {
    totalDeposited: 0,
    totalWithdrawn: 0,
    totalTransferReceived: 0,
    totalTransferSent: 0,
    totalStaked: 0,
    totalStakeReturns: 0,
    totalEarned: 0,
  };

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
  const statistics = { ...baseStatistics, totalStaked: calculatedTotalStaked };

  const toggleBalanceVisibility = useCallback(() => {
    toggleBalanceVisible();
  }, [toggleBalanceVisible]);

  if (isLoading) return <WalletDashboardSkeleton />;
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
  if (!wallet) return null;

  const statCards: StatCardItem[] = [
    { label: 'Total Earned', value: statistics.totalEarned, icon: DollarSign },
    { label: 'Total Staked', value: statistics.totalStaked, icon: WalletIcon },
    {
      label: 'Total Deposited',
      value: statistics.totalDeposited,
      icon: ArrowDownRight,
    },
    {
      label: 'Total Withdrawn',
      value: statistics.totalWithdrawn,
      icon: ArrowUpRight,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top section: balance (mobile = one card; desktop = left column) */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-6">
        {/* Left column on desktop: Total balance + actions + whitelist */}
        <div className="lg:col-span-7 lg:space-y-6">
          {/* Total Balance / Total Available Balance */}
          <div className={`rounded-[18px] p-4 sm:p-6 ${neuStyles['neu-card']}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p
                  className={`mb-1 ${walletStyles.labelUppercase}`}
                  style={{ color: NEU_MUTED }}
                >
                  Total Balance
                </p>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-2xl font-bold sm:text-3xl lg:text-4xl"
                    style={{ color: NEU_ACCENT }}
                  >
                    {balanceVisible
                      ? `$${wallet.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : '••••••'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleBalanceVisibility}
                  className="flex h-9 w-9 items-center justify-center rounded-[16px] transition-[box-shadow,transform,opacity] duration-[250ms] hover:opacity-90 focus:ring-2 focus:ring-[var(--neu-focus-ring)] focus:outline-none"
                  style={{
                    background: 'var(--neu-bg)',
                    boxShadow: 'var(--neu-shadow-inset)',
                    color: 'var(--neu-accent)',
                  }}
                  aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
                >
                  {balanceVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Wallet breakdown: Funded + Earning (mobile: under balance; desktop: moved to right column below) */}
          <div className="lg:hidden">
            <WalletBreakdown wallet={wallet} balanceVisible={balanceVisible} />
          </div>

          {/* Quick Actions: always circular, more vertical spacing on small screens */}
          <div className="py-4 sm:py-0">
            <QuickActions />
          </div>

          {/* Wallet Capabilities – mobile only in flow; desktop we show in right column */}
          <div className="lg:hidden">
            <WalletCapabilities
              canStake={wallet.canStake}
              canWithdraw={wallet.canWithdraw}
              canTransfer={wallet.canTransfer}
            />
          </div>

          {/* Total Earned, Staked, Deposited, Withdrawn – mobile: one row, carousel scroll */}
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
            {statCards.map((card) => (
              <StatCard
                key={card.label}
                {...card}
                balanceVisible={balanceVisible}
                carousel
              />
            ))}
          </div>

          {/* Withdrawal Whitelist */}
          <WithdrawalAddressManager />
        </div>

        {/* Right column on desktop only: Funded + Earning, Total Earned, Total Staked, Total Deposited, Total Withdrawn, Capabilities */}
        <div className="hidden lg:col-span-5 lg:block lg:space-y-4">
          <div className="hidden lg:block">
            <WalletBreakdown wallet={wallet} balanceVisible={balanceVisible} />
          </div>
          <div className="hidden lg:block">
            <WalletCapabilities
              canStake={wallet.canStake}
              canWithdraw={wallet.canWithdraw}
              canTransfer={wallet.canTransfer}
            />
          </div>

          {/* Total Earned, Staked, Deposited, Withdrawn – desktop: 2x2 grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {statCards.map((card) => (
              <StatCard
                key={card.label}
                {...card}
                balanceVisible={balanceVisible}
              />
            ))}
          </div>
        </div>
      </div>

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
