/**
 * Bonus Activated Card Component
 * Success state when bonus is activated
 * Follows Novunt design system with celebration animations
 */

'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Gift, TrendingUp, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { BonusActivatedCardProps } from '@/types/registrationBonus';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

/**
 * Bonus Activated Card Component
 * Shows success message with bonus amount
 */
export function BonusActivatedCard({ bonusData }: BonusActivatedCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = React.useState(false);

  useEffect(() => {
    // Check if confetti has already been shown
    const confettiShown = typeof window !== 'undefined' && localStorage.getItem('novunt_bonus_confetti_shown') === 'true';

    if (confettiShown) {
      console.log('[BonusActivatedCard] ⛔ Confetti already shown, skipping');
      return;
    }

    console.log('[BonusActivatedCard] 🎉 Showing confetti for activated bonus!');

    // Mark as shown immediately
    localStorage.setItem('novunt_bonus_confetti_shown', 'true');

    // Trigger confetti celebration when component mounts
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
      colors: ['#FFD700', '#FFA500', '#10B981', '#059669', '#34D399']
    };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Emit from left and right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="relative overflow-hidden border-2 border-novunt-gold-500/30 bg-gradient-to-br from-novunt-gold-500/10 via-novunt-gold-500/5 to-background shadow-lg shadow-novunt-gold-500/10">
      {/* Animated gold shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-novunt-gold-500/20 via-transparent to-novunt-gold-500/20"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      {/* Sparkle decorations */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 15}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        >
          <Star className="h-4 w-4 text-novunt-gold-500/50 fill-novunt-gold-500/20" />
        </motion.div>
      ))}

      <CardContent className="relative z-10 p-6">
        <div className="text-center space-y-4">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-novunt-gold-500/20 border-4 border-novunt-gold-500/30"
          >
            <CheckCircle2 className="h-10 w-10 text-novunt-gold-600 dark:text-novunt-gold-500" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              🎉 Bonus Activated!
            </h2>
            <p className="text-sm text-muted-foreground">
              Your registration bonus is now active
            </p>
          </motion.div>

          {/* Bonus Amount with Progress */}
          {bonusData.bonusAmount && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="p-6 rounded-xl bg-gradient-to-br from-novunt-gold-500/20 to-novunt-gold-600/20 border-2 border-novunt-gold-500/30 shadow-md shadow-novunt-gold-500/20"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-novunt-gold-600 dark:text-novunt-gold-500" />
                <span className="text-sm font-medium text-muted-foreground">
                  You Received
                </span>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-novunt-gold-600 dark:text-novunt-gold-500 mb-1">
                {formatCurrency(bonusData.bonusAmount)}
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Bonus paid out gradually with weekly ROS
              </p>

              {/* Progress Tracking Toggle */}
              {bonusData.bonus && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="gap-1 text-xs mb-2 mx-auto flex h-7"
                  >
                    {isExpanded ? 'Hide Payout Details' : 'Show Payout Details'}
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 pt-2 border-t border-novunt-gold-500/20">
                          {/* Progress Stats */}
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="text-left">
                              <p className="text-muted-foreground mb-1">Paid Out</p>
                              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(bonusData.bonus.bonusPaidOut || 0)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-muted-foreground mb-1">Remaining</p>
                              <p className="font-semibold text-blue-600 dark:text-blue-400">
                                {formatCurrency(bonusData.bonus.remainingBonus || bonusData.bonusAmount)}
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="relative">
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${((bonusData.bonus.bonusPaidOut || 0) / bonusData.bonusAmount) * 100}%`
                                }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                              />
                            </div>
                            <p className="text-xs text-center text-muted-foreground mt-1">
                              {((bonusData.bonus.bonusPaidOut || 0) / bonusData.bonusAmount * 100).toFixed(1)}% paid out
                            </p>
                          </div>

                          {/* Weekly Payout Info */}
                          {bonusData.bonus.weeklyPayoutCount !== undefined && (
                            <div className="text-xs text-center text-muted-foreground">
                              {bonusData.bonus.weeklyPayoutCount} {bonusData.bonus.weeklyPayoutCount === 1 ? 'payment' : 'payments'} received
                            </div>
                          )}

                          {/* Completion Badge */}
                          {bonusData.bonus.completedAt && (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-400"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Fully Paid Out
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* Description */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <p className="text-sm text-foreground">
                  Your bonus stake is now active and earning weekly profits!
                </p>
                <p className="text-xs text-muted-foreground">
                  You can view all your stakes, including the bonus stake, in your staking dashboard.
                </p>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={() => router.push('/dashboard/stakes')}
                  size="lg"
                  className="w-full md:w-auto"
                  return () => clearInterval(interval);
  }, []);

                return (
                <Card className="relative overflow-hidden border-2 border-novunt-gold-500/30 bg-gradient-to-br from-novunt-gold-500/10 via-novunt-gold-500/5 to-background shadow-lg shadow-novunt-gold-500/10">
                  {/* Animated gold shimmer */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-novunt-gold-500/20 via-transparent to-novunt-gold-500/20"
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  />

                  {/* Sparkle decorations */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        top: `${20 + i * 15}%`,
                        left: `${10 + i * 15}%`,
                      }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 1, 0.3],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    >
                      <Star className="h-4 w-4 text-novunt-gold-500/50 fill-novunt-gold-500/20" />
                    </motion.div>
                  ))}

                  <CardContent className="relative z-10 p-6">
                    <div className="text-center space-y-4">
                      {/* Success Icon */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-novunt-gold-500/20 border-4 border-novunt-gold-500/30"
                      >
                        <CheckCircle2 className="h-10 w-10 text-novunt-gold-600 dark:text-novunt-gold-500" />
                      </motion.div>

                      {/* Title */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                          🎉 Bonus Activated!
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Your registration bonus is now active
                        </p>
                      </motion.div>

                      {/* Bonus Amount with Progress */}
                      {bonusData.bonusAmount && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3, type: 'spring' }}
                          className="p-6 rounded-xl bg-gradient-to-br from-novunt-gold-500/20 to-novunt-gold-600/20 border-2 border-novunt-gold-500/30 shadow-md shadow-novunt-gold-500/20"
                        >
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Gift className="h-5 w-5 text-novunt-gold-600 dark:text-novunt-gold-500" />
                            <span className="text-sm font-medium text-muted-foreground">
                              You Received
                            </span>
                          </div>
                          <div className="text-4xl md:text-5xl font-bold text-novunt-gold-600 dark:text-novunt-gold-500 mb-1">
                            {formatCurrency(bonusData.bonusAmount)}
                          </div>
                          <p className="text-xs text-muted-foreground mb-4">
                            Bonus paid out gradually with weekly ROS
                          </p>

                          {/* Progress Tracking Toggle */}
                          {bonusData.bonus && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="gap-1 text-xs mb-2 mx-auto flex h-7"
                              >
                                {isExpanded ? 'Hide Payout Details' : 'Show Payout Details'}
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </Button>

                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                  >
                                    <div className="space-y-3 pt-2 border-t border-novunt-gold-500/20">
                                      {/* Progress Stats */}
                                      <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="text-left">
                                          <p className="text-muted-foreground mb-1">Paid Out</p>
                                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(bonusData.bonus.bonusPaidOut || 0)}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-muted-foreground mb-1">Remaining</p>
                                          <p className="font-semibold text-blue-600 dark:text-blue-400">
                                            {formatCurrency(bonusData.bonus.remainingBonus || bonusData.bonusAmount)}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Progress Bar */}
                                      <div className="relative">
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                              width: `${((bonusData.bonus.bonusPaidOut || 0) / bonusData.bonusAmount) * 100}%`
                                            }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                                          />
                                        </div>
                                        <p className="text-xs text-center text-muted-foreground mt-1">
                                          {((bonusData.bonus.bonusPaidOut || 0) / bonusData.bonusAmount * 100).toFixed(1)}% paid out
                                        </p>
                                      </div>

                                      {/* Weekly Payout Info */}
                                      {bonusData.bonus.weeklyPayoutCount !== undefined && (
                                        <div className="text-xs text-center text-muted-foreground">
                                          {bonusData.bonus.weeklyPayoutCount} {bonusData.bonus.weeklyPayoutCount === 1 ? 'payment' : 'payments'} received
                                        </div>
                                      )}

                                      {/* Completion Badge */}
                                      {bonusData.bonus.completedAt && (
                                        <motion.div
                                          initial={{ scale: 0.8, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-400"
                                        >
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                          Fully Paid Out
                                        </motion.div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          )}

                          {/* Description */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-2"
                          >
                            <p className="text-sm text-foreground">
                              Your bonus stake is now active and earning weekly profits!
                            </p>
                            <p className="text-xs text-muted-foreground">
                              You can view all your stakes, including the bonus stake, in your staking dashboard.
                            </p>
                          </motion.div>

                          {/* CTA Button */}
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
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                );
}
