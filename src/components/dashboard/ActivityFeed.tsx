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
} from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityFeedProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'withdrawal':
      return Upload;
    case 'stake_created':
    case 'stake_ros':
    case 'stake_completed':
      return TrendingUp;
    case 'transfer':
      return Send;
    case 'referral_bonus':
    case 'registration_bonus':
      return Gift;
    default:
      return Download;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return CheckCircle;
    case 'pending':
      return Clock;
    case 'failed':
      return XCircle;
    default:
      return Clock;
  }
};

/**
 * ActivityFeed Component
 * Modern card showing recent transaction history with icons and colors
 */
export function ActivityFeed({ transactions, isLoading }: ActivityFeedProps) {
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  if (isLoading) {
    return (
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
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
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription className="text-xs">
                Your latest transactions
              </CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard/transactions">View All</a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {safeTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex p-4 rounded-full bg-muted mb-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              No transactions yet
            </p>
            <Button variant="outline" asChild>
              <a href="/dashboard/wallets">Make Your First Deposit</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {safeTransactions.slice(0, 10).map((transaction, index) => {
              const Icon = getTransactionIcon(transaction.type);
              const StatusIcon = getStatusIcon(transaction.status);
              const isOutgoing = ['withdrawal', 'stake_created', 'transfer'].includes(transaction.type);

              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 group cursor-pointer border border-transparent hover:border-border/50"
                >
                  {/* Transaction Icon */}
                  <div className={`
                    p-3 rounded-xl transition-transform group-hover:scale-110 duration-300
                    ${isOutgoing 
                      ? 'bg-destructive/10' 
                      : 'bg-success/10'
                    }
                  `}>
                    <Icon className={`h-5 w-5 ${
                      isOutgoing ? 'text-destructive' : 'text-success'
                    }`} />
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium capitalize truncate">
                        {transaction.type.replace('_', ' ')}
                      </p>
                      <StatusIcon className={`h-3 w-3 flex-shrink-0 ${
                        transaction.status === 'completed' ? 'text-success' :
                        transaction.status === 'pending' ? 'text-warning' :
                        'text-destructive'
                      }`} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(new Date(transaction.createdAt))}
                      {transaction.reference && (
                        <span className="ml-2 font-mono">
                          • {transaction.reference.slice(0, 8)}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Amount & Status */}
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      isOutgoing ? 'text-destructive' : 'text-success'
                    }`}>
                      {isOutgoing ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <Badge
                      variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs capitalize mt-1"
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
