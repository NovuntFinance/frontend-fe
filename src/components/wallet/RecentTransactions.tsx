'use client';

import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  Gift,
  RefreshCw,
  CreditCard,
} from 'lucide-react';
import { useTransactionHistory } from '@/hooks/useWallet';
import {
  formatCurrency,
  formatTransactionType,
  formatTransactionStatus,
  formatAmountWithDirection,
  formatTransactionDate,
} from '@/lib/utils/wallet';
import type { Transaction } from '@/types/enhanced-transaction';
import neuStyles from '@/styles/neumorphic.module.css';

const NEU_ACCENT = '#009BF2';

function getTransactionIcon(
  type: string,
  direction: 'in' | 'out' | 'neutral'
): React.ReactNode {
  const iconClass = 'h-4 w-4 sm:h-5 sm:w-5';
  const style = { color: NEU_ACCENT };
  switch (type) {
    case 'deposit':
    case 'transfer_in':
      return <ArrowDownRight className={iconClass} style={style} />;
    case 'withdrawal':
    case 'transfer_out':
      return <ArrowUpRight className={iconClass} style={style} />;
    case 'stake':
      return <TrendingUp className={iconClass} style={style} />;
    case 'ros_payout':
    case 'stake_pool_payout':
    case 'performance_pool_payout':
    case 'premium_pool_payout':
      return <DollarSign className={iconClass} style={style} />;
    case 'registration_bonus':
    case 'referral_bonus':
      return <Gift className={iconClass} style={style} />;
    case 'fee':
      return (
        <CreditCard
          className={iconClass}
          style={{ color: 'rgba(0,155,242,0.8)' }}
        />
      );
    default:
      return direction === 'in' ? (
        <ArrowDownRight className={iconClass} style={style} />
      ) : (
        <ArrowUpRight className={iconClass} style={style} />
      );
  }
}

/* Hierarchy via #009BF2 opacity only – no other colors */
const TEXT_PRIMARY = 'rgba(0,155,242,0.95)';
const TEXT_MUTED = 'rgba(0,155,242,0.55)';
const AMOUNT_OUT = 'rgba(0,155,242,0.7)'; /* out = slightly lower opacity */
const BADGE_BG = 'rgba(0,155,242,0.15)';
const BADGE_TEXT = 'rgba(0,155,242,0.9)';

function RecentTransactionItem({ transaction }: { transaction: Transaction }) {
  const statusInfo = formatTransactionStatus(transaction.status);
  const isPositive = transaction.direction === 'in';
  const typeIcon = getTransactionIcon(transaction.type, transaction.direction);

  return (
    <div
      className={`flex items-center gap-3 rounded-[16px] p-3 transition-[box-shadow,transform] duration-[250ms] ${neuStyles['neu-card']}`}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{
          background: 'var(--neu-bg)',
          boxShadow: 'var(--neu-shadow-inset)',
          color: 'var(--neu-accent)',
        }}
      >
        {typeIcon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-medium"
          style={{ color: TEXT_PRIMARY }}
        >
          {formatTransactionType(transaction.type, transaction.typeLabel)}
        </p>
        <p className="text-xs" style={{ color: TEXT_MUTED }}>
          {formatTransactionDate(transaction.timestamp)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className="text-sm font-bold"
          style={{
            color: isPositive ? TEXT_PRIMARY : AMOUNT_OUT,
          }}
        >
          {formatAmountWithDirection(transaction.amount, transaction.direction)}
        </p>
        <span
          className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
          style={{
            background: BADGE_BG,
            color: BADGE_TEXT,
          }}
        >
          {statusInfo.label.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

/**
 * Recent Transactions - compact list (3 items) with View All link
 */
export function RecentTransactions() {
  const { data, isLoading } = useTransactionHistory({
    limit: 3,
    page: 1,
    sortBy: 'timestamp',
    sortOrder: 'desc',
  });

  const transactions = data?.transactions ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold" style={{ color: TEXT_PRIMARY }}>
          Transaction History
        </h3>
        <a
          href="#transaction-history"
          className="rounded-[8px] text-sm font-medium transition-opacity duration-[250ms] hover:opacity-90 focus:ring-2 focus:ring-[var(--neu-focus-ring)] focus:outline-none"
          style={{ color: 'var(--neu-accent)' }}
        >
          View All
        </a>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-[16px] opacity-60"
              style={{ background: 'var(--neu-bg)' }}
            />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="py-4 text-center text-sm" style={{ color: TEXT_MUTED }}>
          No transactions yet
        </p>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx: Transaction) => (
            <RecentTransactionItem key={tx._id} transaction={tx} />
          ))}
        </div>
      )}
    </div>
  );
}
