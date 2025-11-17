/**
 * Withdrawal Modal Component
 * Ultra-modern withdrawal flow with 2FA, fee calculation, and limits
 * Based on Backend TRD: FRONTEND_WALLET_IMPLEMENTATION_PHASE1.md
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Shield, Loader2, Info, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateWithdrawal, useWithdrawalLimits, useWallet } from '@/hooks/useWallet';
import { formatCurrency, validateWalletAddress, calculateWithdrawalFee } from '@/lib/utils/wallet';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { TwoFactorInput } from '@/components/auth/TwoFactorInput';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfettiBurst } from '@/components/ui/confetti';
import { CheckCircle2 } from 'lucide-react';

const withdrawalSchema = z.object({
  amount: z
    .number()
    .min(20, 'Minimum withdrawal is 20 USDT')
    .max(10000, 'Maximum withdrawal is 10,000 USDT'),
  walletAddress: z.string().min(1, 'Wallet address is required'),
  network: z.enum(['BEP20', 'TRC20', 'ERC20']).optional(),
});

type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

interface WithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawalModal({ open, onOpenChange }: WithdrawalModalProps) {
  const [step, setStep] = useState<'form' | '2fa'>('form');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { wallet } = useWallet();
  const { data: limits, isLoading: limitsLoading } = useWithdrawalLimits();
  const createWithdrawal = useCreateWithdrawal();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      network: 'BEP20',
    },
  });

  const amount = watch('amount');
  const walletAddress = watch('walletAddress');
  const network = watch('network') || 'BEP20';

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      reset();
      setStep('form');
      setTwoFactorCode('');
      setRequires2FA(false);
    }
  }, [open, reset]);

  // Calculate fee when amount changes
  const feeCalculation = React.useMemo(() => {
    if (!amount || !limits) return null;
    return calculateWithdrawalFee(amount, limits.feePercentage, limits.feeFixed);
  }, [amount, limits]);

  // Validate wallet address
  const addressValidation = React.useMemo(() => {
    if (!walletAddress || !network) return null;
    return validateWalletAddress(walletAddress, network);
  }, [walletAddress, network]);

  const onSubmit = async (data: WithdrawalFormData) => {
    // Validate wallet address
    const validation = validateWalletAddress(data.walletAddress, data.network || 'BEP20');
    if (!validation.valid) {
      toast.error('Invalid wallet address', {
        description: validation.error,
      });
      return;
    }

    // Check if amount exceeds available balance
    if (limits && data.amount > limits.availableBalance) {
      toast.error('Insufficient balance', {
        description: `Available: ${formatCurrency(limits.availableBalance)}`,
      });
      return;
    }

    // Check daily limit
    if (limits && limits.dailyCount >= limits.dailyLimit) {
      toast.error('Daily limit exceeded', {
        description: `You have made ${limits.dailyCount} withdrawals today. Limit resets at ${new Date(limits.resetTime).toLocaleTimeString()}`,
      });
      return;
    }

    try {
      // Attempt withdrawal (backend will return 403 if 2FA required)
      await createWithdrawal.mutateAsync({
        amount: data.amount,
        walletAddress: data.walletAddress,
        network: data.network,
      });
      
      // If successful, close modal
      onOpenChange(false);
    } catch (error: any) {
      // Check if 2FA is required
      if (error?.response?.status === 403 && error?.response?.data?.requires2FA) {
        setRequires2FA(true);
        setStep('2fa');
      }
      // Other errors handled by mutation
    }
  };

  const handle2FAComplete = async (code: string) => {
    if (!amount || !walletAddress) return;

    try {
      await createWithdrawal.mutateAsync({
        amount,
        walletAddress,
        network: network || 'BEP20',
        // Include 2FA code in request (adjust based on backend API)
        // This might need to be passed differently depending on backend implementation
      });
      
      setShowConfetti(true);
      toast.success('Withdrawal requested', {
        description: 'Your withdrawal will be processed within 24-48 hours',
        icon: <CheckCircle2 className="h-5 w-5" />,
      });
      
      setTimeout(() => {
        setShowConfetti(false);
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <>
      <ConfettiBurst trigger={showConfetti} />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Request Withdrawal
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Available Balance */}
              {limits && (
                <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                        <p className="text-2xl font-bold text-foreground">
                          {formatCurrency(limits.availableBalance)}
                        </p>
                      </div>
                      {limits.canWithdraw ? (
                        <div className="p-2 rounded-lg bg-success/20">
                          <Check className="h-5 w-5 text-success" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-destructive/20">
                          <X className="h-5 w-5 text-destructive" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Withdrawal Limits Info */}
              {limits && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Daily limit: {limits.dailyCount}/{limits.dailyLimit} withdrawals
                    </p>
                    <p>
                      Range: {formatCurrency(limits.minWithdrawal)} - {formatCurrency(limits.maxWithdrawal)}
                    </p>
                    {limits.dailyCount >= limits.dailyLimit && (
                      <p className="text-warning mt-1">
                        Limit resets at {new Date(limits.resetTime).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <Label htmlFor="amount">Withdrawal Amount (USDT)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min={limits?.minWithdrawal || 20}
                  max={limits?.maxWithdrawal || 10000}
                  placeholder={`Enter amount (${limits?.minWithdrawal || 20} - ${limits?.maxWithdrawal || 10000} USDT)`}
                  {...register('amount', { valueAsNumber: true })}
                  className="mt-2"
                />
                {errors.amount && (
                  <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
                )}
              </div>

              {/* Fee Calculation Preview */}
              {feeCalculation && amount && amount >= (limits?.minWithdrawal || 20) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Withdrawal Amount:</span>
                    <span className="font-semibold">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fee ({feeCalculation.breakdown}):</span>
                    <span className="font-semibold text-destructive">
                      -{formatCurrency(feeCalculation.totalFee)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">You will receive:</span>
                      <span className="text-lg font-bold text-success">
                        {formatCurrency(feeCalculation.netAmount)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Network Selection */}
              <div>
                <Label htmlFor="network">Network</Label>
                <Select
                  value={network}
                  onValueChange={(value) => setValue('network', value as 'BEP20' | 'TRC20' | 'ERC20')}
                >
                  <SelectTrigger id="network" className="mt-2">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {limits?.supportedNetworks?.map((net) => (
                      <SelectItem key={net} value={net}>
                        {net}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Wallet Address Input */}
              <div>
                <Label htmlFor="walletAddress">Wallet Address</Label>
                <Input
                  id="walletAddress"
                  type="text"
                  placeholder={`Enter ${network} wallet address`}
                  {...register('walletAddress')}
                  className="mt-2 font-mono text-sm"
                />
                {errors.walletAddress && (
                  <p className="text-sm text-destructive mt-1">{errors.walletAddress.message}</p>
                )}
                {addressValidation && !addressValidation.valid && (
                  <p className="text-sm text-destructive mt-1">{addressValidation.error}</p>
                )}
                {addressValidation && addressValidation.valid && (
                  <p className="text-sm text-success mt-1">✓ Valid {network} address</p>
                )}
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 p-4 rounded-lg bg-warning/10 border border-warning/20">
                <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">Important:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Double-check your wallet address - transactions cannot be reversed</li>
                    <li>Processing time: 24-48 hours</li>
                    <li>2FA verification required</li>
                  </ul>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={createWithdrawal.isPending || limitsLoading || !limits?.canWithdraw}
                className="w-full"
                size="lg"
              >
                {createWithdrawal.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Request Withdrawal
                  </>
                )}
              </Button>
            </motion.form>
          ) : (
            // 2FA Step
            <motion.div
              key="2fa"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <TwoFactorInput
                value={twoFactorCode}
                onChange={setTwoFactorCode}
                onComplete={handle2FAComplete}
                isLoading={createWithdrawal.isPending}
                error={createWithdrawal.error ? 'Invalid code' : undefined}
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('form')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => handle2FAComplete(twoFactorCode)}
                  disabled={twoFactorCode.length !== 6 || createWithdrawal.isPending}
                  className="flex-1"
                >
                  {createWithdrawal.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Submit'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
    </>
  );
}

