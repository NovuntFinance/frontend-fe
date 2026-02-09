/**
 * Onboarding Flow for New Users (V2)
 * Tiered Compliance Model: 5-Step Process
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { registrationBonusApi } from '@/services/registrationBonusApi';
import {
  RegistrationBonusData,
  RegistrationBonusStatus,
  SocialMediaPlatform,
} from '@/types/registrationBonus';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CheckCircle2,
  Shield,
  ShieldCheck,
  Wallet,
  TrendingUp as YoutubeIcon,
  TrendingUp,
  ArrowRight,
  Clock,
  Loader2,
  ChevronRight,
  Info,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/enhanced-toast';

export default function OnboardingPage() {
  const router = useRouter();
  const [bonusData, setBonusData] = useState<RegistrationBonusData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [verifyingSocial, setVerifyingSocial] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchStatus = useCallback(async () => {
    try {
      const response = await registrationBonusApi.getStatus();
      if (response.success && response.data) {
        setBonusData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch onboarding status', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Polling to catch automated backend updates (2FA, Wallet, Stake)
    const interval = setInterval(fetchStatus, 5000);
    setPollingInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchStatus]);

  const handleVerifySocial = async (platform: string) => {
    setVerifyingSocial(true);
    try {
      const response = await registrationBonusApi.completeSocialStep(platform);
      if (response.success) {
        toast.success(`Social media verification for ${platform} submitted!`);
        await fetchStatus();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify social media');
    } finally {
      setVerifyingSocial(false);
    }
  };

  const handleAction = (href: string) => {
    router.push(href);
  };

  const steps = [
    {
      id: 'reg',
      title: 'Registration',
      description: 'Account created and email verified',
      icon: ShieldCheck,
      completed: true, // Always true if they reach here
      requiredForLock: true,
    },
    {
      id: '2fa',
      title: '2FA Security',
      description: 'Enable Two-Factor Authentication',
      icon: Shield,
      completed: bonusData?.requirements?.twoFASetup?.isCompleted || false,
      action: { label: 'Setup 2FA', href: '/dashboard/settings' },
      requiredForLock: true,
    },
    {
      id: 'wallet',
      title: 'Wallet Whitelist',
      description: 'Set your BEP20 withdrawal address',
      icon: Wallet,
      completed:
        bonusData?.requirements?.withdrawalAddressWhitelist?.isCompleted ||
        false,
      action: { label: 'Whitelist Address', href: '/dashboard/wallets' },
      requiredForLock: true,
    },
    {
      id: 'social',
      title: 'Social Media',
      description: 'Follow us on YouTube & Facebook',
      icon: YoutubeIcon,
      completed:
        bonusData?.requirements?.socialMediaVerifications?.every(
          (v) => v.isVerified
        ) || false,
      action: {
        label: 'Verify Follow',
        onClick: () => handleVerifySocial('youtube'),
      },
      requiredForLock: false,
    },
    {
      id: 'stake',
      title: 'First Stake',
      description: 'Activate your 10% bonus with a stake',
      icon: TrendingUp,
      completed: bonusData?.requirements?.firstStakeCompleted || false,
      action: { label: 'Create Stake', href: '/dashboard/staking/new' },
      requiredForLock: false,
    },
  ];

  const progress = bonusData?.progressPercentage || 0;
  const isUnlocked = progress >= 60;

  if (loading && !bonusData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4 font-sans text-white">
      <Card className="relative w-full max-w-3xl overflow-hidden border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl sm:p-10">
        {/* Background glow effects */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="bg-neon-green/10 absolute -bottom-24 -left-24 h-64 w-64 rounded-full blur-3xl" />

        {/* Header */}
        <div className="relative mb-10 flex flex-col items-center text-center sm:flex-row sm:text-left">
          <div className="mb-4 flex-1 sm:mb-0">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Compliance <span className="text-cyan-400">Onboarding</span>
            </h1>
            <p className="mt-2 text-slate-400">
              Complete your security profile to unlock full platform access.
            </p>
          </div>

          <div
            className={cn(
              'flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-500',
              isUnlocked
                ? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                : 'border border-amber-500/30 bg-amber-500/20 text-amber-400'
            )}
          >
            {isUnlocked ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
            {isUnlocked ? 'PLATFORM UNLOCKED' : 'PLATFORM LOCKED'}
          </div>
        </div>

        {/* Countdown & Status */}
        {bonusData &&
          bonusData.status !== RegistrationBonusStatus.COMPLETED && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-cyan-400" />
                <div>
                  <span className="block text-xs tracking-wider text-slate-500 uppercase">
                    Time Remaining
                  </span>
                  <span className="font-mono text-lg font-bold">
                    {bonusData.daysRemaining} Days
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-xs tracking-wider text-slate-500 uppercase">
                  Bonus Status
                </span>
                <span className="font-bold text-cyan-400">
                  {bonusData.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          )}

        {/* Progress Bar V2 */}
        <div className="mb-12">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">
              Completion Progress
            </span>
            <span className="text-sm font-bold text-emerald-400">
              {progress}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-center text-xs text-slate-500">
            Reach <span className="font-bold text-emerald-400">60%</span> to
            unlock Withdrawals and Transfers.
          </p>
        </div>

        {/* Step Checklist */}
        <div className="grid gap-4 sm:grid-cols-1">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={cn(
                'group relative flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300',
                step.completed
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              )}
            >
              <div
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors',
                  step.completed
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
                )}
              >
                {step.completed ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <step.icon className="h-6 w-6" />
                )}
              </div>

              <div className="flex-1">
                <h3
                  className={cn(
                    'font-bold transition-colors',
                    step.completed ? 'text-emerald-400' : 'text-white'
                  )}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400">{step.description}</p>
              </div>

              {!step.completed && step.action && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={verifyingSocial && step.id === 'social'}
                  onClick={() =>
                    step.action?.onClick
                      ? step.action.onClick()
                      : handleAction(step.action!.href)
                  }
                  className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
                >
                  {verifyingSocial && step.id === 'social' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {step.action.label}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}

              {step.completed && (
                <div className="hidden text-xs font-bold tracking-widest text-emerald-500/50 uppercase sm:block">
                  Verified
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Global Action */}
        <div className="mt-10 flex flex-col gap-4">
          <Button
            size="lg"
            disabled={!isUnlocked}
            onClick={() => router.push('/dashboard')}
            className={cn(
              'h-14 w-full rounded-2xl text-lg font-bold shadow-xl transition-all duration-500',
              isUnlocked
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 shadow-emerald-500/20 hover:from-emerald-500 hover:to-cyan-500'
                : 'cursor-not-allowed bg-slate-800 text-slate-500'
            )}
          >
            {isUnlocked
              ? 'Continue to Dashboard'
              : 'Platform Locked - Complete Requirements'}
            {isUnlocked && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>

          {!isUnlocked && (
            <p className="text-center text-sm text-amber-400/80">
              * Withdrawal and Transfer features remain locked until 60%
              completion.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
