/**
 * Registration Bonus Banner - Premium Gold Design
 * Modern, attractive design with gold accents and elegant layout
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Star, CheckCircle2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useRegistrationBonus } from '@/hooks/useRegistrationBonus';
import { RegistrationBonusStatus } from '@/types/registrationBonus';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { CountdownTimer } from './CountdownTimer';
import { RequirementSection } from './RequirementSection';
import { BonusActivatedCard } from './BonusActivatedCard';
import { BonusExpiredCard } from './BonusExpiredCard';
import { ErrorState } from './ErrorState';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

/**
 * Premium Gold Registration Bonus Banner
 * Modern design with gold accents and elegant layout
 */
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

  // Cleanup confetti on unmount
  useEffect(() => {
    return () => {
      if (confettiIntervalRef.current) {
        clearInterval(confettiIntervalRef.current);
      }
    };
  }, []);

  // Trigger confetti helper
  const fireConfetti = () => {
    // NUCLEAR OPTION: Check localStorage FIRST before anything else
    if (typeof window !== 'undefined' && localStorage.getItem('novunt_bonus_confetti_shown') === 'true') {
      console.log('[RegistrationBonusBanner] ⛔ Confetti already shown (localStorage check), aborting');
      return;
    }

    // Double check ref to prevent duplicate firing in same session
    if (confettiFiredRef.current) {
      console.log('[RegistrationBonusBanner] ⛔ Confetti already fired in this session (ref check), aborting');
      return;
    }

    console.log('[RegistrationBonusBanner] 🎉 Firing confetti!');
    confettiFiredRef.current = true;

    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
      colors: ['#FFD700', '#FFA500', '#10B981', '#059669', '#34D399']
    };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    // Clear any existing interval
    if (confettiIntervalRef.current) {
      clearInterval(confettiIntervalRef.current);
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Fire confetti from left side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });

      // Fire confetti from right side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    confettiIntervalRef.current = interval;
  };

  // Listen for bonus completion event
  useEffect(() => {
    const handleBonusCompleted = (event: any) => {
      const { bonusAmount } = event.detail || {};

      // Check localStorage directly to be safe
      const isShown = typeof window !== 'undefined' && localStorage.getItem('novunt_bonus_confetti_shown') === 'true';

      if (!hasShownConfetti && !isShown && !confettiFiredRef.current) {
        console.log('[RegistrationBonusBanner] 🎉 Bonus completed event received!', { bonusAmount });
        fireConfetti();
        setHasShownConfetti(true);
        localStorage.setItem('novunt_bonus_confetti_shown', 'true');

        toast.success('🎉 Bonus Activated!', {
          description: `Congratulations! You've unlocked your ${bonusAmount ? `$${bonusAmount}` : '10%'} registration bonus!`,
          duration: 7000,
          id: 'bonus-activated-toast',
        });

        setTimeout(() => refetch(), 1000);
      }
    };

    window.addEventListener('registrationBonusCompleted', handleBonusCompleted);
    return () => {
      window.removeEventListener('registrationBonusCompleted', handleBonusCompleted);
    };
  }, [hasShownConfetti, refetch]);

  // Debug: Log when we detect 100% progress (but DON'T trigger confetti here)
  // Confetti will ONLY be triggered by the 'registrationBonusCompleted' event
  useEffect(() => {
    const progressPercentage = data?.data?.progressPercentage ?? 0;
    const status = data?.data?.status;

    if (progressPercentage === 100 &&
      (status === RegistrationBonusStatus.REQUIREMENTS_MET ||
        status === RegistrationBonusStatus.BONUS_ACTIVE)) {

      // Check localStorage directly
      const isShown = typeof window !== 'undefined' && localStorage.getItem('novunt_bonus_confetti_shown') === 'true';

      console.log('[RegistrationBonusBanner] 🔍 Detected 100% progress', {
        hasShownConfetti,
        isShownInLocalStorage: isShown,
        confettiFiredRef: confettiFiredRef.current,
        willTrigger: !hasShownConfetti && !isShown && !confettiFiredRef.current,
        status,
      });

      // NOTE: We do NOT trigger confetti here anymore to prevent repeated confetti on navigation.
      // Confetti is ONLY triggered by the 'registrationBonusCompleted' event (when stake is created).
    }
  }, [data?.data?.progressPercentage, data?.data?.status, hasShownConfetti]);

  // Check if dismissed in localStorage, but only respect it for completed/expired/cancelled bonuses
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('novunt_bonus_dismissed');
      // Only respect dismissal if bonus is in a final state (completed, expired, cancelled)
      // If bonus is still pending/active, always show it to encourage completion
      if (dismissed === 'true' && data?.data) {
        const status = data.data.status;
        const isFinalState = status === RegistrationBonusStatus.COMPLETED ||
          status === RegistrationBonusStatus.EXPIRED ||
          status === RegistrationBonusStatus.CANCELLED;
        if (isFinalState) {
          setIsDismissed(true);
        } else {
          // Clear dismissal flag if bonus is still active
          localStorage.removeItem('novunt_bonus_dismissed');
          setIsDismissed(false);
        }
      } else if (dismissed === 'true' && !data?.data && !isLoading) {
        // If data hasn't loaded yet, don't dismiss yet
        setIsDismissed(false);
      }
    }
  }, [data, isLoading]);

  // Listen for refetch event (triggered after profile update)
  React.useEffect(() => {
    const handleRefetch = () => {
      refetch();
    };

    window.addEventListener('refetchRegistrationBonus', handleRefetch);
    return () => {
      window.removeEventListener('refetchRegistrationBonus', handleRefetch);
    };
  }, [refetch]);

  // Don't render if dismissed
  if (isDismissed) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <Card className="mb-6 border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              🐛 [DEV] Registration Bonus Banner is dismissed.
            </p>
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  // Loading state
  if (isLoading) {
    return <BannerSkeleton />;
  }

  // Error state
  if (error) {
    const status = (error as any)?.response?.status;

    if (status === 404) {
      if (process.env.NODE_ENV === 'development') {
        return (
          <Card className="mb-6 border-blue-500/30 bg-blue-500/5">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-foreground mb-2">
                🐛 [DEV] Registration Bonus Banner Debug
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                Status: 404 - No registration bonus record found.
              </p>
            </CardContent>
          </Card>
        );
      }
      return null;
    }

    return (
      <ErrorState
        message="Unable to load bonus status"
        onRetry={() => refetch()}
      />
    );
  }

  // No data
  if (!data?.data) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <Card className="mb-6 border-orange-500/30 bg-orange-500/5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              🐛 [DEV] No bonus data returned from API.
            </p>
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  const bonusData = data.data;
  const { status, progressPercentage, bonusPercentage } = bonusData;

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    // Use legacy profile field if available, otherwise use requirements.profileCompletion
    const profileDetails = bonusData.profile?.details || [];
    const profileCompletionPercentage = bonusData.profile?.completionPercentage ?? bonusData.requirements?.profileCompletion?.percentage ?? 0;
    const completedFields = profileDetails.filter((d: any) => d.isCompleted).length;
    const totalFields = profileDetails.length;

    // Calculate expected overall progress based on correct logic:
    // 25% (registration) + 25% (profile) + 25% (social - at least 1) + 25% (stake) = 100%
    const expectedOverallProgress = (() => {
      let progress = 25; // Base: Registration = 25%
      if (profileCompletionPercentage === 100) progress += 25; // Profile complete = +25%
      const socialCompleted = bonusData.socialMedia?.completed ?? bonusData.requirements?.socialMediaVerification?.verifiedCount ?? 0;
      if (socialCompleted >= 1) progress += 25; // Social verified (at least 1) = +25%
      const stakeCompleted = (bonusData.firstStake && 'stakeId' in bonusData.firstStake && bonusData.firstStake.stakeId) ?? bonusData.requirements?.firstStake?.completed ?? false;
      if (stakeCompleted) progress += 25; // First stake = +25%
      return progress;
    })();

    console.log('[RegistrationBonusBanner] 🔍 Data Debug:', {
      status,
      progressPercentage: `${progressPercentage}% (Expected: ${expectedOverallProgress}%)`,
      bonusPercentage,
      profileCompletion: `${profileCompletionPercentage}% (Profile: ${completedFields}/${totalFields} fields completed)`,
      profileDetails: {
        totalFields,
        completedFields,
        expectedPercentage: totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0,
        fields: profileDetails.map((d: any) => ({
          field: d.fieldName,
          completed: d.isCompleted,
        })),
      },
      socialCompleted: `${bonusData.socialMedia?.completed ?? bonusData.requirements?.socialMediaVerification?.verifiedCount ?? 0}/${bonusData.socialMedia?.minimumRequired ?? bonusData.requirements?.socialMediaVerification?.totalRequired ?? 5}`,
      stakeCompleted: (bonusData.firstStake && 'stakeId' in bonusData.firstStake && bonusData.firstStake.stakeId) ?? bonusData.requirements?.firstStake?.completed ?? false,
      expectedOverallProgress: `${expectedOverallProgress}%`,
      progressBreakdown: {
        registration: '25% (automatic)',
        profile: profileCompletionPercentage === 100 ? '+25%' : '+0%',
        social: (bonusData.socialMedia?.completed ?? bonusData.requirements?.socialMediaVerification?.verifiedCount ?? 0) >= 1 ? '+25%' : '+0%',
        stake: ((bonusData.firstStake && 'stakeId' in bonusData.firstStake && bonusData.firstStake.stakeId) ?? bonusData.requirements?.firstStake?.completed ?? false) ? '+25%' : '+0%',
        total: `${expectedOverallProgress}%`,
      },
      fullData: bonusData,
    });
  }

  // Ensure we have valid numbers (fallback to 0 if undefined/null)
  const safeProgressPercentage = typeof progressPercentage === 'number' ? progressPercentage : 0;
  const safeProfileCompletion = bonusData.profile?.completionPercentage ?? bonusData.requirements?.profileCompletion?.percentage ?? 0;

  // Handle dismiss - only allow dismissal for final states
  const handleDismiss = () => {
    const status = bonusData?.status;
    const isFinalState = status === RegistrationBonusStatus.COMPLETED ||
      status === RegistrationBonusStatus.EXPIRED ||
      status === RegistrationBonusStatus.CANCELLED ||
      status === RegistrationBonusStatus.BONUS_ACTIVE;

    // Only allow dismissal if bonus is in a final state
    // Don't allow dismissal for pending/requirements_met bonuses (users should complete them)
    if (isFinalState) {
      setIsDismissed(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('novunt_bonus_dismissed', 'true');
      }
    } else {
      // Show a message that the banner can't be dismissed yet
      toast.info('Complete the bonus requirements to dismiss this banner', {
        description: 'The banner will remain visible until you complete or the bonus expires',
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
    case RegistrationBonusStatus.CANCELLED:
      return null;

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
            className="mb-6"
          >
            <Card className="relative overflow-hidden border-2 border-novunt-gold-500/30 bg-gradient-to-br from-novunt-gold-500/10 via-novunt-gold-500/5 to-background shadow-lg shadow-novunt-gold-500/10">
              {/* Animated gold shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-novunt-gold-500/20 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              />

              {/* Gold sparkle decorations */}
              <div className="absolute top-4 right-4 opacity-30">
                <Star className="h-5 w-5 text-novunt-gold-500 animate-pulse fill-novunt-gold-500/20" />
              </div>

              <CardContent className="relative z-10 p-5 md:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Gold gift icon */}
                    <motion.div
                      className="p-2.5 rounded-xl bg-gradient-to-br from-novunt-gold-500/30 to-novunt-gold-600/20 backdrop-blur-sm border border-novunt-gold-500/30"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <Gift className="h-6 w-6 text-novunt-gold-600 dark:text-novunt-gold-500" />
                    </motion.div>

                    {/* Title */}
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-0.5">
                        Welcome Bonus: {bonusPercentage}% on First Stake!
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Complete all requirements to unlock your bonus
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="gap-1 text-xs h-8"
                    >
                      {isExpanded ? 'Hide Details' : 'Show Details'}
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>

                    {/* Dismiss Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDismiss}
                      className="shrink-0 h-8 w-8 rounded-full hover:bg-novunt-gold-500/10 text-muted-foreground hover:text-foreground"
                      aria-label="Dismiss banner"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Countdown Timer - Gold Style */}
                {bonusData.expiresAt && (
                  <div className="mb-4">
                    <CountdownTimer
                      deadline={bonusData.expiresAt}
                      timeRemaining={bonusData.timeRemaining ?? 0}
                      onExpire={() => refetch()}
                    />
                  </div>
                )}

                {/* Overall Progress */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">Overall Progress</span>
                    <span className="text-sm font-bold text-novunt-gold-600 dark:text-novunt-gold-500">
                      {safeProgressPercentage}%
                    </span>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-muted/50 border border-novunt-gold-500/20">
                    <motion.div
                      className="h-full bg-gradient-to-r from-novunt-gold-500 via-novunt-gold-600 to-novunt-gold-500 shadow-lg shadow-novunt-gold-500/50"
                      initial={{ width: 0 }}
                      animate={{ width: `${safeProgressPercentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                    {/* Subtle glow effect on progress bar */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{
                        duration: 3,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    />
                  </div>
                </div>

                {/* Requirements Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-novunt-gold-500/10 mt-4">
                        <RequirementSection
                          requirements={bonusData.requirements}
                          nextStepDescription={bonusData.nextStepDescription ?? 'Complete the requirements above to activate your bonus'}
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

/**
 * Loading skeleton
 */
function BannerSkeleton() {
  return (
    <Card className="mb-6 border-novunt-gold-500/30 bg-gradient-to-br from-novunt-gold-500/10 to-background">
      <CardContent className="p-5 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-16 w-full mb-4" />
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  );
}
