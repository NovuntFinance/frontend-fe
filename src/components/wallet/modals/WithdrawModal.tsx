'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useWalletBalance } from '@/lib/queries';
import { useInitiateWithdrawal } from '@/lib/mutations/transactionMutations';
import { LargeWithdrawalDialog } from '@/components/dialogs/LargeWithdrawalDialog';
import { DailyLimitDialog } from '@/components/dialogs/DailyLimitDialog';
import { useWithdrawalConfig } from '@/hooks/useWithdrawalConfig';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type WithdrawStep = 'form' | 'confirm' | 'submitting' | 'success';

/**
 * Withdraw Modal - NowPayments Withdrawal Flow
 * Step 1: Form (amount, address, network)
 * Step 2: Confirmation preview
 * Step 3: Submitting
 * Step 4: Success (pending admin approval)
 */
export function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const { data: wallet, refetch } = useWalletBalance();
  const [step, setStep] = useState<WithdrawStep>('form');

  // Mutation hook
  const withdrawMutation = useInitiateWithdrawal();
  const [formData, setFormData] = useState({
    amount: '',
    walletAddress: '',
    network: 'BEP20',
  });
  const [error, setError] = useState('');
  const [withdrawalId, setWithdrawalId] = useState('');

  // Modal states
  const [showLargeWithdrawalDialog, setShowLargeWithdrawalDialog] =
    useState(false);
  const [showDailyLimitDialog, setShowDailyLimitDialog] = useState(false);
  const [pendingWithdrawal, setPendingWithdrawal] = useState(false);

  // Get withdrawal config from dynamic config system
  const withdrawalConfig = useWithdrawalConfig();
  const MIN_WITHDRAWAL = withdrawalConfig.minAmount;
  const FEE_PERCENTAGE = withdrawalConfig.feePercentage;
  const DAILY_LIMIT = withdrawalConfig.dailyLimit;

  const availableBalance = wallet?.earnings?.availableBalance || 0;
  const amount = parseFloat(formData.amount) || 0;
  const fee = (amount * FEE_PERCENTAGE) / 100;
  const youReceive = amount - fee;

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setFormData({ amount: '', walletAddress: '', network: 'BEP20' });
      setError('');
      refetch();
    }
  }, [isOpen, refetch]);

  const validateForm = () => {
    if (amount < MIN_WITHDRAWAL) {
      setError(`Minimum withdrawal is ${MIN_WITHDRAWAL} USDT`);
      return false;
    }
    if (amount > availableBalance) {
      setError('Insufficient balance');
      return false;
    }
    if (!formData.walletAddress) {
      setError('Please enter your wallet address');
      return false;
    }
    if (formData.walletAddress.length < 20) {
      setError('Invalid wallet address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (skipDialogs = false) => {
    if (!validateForm()) return;

    setError('');

    // Check if withdrawal amount exceeds $1,000
    if (!skipDialogs && amount > 1000) {
      setShowLargeWithdrawalDialog(true);
      return;
    }

    // TODO: Check daily withdrawal count from backend
    // For now, this is a placeholder - backend should return this in the error

    try {
      const response = await withdrawMutation.mutateAsync({
        amount,
        address: formData.walletAddress,
        network: formData.network as 'BEP20' | 'TRC20',
        // No currency field needed - backend always uses USDT
      });

      setWithdrawalId(response.transactionId);
      setStep('success');

      // Show appropriate message based on approval requirement
      const message = response.requiresApproval
        ? `Awaiting admin approval. ${response.estimatedProcessingTime}`
        : `Processing withdrawal. ${response.estimatedProcessingTime}`;

      toast.success('Withdrawal request submitted!', {
        description: message,
      });

      // Refresh wallet balance
      refetch();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to submit withdrawal';

      // Check if error is due to daily limit
      if (
        errorMessage.toLowerCase().includes('daily limit') ||
        errorMessage.toLowerCase().includes('limit exceeded')
      ) {
        // Calculate reset time (next day at midnight UTC)
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        tomorrow.setUTCHours(0, 0, 0, 0);

        setShowDailyLimitDialog(true);
        return;
      }

      setError(errorMessage);
      toast.error('Withdrawal failed', {
        description: errorMessage,
      });
    }
  };

  const handleClose = () => {
    if (step === 'submitting') {
      return; // Don't allow closing during submission
    }
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <React.Fragment key="withdraw-modal">
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="bg-background/80 fixed inset-0 z-50 backdrop-blur-sm"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                key="modal-content"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-card border-border/50 relative w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl"
              >
                {/* Header */}
                <div className="from-secondary via-secondary to-secondary/80 relative bg-gradient-to-br p-6">
                  <div className="from-secondary/20 absolute inset-0 bg-gradient-to-t to-transparent" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-secondary-foreground/10 rounded-xl p-3">
                        <Upload className="text-secondary-foreground h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-secondary-foreground text-2xl font-bold">
                          Withdraw USDT
                        </h2>
                        <p className="text-secondary-foreground/80 text-sm">
                          Cash out your earnings
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClose}
                      disabled={step === 'submitting'}
                      className="text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Step 1: Form */}
                  {step === 'form' && (
                    <motion.div
                      key="step-form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {/* Available Balance */}
                      <div className="from-secondary/10 to-secondary/5 border-secondary/20 rounded-xl border bg-gradient-to-br p-4">
                        <p className="text-muted-foreground mb-1 text-sm">
                          Available for Withdrawal
                        </p>
                        <p className="text-foreground text-3xl font-bold">
                          $
                          {availableBalance.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          From Earnings Wallet only
                        </p>
                      </div>

                      {/* Withdrawal Limits */}
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Withdrawal Limits:</strong>
                          <br />• Min: {MIN_WITHDRAWAL} USDT • Fee:{' '}
                          {FEE_PERCENTAGE}%
                          <br />• Daily Limit: {DAILY_LIMIT} withdrawals
                          <br />• Processing: 1-24 hours (admin approval
                          required)
                        </AlertDescription>
                      </Alert>

                      {/* Amount */}
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (USDT)</Label>
                        <Input
                          id="amount"
                          type="number"
                          min={MIN_WITHDRAWAL}
                          max={availableBalance}
                          step="0.01"
                          placeholder={`Enter amount (min ${MIN_WITHDRAWAL} USDT)`}
                          value={formData.amount}
                          onChange={(e) =>
                            setFormData({ ...formData, amount: e.target.value })
                          }
                          className="text-lg"
                        />
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              amount: availableBalance.toString(),
                            })
                          }
                          className="text-xs"
                        >
                          Use max balance
                        </Button>
                      </div>

                      {/* Network Selection */}
                      <div className="space-y-2">
                        <Label>Network</Label>
                        <RadioGroup
                          value={formData.network}
                          onValueChange={(value) =>
                            setFormData({ ...formData, network: value })
                          }
                        >
                          <div className="hover:bg-muted flex cursor-pointer items-center space-x-2 rounded-lg border p-3">
                            <RadioGroupItem value="BEP20" id="bep20" />
                            <Label
                              htmlFor="bep20"
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-semibold">BEP20 (BSC)</div>
                              <div className="text-muted-foreground text-xs">
                                Binance Smart Chain - Fast & Low Fees
                              </div>
                            </Label>
                          </div>
                          <div className="hover:bg-muted flex cursor-pointer items-center space-x-2 rounded-lg border p-3">
                            <RadioGroupItem value="TRC20" id="trc20" />
                            <Label
                              htmlFor="trc20"
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-semibold">TRC20 (Tron)</div>
                              <div className="text-muted-foreground text-xs">
                                Tron Network - Very Fast
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Wallet Address */}
                      <div className="space-y-2">
                        <Label htmlFor="address">
                          Your {formData.network} Wallet Address
                        </Label>
                        <Input
                          id="address"
                          type="text"
                          placeholder="Enter your wallet address"
                          value={formData.walletAddress}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              walletAddress: e.target.value,
                            })
                          }
                          className="font-mono text-sm"
                        />
                        <p className="text-muted-foreground text-xs">
                          ⚠️ Double-check your address. Incorrect address may
                          result in loss of funds.
                        </p>
                      </div>

                      {/* Fee Breakdown */}
                      {amount >= MIN_WITHDRAWAL && (
                        <div className="bg-muted space-y-2 rounded-xl p-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Amount:
                            </span>
                            <span className="font-semibold">
                              ${amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Fee ({FEE_PERCENTAGE}%):
                            </span>
                            <span className="text-destructive font-semibold">
                              -${fee.toFixed(2)}
                            </span>
                          </div>
                          <div className="bg-border my-2 h-px" />
                          <div className="flex justify-between">
                            <span className="font-semibold">
                              You&apos;ll receive:
                            </span>
                            <span className="text-success text-lg font-bold">
                              ${youReceive.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}

                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <Button
                        onClick={() => {
                          if (validateForm()) {
                            setStep('confirm');
                          }
                        }}
                        disabled={
                          withdrawMutation.isPending ||
                          !formData.amount ||
                          !formData.walletAddress
                        }
                        className="bg-secondary hover:bg-secondary/90 w-full"
                        size="lg"
                      >
                        Continue
                      </Button>
                    </motion.div>
                  )}

                  {/* Step 2: Confirmation */}
                  {step === 'confirm' && (
                    <motion.div
                      key="step-confirm"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <Alert className="bg-secondary/10 border-secondary">
                        <CheckCircle2 className="text-secondary h-4 w-4" />
                        <AlertDescription>
                          Please review your withdrawal details carefully
                        </AlertDescription>
                      </Alert>

                      {/* Confirmation Details */}
                      <div className="space-y-4">
                        <div className="bg-muted space-y-3 rounded-xl p-4">
                          <div>
                            <p className="text-muted-foreground mb-1 text-xs">
                              Amount
                            </p>
                            <p className="text-2xl font-bold">
                              ${amount.toFixed(2)} USDT
                            </p>
                          </div>

                          <div className="bg-border h-px" />

                          <div>
                            <p className="text-muted-foreground mb-1 text-xs">
                              Network
                            </p>
                            <p className="font-semibold">{formData.network}</p>
                          </div>

                          <div>
                            <p className="text-muted-foreground mb-1 text-xs">
                              Wallet Address
                            </p>
                            <p className="font-mono text-sm break-all">
                              {formData.walletAddress}
                            </p>
                          </div>

                          <div className="bg-border h-px" />

                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Fee ({FEE_PERCENTAGE}%)
                            </span>
                            <span className="text-destructive font-semibold">
                              -${fee.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="font-semibold">
                              You&apos;ll receive
                            </span>
                            <span className="text-success text-xl font-bold">
                              ${youReceive.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Important:</strong> Withdrawals require
                            admin approval and may take 1-24 hours to process.
                            Ensure your wallet address is correct.
                          </AlertDescription>
                        </Alert>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => setStep('form')}
                          variant="outline"
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={() => handleSubmit()}
                          disabled={withdrawMutation.isPending}
                          className="bg-secondary hover:bg-secondary/90 flex-1"
                        >
                          {withdrawMutation.isPending && (
                            <NovuntSpinner size="sm" className="mr-2" />
                          )}
                          Confirm Withdrawal
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Success */}
                  {step === 'success' && (
                    <motion.div
                      key="step-success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6 py-12 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className="bg-secondary/10 inline-flex rounded-full p-6"
                      >
                        <Clock className="text-secondary h-12 w-12" />
                      </motion.div>

                      <div>
                        <h3 className="mb-2 text-2xl font-bold">
                          Withdrawal Submitted!
                        </h3>
                        <p className="text-muted-foreground text-lg">
                          Your withdrawal request is pending admin approval
                        </p>
                      </div>

                      <div className="bg-muted space-y-2 rounded-xl p-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-semibold">
                            ${youReceive.toFixed(2)} USDT
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Network:
                          </span>
                          <span className="font-semibold">
                            {formData.network}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="text-warning font-semibold">
                            ⏳ Pending
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Request ID:
                          </span>
                          <span className="font-mono text-xs">
                            {withdrawalId}
                          </span>
                        </div>
                      </div>

                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          You&apos;ll receive a notification once your
                          withdrawal is approved. Expected processing time: 1-24
                          hours.
                        </AlertDescription>
                      </Alert>

                      <Button
                        onClick={onClose}
                        className="bg-secondary hover:bg-secondary/90 w-full"
                        size="lg"
                      >
                        Done
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </React.Fragment>
        )}
      </AnimatePresence>

      {/* Large Withdrawal Confirmation Dialog */}
      <LargeWithdrawalDialog
        open={showLargeWithdrawalDialog}
        onOpenChange={setShowLargeWithdrawalDialog}
        amount={amount}
        walletAddress={formData.walletAddress}
        estimatedFees={fee}
        requires2FA={false} // TODO: Check if user has 2FA enabled
        onConfirm={() => {
          setShowLargeWithdrawalDialog(false);
          handleSubmit(true); // Skip dialog check
        }}
        onCancel={() => {
          setShowLargeWithdrawalDialog(false);
        }}
      />

      {/* Daily Limit Exceeded Dialog */}
      <DailyLimitDialog
        open={showDailyLimitDialog}
        onOpenChange={setShowDailyLimitDialog}
        dailyLimit={5000} // TODO: Get from backend/user settings
        withdrawnToday={4000} // TODO: Get from backend
        remainingLimit={1000} // TODO: Calculate from backend data
        resetTime={(() => {
          const tomorrow = new Date();
          tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
          tomorrow.setUTCHours(0, 0, 0, 0);
          return tomorrow;
        })()}
      />
    </>
  );
}
