/**
 * Empty State Components
 * Consistent empty states across the application
 * Supports default (card) and neumorphic (dashboard) variants
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Inbox,
  Wallet,
  TrendingUp,
  Users,
  FileText,
  AlertCircle,
  Search,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import neuStyles from '@/styles/neumorphic.module.css';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  /** Use 'neumorphic' when inside dashboard/activity feed to match transaction cards */
  variant?: 'default' | 'neumorphic';
  /** When true (and variant is neumorphic), use tight layout to match transaction card height */
  compact?: boolean;
}

/**
 * Generic Empty State Component
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = 'default',
  compact = false,
}: EmptyStateProps) {
  const isCompact = variant === 'neumorphic' && compact;

  const content = (
    <>
      {!isCompact && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={isCompact ? 'mb-2' : 'mb-4'}
        >
          <div
            className={
              variant === 'neumorphic'
                ? isCompact
                  ? 'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9'
                  : 'flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full sm:h-16 sm:w-16'
                : 'bg-muted text-muted-foreground flex h-16 w-16 items-center justify-center rounded-full'
            }
            style={
              variant === 'neumorphic'
                ? { background: 'rgba(255, 255, 255, 0.05)' }
                : undefined
            }
          >
            <span
              style={
                variant === 'neumorphic'
                  ? { color: 'rgba(255, 255, 255, 0.95)' }
                  : undefined
              }
            >
              {icon || (
                <Inbox
                  className={isCompact ? 'h-4 w-4 sm:h-5 sm:w-5' : 'h-8 w-8'}
                />
              )}
            </span>
          </div>
        </motion.div>
      )}

      <motion.h3
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className={
          isCompact
            ? 'mb-1 text-sm font-semibold'
            : 'mb-2 text-lg font-semibold'
        }
        style={
          variant === 'neumorphic'
            ? { color: 'rgba(255, 255, 255, 0.95)' }
            : undefined
        }
      >
        {title}
      </motion.h3>

      {description && (
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className={
            variant === 'neumorphic'
              ? isCompact
                ? 'mb-3 line-clamp-2 max-w-md text-xs'
                : 'mb-6 max-w-md text-sm'
              : 'text-muted-foreground mb-6 max-w-md text-sm'
          }
          style={
            variant === 'neumorphic'
              ? { color: 'rgba(255, 255, 255, 0.5)' }
              : undefined
          }
        >
          {description}
        </motion.p>
      )}

      {action && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {variant === 'neumorphic' ? (
            <button
              type="button"
              onClick={action.onClick}
              className={`${neuStyles['neu-button-accent']} inline-flex cursor-pointer items-center justify-center rounded-xl border transition-all duration-200 outline-none hover:translate-y-[-1px] focus-visible:ring-2 focus-visible:ring-[var(--neu-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--neu-bg-primary)] active:translate-y-0 ${isCompact ? 'px-4 py-2 text-sm font-medium' : 'px-6 py-3 font-semibold'}`}
              style={{
                background:
                  'linear-gradient(135deg, var(--neu-bg-secondary) 0%, rgba(0, 155, 242, 0.12) 100%)',
                boxShadow:
                  '6px 6px 12px rgba(0, 0, 0, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.05), 0 0 20px rgba(0, 155, 242, 0.2)',
                color: 'var(--neu-accent)',
              }}
            >
              {action.label}
            </button>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </motion.div>
      )}
    </>
  );

  if (variant === 'neumorphic') {
    return (
      <div
        className={`flex flex-col items-center justify-center text-center ${className ?? ''} ${isCompact ? 'py-3 sm:py-4' : 'py-8 sm:py-10'}`}
      >
        {content}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
        {content}
      </CardContent>
    </Card>
  );
}

/**
 * Specific Empty State Variants
 */

export function EmptyWallet({ onDeposit }: { onDeposit: () => void }) {
  return (
    <EmptyState
      icon={<Wallet className="h-8 w-8" />}
      title="No funds yet"
      description="Get started by making your first deposit to unlock all features"
      action={{
        label: 'Make a Deposit',
        onClick: onDeposit,
      }}
    />
  );
}

export function EmptyStakes({ onCreateStake }: { onCreateStake: () => void }) {
  return (
    <EmptyState
      icon={<TrendingUp className="h-8 w-8" />}
      title="No active stakes"
      description="Start earning passive income by creating your first stake"
      action={{
        label: 'Create Stake',
        onClick: onCreateStake,
      }}
    />
  );
}

export function EmptyReferrals() {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8" />}
      title="No referrals yet"
      description="Share your referral code with friends and family to start earning bonuses"
    />
  );
}

export function EmptyTransactions({
  action,
  variant = 'default',
  compact = false,
}: {
  action?: { label: string; onClick: () => void };
  /** Use 'neumorphic' in dashboard activity feed to match transaction cards */
  variant?: 'default' | 'neumorphic';
  /** Compact layout to match transaction card height (use in activity feed) */
  compact?: boolean;
}) {
  return (
    <EmptyState
      icon={
        <FileText className={compact ? 'h-4 w-4 sm:h-5 sm:w-5' : 'h-8 w-8'} />
      }
      title="No transactions"
      description="Your transaction history will appear here once you start making deposits or withdrawals"
      action={action}
      variant={variant}
      compact={compact}
    />
  );
}

export function EmptyNotifications({ description }: { description?: string }) {
  return (
    <EmptyState
      icon={<Inbox className="h-8 w-8" />}
      title="No notifications yet"
      description={
        description ||
        "You'll see notifications about your account activity here"
      }
    />
  );
}

export function EmptySearch({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8" />}
      title="No results found"
      description={
        query
          ? `No results found for "${query}". Try a different search term.`
          : 'Try adjusting your search criteria'
      }
    />
  );
}

export function ErrorState({
  onRetry,
  message = 'Something went wrong',
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <EmptyState
      icon={<AlertCircle className="text-destructive h-8 w-8" />}
      title="Error"
      description={message}
      action={
        onRetry
          ? {
              label: 'Try Again',
              onClick: onRetry,
            }
          : undefined
      }
    />
  );
}

export function PendingState({
  message = 'Processing...',
}: {
  message?: string;
}) {
  return (
    <EmptyState
      icon={<Clock className="text-warning h-8 w-8 animate-pulse" />}
      title="Pending"
      description={message}
    />
  );
}

export function SuccessState({
  message = 'Success!',
  onContinue,
}: {
  message?: string;
  onContinue?: () => void;
}) {
  return (
    <EmptyState
      icon={<CheckCircle className="text-success h-8 w-8" />}
      title="Success"
      description={message}
      action={
        onContinue
          ? {
              label: 'Continue',
              onClick: onContinue,
            }
          : undefined
      }
    />
  );
}

/**
 * Export as namespace for easier imports
 */
export const EmptyStates = {
  EmptyState,
  EmptyWallet,
  EmptyStakes,
  EmptyReferrals,
  EmptyTransactions,
  EmptyNotifications,
  EmptySearch,
  ErrorState,
  PendingState,
  SuccessState,
};
