'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ShieldCheck, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateStake } from '@/lib/mutations/stakingMutations';
import { useWalletBalance } from '@/lib/queries';
import { toast } from 'sonner';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';

interface CreateStakeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STAKING_GOALS = [
  { value: 'wedding', label: '💍 Wedding', icon: '💍' },
  { value: 'housing', label: '🏠 Housing', icon: '🏠' },
  { value: 'vehicle', label: '🚗 Vehicle', icon: '🚗' },
  { value: 'travel', label: '✈️ Travel', icon: '✈️' },
  { value: 'education', label: '🎓 Education', icon: '🎓' },
  { value: 'emergency', label: '🚨 Emergency Fund', icon: '🚨' },
  { value: 'retirement', label: '🏖️ Retirement', icon: '🏖️' },
  { value: 'business', label: '💼 Business', icon: '💼' },
  { value: 'other', label: '🎯 Other', icon: '🎯' },
];

export function CreateStakeModal({ isOpen, onClose }: CreateStakeModalProps) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState<'funded' | 'earning' | 'both'>('both');
  const [goal, setGoal] = useState<string>('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

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

  const isValidAmount = amountNum >= minStake && amountNum <= availableBalance;

  const handleSubmit = () => {
    if (!isValidAmount) {
      toast.error('Invalid amount', {
        description: `Amount must be between $${minStake} and $${availableBalance.toFixed(2)}`,
      });
      return;
    }

    if (requires2FA && !twoFactorCode) {
      toast.error('2FA Required', {
        description: 'Staking amounts over $500 require Two-Factor Authentication',
      });
      return;
    }

    setShowConfirm(true);
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

      const goalText = goalTitle ? ` for "${goalTitle}"` : '';
      toast.success('Stake Created Successfully! 🎉', {
        description: `You've staked $${amountNum.toFixed(2)} USDT${goalText}. Target return: $${targetReturn.toFixed(2)}`,
        duration: 5000,
      });

      // Reset form
      setAmount('');
      setSource('both');
      setGoal('');
      setGoalTitle('');
      setGoalDescription('');
      setTwoFactorCode('');
      setShowConfirm(false);
      onClose();
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
        errorMessage = `Insufficient funds. You need $${amountNum.toFixed(2)} but have $${totalBalance.toFixed(2)} available.`;
      } else if (errorMessage.includes('Failed to create stake')) {
        errorMessage = 'Unable to create stake. This may be a server issue. Please check your wallet balance and try again.';
      }
      
      console.error('[CreateStakeModal] User-friendly error:', errorMessage);
      
      toast.error('Failed to Create Stake', {
        description: errorMessage,
        duration: 7000,
      });
      setShowConfirm(false);
    }
  };

  const handleClose = () => {
    if (!createStake.isPending) {
      setShowConfirm(false);
      onClose();
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {!showConfirm ? (
                // Step 1: Enter Stake Details
                <>
                  {/* Header */}
                  <div className="sticky top-0 bg-gradient-to-r from-novunt-blue-600 to-novunt-blue-700 dark:from-novunt-blue-700 dark:to-novunt-blue-800 p-6 rounded-t-2xl">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            Create a New Stake
                          </h2>
                          <p className="text-xs text-white/80 mt-0.5">
                            Novunt Staking Platform
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleClose}
                        aria-label="Close modal"
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                        disabled={createStake.isPending}
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-sm text-white/90">
                        Choose the amount you would like to stake from your funded wallet. You&apos;ll earn weekly ROS credited to your earnings wallet until you double your stake.
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-5">
                    {/* Section Header */}
                    <div className="border-l-4 border-novunt-blue-600 pl-4 py-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Stake Details</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Complete the form below to launch your next staking cycle.</p>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Amount to Stake (USDT)
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        min={minStake}
                        max={availableBalance}
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="10000"
                        className="text-base h-12 border-gray-300 dark:border-gray-600 focus:border-novunt-blue-500 focus:ring-novunt-blue-500"
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          Available: ${availableBalance.toFixed(2)} USDT
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          Min: ${minStake} USDT
                        </span>
                      </div>
                    </div>

                    {/* Goal Title */}
                    <div className="space-y-2">
                      <Label htmlFor="goalTitle" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Goal Title <span className="text-gray-400">(optional)</span>
                      </Label>
                      <Input
                        id="goalTitle"
                        type="text"
                        maxLength={60}
                        value={goalTitle}
                        onChange={(e) => setGoalTitle(e.target.value)}
                        placeholder="E.g. New Laptop Fund"
                        className="text-base h-12 border-gray-300 dark:border-gray-600 focus:border-novunt-blue-500 focus:ring-novunt-blue-500"
                      />
                    </div>

                    {/* Goal Description */}
                    <div className="space-y-2">
                      <Label htmlFor="goalDescription" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Goal Description <span className="text-gray-400">(optional)</span>
                      </Label>
                      <Textarea
                        id="goalDescription"
                        maxLength={240}
                        rows={3}
                        value={goalDescription}
                        onChange={(e) => setGoalDescription(e.target.value)}
                        placeholder="Describe what this stake will help you achieve"
                        className="text-base resize-none border-gray-300 dark:border-gray-600 focus:border-novunt-blue-500 focus:ring-novunt-blue-500"
                      />
                    </div>



                    {/* Security Notice */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex-shrink-0">
                          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                            Security Notice
                          </h4>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Funds are locked for the duration of the stake. Early withdrawals may incur penalties.
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800 flex items-center justify-between">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                          Powered by Novunt&apos;s staking engine
                        </span>
                        <span className="text-xs font-bold text-blue-900 dark:text-blue-100">
                          Target ROS: 100%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3 rounded-b-2xl">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1 h-12 font-semibold border-gray-300 dark:border-gray-600"
                      disabled={createStake.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!isValidAmount || (requires2FA && twoFactorCode.length !== 6) || createStake.isPending}
                      className="flex-1 h-12 font-semibold bg-novunt-blue-600 hover:bg-novunt-blue-700 text-white"
                    >
                      Create Stake
                    </Button>
                  </div>
                </>
              ) : (
                // Step 2: Confirmation
                <>
                  {/* Header */}
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-4 bg-white/20 rounded-full">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center">Confirm Your Stake</h2>
                    <p className="text-center text-emerald-50 mt-2">
                      Please review the details before confirming
                    </p>
                  </div>

                  {/* Confirmation Details */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Stake Amount</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          ${amountNum.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Target Return (200%)</span>
                        <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                          ${targetReturn.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Staking From</span>
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {source === 'both' ? 'Both Wallets' : `${source} Wallet`}
                        </span>
                      </div>
                      {goal && (
                        <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400">Staking Goal</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {STAKING_GOALS.find(g => g.value === goal)?.label || goal}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-600 dark:text-gray-400">Payout Frequency</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          Weekly
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 dark:bg-gray-900 p-6 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowConfirm(false)}
                      className="flex-1"
                      disabled={createStake.isPending}
                    >
                      Go Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleConfirm}
                      disabled={createStake.isPending}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {createStake.isPending ? (
                        <>
                          <NovuntSpinner size="sm" className="mr-2" />
                          Creating...
                        </>
                      ) : (
                        'Confirm Stake'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

