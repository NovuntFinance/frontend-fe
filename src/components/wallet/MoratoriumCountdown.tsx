'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { MoratoriumStatus } from '@/services/walletApi';

interface MoratoriumCountdownProps {
  moratorium: MoratoriumStatus;
  onExpired?: () => void;
}

/**
 * Moratorium Countdown Component
 * Displays a countdown timer for the 48-hour wallet address change moratorium
 */
export function MoratoriumCountdown({
  moratorium,
  onExpired,
}: MoratoriumCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: moratorium.hoursRemaining,
    minutes: moratorium.minutesRemaining,
  });

  useEffect(() => {
    if (!moratorium.active) return;

    const updateCountdown = () => {
      if (!moratorium.canChangeAt) {
        setTimeRemaining({
          hours: moratorium.hoursRemaining,
          minutes: moratorium.minutesRemaining,
        });
        return;
      }

      const now = new Date();
      const canChangeAt = new Date(moratorium.canChangeAt);
      const remaining = canChangeAt.getTime() - now.getTime();

      if (remaining <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0 });
        onExpired?.();
        return;
      }

      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.ceil((remaining % (60 * 60 * 1000)) / (60 * 1000));

      setTimeRemaining({ hours, minutes });
    };

    // Update immediately
    updateCountdown();

    // Update every minute
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [
    moratorium.active,
    moratorium.canChangeAt,
    moratorium.hoursRemaining,
    moratorium.minutesRemaining,
    onExpired,
  ]);

  if (!moratorium.active) {
    return null;
  }

  return (
    <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
      <Lock className="h-4 w-4 text-amber-600" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-semibold text-amber-700 dark:text-amber-400">
            ⏳ Address Change Locked
          </p>
          <p className="text-sm text-amber-700/90 dark:text-amber-400/90">
            You can change this address in{' '}
            <strong>
              {timeRemaining.hours}h {timeRemaining.minutes}m
            </strong>
          </p>
          {moratorium.canChangeAtFormatted && (
            <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
              Available at: {moratorium.canChangeAtFormatted}
            </p>
          )}
          <div className="mt-2 rounded-md bg-amber-500/20 p-2">
            <p className="mb-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
              🔒 Why the 48-hour wait?
            </p>
            <p className="text-xs text-amber-700/90 dark:text-amber-400/90">
              This security measure protects you from hackers who might gain
              unauthorized access to your account and attempt to change your
              withdrawal address to steal your funds. The waiting period gives
              you time to detect and report any unauthorized changes.
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
