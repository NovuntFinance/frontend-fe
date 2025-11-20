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
        errorMessage = `Insufficient funds. You need $${amountNum.toFixed(2)} but have $${availableBalance.toFixed(2)} available.`;
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
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-auto my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {!showConfirm ? (
                // Step 1: Enter Stake Details
                <div className="relative overflow-hidden rounded-2xl">
                  {/* Animated Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-novunt-blue-600/20 via-novunt-blue-500/10 to-transparent rounded-t-2xl" />
                  
                  {/* Animated Floating Blobs */}
                  <motion.div
                    animate={{
                      x: [0, 20, 0],
                      y: [0, -20, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute -top-12 -right-12 w-32 h-32 bg-novunt-blue-600/30 rounded-full blur-3xl"
                  />
                  <motion.div
                    animate={{
                      x: [0, -10, 0],
                      y: [0, 15, 0],
                      scale: [1, 0.9, 1],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.5,
                    }}
                    className="absolute -bottom-8 -left-8 w-24 h-24 bg-novunt-blue-500/20 rounded-full blur-2xl"
                  />

                  {/* Header */}
                  <div className="bg-gradient-to-r from-novunt-blue-700 to-novunt-blue-600 dark:from-novunt-blue-800 dark:to-novunt-blue-700 p-4 rounded-t-2xl relative overflow-hidden">
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 15 }}
                          className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg"
                        >
                          <TrendingUp className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            Create a New Stake
                          </h2>
                          <p className="text-xs text-white/80 mt-0.5">
                            Your journey to financial growth
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
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 relative z-10">
                      <p className="text-sm text-white/90 leading-relaxed">
                        Choose your stake amount and watch it grow. You&apos;ll earn weekly ROS credited to your earnings wallet until you achieve 200% returns.
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-4 relative">
                    {/* Section Header with Icon */}
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: -5 }}
                        className="p-3 rounded-xl bg-gradient-to-br from-novunt-blue-600/30 to-novunt-blue-500/20 backdrop-blur-sm shadow-lg"
                      >
                        <TrendingUp className="h-6 w-6 text-novunt-blue-700 dark:text-novunt-blue-400" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-bold text-novunt-blue-700 dark:text-novunt-blue-400">Stake Details</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Launch your next growth cycle</p>
                      </div>
                    </div>

                    {/* Amount Input - Premium Design */}
                    <div className="space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl p-4 border-2 border-blue-300 dark:border-gray-700">
                      <Label htmlFor="amount" className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="text-lg">💰</span>
                        Amount to Stake (USDT)
                      </Label>
                      <div className="relative">
                        <Input
                          id="amount"
                          type="number"
                          min={minStake}
                          max={availableBalance}
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="10000"
                          className="text-lg font-bold h-14 border-2 border-novunt-blue-400 dark:border-novunt-blue-600 focus:border-novunt-blue-600 focus:ring-2 focus:ring-novunt-blue-600/50 bg-white dark:bg-gray-900"
                        />
                        {amountNum > 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md"
                          >
                            Target: ${targetReturn.toFixed(2)}
                          </motion.div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="font-medium">Available: ${availableBalance.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <span className="font-medium">Min: ${minStake}</span>
                        </div>
                      </div>
                    </div>

                    {/* Goal Title - Premium Design */}
                    <div className="space-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-novunt-blue-900/20 dark:to-novunt-blue-800/20 rounded-xl p-3 border-2 border-blue-300 dark:border-novunt-blue-600">
                      <Label htmlFor="goalTitle" className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="text-lg">🎯</span>
                        Goal Title <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(optional)</span>
                      </Label>
                      <Input
                        id="goalTitle"
                        type="text"
                        maxLength={60}
                        value={goalTitle}
                        onChange={(e) => setGoalTitle(e.target.value)}
                        placeholder="E.g. New Laptop Fund"
                        className="text-base h-12 border-2 border-novunt-blue-400 dark:border-novunt-blue-600 focus:border-novunt-blue-600 focus:ring-2 focus:ring-novunt-blue-600/50 bg-white dark:bg-gray-900"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {60 - goalTitle.length} characters remaining
                      </p>
                    </div>

                    {/* Goal Description - Premium Design */}
                    <div className="space-y-2 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-novunt-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 border-2 border-indigo-300 dark:border-blue-600">
                      <Label htmlFor="goalDescription" className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="text-lg">📝</span>
                        Goal Description <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(optional)</span>
                      </Label>
                      <Textarea
                        id="goalDescription"
                        maxLength={240}
                        rows={3}
                        value={goalDescription}
                        onChange={(e) => setGoalDescription(e.target.value)}
                        placeholder="Describe what this stake will help you achieve"
                        className="text-base resize-none border-2 border-blue-400 dark:border-blue-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/50 bg-white dark:bg-gray-900"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {240 - goalDescription.length} characters remaining
                      </p>
                    </div>



                    {/* Security Notice - Premium Design */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 rounded-xl p-5 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg"
                    >
                      {/* Animated Background Blob */}
                      <motion.div
                        animate={{
                          x: [0, 10, 0],
                          y: [0, -5, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-300/30 dark:bg-emerald-500/20 rounded-full blur-2xl"
                      />
                      
                      <div className="flex items-start gap-3 relative z-10">
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex-shrink-0 shadow-lg"
                        >
                          <ShieldCheck className="w-5 h-5 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-2">
                            🔒 Security Notice
                          </h4>
                          <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                            Your funds are permanently staked and will earn weekly ROS until you reach 200% returns. Stake wisely for maximum growth!
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between relative z-10">
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Powered by Novunt
                        </span>
                        <span className="text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                          Target: 200% ROS
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Footer - Premium Design */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-t-2 border-gray-200 dark:border-gray-700 p-4 flex gap-3 rounded-b-2xl shadow-lg"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1 h-12 font-bold border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      disabled={createStake.isPending}
                    >
                      <span className="text-sm">Cancel</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!isValidAmount || (requires2FA && twoFactorCode.length !== 6) || createStake.isPending}
                      className="flex-1 h-12 font-bold bg-gradient-to-r from-novunt-blue-700 via-novunt-blue-600 to-novunt-blue-700 hover:from-novunt-blue-800 hover:via-novunt-blue-700 hover:to-novunt-blue-800 text-white shadow-xl shadow-novunt-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-sm flex items-center gap-2">
                        {createStake.isPending ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                            Processing...
                          </>
                        ) : (
                          <>
                            Create Stake
                            <span className="text-base">🚀</span>
                          </>
                        )}
                      </span>
                    </Button>
                  </motion.div>
                </div>
              ) : (
                // Step 2: Confirmation - Premium Design
                <div className="overflow-hidden rounded-2xl">
                  {/* Header */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 text-white">
                    {/* Animated Background Blobs */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"
                    />
                    <motion.div
                      animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1,
                      }}
                      className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"
                    />
                    
                    <div className="relative z-10">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.6 }}
                        className="flex items-center justify-center mb-4"
                      >
                        <motion.div 
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          className="p-4 bg-white/30 backdrop-blur-sm rounded-2xl shadow-2xl"
                        >
                          <CheckCircle2 className="w-10 h-10" />
                        </motion.div>
                      </motion.div>
                      <h2 className="text-2xl font-bold text-center mb-1">Confirm Your Stake</h2>
                      <p className="text-center text-white/90 text-xs">
                        Review the details before finalizing your investment
                      </p>
                    </div>
                  </div>

                  {/* Confirmation Details - Premium Design */}
                  <div className="p-4 space-y-3">
                    <div className="space-y-2">
                      {/* Stake Amount */}
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex justify-between items-center py-3 px-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-novunt-blue-900/30 dark:to-novunt-blue-800/30 border-2 border-blue-300 dark:border-novunt-blue-600"
                      >
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <span className="text-lg">💰</span>
                          Stake Amount
                        </span>
                        <span className="text-2xl font-bold text-novunt-blue-700 dark:text-novunt-blue-400">
                          ${amountNum.toFixed(2)}
                        </span>
                      </motion.div>

                      {/* Target Return */}
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-between items-center py-3 px-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-300 dark:border-emerald-800"
                      >
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <span className="text-lg">🎯</span>
                          Target Return (200%)
                        </span>
                        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                          ${targetReturn.toFixed(2)}
                        </span>
                      </motion.div>

                      {/* Staking From */}
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-between items-center py-3 px-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-800"
                      >
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <span className="text-lg">👛</span>
                          Staking From
                        </span>
                        <span className="font-bold text-amber-700 dark:text-amber-400 capitalize">
                          {source === 'both' ? 'Both Wallets' : `${source} Wallet`}
                        </span>
                      </motion.div>

                      {/* Staking Goal */}
                      {goal && (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          className="flex justify-between items-center py-3 px-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-novunt-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-300 dark:border-novunt-blue-600"
                        >
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <span className="text-lg">🚀</span>
                            Staking Goal
                          </span>
                          <span className="font-bold text-novunt-blue-700 dark:text-novunt-blue-300">
                            {STAKING_GOALS.find(g => g.value === goal)?.label || goal}
                          </span>
                        </motion.div>
                      )}

                      {/* Payout Frequency */}
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex justify-between items-center py-3 px-3 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-2 border-indigo-300 dark:border-indigo-800"
                      >
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <span className="text-lg">📅</span>
                          Payout Frequency
                        </span>
                        <span className="font-bold text-indigo-700 dark:text-indigo-400">
                          Weekly
                        </span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Footer - Premium Design */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-t-2 border-gray-200 dark:border-gray-700 p-4 flex gap-3 shadow-lg"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 h-12 font-bold border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      disabled={createStake.isPending}
                    >
                      <span className="text-sm">← Go Back</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={handleConfirm}
                      disabled={createStake.isPending}
                      className="flex-1 h-12 font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 text-white shadow-xl shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createStake.isPending ? (
                        <span className="text-sm flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          Creating...
                        </span>
                      ) : (
                        <span className="text-sm flex items-center gap-2">
                          Confirm Stake
                          <span className="text-base">✅</span>
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

