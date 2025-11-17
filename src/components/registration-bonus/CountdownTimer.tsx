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
  const { days, hours, minutes, seconds, isExpired, totalSeconds } = useCountdown(
    deadline,
    initialTimeRemaining
  );

  React.useEffect(() => {
    if (isExpired && onExpire) {
      onExpire();
    }
  }, [isExpired, onExpire]);

  if (isExpired) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-3 p-4">
          <div className="p-2 rounded-lg bg-destructive/20">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-destructive">Time's Up!</p>
            <p className="text-xs text-muted-foreground">
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
    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-novunt-gold-500/10 via-novunt-gold-500/5 to-novunt-gold-500/10 border border-novunt-gold-500/20 backdrop-blur-sm">
      <div className="p-2 rounded-lg bg-novunt-gold-500/20 border border-novunt-gold-500/30">
        <Clock className="h-5 w-5 text-novunt-gold-600 dark:text-novunt-gold-500 shrink-0" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground mb-1.5">
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
                className={cn(
                  'text-lg md:text-xl font-bold tabular-nums',
                  unit.value <= 1 && unit.label === 'Days'
                    ? 'text-destructive'
                    : 'text-novunt-gold-600 dark:text-novunt-gold-500'
                )}
              >
                {String(unit.value).padStart(2, '0')}
              </motion.span>
              <span className="text-xs text-muted-foreground font-medium">
                {unit.short}
              </span>
              {index < timeUnits.length - 1 && (
                <span className="text-novunt-gold-500/50 mx-0.5 text-lg">:</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

