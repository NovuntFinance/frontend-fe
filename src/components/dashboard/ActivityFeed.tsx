'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Upload,
  Send,
  TrendingUp,
  Gift,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Wallet,
} from 'lucide-react';
import type { Transaction as EnhancedTransaction } from '@/types/enhanced-transaction';
import type { Transaction as LegacyTransaction } from '@/types/transaction';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { isStakeTransactionType } from '@/lib/utils/wallet';
import { useUIStore } from '@/store/uiStore';

// Support both enhanced and legacy transaction types
type TransactionUnion = EnhancedTransaction | LegacyTransaction;

interface ActivityFeedProps {
  transactions: TransactionUnion[];
  isLoading?: boolean;
}

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'withdrawal':
      return Upload;
    case 'stake':
    case 'stake_created':
    case 'stake_ros':
    case 'stake_completed':
    case 'ros_payout':
    case 'stake_completion':
      return TrendingUp;
    case 'transfer':
    case 'transfer_out':
    case 'transfer_in':
      return Send;
    case 'referral_bonus':
    case 'registration_bonus':
    case 'bonus_activation':
      return Gift;
    case 'deposit':
      return Download;
    case 'stake_pool_payout':
    case 'performance_pool_payout':
    case 'premium_pool_payout':
      return DollarSign;
    default:
      return Wallet;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
    case 'confirmed':
      return CheckCircle;
    case 'pending':
    case 'processing':
      return Clock;
    case 'failed':
    case 'cancelled':
    case 'expired':
      return XCircle;
    default:
      return Clock;
  }
};

// Helper to check if transaction is enhanced type
const isEnhancedTransaction = (
  tx: TransactionUnion
): tx is EnhancedTransaction => {
  return '_id' in tx && 'timestamp' in tx;
};

// Helper to get transaction ID
const getTransactionId = (tx: TransactionUnion): string => {
  return isEnhancedTransaction(tx) ? tx._id : tx.id;
};

// Helper to get transaction date
const getTransactionDate = (tx: TransactionUnion): Date => {
  if (isEnhancedTransaction(tx)) {
    return new Date(tx.timestamp || tx.createdAt);
  }
  return new Date(tx.createdAt);
};

// Helper to get transaction type label
// IMPORTANT: Only registration_bonus should show as "Bonus"
// All other earnings (referral_bonus, ros_payout, pool payouts) should show as "Earning" or descriptive labels
const getTransactionTypeLabel = (tx: TransactionUnion): string => {
  // Always use "Daily ROS Payout" for ros_payout type
  if (tx.type === 'ros_payout') {
    return 'Daily ROS Payout';
  }

  // Referral bonuses are earnings, not bonuses - display as "Earning"
  if (tx.type === 'referral_bonus') {
    return 'Earning';
  }

  if (isEnhancedTransaction(tx)) {
    // Use typeLabel if provided, but clean it up for consistency
    let label = tx.typeLabel || tx.type.replace('_', ' ');

    // Replace "Weekly ROS Payout" with "Daily ROS Payout"
    label = label.replace(/Weekly ROS Payout/gi, 'Daily ROS Payout');

    // Replace "Referral Bonus" with "Earning"
    label = label.replace(/Referral Bonus/gi, 'Earning');

    // Replace "REF: BONUS" or similar patterns with "Earning"
    label = label.replace(/REF:\s*BONUS/gi, 'Earning');
    label = label.replace(/REF\s*BONUS/gi, 'Earning');

    return label;
  }

  // For legacy transactions, format the type
  const type = tx.type.replace('_', ' ');
  if (type.toLowerCase() === 'referral bonus') {
    return 'Earning';
  }
  return type;
};

// Helper to check if transaction is outgoing
const isOutgoingTransaction = (tx: TransactionUnion): boolean => {
  if (isEnhancedTransaction(tx)) {
    return (
      tx.direction === 'out' ||
      ['withdrawal', 'transfer_out', 'stake', 'unstake', 'fee'].includes(
        tx.type
      )
    );
  }
  return ['withdrawal', 'stake_created', 'transfer'].includes(tx.type);
};

// Helper to get masked related-user name (referrer, sender, etc.)
const getRelatedUser = (tx: TransactionUnion): string | null => {
  if (isEnhancedTransaction(tx)) {
    return tx.fromUser?.name || tx.toUser?.name || null;
  }
  return null;
};

// Helper to get transaction status label
const getTransactionStatus = (tx: TransactionUnion): string => {
  if (isEnhancedTransaction(tx)) return tx.status;
  return (tx as { status?: string }).status ?? 'completed';
};

/**
 * ActivityFeed Component
 * Neumorphic card matching Total Earned card design, showing one activity at a time with auto-rotation
 */
