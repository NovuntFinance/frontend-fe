'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ShieldCheck, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateStake } from '@/lib/mutations/stakingMutations';
import { useWalletBalance } from '@/lib/queries';
import { toast } from 'sonner';
import { useUIStore } from '@/store/uiStore';

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

  const amountNum = parseFloat(amount) || 0;
  const targetReturn = amountNum * 2; // 200% ROS
  const minStake = 20;
  const requires2FA = amountNum > 500;

  // Calculate available balance based on source
  const availableBalance =
    source === 'funded' ? walletBalance?.funded.balance || 0 :
      source === 'earning' ? walletBalance?.earnings.balance || 0 :
        (walletBalance?.funded.balance || 0) + (walletBalance?.earnings.balance || 0);

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
      setError(`Insufficient balance. You have $${availableBalance.toFixed(2)} available.`);
      return;
    }

    if (requires2FA && !twoFactorCode) {
      toast.error('2FA Required', {
        description: 'Staking amounts over $500 require Two-Factor Authentication',
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
        }
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
        response?: { data?: { message?: string; error?: { message?: string; details?: string } } };
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
      if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
        errorMessage = `Insufficient funds. You need $${amountNum.toFixed(2)} but have $${availableBalance.toFixed(2)} available.`;
      } else if (errorMessage.includes('Failed to create stake')) {
        errorMessage = 'Unable to create stake. This may be a server issue. Please check your wallet balance and try again.';
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 overflow-y-auto pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-auto my-8 pointer-events-auto border border-gray-200 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {step === 1 && (
                // Step 1: Enter Stake Details
                <div className="relative overflow-hidden rounded-2xl">
                  {/* Header - Using standard blue-600 to ensure visibility in light mode */}
                  <div className="bg-blue-600 dark:bg-blue-900 p-5 rounded-t-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 dark:from-blue-900 dark:to-blue-800 opacity-100" />
                    <div className="flex items-start justify-between mb-1 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg border border-white/20">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            Create New Stake
                          </h2>
                          <p className="text-xs text-white/90 mt-0.5 font-medium">
                            Earn weekly ROS until 200% return
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleClose}
                        aria-label="Close modal"
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 text-white/90 hover:text-white"
                        disabled={createStake.isPending}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-5 relative">

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="amount" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Stake Amount (USDT)
                        </Label>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Min: ${minStake}
                        </span>
                      </div>

                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-bold">$</div>
                        <Input
                          id="amount"
                          type="number"
                          min={minStake}
                          max={availableBalance}
                          step="0.01"
                          value={amount}
                          onChange={handleAmountChange}
                          placeholder="0.00"
                          className={`pl-7 pr-16 text-lg font-bold h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${error
                              ? 'border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500'
                              : 'border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500'
                            }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setAmount(availableBalance.toString());
                            if (error) setError(null);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md transition-colors"
                        >
                          MAX
                        </button>
                      </div>

                      {/* Inline Error Message */}
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs font-medium text-red-500 dark:text-red-400 mt-1"
                        >
                          {error}
                        </motion.p>
                      )}

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          Available: <span className="font-medium text-emerald-600 dark:text-emerald-400">${availableBalance.toFixed(2)}</span>
                        </span>
                        {amountNum > 0 && !error && (
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            Target Return: ${targetReturn.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Goal Title (Optional) */}
                    <div className="space-y-2">
                      <Label htmlFor="goalTitle" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Goal Title <span className="text-xs font-normal text-gray-500">(Optional)</span>
                      </Label>
                      <Input
                        id="goalTitle"
                        type="text"
                        maxLength={60}
                        value={goalTitle}
                        onChange={(e) => setGoalTitle(e.target.value)}
                        placeholder="E.g. Dream Vacation"
                        className="h-10 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Security Notice */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/50 flex gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                          Guaranteed Returns
                        </h4>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400/80 leading-relaxed">
                          Your stake is locked until you receive 200% total return through weekly payouts.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 p-5 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1 h-11 font-medium border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                      disabled={createStake.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={createStake.isPending}
                      className="flex-1 h-11 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-6 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-1 text-white">Confirm Stake</h2>
                    <p className="text-white/90 text-sm">
                      Please review your stake details
                    </p>
                  </div>

                  {/* Confirmation Details */}
                  <div className="p-6 space-y-4 bg-white dark:bg-gray-900">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">${amountNum.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Target Return</span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${targetReturn.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Source</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{source === 'both' ? 'Both Wallets' : `${source} Wallet`}</span>
                      </div>
                      {goalTitle && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Goal</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{goalTitle}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 pt-0 flex gap-3 bg-white dark:bg-gray-900">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-11 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                      disabled={createStake.isPending}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleConfirm}
                      disabled={createStake.isPending}
                      className="flex-1 h-11 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                    >
                      {createStake.isPending ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
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
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </motion.div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Stake Created Successfully! 🎉
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      You've successfully staked <span className="font-bold text-gray-900 dark:text-white">${amountNum.toFixed(2)}</span>
                      {goalTitle && <span> for "<span className="font-medium">{goalTitle}</span>"</span>}.
                    </p>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-8 border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Total Target Return</span>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${targetReturn.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 text-left">
                        You will receive weekly payouts to your Earning Wallet until this target is reached.
                      </p>
                    </div>

                    <Button
                      onClick={handleClose}
                      className="w-full h-11 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
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
