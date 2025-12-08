'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateStake } from '@/lib/mutations/stakingMutations';
import { useWalletBalance } from '@/lib/queries';
import { toast } from 'sonner';
import { useUIStore } from '@/store/uiStore';
import { useStakingConfig } from '@/hooks/useStakingConfig';

export function CreateStakeModal() {
  const { isModalOpen, closeModal } = useUIStore();
  const isOpen = isModalOpen('create-stake');

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState<'funded' | 'earning' | 'both'>('both');
  const [goal, setGoal] = useState<string>('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: walletBalance } = useWalletBalance();
  const createStake = useCreateStake();

  // Get staking config from dynamic config system
  const stakingConfig = useStakingConfig();
  const amountNum = parseFloat(amount) || 0;
  const targetReturn = amountNum * (stakingConfig.goalTargetPercentage / 100); // Dynamic target percentage
  const minStake = stakingConfig.minAmount;
  const requires2FA = amountNum > 500;

  // Calculate available balance based on source
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
      setGoalDescription('');
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
        `Insufficient balance. You have $${availableBalance.toFixed(2)} available.`
      );
      return;
    }

    if (requires2FA && !twoFactorCode) {
      toast.error('2FA Required', {
        description:
          'Staking amounts over $500 require Two-Factor Authentication',
      });
      return;
    }

    setStep(2);
  };

  const handleConfirm = async () => {
    try {
      console.log('[CreateStakeModal] Attempting to create stake:', {
        amount: amountNum,
        source,
        goal: goal || 'none',
        has2FA: !!twoFactorCode,
        walletBalances: {
          funded: walletBalance?.funded.balance || 0,
          earnings: walletBalance?.earnings.balance || 0,
          available: availableBalance,
        },
      });

      await createStake.mutateAsync({
        amount: amountNum,
        source,
        ...(goal && { goal }),
        ...(requires2FA && twoFactorCode && { twoFactorCode }),
      });

      // Move to success step instead of closing
      setStep(3);
    } catch (error: unknown) {
      console.error('[CreateStakeModal] Full error object:', error);

      // Extract detailed error information
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

      // Try to extract backend error message
      if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.responseData) {
        try {
          const parsedData = JSON.parse(err.responseData);
          if (parsedData.error?.message) {
            errorMessage = parsedData.error.message;
          } else if (parsedData.message) {
            errorMessage = parsedData.message;
          }
        } catch {
          // Could not parse
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Check for specific error scenarios
      if (
        errorMessage.includes('insufficient') ||
        errorMessage.includes('balance')
      ) {
        errorMessage = `Insufficient funds. You need $${amountNum.toFixed(2)} but have $${availableBalance.toFixed(2)} available.`;
      } else if (errorMessage.includes('Failed to create stake')) {
        errorMessage =
          'Unable to create stake. This may be a server issue. Please check your wallet balance and try again.';
      }

      console.error('[CreateStakeModal] User-friendly error:', errorMessage);

      toast.error('Failed to Create Stake', {
        description: errorMessage,
        duration: 7000,
      });
      setStep(1); // Go back to step 1 on error
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center overflow-y-auto p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="pointer-events-auto mx-auto my-8 w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              {step === 1 && (
                // Step 1: Enter Stake Details
                <div className="relative overflow-hidden rounded-2xl">
                  {/* Header - Using standard blue-600 to ensure visibility in light mode */}
                  <div className="relative overflow-hidden rounded-t-2xl bg-blue-600 p-5 dark:bg-blue-900">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 opacity-100 dark:from-blue-900 dark:to-blue-800" />
                    <div className="relative z-10 mb-1 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-white/20 bg-white/20 p-2.5 shadow-lg backdrop-blur-sm">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            Create New Stake
                          </h2>
                          <p className="mt-0.5 text-xs font-medium text-white/90">
                            Earn weekly ROS until{' '}
                            {stakingConfig.goalTargetPercentage}% return
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleClose}
                        aria-label="Close modal"
                        className="flex-shrink-0 rounded-lg p-2 text-white/90 transition-colors hover:bg-white/20 hover:text-white"
                        disabled={createStake.isPending}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative space-y-5 p-5">
                    {/* Amount Input */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="amount"
                          className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                          Stake Amount (USDT)
                        </Label>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Min: ${minStake}
                        </span>
                      </div>

                      <div className="relative">
                        <div className="absolute top-1/2 left-3 -translate-y-1/2 font-bold text-gray-500 dark:text-gray-400">
                          $
                        </div>
                        <Input
                          id="amount"
                          type="number"
                          min={minStake}
                          max={availableBalance}
                          step="0.01"
                          value={amount}
                          onChange={handleAmountChange}
                          placeholder="0.00"
                          className={`h-12 bg-white pr-16 pl-7 text-lg font-bold text-gray-900 dark:bg-gray-800 dark:text-white ${
                            error
                              ? 'border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500'
                              : 'border-gray-300 focus:border-blue-500 dark:border-gray-700 dark:focus:border-blue-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setAmount(availableBalance.toString());
                            if (error) setError(null);
                          }}
                          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600 transition-colors hover:text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          MAX
                        </button>
                      </div>

                      {/* Inline Error Message */}
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-xs font-medium text-red-500 dark:text-red-400"
                        >
                          {error}
                        </motion.p>
                      )}

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          Available:{' '}
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            ${availableBalance.toFixed(2)}
                          </span>
                        </span>
                        {amountNum > 0 && !error && (
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            Target Return: ${targetReturn.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Goal Title (Optional) */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="goalTitle"
                        className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                      >
                        Goal Title{' '}
                        <span className="text-xs font-normal text-gray-500">
                          (Optional)
                        </span>
                      </Label>
                      <Input
                        id="goalTitle"
                        type="text"
                        maxLength={60}
                        value={goalTitle}
                        onChange={(e) => setGoalTitle(e.target.value)}
                        placeholder="E.g. Dream Vacation"
                        className="h-10 border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    {/* 2FA Input - Shows when amount > $500 */}
                    {requires2FA && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/50 dark:bg-amber-900/20">
                          <div className="flex items-start gap-2">
                            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                            <div>
                              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                                2FA Required
                              </p>
                              <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400/80">
                                Stakes over $500 require Two-Factor
                                Authentication for security
                              </p>
                            </div>
                          </div>
                        </div>
                        <Label
                          htmlFor="twoFactorCode"
                          className="text-sm font-semibold text-gray-700 dark:text-gray-300"
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
                          className="h-10 border-amber-300 bg-white text-center font-mono text-lg tracking-widest text-gray-900 focus:border-amber-500 dark:border-amber-700 dark:bg-gray-800 dark:text-white dark:focus:border-amber-500"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Enter the 6-digit code from your authenticator app
                        </p>
                      </motion.div>
                    )}

                    {/* Security Notice */}
                    <div className="flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-800/50 dark:bg-emerald-900/20">
                      <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <h4 className="mb-1 text-sm font-bold text-emerald-800 dark:text-emerald-300">
                          Guaranteed Returns
                        </h4>
                        <p className="text-xs leading-relaxed text-emerald-700 dark:text-emerald-400/80">
                          Your stake is locked until you receive{' '}
                          {stakingConfig.goalTargetPercentage}% total return
                          through weekly payouts.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex gap-3 border-t border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-800/50">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="h-11 flex-1 border-gray-300 font-medium text-gray-700 dark:border-gray-600 dark:text-gray-300"
                      disabled={createStake.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={createStake.isPending}
                      className="h-11 flex-1 bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {createStake.isPending ? 'Processing...' : 'Create Stake'}
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                // Step 2: Confirmation
                <div className="overflow-hidden rounded-2xl">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-6 text-center text-white">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mb-1 text-2xl font-bold text-white">
                      Confirm Stake
                    </h2>
                    <p className="text-sm text-white/90">
                      Please review your stake details
                    </p>
                  </div>

                  {/* Confirmation Details */}
                  <div className="space-y-4 bg-white p-6 dark:bg-gray-900">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-100 py-2 dark:border-gray-800">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Amount
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ${amountNum.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-gray-100 py-2 dark:border-gray-800">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Target Return
                        </span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          ${targetReturn.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-gray-100 py-2 dark:border-gray-800">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Source
                        </span>
                        <span className="text-sm font-medium text-gray-900 capitalize dark:text-white">
                          {source === 'both'
                            ? 'Both Wallets'
                            : `${source} Wallet`}
                        </span>
                      </div>
                      {goalTitle && (
                        <div className="flex items-center justify-between border-b border-gray-100 py-2 dark:border-gray-800">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Goal
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {goalTitle}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex gap-3 bg-white p-6 pt-0 dark:bg-gray-900">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="h-11 flex-1 border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                      disabled={createStake.isPending}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleConfirm}
                      disabled={createStake.isPending}
                      className="h-11 flex-1 bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
                    >
                      {createStake.isPending ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </span>
                      ) : (
                        'Confirm & Stake'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                // Step 3: Success
                <div className="overflow-hidden rounded-2xl bg-white dark:bg-gray-900">
                  <div className="p-8 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 20,
                      }}
                      className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30"
                    >
                      <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                    </motion.div>

                    <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                      Stake Created Successfully! 🎉
                    </h2>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">
                      You’ve successfully staked{' '}
                      <span className="font-bold text-gray-900 dark:text-white">
                        ${amountNum.toFixed(2)}
                      </span>
                      {goalTitle && (
                        <span>
                          {' '}
                          for <span className="font-medium">{goalTitle}</span>
                        </span>
                      )}
                      .
                    </p>

                    <div className="mb-8 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Total Target Return
                        </span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          ${targetReturn.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-left text-xs text-gray-500 dark:text-gray-500">
                        You will receive weekly payouts to your Earning Wallet
                        until this target is reached.
                      </p>
                    </div>

                    <Button
                      onClick={handleClose}
                      className="h-11 w-full bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