export function ActivityFeed({ transactions, isLoading }: ActivityFeedProps) {
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const balanceVisible = useUIStore((s) => s.balanceVisible);

  // Memoize transactions to detect changes
  const transactionsKey = useMemo(
    () => safeTransactions.map((tx) => getTransactionId(tx)).join(','),
    [safeTransactions]
  );

  // Reset to first item when transactions change (new activity added)
  useEffect(() => {
    if (safeTransactions.length > 0) {
      setCurrentIndex(0);
    }
  }, [transactionsKey]);

  // Auto-rotate through activities every 5 seconds
  useEffect(() => {
    if (safeTransactions.length === 0 || isLoading) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % safeTransactions.length);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [safeTransactions.length, isLoading]);

  // Get current activity to display
  const currentTransaction =
    safeTransactions.length > 0 ? safeTransactions[currentIndex] : null;
  const openModal = useUIStore((s) => s.openModal);

  return (
    <div className="lg:w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div
          className="rounded-2xl px-7 py-3 transition-all duration-300 sm:px-8 sm:py-4"
          style={{
            background: 'var(--neu-bg)',
            boxShadow: 'var(--neu-shadow-raised)',
            border: '1px solid var(--neu-border)',
          }}
        >
          {/* Content Section - stat-card layout: label + value row + status badge */}
          <div className="relative min-h-[64px]">
            {isLoading || safeTransactions.length === 0 ? (
              <div
                className="w-full cursor-pointer"
                onClick={() => openModal('deposit')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal('deposit');
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="No activity yet, make a deposit to get started"
              >
                <div className="mb-1">
                  <p
                    className="text-left text-xs font-semibold sm:text-sm"
                    style={{ color: 'var(--neu-accent)', filter: 'none' }}
                  >
                    Recent Activity
                  </p>
                </div>
                <p
                  className="text-lg font-black sm:text-xl"
                  style={{ color: 'var(--neu-text-primary)', filter: 'none' }}
                >
                  +$0.00
                </p>
                <div className="absolute top-1/2 right-0 -translate-y-1/2">
                  <Wallet className="h-10 w-10" style={{ color: '#009BF2' }} />
                </div>
              </div>
            ) : currentTransaction ? (
              <AnimatePresence initial={false}>
                <motion.div
                  key={`${getTransactionId(currentTransaction)}-${currentIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 w-full"
                >
                  {(() => {
                    const isStake = isStakeTransactionType(
                      currentTransaction.type
                    );
                    const isOutgoing =
                      !isStake && isOutgoingTransaction(currentTransaction);
                    const IconComp = getTransactionIcon(
                      currentTransaction.type
                    );
                    const relatedUser = getRelatedUser(currentTransaction);
                    const txStatus = getTransactionStatus(currentTransaction);
                    return (
                      <>
                        {/* Label: type (accent) · time · masked user (muted) */}
                        <div className="mb-0.5 pr-12">
                          <p
                            className="truncate text-left text-xs font-semibold capitalize sm:text-sm"
                            style={{
                              color: 'var(--neu-accent)',
                              filter: 'none',
                            }}
                          >
                            {getTransactionTypeLabel(currentTransaction)}
                            <span
                              className="ml-1.5 font-normal lowercase"
                              style={{ color: 'var(--neu-text-secondary)' }}
                            >
                              ·{' '}
                              {formatRelativeTime(
                                getTransactionDate(currentTransaction)
                              )}
                              {relatedUser && <> · {relatedUser}</>}
                            </span>
                          </p>
                        </div>

                        {/* Amount + status badge row */}
                        <div className="flex items-center gap-2 pr-12">
                          <motion.p
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            key={currentTransaction.amount}
                            className="flex-1 text-lg font-black sm:text-xl"
                            style={{
                              color: isOutgoing
                                ? '#ef4444'
                                : 'var(--neu-text-primary)',
                              filter: 'none',
                            }}
                          >
                            {isStake ? '' : isOutgoing ? '-' : '+'}
                            {balanceVisible
                              ? formatCurrency(
                                  Math.abs(
                                    Number(
                                      (
                                        currentTransaction as {
                                          amount?: number;
                                        }
                                      ).amount ?? 0
                                    )
                                  )
                                )
                              : '••••••'}
                          </motion.p>

                          {/* Status badge — accent bg + white text */}
                          <span
                            className="flex-shrink-0 rounded-md px-2 py-0.5 text-xs font-bold capitalize"
                            style={{
                              background: 'var(--neu-accent)',
                              color: 'white',
                            }}
                          >
                            {txStatus}
                          </span>
                        </div>

                        {/* Icon — absolute right, vertically centred */}
                        <div className="absolute top-1/2 right-0 -translate-y-1/2">
                          <IconComp
                            className="h-10 w-10"
                            style={{ color: '#009BF2' }}
                          />
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
