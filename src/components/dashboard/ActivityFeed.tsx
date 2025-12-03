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
import { Skeleton } from '@/components/ui/skeleton';

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
const getTransactionTypeLabel = (tx: TransactionUnion): string => {
  if (isEnhancedTransaction(tx)) {
    return tx.typeLabel || tx.type.replace('_', ' ');
  }
  return tx.type.replace('_', ' ');
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
      <Card className="bg-card/50 border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-muted/50 flex items-center gap-4 rounded-xl p-4"
              >
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <TrendingUp className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription className="text-xs">
                Your latest transactions
              </CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard/wallets?tab=transactions">View All</a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
