/**
 * Countdown Timer Component
 * Displays deadline countdown with days, hours, minutes, seconds
 * Follows Novunt design system
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { CountdownTimerProps } from '@/types/registrationBonus';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Countdown Timer Component
 * Shows time remaining until deadline expires
 */
export function CountdownTimer({
  deadline,
  timeRemaining: initialTimeRemaining,
  onExpire,
}: CountdownTimerProps) {
  const { days, hours, minutes, seconds, isExpired, totalSeconds } =
    useCountdown(deadline, initialTimeRemaining);

  React.useEffect(() => {
    if (isExpired && onExpire) {
      onExpire();
    }
  }, [isExpired, onExpire]);

  if (isExpired) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-3 p-4">
          <div className="bg-destructive/20 rounded-lg p-2">
            <AlertCircle className="text-destructive h-5 w-5" />
          </div>
          <div>
            <p className="text-destructive text-sm font-semibold">Time’s Up!</p>
            <p className="text-muted-foreground text-xs">
              The registration bonus deadline has passed
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const timeUnits = [
    { label: 'Days', value: days, short: 'd' },
    { label: 'Hours', value: hours, short: 'h' },
    { label: 'Minutes', value: minutes, short: 'm' },
    { label: 'Seconds', value: seconds, short: 's' },
  ];

  return (
    <div
      className="flex items-center gap-3 rounded-xl p-4"
      style={{
        background: 'var(--neu-bg)',
        boxShadow:
          'inset 3px 3px 8px var(--neu-shadow-dark), inset -3px -3px 8px var(--neu-shadow-light)',
      }}
    >
      {/* Icon - Soft elevated */}
      <div
        className="shrink-0 rounded-lg p-2"
        style={{
          background: 'var(--neu-bg)',
          boxShadow:
            '2px 2px 5px var(--neu-shadow-dark), -2px -2px 5px var(--neu-shadow-light)',
        }}
      >
        <Clock
          className="h-5 w-5"
          style={{ color: 'var(--neu-text-secondary)' }}
        />
      </div>
      <div className="flex-1">
        <p
          className="mb-1.5 text-xs font-medium"
          style={{ color: 'var(--neu-text-secondary)' }}
        >
          Time Remaining
        </p>
        <div className="flex items-center gap-2 md:gap-3">
          {timeUnits.map((unit, index) => (
            <motion.div
              key={unit.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-baseline gap-1"
            >
              <motion.span
                key={unit.value}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-lg font-bold tabular-nums md:text-xl"
                style={{
                  color:
                    unit.value <= 1 && unit.label === 'Days'
                      ? '#ef4444'
                      : 'var(--neu-text-primary)',
                }}
              >
                {String(unit.value).padStart(2, '0')}
              </motion.span>
              <span
                className="text-xs font-medium"
                style={{ color: 'var(--neu-text-secondary)' }}
              >
                {unit.short}
              </span>
              {index < timeUnits.length - 1 && (
                <span
                  className="mx-0.5 text-lg"
                  style={{ color: 'var(--neu-text-secondary)', opacity: 0.5 }}
                >
                  :
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
