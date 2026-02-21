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
import { LoadingStates } from '@/components/ui/loading-states';
import { EmptyStates } from '@/components/EmptyStates';
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
          className="rounded-2xl p-5 transition-all duration-300 sm:p-6 lg:p-5 xl:p-6"
          style={{
            background: '#0D162C',
            boxShadow: `
              inset 8px 8px 16px rgba(0, 0, 0, 0.5),
              inset -8px -8px 16px rgba(255, 255, 255, 0.05),
              inset 2px 2px 4px rgba(0, 0, 0, 0.4),
              inset -2px -2px 4px rgba(255, 255, 255, 0.1),
              0 0 0 1px rgba(255, 255, 255, 0.03)
            `,
          }}
        >
          {/* Content Section - Single Activity Display (matches Total Deposit card typography) */}
          <div className="min-h-[80px]">
            {isLoading ? (
              <LoadingStates.Text lines={1} className="h-8 sm:h-10" />
            ) : safeTransactions.length === 0 ? (
              <EmptyStates.EmptyTransactions
                variant="neumorphic"
                compact
                action={{
                  label: 'Make Your First Deposit',
                  onClick: () => openModal('deposit'),
                }}
              />
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
                  <div className="mb-1.5 flex items-center gap-2 sm:gap-3">
                    {/* Icon - same size/shape as Total Deposit card */}
                    <div
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8 lg:h-7 lg:w-7"
                      style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                    >
                      {(() => {
                        const Icon = getTransactionIcon(
                          currentTransaction.type
                        );
                        return (
                          <Icon
                            className="h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4"
                            style={{
                              color: 'rgba(255, 255, 255, 0.95)',
                              filter: 'none',
                            }}
                          />
                        );
                      })()}
                    </div>
                    {/* Label + subtitle - same font size/color as Total Deposit card */}
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-xs font-medium capitalize sm:text-sm lg:text-xs"
                        style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          filter: 'none',
                        }}
                      >
                        {getTransactionTypeLabel(currentTransaction)}
                      </p>
                      <p
                        className="text-[10px] sm:text-xs lg:text-[10px]"
                        style={{
                          color: 'rgba(255, 255, 255, 0.5)',
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
                  {/* Amount - same font size/shape as Total Deposit; green for +, red for - */}
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
                          color: isOutgoing ? '#ef4444' : '#22c55e',
                          filter: 'none',
                        }}
                      >
                        {isOutgoing ? '-' : '+'}
                        {formatCurrency(currentTransaction.amount)}
                      </motion.div>
                    );
                  })()}
                  {/* Status - same muted style as card subtitle */}
                  <p
                    className="mt-1.5 text-[10px] font-medium capitalize sm:text-xs lg:text-[10px]"
                    style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      filter: 'none',
                    }}
                  >
                    {currentTransaction.status}
                  </p>
                </motion.div>
              </AnimatePresence>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
