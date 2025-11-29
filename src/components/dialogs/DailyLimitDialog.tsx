/**
 * Daily Limit Exceeded Dialog
 * Shows when user exceeds daily withdrawal limit
 */

import React, { useState, useEffect } from 'react';
import { CriticalActionDialog } from './CriticalActionDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock } from 'lucide-react';
import Link from 'next/link';

export interface DailyLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dailyLimit: number;
  withdrawnToday: number;
  remainingLimit: number;
  resetTime?: Date; // When the limit resets
}

export function DailyLimitDialog({
  open,
  onOpenChange,
  dailyLimit,
  withdrawnToday,
  remainingLimit,
  resetTime,
}: DailyLimitDialogProps) {
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    if (!resetTime) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = resetTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilReset('Reset in progress...');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [resetTime]);

  const details = [
    {
      label: 'Daily Limit',
      value: `$${dailyLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
    {
      label: 'Withdrawn Today',
      value: `$${withdrawnToday.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
    {
      label: 'Remaining',
      value: `$${remainingLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
  ];

  return (
    <CriticalActionDialog
      open={open}
      onOpenChange={onOpenChange}
      type="warning"
      title="Daily Withdrawal Limit Exceeded"
      description="You have reached your daily withdrawal limit. Please try again after the limit resets or contact support to request a limit increase."
      details={details}
      confirmText="Got it"
      showCancel={false}
      onConfirm={() => onOpenChange(false)}
    >
      {/* Reset Time Countdown */}
      {resetTime && timeUntilReset && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Limit resets in:</strong> {timeUntilReset}
          </AlertDescription>
        </Alert>
      )}

      {/* Support Link */}
      <div className="text-muted-foreground pt-2 text-center text-sm">
        Need a higher limit?{' '}
        <Link
          href="/support"
          className="text-primary font-medium hover:underline"
        >
          Contact Support
        </Link>
      </div>
    </CriticalActionDialog>
  );
}
