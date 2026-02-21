/**
 * Registration Bonus Banner – Premium Gold Design
 * 5-step progress tracker:
 *   1. Registration (20%)  – automatic
 *   2. 2FA Setup (20%)
 *   3. Withdrawal Address (20%)
 *   4. Social Media – ALL 5 (20%)
 *   5. First Stake ≥ 20 USDT (20%)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, ChevronDown, ChevronUp } from 'lucide-react';
import { useRegistrationBonus } from '@/hooks/useRegistrationBonus';
import { RegistrationBonusStatus } from '@/types/registrationBonus';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShimmerCard } from '@/components/ui/shimmer';
import { CountdownTimer } from './CountdownTimer';
import { RequirementSection } from './RequirementSection';
import { BonusActivatedCard } from './BonusActivatedCard';
import { BonusExpiredCard } from './BonusExpiredCard';
import { BonusCompletedCard } from '@/components/registration-bonus/BonusCompletedCard';
import { ErrorState } from './ErrorState';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export function RegistrationBonusBanner() {
  const { data, isLoading, error, refetch } = useRegistrationBonus();
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);
  const confettiIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const confettiFiredRef = React.useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shown = localStorage.getItem('novunt_bonus_confetti_shown');
      if (shown === 'true') {
        setHasShownConfetti(true);
        confettiFiredRef.current = true;
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (confettiIntervalRef.current) {
        clearInterval(confettiIntervalRef.current);
      }
    };
  }, []);

  const fireConfetti = () => {
    if (
      typeof window !== 'undefined' &&
      localStorage.getItem('novunt_bonus_confetti_shown') === 'true'
    ) {
      return;
    }
    if (confettiFiredRef.current) return;

    confettiFiredRef.current = true;
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
      colors: ['#FFD700', '#FFA500', '#10B981', '#059669', '#34D399'],
    };
    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    if (confettiIntervalRef.current) clearInterval(confettiIntervalRef.current);

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

    confettiIntervalRef.current = interval;
  };

  // Listen for bonus completion event
  useEffect(() => {
    const handleBonusCompleted = (event: any) => {
      const { bonusAmount } = event.detail || {};
      const isShown =
        typeof window !== 'undefined' &&
        localStorage.getItem('novunt_bonus_confetti_shown') === 'true';

      if (!hasShownConfetti && !isShown && !confettiFiredRef.current) {
        fireConfetti();
        setHasShownConfetti(true);
        localStorage.setItem('novunt_bonus_confetti_shown', 'true');

        toast.success('Bonus Activated!', {
          description: `Congratulations! You've unlocked your ${bonusAmount ? `$${bonusAmount}` : '10%'} registration bonus!`,
          duration: 7000,
          id: 'bonus-activated-toast',
        });

        setTimeout(() => refetch(), 1000);
      }
    };

    window.addEventListener('registrationBonusCompleted', handleBonusCompleted);
    return () => {
      window.removeEventListener(
        'registrationBonusCompleted',
        handleBonusCompleted
      );
    };
  }, [hasShownConfetti, refetch]);

  // Check dismissal only for final states
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('novunt_bonus_dismissed');
      if (dismissed === 'true' && data?.data) {
        const status = data.data.status;
        const isFinalState =
          status === RegistrationBonusStatus.COMPLETED ||
          status === RegistrationBonusStatus.EXPIRED ||
          status === RegistrationBonusStatus.CANCELLED;
        if (isFinalState) {
          setIsDismissed(true);
        } else {
          localStorage.removeItem('novunt_bonus_dismissed');
          setIsDismissed(false);
        }
      }
    }
  }, [data]);

  // Listen for refetch event (triggered after 2FA setup, wallet addition, etc.)
  React.useEffect(() => {
    const handleRefetch = () => refetch();
    window.addEventListener('refetchRegistrationBonus', handleRefetch);
    return () =>
      window.removeEventListener('refetchRegistrationBonus', handleRefetch);
  }, [refetch]);

  if (isDismissed) return null;

  // Loading: render nothing so no skeleton or extra spacing; banner appears when data is ready
  if (isLoading) return null;

  // Error handling
  if (error) {
    const err = error as any;
    const status = err?.statusCode || err?.response?.status || err?.status;
    const errorMessage =
      err?.message ||
      err?.response?.data?.message ||
      'Unable to load bonus status';

    if (status === 404) return null;
    return <ErrorState message={errorMessage} onRetry={() => refetch()} />;
  }

  if (!data?.data) return null;

  const bonusData = data.data;
  const { status, progressPercentage, bonusPercentage } = bonusData;
  const safeProgressPercentage =
    typeof progressPercentage === 'number' ? progressPercentage : 0;

  // Resolve countdown deadline – prefer V2 `deadline`, fallback to legacy `expiresAt`
  const countdownDeadline = bonusData.deadline || bonusData.expiresAt;

  const handleDismiss = () => {
    const isFinalState =
      status === RegistrationBonusStatus.COMPLETED ||
      status === RegistrationBonusStatus.EXPIRED ||
      status === RegistrationBonusStatus.CANCELLED ||
      status === RegistrationBonusStatus.BONUS_ACTIVE;

    if (isFinalState) {
      setIsDismissed(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('novunt_bonus_dismissed', 'true');
      }
    } else {
      toast.info('Complete the bonus requirements to dismiss this banner', {
        description:
          'The banner will remain visible until you complete or the bonus expires',
      });
    }
  };

  // Render based on status
  switch (status) {
    case RegistrationBonusStatus.BONUS_ACTIVE:
      return (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <BonusActivatedCard bonusData={bonusData} />
          </motion.div>
        </AnimatePresence>
      );

    case RegistrationBonusStatus.EXPIRED:
      return (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <BonusExpiredCard bonusData={bonusData} />
          </motion.div>
        </AnimatePresence>
      );

    case RegistrationBonusStatus.COMPLETED:
      return (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <BonusCompletedCard bonusData={bonusData} />
          </motion.div>
        </AnimatePresence>
      );

    case RegistrationBonusStatus.CANCELLED:
      return (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-muted bg-muted/30">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Your registration bonus has been cancelled.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      );

    case RegistrationBonusStatus.PENDING:
    case RegistrationBonusStatus.REQUIREMENTS_MET:
    default:
      return (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent" />

              {/* Animated Floating Blob */}
              <motion.div
                animate={{
                  x: [0, -15, 0],
                  y: [0, 10, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-amber-500/30 blur-2xl"
              />

              <CardHeader className="relative p-4 sm:p-6">
                <div className="mb-2 flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -10 }}
                      className="rounded-xl bg-gradient-to-br from-amber-500/30 to-yellow-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                    >
                      <Gift className="h-5 w-5 text-amber-500 sm:h-6 sm:w-6" />
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                        Welcome Bonus: {bonusPercentage}% on First Stake!
                      </CardTitle>
                      <CardDescription className="truncate text-[10px] sm:text-xs">
                        Complete all 5 steps within 7 days to unlock your bonus
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="h-8 gap-1 text-xs"
                    >
                      {isExpanded ? 'Hide' : 'Details'}
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDismiss}
                      className="text-muted-foreground hover:text-foreground h-8 w-8 shrink-0 rounded-full"
                      aria-label="Dismiss banner"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative overflow-visible p-4 pt-0 sm:p-6 sm:pt-0">
                {/* Countdown Timer */}
                {countdownDeadline && (
                  <div className="mb-4">
                    <CountdownTimer
                      deadline={countdownDeadline}
                      timeRemaining={bonusData.timeRemaining ?? 0}
                      onExpire={() => refetch()}
                    />
                  </div>
                )}

                {/* Overall Progress */}
                <div className="mb-4 sm:mb-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-foreground text-sm font-semibold">
                      Overall Progress
                    </span>
                    <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-sm font-bold text-transparent">
                      {safeProgressPercentage}%
                    </span>
                  </div>
                  <div className="bg-muted/50 relative h-3 overflow-hidden rounded-full">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 shadow-lg shadow-amber-500/50"
                      initial={{ width: 0 }}
                      animate={{ width: `${safeProgressPercentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-muted-foreground mt-1 text-[10px]">
                    {safeProgressPercentage < 100
                      ? `${Math.ceil((100 - safeProgressPercentage) / 20)} step${Math.ceil((100 - safeProgressPercentage) / 20) !== 1 ? 's' : ''} remaining`
                      : 'All steps complete!'}
                  </p>
                </div>

                {/* Requirements Section – expanded */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="border-border/50 mt-4 border-t pt-4">
                        <RequirementSection
                          requirements={bonusData.requirements}
                          nextStepDescription={
                            bonusData.nextStepDescription ??
                            'Complete the requirements above to activate your bonus'
                          }
                          onRefresh={refetch}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      );
  }
}
