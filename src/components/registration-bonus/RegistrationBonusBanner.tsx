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
import { useActiveStakes } from '@/lib/queries';
import { registrationBonusApi } from '@/services/registrationBonusApi';
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
import { BonusCompletedCard } from './BonusCompletedCard';
import { ErrorState } from './ErrorState';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export interface RegistrationBonusBannerProps {
  /** When provided (e.g. inside a modal), the X button calls this instead of dismiss logic */
  onClose?: () => void;
  /** When true (e.g. in modal), the Details section is expanded by default so progress and steps are visible */
  defaultExpanded?: boolean;
}

export function RegistrationBonusBanner({
  onClose,
  defaultExpanded = false,
}: RegistrationBonusBannerProps = {}) {
  const { data, isLoading, error, refetch } = useRegistrationBonus();
  const { data: activeStakes } = useActiveStakes();
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);
  const confettiIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const confettiFiredRef = React.useRef(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const selfHealAttemptedRef = React.useRef(false);

  // ──────────────────────────────────────────────────────────────────────
  // Self-healing: If bonus status says firstStakeCompleted = false but the
  // user already has an active stake >= 20 USDT, the backend missed it.
  // Call process-stake once to fix the record, then refetch status.
  // ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (selfHealAttemptedRef.current) return;

    const bonusData = data?.data;
    if (!bonusData) return;

    // Only run when bonus is still pending and first stake is NOT marked
    const isPending = bonusData.status === RegistrationBonusStatus.PENDING;
    const firstStakeMissing =
      !bonusData.requirements?.firstStakeCompleted &&
      !bonusData.requirements?.firstStake?.completed;

    if (!isPending || !firstStakeMissing) return;

    // Find a qualifying active stake (amount >= 20, not a bonus stake)
    const stakes = Array.isArray(activeStakes) ? activeStakes : [];
    const qualifyingStake = stakes.find(
      (s: any) =>
        s.amount >= 20 &&
        s.type !== 'registration_bonus' &&
        !s.isRegistrationBonus &&
        s.active !== false &&
        s.status !== 'cancelled'
    );

    if (!qualifyingStake) return;

    const stakeId = qualifyingStake.id ?? (qualifyingStake as any)._id;
    if (!stakeId) return;

    // Attempt self-heal
    selfHealAttemptedRef.current = true;
    console.log(
      '[RegistrationBonusBanner] 🔧 Self-healing: backend missed first stake. Calling process-stake...',
      { stakeId, amount: qualifyingStake.amount }
    );

    registrationBonusApi
      .processStake(stakeId, qualifyingStake.amount)
      .then((res) => {
        console.log(
          '[RegistrationBonusBanner] ✅ Self-heal process-stake succeeded:',
          res
        );
        // Refetch bonus status after a short delay to let backend update
        setTimeout(() => refetch(), 1500);
      })
      .catch((err) => {
        console.error(
          '[RegistrationBonusBanner] ❌ Self-heal process-stake failed:',
          err
        );
        // Even if it fails, refetch — the backend "self-healing on GET" might have kicked in
        setTimeout(() => refetch(), 2000);
      });
  }, [data, activeStakes, refetch]);

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
            <BonusActivatedCard bonusData={bonusData} onClose={onClose} />
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
            <BonusExpiredCard bonusData={bonusData} onClose={onClose} />
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
            <BonusCompletedCard bonusData={bonusData} onClose={onClose} />
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
            {/* Header & content – no outer card wrapper */}
            <div className="relative p-4 sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-2 sm:gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                  {/* Icon - Soft elevated */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="shrink-0 rounded-xl p-2.5 sm:p-3"
                    style={{
                      background: 'var(--neu-bg)',
                      boxShadow:
                        '3px 3px 8px var(--neu-shadow-dark), -3px -3px 8px var(--neu-shadow-light)',
                    }}
                  >
                    <Gift
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      style={{ color: 'var(--neu-accent)' }}
                    />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="truncate text-sm font-bold sm:text-base md:text-lg"
                      style={{ color: 'var(--neu-accent)' }}
                    >
                      Welcome Bonus: {bonusPercentage}% on First Stake!
                    </h3>
                    <p
                      className="truncate text-[10px] sm:text-xs"
                      style={{ color: 'var(--neu-text-secondary)' }}
                    >
                      Complete all 5 steps within 7 days to unlock your bonus
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                  {/* Toggle button - Neumorphic */}
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium transition-all"
                    style={{
                      background: 'var(--neu-bg)',
                      color: 'var(--neu-accent)',
                      boxShadow: isExpanded
                        ? 'inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light)'
                        : '2px 2px 5px var(--neu-shadow-dark), -2px -2px 5px var(--neu-shadow-light)',
                    }}
                  >
                    {isExpanded ? 'Hide' : 'Details'}
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                  {/* Close button */}
                  <button
                    onClick={onClose ?? handleDismiss}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all"
                    style={{
                      background: 'var(--neu-bg)',
                      color: 'var(--neu-text-secondary)',
                      boxShadow:
                        '2px 2px 5px var(--neu-shadow-dark), -2px -2px 5px var(--neu-shadow-light)',
                    }}
                    aria-label={onClose ? 'Close' : 'Dismiss banner'}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

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
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--neu-text-primary)' }}
                  >
                    Overall Progress
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: 'var(--neu-accent)' }}
                  >
                    {safeProgressPercentage}%
                  </span>
                </div>
                {/* Progress Track - Inset */}
                <div
                  className="relative h-3 overflow-hidden rounded-full"
                  style={{
                    background: 'var(--neu-bg)',
                    boxShadow:
                      'inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)',
                  }}
                >
                  {/* Progress Fill - Illuminated */}
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${safeProgressPercentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      background: 'var(--neu-accent)',
                      boxShadow: `0 0 8px rgba(var(--neu-accent-rgb), 0.5), inset -1px -1px 2px rgba(255, 255, 255, 0.2)`,
                    }}
                  />
                </div>
                <p
                  className="mt-1.5 text-[10px]"
                  style={{ color: 'var(--neu-text-secondary)' }}
                >
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
                    <div
                      className="mt-4 border-t pt-4"
                      style={{ borderColor: 'var(--neu-border)' }}
                    >
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
            </div>
          </motion.div>
        </AnimatePresence>
      );
  }
}
