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
import { useUIStore } from '@/store/uiStore';
import { NeumorphicCarouselDots } from '@/components/ui/neumorphic-carousel-dots';

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

/**
 * ActivityFeed Component
 * Neumorphic card matching Total Earned card design, showing one activity at a time with auto-rotation
 */
export function ActivityFeed({ transactions, isLoading }: ActivityFeedProps) {
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const [currentIndex, setCurrentIndex] = useState(0);

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
          className="rounded-2xl p-5 transition-all duration-300 sm:p-6"
          style={{
            background: '#0D162C',
            boxShadow:
              '8px 8px 20px rgba(4, 8, 18, 0.7), -8px -8px 20px rgba(25, 40, 72, 0.5)',
            border: '1px solid var(--app-border)',
          }}
        >
          {/* Content Section - Real data or placeholder (no skeleton; show placeholder while loading) */}
          <div className="min-h-[80px]">
            {isLoading || safeTransactions.length === 0 ? (
              /* Placeholder row – card always shows content, never empty */
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
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9"
                    style={{ background: 'rgba(0, 155, 242, 0.15)' }}
                  >
                    <Wallet
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      style={{ color: '#009BF2', filter: 'none' }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-xs font-semibold sm:text-sm"
                      style={{ color: '#009BF2', filter: 'none' }}
                    >
                      No activity yet
                    </p>
                    <p
                      className="text-[10px] sm:text-xs"
                      style={{
                        color: 'rgba(0, 155, 242, 0.75)',
                        filter: 'none',
                      }}
                    >
                      Deposit or stake to see your activity here
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <p
                    className="text-xl font-black sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl"
                    style={{ color: 'var(--app-text-primary)', filter: 'none' }}
                  >
                    +$0.00
                  </p>
                  <p
                    className="shrink-0 text-[10px] font-medium capitalize sm:text-xs"
                    style={{
                      color: 'rgba(0, 155, 242, 0.6)',
                      filter: 'none',
                    }}
                  >
                    —
                  </p>
                </div>
              </div>
            ) : currentTransaction ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${getTransactionId(currentTransaction)}-${currentIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <div className="mb-4 flex items-center gap-3">
                    {/* Icon - design accent */}
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9"
                      style={{ background: 'rgba(0, 155, 242, 0.15)' }}
                    >
                      {(() => {
                        const Icon = getTransactionIcon(
                          currentTransaction.type
                        );
                        return (
                          <Icon
                            className="h-4 w-4 sm:h-5 sm:w-5"
                            style={{ color: '#009BF2', filter: 'none' }}
                          />
                        );
                      })()}
                    </div>
                    {/* Label + subtitle - design colors */}
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-xs font-semibold capitalize sm:text-sm"
                        style={{ color: '#009BF2', filter: 'none' }}
                      >
                        {getTransactionTypeLabel(currentTransaction)}
                      </p>
                      <p
                        className="text-[10px] sm:text-xs"
                        style={{
                          color: 'rgba(0, 155, 242, 0.75)',
                          filter: 'none',
                        }}
                      >
                        {formatRelativeTime(
                          getTransactionDate(currentTransaction)
                        )}
                        {(() => {
                          const reference = isEnhancedTransaction(
                            currentTransaction
                          )
                            ? currentTransaction.reference
                            : currentTransaction.reference;
                          return reference ? (
                            <span className="ml-1.5 font-mono">
                              • {reference.slice(0, 8)}
                            </span>
                          ) : null;
                        })()}
                      </p>
                    </div>
                  </div>
                  {/* Amount and status on one row so card stays compact */}
                  <div className="flex items-baseline justify-between gap-3">
                    {(() => {
                      const isOutgoing =
                        isOutgoingTransaction(currentTransaction);
                      return (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-xl font-black sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl"
                          style={{
                            color: isOutgoing ? '#ef4444' : 'var(--app-text-primary)',
                            filter: 'none',
                          }}
                        >
                          {isOutgoing ? '-' : '+'}
                          {formatCurrency(currentTransaction.amount)}
                        </motion.div>
                      );
                    })()}
                    <p
                      className="shrink-0 text-[10px] font-medium capitalize sm:text-xs"
                      style={{
                        color: 'rgba(0, 155, 242, 0.75)',
                        filter: 'none',
                      }}
                    >
                      {currentTransaction.status}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : null}
          </div>
          {safeTransactions.length > 1 && (
            <NeumorphicCarouselDots
              count={safeTransactions.length}
              currentIndex={currentIndex}
              onSelect={setCurrentIndex}
              ariaLabelPrefix="Go to activity"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
