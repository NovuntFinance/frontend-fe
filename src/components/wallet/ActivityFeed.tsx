'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Upload,
  Send,
  TrendingUp,
  Gift,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer_sent' | 'transfer_received' | 'roi' | 'bonus';
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  description: string;
}

// Mock data - replace with actual API call
const useRecentActivity = () => {
  // TODO: Replace with actual React Query hook
  return {
    data: [
      {
        id: '1',
        type: 'deposit',
        amount: 100,
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        description: 'Deposit via NowPayments',
      },
      {
        id: '2',
        type: 'roi',
        amount: 15.50,
        status: 'confirmed',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        description: 'Weekly ROS earnings',
      },
      {
        id: '3',
        type: 'transfer_sent',
        amount: -50,
        status: 'confirmed',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        description: 'Sent to @john_doe',
      },
      {
        id: '4',
        type: 'withdrawal',
        amount: -75,
        status: 'pending',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        description: 'Withdrawal to wallet',
      },
    ] as Transaction[],
    isLoading: false,
  };
};

const getTransactionIcon = (type: Transaction['type']) => {
  const iconClass = 'h-5 w-5';
  switch (type) {
    case 'deposit':
      return <Download className={iconClass} />;
    case 'withdrawal':
      return <Upload className={iconClass} />;
    case 'transfer_sent':
      return <Send className={iconClass} />;
    case 'transfer_received':
      return <Send className={`${iconClass} rotate-180`} />;
    case 'roi':
      return <TrendingUp className={iconClass} />;
    case 'bonus':
      return <Gift className={iconClass} />;
    default:
      return null;
  }
};

const getStatusIcon = (status: Transaction['status']) => {
  switch (status) {
    case 'confirmed':
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case 'pending':
      return <Loader2 className="h-4 w-4 text-warning animate-spin" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-destructive" />;
  }
};

const getTransactionColor = (type: Transaction['type']) => {
  switch (type) {
    case 'deposit':
    case 'transfer_received':
    case 'roi':
    case 'bonus':
      return 'text-success';
    case 'withdrawal':
    case 'transfer_sent':
      return 'text-destructive';
    default:
      return 'text-foreground';
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

/**
 * Activity Feed Component
 * Shows recent wallet transactions and activities
 */
export function ActivityFeed() {
  const { data: transactions, isLoading } = useRecentActivity();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl bg-card border border-border/50 shadow-lg h-fit"
    >
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Recent Activity
            </h3>
            <p className="text-sm text-muted-foreground">
              Your latest transactions
            </p>
          </div>
          <Clock className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Activity List */}
      <ScrollArea className="h-[500px]">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex p-4 rounded-full bg-muted mb-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No transactions yet
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-3">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                {/* Icon */}
                <div className={`
                  p-3 rounded-xl
                  ${transaction.amount > 0 ? 'bg-success/10' : 'bg-destructive/10'}
                  group-hover:scale-110 transition-transform
                `}>
                  <div className={transaction.amount > 0 ? 'text-success' : 'text-destructive'}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {transaction.description}
                    </p>
                    {getStatusIcon(transaction.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(transaction.timestamp)}
                    </p>
                    <Badge
                      variant={transaction.status === 'confirmed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className={`text-sm font-bold ${getTransactionColor(transaction.type)}`}>
                    {transaction.amount > 0 ? '+' : ''}
                    ${Math.abs(transaction.amount).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    USDT
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {transactions && transactions.length > 0 && (
        <div className="p-4 border-t border-border/50">
          <button className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            View All Transactions →
          </button>
        </div>
      )}
    </motion.div>
  );
}

