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

  const MIN_WITHDRAWAL = 10;
  const FEE_PERCENTAGE = 5;
  const DAILY_LIMIT = 2;

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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setError('');

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
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit withdrawal';
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-secondary via-secondary to-secondary/80 p-6">
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-secondary-foreground/10">
                      <Upload className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-secondary-foreground">
                        Withdraw USDT
                      </h2>
                      <p className="text-sm text-secondary-foreground/80">
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
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Available Balance */}
                    <div className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl border border-secondary/20">
                      <p className="text-sm text-muted-foreground mb-1">
                        Available for Withdrawal
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        ${availableBalance.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        From Earnings Wallet only
                      </p>
                    </div>

                    {/* Withdrawal Limits */}
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Withdrawal Limits:</strong>
                        <br />
                        • Min: {MIN_WITHDRAWAL} USDT • Fee: {FEE_PERCENTAGE}%
                        <br />
                        • Daily Limit: {DAILY_LIMIT} withdrawals
                        <br />
                        • Processing: 1-24 hours (admin approval required)
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
                          setFormData({ ...formData, amount: availableBalance.toString() })
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
                        <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                          <RadioGroupItem value="BEP20" id="bep20" />
                          <Label htmlFor="bep20" className="flex-1 cursor-pointer">
                            <div className="font-semibold">BEP20 (BSC)</div>
                            <div className="text-xs text-muted-foreground">
                              Binance Smart Chain - Fast & Low Fees
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                          <RadioGroupItem value="TRC20" id="trc20" />
                          <Label htmlFor="trc20" className="flex-1 cursor-pointer">
                            <div className="font-semibold">TRC20 (Tron)</div>
                            <div className="text-xs text-muted-foreground">
                              Tron Network - Very Fast
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Wallet Address */}
                    <div className="space-y-2">
                      <Label htmlFor="address">Your {formData.network} Wallet Address</Label>
                      <Input
                        id="address"
                        type="text"
                        placeholder="Enter your wallet address"
                        value={formData.walletAddress}
                        onChange={(e) =>
                          setFormData({ ...formData, walletAddress: e.target.value })
                        }
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        ⚠️ Double-check your address. Incorrect address may result in loss of funds.
                      </p>
                    </div>

                    {/* Fee Breakdown */}
                    {amount >= MIN_WITHDRAWAL && (
                      <div className="p-4 bg-muted rounded-xl space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-semibold">${amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fee ({FEE_PERCENTAGE}%):</span>
                          <span className="font-semibold text-destructive">
                            -${fee.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-px bg-border my-2" />
                        <div className="flex justify-between">
                          <span className="font-semibold">You&apos;ll receive:</span>
                          <span className="font-bold text-lg text-success">
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
                      disabled={withdrawMutation.isPending || !formData.amount || !formData.walletAddress}
                      className="w-full bg-secondary hover:bg-secondary/90"
                      size="lg"
                    >
                      Continue
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Confirmation */}
                {step === 'confirm' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <Alert className="bg-secondary/10 border-secondary">
                      <CheckCircle2 className="h-4 w-4 text-secondary" />
                      <AlertDescription>
                        Please review your withdrawal details carefully
                      </AlertDescription>
                    </Alert>

                    {/* Confirmation Details */}
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-xl space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Amount</p>
                          <p className="text-2xl font-bold">${amount.toFixed(2)} USDT</p>
                        </div>

                        <div className="h-px bg-border" />

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Network</p>
                          <p className="font-semibold">{formData.network}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                          <p className="font-mono text-sm break-all">{formData.walletAddress}</p>
                        </div>

                        <div className="h-px bg-border" />

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Fee ({FEE_PERCENTAGE}%)</span>
                          <span className="font-semibold text-destructive">-${fee.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="font-semibold">You&apos;ll receive</span>
                          <span className="text-xl font-bold text-success">${youReceive.toFixed(2)}</span>
                        </div>
                      </div>

                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Important:</strong> Withdrawals require admin approval and may take 1-24 hours to process. Ensure your wallet address is correct.
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
                        onClick={handleSubmit}
                        disabled={withdrawMutation.isPending}
                        className="flex-1 bg-secondary hover:bg-secondary/90"
                      >
                        {withdrawMutation.isPending && <NovuntSpinner size="sm" className="mr-2" />}
                        Confirm Withdrawal
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Success */}
                {step === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center space-y-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.5 }}
                      className="inline-flex p-6 rounded-full bg-secondary/10"
                    >
                      <Clock className="h-12 w-12 text-secondary" />
                    </motion.div>

                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        Withdrawal Submitted!
                      </h3>
                      <p className="text-lg text-muted-foreground">
                        Your withdrawal request is pending admin approval
                      </p>
                    </div>

                    <div className="p-4 bg-muted rounded-xl space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">${youReceive.toFixed(2)} USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Network:</span>
                        <span className="font-semibold">{formData.network}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-warning font-semibold">⏳ Pending</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Request ID:</span>
                        <span className="font-mono text-xs">{withdrawalId}</span>
                      </div>
                    </div>

                      <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        You&apos;ll receive a notification once your withdrawal is approved. Expected processing time: 1-24 hours.
                      </AlertDescription>
                    </Alert>

                    <Button
                      onClick={onClose}
                      className="w-full bg-secondary hover:bg-secondary/90"
                      size="lg"
                    >
                      Done
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

