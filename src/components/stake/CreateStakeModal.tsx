'use client';

/**
 * Create Stake modal – uses shared neumorphic modal system.
 * Same layout, flow (steps 1–3, 2FA, source), and behavior; styling from @/components/neumorphic-modal.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useCreateStake } from '@/lib/mutations/stakingMutations';
import { useWalletBalance } from '@/lib/queries';
import { toast } from '@/components/ui/enhanced-toast';
import { useUIStore } from '@/store/uiStore';
import { useStakingConfig } from '@/hooks/useStakingConfig';
import { fmt4 } from '@/utils/formatters';
import {
  NEU_TOKENS,
  neuInset,
  neuRaised,
  neuRadius,
} from '@/components/neumorphic-modal/tokens';
import {
  BaseModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  InfoCallout,
  PrimaryButton,
  SecondaryButton,
} from '@/components/neumorphic-modal';
import { cn } from '@/lib/utils';

export function CreateStakeModal() {
  const { isModalOpen, closeModal } = useUIStore();
  const isOpen = isModalOpen('create-stake');

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState<'funded' | 'earning' | 'both'>('both');
  const [goal, setGoal] = useState<string>('');
  const [goalTitle, setGoalTitle] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: walletBalance } = useWalletBalance();
  const createStake = useCreateStake();
  const stakingConfig = useStakingConfig();

  const amountNum = parseFloat(amount) || 0;
  const targetReturn = amountNum * (stakingConfig.goalTargetPercentage / 100);
  const minStake = stakingConfig.minAmount;
  const maxStake = stakingConfig.maxAmount;
  const requires2FA = amountNum > 100000;

  const availableBalance =
    source === 'funded'
      ? walletBalance?.funded.balance || 0
      : source === 'earning'
        ? walletBalance?.earnings.balance || 0
        : (walletBalance?.funded.balance || 0) +
          (walletBalance?.earnings.balance || 0);

  const handleClose = () => {
    if (!createStake.isPending) {
      setStep(1);
      setAmount('');
      setSource('both');
      setGoal('');
      setGoalTitle('');
      setTwoFactorCode('');
      setError(null);
      closeModal('create-stake');
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = () => {
    setError(null);
    if (!amount) {
      setError('Please enter an amount to stake.');
      return;
    }
    if (amountNum < minStake) {
      setError(`Minimum stake amount is $${minStake}.`);
      return;
    }
    if (amountNum > availableBalance) {
      setError(
        `Insufficient balance. You have $${fmt4(availableBalance)} available.`
      );
      return;
    }
    if (requires2FA && !twoFactorCode) {
      toast.error('2FA Required', {
        description:
          'High-value stakes require Two-Factor Authentication for security',
      });
      return;
    }
    setStep(2);
  };

  const handleConfirm = async () => {
    try {
      await createStake.mutateAsync({
        amount: amountNum,
        source,
        ...((goal || goalTitle) && { goal: goal || goalTitle }),
        ...(requires2FA && twoFactorCode && { twoFactorCode }),
      });
      setStep(3);
    } catch (error: unknown) {
      const err = error as {
        message?: string;
        response?: {
          data?: {
            message?: string;
            error?: { message?: string; details?: string };
          };
        };
        responseData?: string;
      };
      let errorMessage = 'Please try again or contact support';
      if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.responseData) {
        try {
          const parsedData = JSON.parse(err.responseData);
          if (parsedData.error?.message)
            errorMessage = parsedData.error.message;
          else if (parsedData.message) errorMessage = parsedData.message;
        } catch {
          /* ignore */
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      if (
        errorMessage.includes('insufficient') ||
        errorMessage.includes('balance')
      ) {
        errorMessage = `Insufficient funds. You need $${fmt4(amountNum)} but have $${fmt4(availableBalance)} available.`;
      } else if (errorMessage.includes('Failed to create stake')) {
        errorMessage =
          'Unable to create stake. Please check your wallet balance and try again.';
      }
      toast.error('Failed to Create Stake', {
        description: errorMessage,
        duration: 7000,
      });
      setStep(1);
    }
  };

  const insetStyle: React.CSSProperties = {
    background: NEU_TOKENS.bg,
    boxShadow: neuInset,
    border: `1px solid ${NEU_TOKENS.border}`,
    borderRadius: neuRadius.md,
  };

  const raisedStyle: React.CSSProperties = {
    background: NEU_TOKENS.bg,
    boxShadow: neuRaised,
    border: `1px solid ${NEU_TOKENS.border}`,
    borderRadius: neuRadius.md,
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      preventClose={createStake.isPending}
    >
      {step === 1 && (
        <>
          <ModalHeader
            title="Create New Stake"
            subtitle="Secure your future by locking in high-yield returns."
            onClose={handleClose}
            disableClose={createStake.isPending}
          />
          <ModalBody>
            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              <div className="space-y-1.5">
                <Label
                  htmlFor="goalTitle"
                  className="text-sm font-medium"
                  style={{ color: NEU_TOKENS.white60 }}
                >
                  Goal Title{' '}
                  <span className="font-normal opacity-80">(Optional)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="goalTitle"
                    type="text"
                    maxLength={60}
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="e.g. Dream Vacation"
                    className="neu-input h-11 w-full border-0 pr-10 pl-4 text-sm focus-visible:ring-0"
                  />
                  <span
                    className="absolute top-1/2 right-3 -translate-y-1/2 opacity-70"
                    style={{ color: NEU_TOKENS.accent }}
                  >
                    <Target className="size-4" />
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label
                    htmlFor="amount"
                    className="text-sm font-medium"
                    style={{ color: NEU_TOKENS.white60 }}
                  >
                    Stake Amount
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      setAmount(availableBalance.toString());
                      if (error) setError(null);
                    }}
                    className="text-xs font-semibold transition-opacity hover:opacity-90"
                    style={{ color: NEU_TOKENS.accent }}
                  >
                    MAX
                  </button>
                </div>
                <div
                  className="flex items-stretch overflow-hidden"
                  style={insetStyle}
                >
                  <span
                    className="flex items-center pl-4 text-lg font-semibold"
                    style={{ color: NEU_TOKENS.white60 }}
                  >
                    $
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    min={minStake}
                    max={availableBalance}
                    step="0.01"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className={cn(
                      'neu-input neu-input-inner h-12 flex-1 border-0 bg-transparent pr-2 pl-1 text-lg font-semibold focus-visible:ring-0 focus-visible:ring-offset-0'
                    )}
                  />
                  <span
                    className="flex items-center px-4 text-sm font-medium"
                    style={{ color: NEU_TOKENS.white60 }}
                  >
                    USDT
                  </span>
                </div>
                <div
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs"
                  style={{ color: NEU_TOKENS.white60 }}
                >
                  <span>
                    Available:{' '}
                    <span
                      className="font-semibold"
                      style={{ color: NEU_TOKENS.accent }}
                    >
                      ${fmt4(availableBalance)}
                    </span>
                  </span>
                  <span>
                    Min: ${minStake} — Max: ${maxStake}
                  </span>
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="neu-error text-xs font-medium"
                  >
                    {error}
                  </motion.p>
                )}
                {amountNum > 0 && !error && (
                  <p className="text-xs" style={{ color: NEU_TOKENS.white60 }}>
                    Target return: ${fmt4(targetReturn)}
                  </p>
                )}
              </div>

              {requires2FA && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2 rounded-xl p-4"
                  style={{
                    ...insetStyle,
                    borderColor: 'rgba(245, 158, 11, 0.25)',
                  }}
                >
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 size-4 flex-shrink-0 text-amber-400" />
                    <div>
                      <p className="text-xs font-semibold text-amber-300">
                        2FA Required
                      </p>
                      <p className="mt-0.5 text-xs text-amber-200/80">
                        High-value stakes require Two-Factor Authentication.
                      </p>
                    </div>
                  </div>
                  <Label
                    htmlFor="twoFactorCode"
                    className="text-sm font-medium text-amber-200/90"
                  >
                    Authenticator Code
                  </Label>
                  <Input
                    id="twoFactorCode"
                    type="text"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) =>
                      setTwoFactorCode(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="000000"
                    className="neu-input h-10 border-amber-500/30 text-center font-mono text-lg tracking-widest"
                  />
                </motion.div>
              )}

              <InfoCallout
                icon={
                  <ShieldCheck
                    className="size-4"
                    style={{ color: NEU_TOKENS.accent }}
                  />
                }
                title="Guaranteed Returns"
                description={
                  <>
                    Your stake is locked until you receive{' '}
                    {stakingConfig.goalTargetPercentage}% total return through
                    daily payouts.
                  </>
                }
                badge={{ label: 'Secure lock' }}
              />

              <ModalFooter>
                <PrimaryButton
                  onClick={handleSubmit}
                  disabled={createStake.isPending}
                  loading={createStake.isPending}
                >
                  {createStake.isPending ? 'Processing...' : 'Create Stake'}
                </PrimaryButton>
                <SecondaryButton onClick={handleClose}>
                  Cancel and Return
                </SecondaryButton>
              </ModalFooter>
            </div>
          </ModalBody>
        </>
      )}

      {step === 2 && (
        <>
          <div className="px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
            <div className="mb-4 flex items-center justify-center gap-2">
              <div
                className="flex size-12 items-center justify-center rounded-full"
                style={raisedStyle}
              >
                <CheckCircle2
                  className="size-6"
                  style={{ color: NEU_TOKENS.accent }}
                />
              </div>
            </div>
            <h2
              className="text-center text-lg font-bold sm:text-xl"
              style={{ color: NEU_TOKENS.accent }}
            >
              Confirm Stake
            </h2>
            <p
              className="mt-1 text-center text-sm"
              style={{ color: NEU_TOKENS.white60 }}
            >
              Please review your stake details
            </p>
          </div>
          <div
            className="mx-4 mb-4 space-y-0 rounded-xl sm:mx-6 lg:mx-8"
            style={insetStyle}
          >
            <Row label="Amount" value={`$${fmt4(amountNum)}`} />
            <Row
              label="Target Return"
              value={`$${fmt4(targetReturn)}`}
              accent
            />
            <Row
              label="Source"
              value={source === 'both' ? 'Both Wallets' : `${source} Wallet`}
            />
            {goalTitle && <Row label="Goal" value={goalTitle} />}
          </div>
          <div className="flex gap-3 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={createStake.isPending}
              className="h-11 flex-1 border-0 bg-transparent font-medium text-inherit"
              style={{ ...raisedStyle, color: NEU_TOKENS.white60 }}
            >
              Back
            </Button>
            <PrimaryButton
              onClick={handleConfirm}
              disabled={createStake.isPending}
              loading={createStake.isPending}
              className="h-11 flex-1"
            >
              {createStake.isPending ? 'Creating...' : 'Confirm & Stake'}
            </PrimaryButton>
          </div>
        </>
      )}

      {step === 3 && (
        <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full sm:size-20"
            style={raisedStyle}
          >
            <CheckCircle2
              className="size-8 sm:size-10"
              style={{ color: NEU_TOKENS.accent }}
            />
          </motion.div>
          <h2
            className="text-center text-xl font-bold sm:text-2xl"
            style={{ color: NEU_TOKENS.accent }}
          >
            Stake Created Successfully
          </h2>
          <p
            className="mt-2 text-center text-sm"
            style={{ color: NEU_TOKENS.white60 }}
          >
            You&apos;ve successfully staked{' '}
            <span className="font-bold" style={{ color: NEU_TOKENS.white80 }}>
              ${fmt4(amountNum)}
            </span>
            {goalTitle && (
              <>
                {' '}
                for <span className="font-medium">{goalTitle}</span>
              </>
            )}
            .
          </p>
          <div
            className="mx-auto mt-6 max-w-sm rounded-xl p-4"
            style={insetStyle}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: NEU_TOKENS.white60 }}>
                Total Target Return
              </span>
              <span
                className="text-lg font-bold"
                style={{ color: NEU_TOKENS.accent }}
              >
                ${fmt4(targetReturn)}
              </span>
            </div>
            <p
              className="mt-2 text-left text-xs"
              style={{ color: NEU_TOKENS.white40 }}
            >
              You will receive daily payouts to your Earning Wallet until this
              target is reached.
            </p>
          </div>
          <PrimaryButton onClick={handleClose} className="mt-6">
            Done
          </PrimaryButton>
        </div>
      )}
    </BaseModal>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
      style={{ borderColor: NEU_TOKENS.border }}
    >
      <span className="text-sm" style={{ color: NEU_TOKENS.white60 }}>
        {label}
      </span>
      <span
        className="text-sm font-semibold"
        style={
          accent ? { color: NEU_TOKENS.accent } : { color: NEU_TOKENS.white80 }
        }
      >
        {value}
      </span>
    </div>
  );
}
