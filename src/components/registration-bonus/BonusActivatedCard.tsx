/**
 * Bonus Activated Card Component
 * Success state when bonus is activated.
 * Shows payout progress (bonus.paidOut / bonus.totalAmount) and daily ROS info.
 */

'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Gift, TrendingUp, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { BonusActivatedCardProps } from '@/types/registrationBonus';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

export function BonusActivatedCard({ bonusData }: BonusActivatedCardProps) {
  const router = useRouter();

  useEffect(() => {
    const confettiShown =
      typeof window !== 'undefined' &&
      localStorage.getItem('novunt_bonus_confetti_shown') === 'true';

    if (confettiShown) return;
    localStorage.setItem('novunt_bonus_confetti_shown', 'true');

    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
      colors: ['#FFD700', '#FFA500', '#10B981', '#059669', '#34D399'],
    };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Resolve bonus amounts with fallbacks for both V2 and legacy field names
  const bonusTotalAmount =
    bonusData.bonus?.totalAmount ??
    bonusData.bonus?.amount ??
    bonusData.bonusAmount ??
    0;

  const bonusPaidOut =
    bonusData.bonus?.paidOut ?? bonusData.bonus?.bonusPaidOut ?? 0;

  const bonusRemaining =
    bonusData.bonus?.remaining ??
    bonusData.bonus?.remainingBonus ??
    Math.max(bonusTotalAmount - bonusPaidOut, 0);

  const payoutPercent =
    bonusTotalAmount > 0
      ? Math.min((bonusPaidOut / bonusTotalAmount) * 100, 100)
      : 0;

  const isFullyPaid =
    bonusData.bonus?.completedAt != null || payoutPercent >= 100;

  return (
    <Card className="border-novunt-gold-500/30 from-novunt-gold-500/10 via-novunt-gold-500/5 to-background shadow-novunt-gold-500/10 relative overflow-hidden border-2 bg-gradient-to-br shadow-lg">
      {/* Animated gold shimmer */}
      <motion.div
        className="from-novunt-gold-500/20 to-novunt-gold-500/20 absolute inset-0 bg-gradient-to-br via-transparent"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
      />

      {/* Sparkle decorations */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: `${20 + i * 15}%`, left: `${10 + i * 15}%` }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
        >
          <Star className="fill-novunt-gold-500/20 text-novunt-gold-500/50 h-4 w-4" />
        </motion.div>
      ))}

      <CardContent className="relative z-10 p-6">
        <div className="space-y-4 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="bg-novunt-gold-500/20 border-novunt-gold-500/30 inline-flex h-20 w-20 items-center justify-center rounded-full border-4"
          >
            <CheckCircle2 className="text-novunt-gold-600 dark:text-novunt-gold-500 h-10 w-10" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-foreground mb-2 text-2xl font-bold md:text-3xl">
              Bonus Activated!
            </h2>
            <p className="text-muted-foreground text-sm">
              Your registration bonus stake is now earning daily ROS
            </p>
          </motion.div>

          {/* Bonus Amount with Payout Progress */}
          {bonusTotalAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="from-novunt-gold-500/20 to-novunt-gold-600/20 border-novunt-gold-500/30 shadow-novunt-gold-500/20 rounded-xl border-2 bg-gradient-to-br p-6 shadow-md"
            >
              <div className="mb-2 flex items-center justify-center gap-2">
                <Gift className="text-novunt-gold-600 dark:text-novunt-gold-500 h-5 w-5" />
                <span className="text-muted-foreground text-sm font-medium">
                  Bonus Stake
                </span>
              </div>
              <div className="text-novunt-gold-600 dark:text-novunt-gold-500 mb-1 text-4xl font-bold md:text-5xl">
                {formatCurrency(bonusTotalAmount)}
              </div>
              <p className="text-muted-foreground mb-4 text-xs">
                Earning daily ROS with 100% return cap
              </p>

              {/* Payout Progress */}
              <div className="border-novunt-gold-500/20 space-y-3 border-t pt-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-left">
                    <p className="text-muted-foreground mb-1">Paid Out</p>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(bonusPaidOut)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground mb-1">Remaining</p>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(bonusRemaining)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${payoutPercent}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                    />
                  </div>
                  <p className="text-muted-foreground mt-1 text-center text-xs">
                    {formatCurrency(bonusPaidOut)} /{' '}
                    {formatCurrency(bonusTotalAmount)} earned
                  </p>
                </div>

                {/* Fully Paid Badge */}
                {isFullyPaid && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Fully Earned
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <p className="text-foreground text-sm">
              Your bonus stake earns daily ROS alongside your regular stakes.
            </p>
            <p className="text-muted-foreground text-xs">
              View the bonus stake card in your staking dashboard.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={() => router.push('/dashboard/stakes')}
              size="lg"
              className="w-full md:w-auto"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              View My Stakes
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
