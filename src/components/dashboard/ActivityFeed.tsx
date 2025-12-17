'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
  ChevronRight,
} from 'lucide-react';
import type { Transaction as EnhancedTransaction } from '@/types/enhanced-transaction';
import type { Transaction as LegacyTransaction } from '@/types/transaction';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShimmerCard } from '@/components/ui/shimmer';

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
 * Modern card showing recent transaction history with icons and colors
 */
export function ActivityFeed({ transactions, isLoading }: ActivityFeedProps) {
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  if (isLoading) {
    return (
      <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent" />
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
          className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-blue-500/30 blur-2xl"
        />
        <CardHeader className="relative p-4 sm:p-6">
          {/* Arrow Icon - Top Right */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-muted-foreground hover:text-foreground absolute top-3 right-3 z-10 h-8 w-8 transition-colors sm:top-6 sm:right-6"
          >
            <a href="/dashboard/wallets?tab=transactions">
              <ChevronRight className="h-5 w-5" />
            </a>
          </Button>

          <div className="mb-2 flex items-center gap-2 sm:gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -10 }}
              className="rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
            >
              <TrendingUp className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                Recent Activity
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-xs">
                Your latest transactions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <ShimmerCard key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent" />

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
        className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-blue-500/30 blur-2xl"
      />

      <CardHeader className="relative p-4 sm:p-6">
        {/* Arrow Icon - Top Right */}
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="text-muted-foreground hover:text-foreground absolute top-3 right-3 z-10 h-8 w-8 transition-colors sm:top-6 sm:right-6"
        >
          <a href="/dashboard/wallets?tab=transactions">
            <ChevronRight className="h-5 w-5" />
          </a>
        </Button>

        <div className="mb-2 flex items-center gap-2 sm:gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -10 }}
            className="rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
          >
            <TrendingUp className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
              Recent Activity
            </CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">
              Your latest transactions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
        {safeTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="bg-muted mb-4 inline-flex rounded-full p-4">
              <Clock className="text-muted-foreground h-8 w-8" />
            </div>
            <p className="text-muted-foreground mb-4 text-sm">
              No transactions yet
            </p>
            <Button variant="outline" asChild>
              <a href="/dashboard/wallets">Make Your First Deposit</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {safeTransactions.slice(0, 5).map((transaction, index) => {
              const Icon = getTransactionIcon(transaction.type);
              const StatusIcon = getStatusIcon(transaction.status);
              const isOutgoing = isOutgoingTransaction(transaction);
              const transactionId = getTransactionId(transaction);
              const transactionDate = getTransactionDate(transaction);
              const typeLabel = getTransactionTypeLabel(transaction);
              const reference = isEnhancedTransaction(transaction)
                ? transaction.reference
                : transaction.reference;

              return (
                <motion.div
                  key={transactionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-muted/50 group hover:border-border/50 flex cursor-pointer items-center gap-4 rounded-xl border border-transparent p-4 transition-all duration-300"
                >
                  {/* Transaction Icon */}
                  <div
                    className={`rounded-xl p-3 transition-transform duration-300 group-hover:scale-110 ${
                      isOutgoing ? 'bg-destructive/10' : 'bg-success/10'
                    } `}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isOutgoing ? 'text-destructive' : 'text-success'
                      }`}
                    />
                  </div>

                  {/* Transaction Details */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="truncate text-sm font-medium capitalize">
                        {typeLabel}
                      </p>
                      <StatusIcon
                        className={`h-3 w-3 flex-shrink-0 ${
                          transaction.status === 'completed' ||
                          transaction.status === 'confirmed'
                            ? 'text-success'
                            : transaction.status === 'pending' ||
                                transaction.status === 'processing'
                              ? 'text-warning'
                              : 'text-destructive'
                        }`}
                      />
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {formatRelativeTime(transactionDate)}
                      {reference && (
                        <span className="ml-2 font-mono">
                          • {reference.slice(0, 8)}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Amount & Status */}
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        isOutgoing ? 'text-destructive' : 'text-success'
                      }`}
                    >
                      {isOutgoing ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <Badge
                      variant={
                        transaction.status === 'completed' ||
                        transaction.status === 'confirmed'
                          ? 'default'
                          : 'secondary'
                      }
                      className="mt-1 text-xs capitalize"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
