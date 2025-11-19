'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Wallet, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
      const response = await createStake.mutateAsync({
        amount: amountNum,
        source,
        ...(goal && { goal }),
        ...(requires2FA && twoFactorCode && { twoFactorCode }),
      });

      const goalText = goal ? ` towards your ${STAKING_GOALS.find(g => g.value === goal)?.label || 'goal'}` : '';
      toast.success('Stake Created Successfully! 🎉', {
        description: `You've staked $${amountNum.toFixed(2)} USDT${goalText}. Target return: $${targetReturn.toFixed(2)}`,
        duration: 5000,
      });

      // Reset form
      setAmount('');
      setSource('both');
      setGoal('');
      setTwoFactorCode('');
      setShowConfirm(false);
      onClose();
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('[CreateStakeModal] Error:', error);
      toast.error('Failed to Create Stake', {
        description: err.message || 'Please try again or contact support',
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
                  <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          Create New Stake
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Earn 200% ROS through weekly payouts
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      aria-label="Close modal"
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      disabled={createStake.isPending}
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Available Balance */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                          Available Balance
                        </span>
                        <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                        ${availableBalance.toFixed(2)}
                      </div>
                      <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                        <div>Deposit Wallet: ${walletBalance?.funded.balance.toFixed(2) || '0.00'}</div>
                        <div>Earnings Wallet: ${walletBalance?.earnings.balance.toFixed(2) || '0.00'}</div>
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-gray-900 dark:text-white">
                        Stake Amount (USDT)
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="amount"
                          type="number"
                          min={minStake}
                          max={availableBalance}
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="pl-10 text-lg font-semibold"
                        />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Minimum: ${minStake} USDT • Maximum: ${availableBalance.toFixed(2)} USDT
                      </p>
                    </div>

                    {/* Target Return Display */}
                    {amountNum >= minStake && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Target Return (200%)
                          </span>
                          <span className="text-xl font-bold text-blue-900 dark:text-blue-100">
                            ${targetReturn.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                          You'll receive weekly ROS payouts to your Earnings Wallet until you reach this amount
                        </p>
                      </motion.div>
                    )}

                    {/* Goal Selection */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 dark:text-white">Stake Goal (Optional)</Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        What are you staking towards?
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {STAKING_GOALS.map((goalOption) => (
                          <button
                            key={goalOption.value}
                            type="button"
                            onClick={() => setGoal(goal === goalOption.value ? '' : goalOption.value)}
                            aria-label={goalOption.label}
                            className={`p-3 rounded-lg border-2 transition-all text-center ${
                              goal === goalOption.value
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <div className="text-2xl mb-1">{goalOption.icon}</div>
                            <span className={`text-xs font-medium ${
                              goal === goalOption.value
                                ? 'text-emerald-900 dark:text-emerald-100'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {goalOption.label.replace(/^[^\s]+\s/, '')}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Source Selection */}
                    <div className="space-y-2">
                      <Label className="text-gray-900 dark:text-white">Stake From</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['both', 'funded', 'earning'] as const).map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setSource(option)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              source === option
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <span className={`text-sm font-medium ${
                              source === option
                                ? 'text-emerald-900 dark:text-emerald-100'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {option === 'both' ? 'Both' : option === 'funded' ? 'Deposit' : 'Earnings'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2FA Code (if required) */}
                    {requires2FA && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <Label htmlFor="twoFactorCode" className="text-gray-900 dark:text-white flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          Two-Factor Code (Required for amounts {'>'} $500)
                        </Label>
                        <Input
                          id="twoFactorCode"
                          type="text"
                          maxLength={6}
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 6-digit code"
                          className="text-center text-lg tracking-widest font-mono"
                        />
                      </motion.div>
                    )}

                    {/* Important Notes */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                            Important Information
                          </p>
                          <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                            <li>• Stakes are permanent commitments (principal cannot be withdrawn)</li>
                            <li>• You'll receive weekly ROS payouts to your Earnings Wallet</li>
                            <li>• Payouts continue until you reach 200% total return</li>
                            <li>• ROS percentages vary based on Novunt trading performance</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1"
                      disabled={createStake.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!isValidAmount || (requires2FA && twoFactorCode.length !== 6) || createStake.isPending}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Review Stake
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

