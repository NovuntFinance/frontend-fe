/**
 * Withdrawal Modal Component
 * Implementation based on: Withdrawal Feature - Frontend Implementation Guide
 *
 * Features:
 * - Get withdrawal limits and available balance
 * - Default withdrawal address support
 * - 2FA verification (mandatory)
 * - Fee calculation and display
 * - Instant withdrawals vs admin approval
 * - Daily limits check
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertCircle,
  Shield,
  Loader2,
  Info,
  Check,
  Save,
  Clock,
  Lock,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateWithdrawal,
  useWithdrawalLimits,
  useDefaultWithdrawalAddress,
  useSetDefaultWithdrawalAddress,
  useWallet,
} from '@/hooks/useWallet';
import { useWalletBalance } from '@/lib/queries';
import { useQueryClient } from '@tanstack/react-query';
import {
  formatCurrency,
  generateTestWalletAddress,
  validateWalletAddress,
} from '@/lib/utils/wallet';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { TwoFactorInput } from '@/components/auth/TwoFactorInput';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfettiBurst } from '@/components/ui/confetti';
import { CheckCircle2 } from 'lucide-react';

// Form schema - walletAddress is not needed if default exists (backend uses it automatically)
// Note: 2FA code is handled separately via TwoFactorInput component
const createWithdrawalSchema = (hasDefaultAddress: boolean) =>
  z.object({
    amount: z
      .number()
      .min(10, 'Minimum withdrawal is 10 USDT')
      .max(10000, 'Maximum withdrawal is 10,000 USDT'),
    // Address is not required in form if default exists - backend uses it automatically
    // Network is always BEP20 - not needed in form
  });

type WithdrawalFormData = z.infer<ReturnType<typeof createWithdrawalSchema>>;

interface WithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawalModal({ open, onOpenChange }: WithdrawalModalProps) {
  const [step, setStep] = useState<'form' | 'setup-address' | 'success'>(
    'form'
  );
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [withdrawalResult, setWithdrawalResult] = useState<any>(null);
  const [addressToSet, setAddressToSet] = useState('');
  const [setup2FACode, setSetup2FACode] = useState('');
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null); // Address detected from error response

  // API hooks
  const queryClient = useQueryClient();
  const { data: limits, isLoading: limitsLoading } = useWithdrawalLimits();
  const { data: defaultAddress, isLoading: defaultAddressLoading } =
    useDefaultWithdrawalAddress();
  const { wallet: walletInfo } = useWallet(); // Wallet info endpoint also has default address
  const { data: walletBalance } = useWalletBalance(); // Fallback for earnings balance
  const createWithdrawal = useCreateWithdrawal();
  const setDefaultAddress = useSetDefaultWithdrawalAddress();

  // Check if address exists - use hasDefaultAddress flag instead of checking if address exists
  // Check both the dedicated endpoint and wallet info endpoint
  const hasDefaultAddress =
    defaultAddress?.hasDefaultAddress ||
    walletInfo?.hasDefaultAddress ||
    !!detectedAddress;
  const actualAddress =
    defaultAddress?.address ||
    walletInfo?.defaultWithdrawalAddress ||
    detectedAddress;
  const schema = createWithdrawalSchema(hasDefaultAddress);

  // Debug logging for address detection
  React.useEffect(() => {
    if (open) {
      console.log('[WithdrawalModal] 🔍 Address Debug:', {
        defaultAddressEndpoint: {
          hasDefaultAddress: defaultAddress?.hasDefaultAddress,
          address: defaultAddress?.address,
          immutable: defaultAddress?.immutable,
        },
        walletInfoEndpoint: {
          hasDefaultAddress: walletInfo?.hasDefaultAddress,
          address: walletInfo?.defaultWithdrawalAddress,
          immutable: walletInfo?.immutable,
        },
        detectedAddress: detectedAddress,
        computedHasDefaultAddress: hasDefaultAddress,
        actualAddress: actualAddress,
      });
    }
  }, [
    open,
    defaultAddress,
    walletInfo,
    detectedAddress,
    hasDefaultAddress,
    actualAddress,
  ]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<WithdrawalFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      network: 'BEP20', // Only BEP20 is supported
    },
  });

  const amount = watch('amount');
  const network = 'BEP20'; // Only BEP20 is supported

  // Network is always BEP20 - no need to detect

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      reset();
      setStep('form');
      setTwoFactorCode('');
      setSetup2FACode('');
      setAddressToSet('');
      setWithdrawalResult(null);
    }
  }, [open, reset]);

  // Prevent setup step if address is already set
  // Also handle case where backend says address exists but GET didn't return it
  useEffect(() => {
    if (step === 'setup-address') {
      // Only check if address is already set if we have loaded data (not loading)
      // This prevents blocking the setup step when data is still loading
      if (!defaultAddressLoading && hasDefaultAddress && actualAddress) {
        toast.error('Address already set', {
          description: `Your withdrawal address (${actualAddress.slice(0, 10)}...${actualAddress.slice(-10)}) is permanently set and cannot be changed. Contact support if needed.`,
          duration: 5000,
        });
        setStep('form');
        setAddressToSet('');
        setSetup2FACode('');
      }
    }
  }, [
    step,
    hasDefaultAddress,
    actualAddress,
    defaultAddressLoading,
    defaultAddress,
  ]);

  // Handle ADDRESS_IMMUTABLE error from setDefaultAddress mutation
  // This is a workaround for when GET doesn't return the address but POST says it exists
  useEffect(() => {
    if (setDefaultAddress.error) {
      const errorData = (setDefaultAddress.error as any)?.response?.data;
      if (
        errorData?.code === 'ADDRESS_IMMUTABLE' &&
        errorData?.currentAddress
      ) {
        // Address exists but GET didn't return it - store it from error response
        console.log(
          '[WithdrawalModal] 🔒 Address detected from error:',
          errorData.currentAddress
        );
        setDetectedAddress(errorData.currentAddress);
        // Invalidate query to try refetching
        queryClient.invalidateQueries({
          queryKey: ['withdrawal', 'default-address'],
        });
        // Redirect back to form
        if (step === 'setup-address') {
          setStep('form');
          setAddressToSet('');
          setSetup2FACode('');
        }
      }
    }
  }, [setDefaultAddress.error, step, queryClient]);

  // Calculate fee
  const feeCalculation = React.useMemo(() => {
    if (!amount || !limits?.fees) return null;
    const fee = (amount * limits.fees.percentage) / 100;
    const netAmount = amount - fee;
    return { fee, netAmount };
  }, [amount, limits]);

  // Check if amount qualifies for instant withdrawal
  const isInstantWithdrawal = React.useMemo(() => {
    if (!amount || !limits) return false;
    return (
      amount <= limits.limits.instantWithdrawalThreshold &&
      limits.limits.enableInstantWithdrawals
    );
  }, [amount, limits]);

  const onSubmit = async (data: WithdrawalFormData) => {
    const finalNetwork = data.network || 'TRC20';

    // Check if user has a default address set
    if (!hasDefaultAddress || !actualAddress) {
      toast.error('Withdrawal address required', {
        description:
          'Please set your withdrawal address before making a withdrawal',
      });
      // Could open a setup modal here, but for now just show error
      return;
    }

    // Check if amount exceeds available balance
    if (limits && data.amount > limits.availableBalance) {
      toast.error('Insufficient balance', {
        description: `Available: ${formatCurrency(limits.availableBalance)}. Withdrawals can only be made from earnings wallet.`,
      });
      return;
    }

    // Check daily limit
    if (limits && !limits.dailyLimits.canWithdrawToday) {
      toast.error('Daily limit exceeded', {
        description: `You have made ${limits.dailyLimits.withdrawalsUsedToday} withdrawals today. Limit resets at ${new Date(limits.dailyLimits.resetTime).toLocaleString()}`,
      });
      return;
    }

    // Check minimum amount
    if (limits && data.amount < limits.limits.minimum) {
      toast.error('Amount too low', {
        description: `Minimum withdrawal is ${limits.limits.minimum} USDT`,
      });
      return;
    }

    // Check if 2FA code is provided
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      toast.error('2FA code required', {
        description:
          'Please enter the 6-digit code from your authenticator app',
      });
      return;
    }

    // Submit withdrawal with 2FA code
    // Backend will use default address automatically (BEP20 only)
    await handleWithdrawalSubmit(data.amount, twoFactorCode);
  };

  const handleWithdrawalSubmit = async (
    amount: number,
    twoFACode: string,
    customAddress?: string
  ) => {
    try {
      // Build withdrawal payload
      // walletAddress is optional - if not provided, backend uses user's default withdrawal address
      const withdrawalPayload: {
        amount: number;
        walletAddress?: string;
        network: 'BEP20';
        twoFACode: string;
      } = {
        amount,
        network: 'BEP20', // Only BEP20 is supported
        twoFACode,
      };

      // Only include walletAddress if user provided a custom address different from default
      if (customAddress && customAddress !== actualAddress) {
        withdrawalPayload.walletAddress = customAddress;
      }
      // If no custom address and no default address, backend will return WALLET_ADDRESS_REQUIRED

      const response = await createWithdrawal.mutateAsync(withdrawalPayload);

      setWithdrawalResult(response.data);
      setShowConfetti(true);
      setStep('success');

      // Close modal after 3 seconds
      setTimeout(() => {
        setShowConfetti(false);
        onOpenChange(false);
      }, 3000);
    } catch (error: any) {
      // Check if error requires setup redirect
      const errorData = error?.response?.data;
      if (
        errorData?.code === 'WALLET_ADDRESS_REQUIRED' &&
        errorData?.requiresSetup
      ) {
        // Redirect to withdrawal address setup
        toast.error('Withdrawal address required', {
          description:
            errorData?.message ||
            'Please set your default withdrawal address first.',
        });
        setStep('setup-address');
        // Generate a BEP20 test address by default
        const testAddress = generateTestWalletAddress('BEP20');
        setAddressToSet(testAddress);
        return;
      }
      // Other errors are handled by mutation's onError handler
      console.error('Withdrawal error:', error);
    }
  };

  const handle2FAComplete = async (code: string) => {
    if (!amount) return;

    // Check if user has default address
    if (!hasDefaultAddress || !actualAddress) {
      toast.error('Withdrawal address required', {
        description:
          'Please set your withdrawal address before making a withdrawal',
      });
      setStep('setup-address');
      return;
    }

    await handleWithdrawalSubmit(amount, code);
  };

  // Use withdrawal limits API balance, fallback to wallet balance if not available or is 0
  // Note: We check for null/undefined OR 0, because 0 means the API didn't return a valid balance
  const availableBalance =
    limits?.availableBalance && limits.availableBalance > 0
      ? limits.availableBalance
      : (walletBalance?.earnings?.availableBalance ??
        walletBalance?.earnings?.balance ??
        0);

  // Debug logging
  React.useEffect(() => {
    if (open) {
      console.log('[WithdrawalModal] 💰 Balance Debug:', {
        limitsAvailableBalance: limits?.availableBalance,
        walletEarningsAvailableBalance:
          walletBalance?.earnings?.availableBalance,
        walletEarningsBalance: walletBalance?.earnings?.balance,
        finalAvailableBalance: availableBalance,
        limitsData: limits,
        walletBalanceData: walletBalance,
      });
    }
  }, [open, limits, walletBalance, availableBalance]);
  const minWithdrawal = limits?.limits?.minimum || 10;
  const feePercentage = limits?.fees?.percentage || 3.0;
  // Only BEP20 is supported - no network selection needed
  const canWithdrawToday = limits?.dailyLimits?.canWithdrawToday ?? true;
  const withdrawalsRemaining = limits?.dailyLimits?.withdrawalsRemaining || 0;

  return (
    <>
      <ConfettiBurst trigger={showConfetti} />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
              <Shield className="text-primary h-6 w-6" />
              Withdraw USDT
            </DialogTitle>
            <DialogDescription className="sr-only">
              Withdraw funds from your earnings wallet. Enter the amount, wallet
              address, and 2FA code to complete the withdrawal.
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {step === 'setup-address' ? (
              // Address Setup Step
              <motion.div
                key="setup-address"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <p className="mb-1 font-semibold">
                      Set Your Withdrawal Address
                    </p>
                    <p className="text-sm">
                      This address will be used for all withdrawals and cannot
                      be changed once set.
                    </p>
                  </AlertDescription>
                </Alert>

                {/* Network Info - Only BEP20 is supported */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold">Network: BEP20 (BSC)</p>
                    <p className="text-muted-foreground text-sm">
                      Only Binance Smart Chain (BEP20) addresses are supported
                    </p>
                  </AlertDescription>
                </Alert>

                {/* Address Input */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label htmlFor="setup-address">Wallet Address</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const testAddress = generateTestWalletAddress('BEP20');
                        setAddressToSet(testAddress);
                        toast.info('Test address generated', {
                          description:
                            'BEP20 test address generated. You can edit it or use it as-is.',
                        });
                      }}
                      className="text-xs"
                    >
                      🧪 Generate Test Address
                    </Button>
                  </div>
                  <Input
                    id="setup-address"
                    type="text"
                    placeholder="Enter BEP20 (BSC) wallet address (0x...)"
                    value={addressToSet}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAddressToSet(value);
                      // Reject TRC20 addresses (starting with 'T')
                      if (value.startsWith('T')) {
                        toast.error('TRC20 not supported', {
                          description:
                            'Only BEP20 (BSC) addresses are supported',
                        });
                      }
                    }}
                    className="font-mono text-sm"
                  />
                  {addressToSet &&
                    (() => {
                      // Only validate BEP20 format
                      if (addressToSet.startsWith('T')) {
                        return (
                          <p className="text-destructive mt-1 text-sm">
                            ❌ TRC20 addresses are not supported. Only BEP20
                            (BSC) addresses are allowed.
                          </p>
                        );
                      }
                      const validation = validateWalletAddress(
                        addressToSet,
                        'BEP20'
                      );
                      return validation.valid ? (
                        <p className="text-success mt-1 text-sm">
                          ✓ Valid BEP20 (BSC) address
                        </p>
                      ) : (
                        <p className="text-destructive mt-1 text-sm">
                          {validation.error}
                        </p>
                      );
                    })()}
                </div>

                {/* 2FA Input for Setup */}
                <div>
                  <Label htmlFor="setup-2fa">2FA Code (Required)</Label>
                  <div className="mt-2">
                    <TwoFactorInput
                      value={setup2FACode}
                      onChange={setSetup2FACode}
                      onComplete={async (code) => {
                        if (!addressToSet) {
                          toast.error('Address required', {
                            description:
                              'Please enter or generate a wallet address',
                          });
                          return;
                        }

                        // Reject TRC20 addresses
                        if (addressToSet.startsWith('T')) {
                          toast.error('TRC20 not supported', {
                            description:
                              'Only BEP20 (BSC) addresses are supported',
                          });
                          return;
                        }

                        // Validate BEP20 address format
                        const validation = validateWalletAddress(
                          addressToSet,
                          'BEP20'
                        );
                        if (!validation.valid) {
                          toast.error('Invalid BEP20 address', {
                            description:
                              validation.error ||
                              'Please enter a valid BSC wallet address',
                          });
                          return;
                        }

                        // Set the address (network defaults to BEP20 on backend)
                        try {
                          const response = await setDefaultAddress.mutateAsync({
                            address: addressToSet,
                            network: 'BEP20', // Explicitly set BEP20
                            twoFACode: code, // 2FA code in request body
                          });
                          // Update cache immediately with response data if available
                          if (response?.data) {
                            queryClient.setQueryData(
                              ['withdrawal', 'default-address'],
                              response.data
                            );
                          }
                          // Invalidate and refetch queries to ensure consistency
                          await Promise.all([
                            queryClient.invalidateQueries({
                              queryKey: ['withdrawal', 'default-address'],
                            }),
                            queryClient.invalidateQueries({
                              queryKey: ['wallet', 'info'],
                            }),
                          ]);
                          // Refetch to ensure UI is updated
                          await queryClient.refetchQueries({
                            queryKey: ['withdrawal', 'default-address'],
                          });
                          setStep('form');
                          setAddressToSet('');
                          setSetup2FACode('');
                        } catch (error) {
                          // Error handled by mutation
                        }
                      }}
                      isLoading={setDefaultAddress.isPending}
                      error={
                        setDefaultAddress.error
                          ? 'Invalid 2FA code. Please try again.'
                          : undefined
                      }
                    />
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep('form');
                      setAddressToSet('');
                      setSetup2FACode('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!addressToSet) {
                        toast.error('Address required');
                        return;
                      }

                      if (setup2FACode.length !== 6) {
                        toast.error('2FA code required', {
                          description: 'Please enter the 6-digit code',
                        });
                        return;
                      }

                      // Reject TRC20 addresses
                      if (addressToSet.startsWith('T')) {
                        toast.error('TRC20 not supported', {
                          description:
                            'Only BEP20 (BSC) addresses are supported',
                        });
                        return;
                      }

                      // Validate BEP20 address format
                      const validation = validateWalletAddress(
                        addressToSet,
                        'BEP20'
                      );
                      if (!validation.valid) {
                        toast.error('Invalid BEP20 address', {
                          description:
                            validation.error ||
                            'Please enter a valid BSC wallet address',
                        });
                        return;
                      }

                      // Check if address is already set before attempting to set
                      if (hasDefaultAddress && actualAddress) {
                        toast.error('Address already set', {
                          description: `Your withdrawal address (${actualAddress.slice(0, 10)}...${actualAddress.slice(-10)}) is permanently set and cannot be changed. Contact support if needed.`,
                          duration: 5000,
                        });
                        setStep('form');
                        return;
                      }

                      // Set the address (network defaults to BEP20 on backend)
                      try {
                        const response = await setDefaultAddress.mutateAsync({
                          address: addressToSet,
                          network: 'BEP20', // Explicitly set BEP20
                          twoFACode: setup2FACode, // 2FA code in request body
                        });
                        // Update cache immediately with response data if available
                        if (response?.data) {
                          queryClient.setQueryData(
                            ['withdrawal', 'default-address'],
                            response.data
                          );
                        }
                        // Invalidate and refetch queries to ensure consistency
                        await Promise.all([
                          queryClient.invalidateQueries({
                            queryKey: ['withdrawal', 'default-address'],
                          }),
                          queryClient.invalidateQueries({
                            queryKey: ['wallet', 'info'],
                          }),
                        ]);
                        // Refetch to ensure UI is updated
                        await queryClient.refetchQueries({
                          queryKey: ['withdrawal', 'default-address'],
                        });
                        setStep('form');
                        setAddressToSet('');
                        setSetup2FACode('');
                      } catch (error) {
                        // Error handled by mutation
                      }
                    }}
                    disabled={
                      setDefaultAddress.isPending ||
                      !addressToSet ||
                      setup2FACode.length !== 6
                    }
                    className="flex-1"
                  >
                    {setDefaultAddress.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Setting...
                      </>
                    ) : (
                      'Set Address'
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : step === 'form' ? (
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
                  <Card className="from-success/10 to-success/5 border-success/20 bg-gradient-to-br">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground mb-1 text-sm">
                            Available for Withdrawal
                          </p>
                          <p className="text-foreground text-2xl font-bold">
                            {formatCurrency(availableBalance)}
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            From Earnings Wallet only
                          </p>
                        </div>
                        {canWithdrawToday ? (
                          <div className="bg-success/20 rounded-lg p-2">
                            <Check className="text-success h-5 w-5" />
                          </div>
                        ) : (
                          <div className="bg-destructive/20 rounded-lg p-2">
                            <X className="text-destructive h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Withdrawal Limits Info */}
                {limits && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Withdrawal Limits:</strong>
                        </p>
                        <p>
                          • Min: {minWithdrawal} USDT • Fee: {feePercentage}%
                        </p>
                        <p>
                          • Daily Limit: {withdrawalsRemaining} withdrawals
                          remaining
                        </p>
                        <p>
                          • Processing:{' '}
                          {isInstantWithdrawal
                            ? limits.processingTimes.instant
                            : limits.processingTimes.standard}
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Amount Input */}
                <div>
                  <Label htmlFor="amount">Amount (USDT)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min={minWithdrawal}
                    max={10000}
                    placeholder={`Enter amount (min ${minWithdrawal} USDT)`}
                    {...register('amount', { valueAsNumber: true })}
                    className="mt-2 text-lg"
                  />
                  {errors.amount && (
                    <p className="text-destructive mt-1 text-sm">
                      {errors.amount.message}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => setValue('amount', availableBalance)}
                    className="mt-1 text-xs"
                  >
                    Use max balance
                  </Button>
                </div>

                {/* Fee Calculation Preview */}
                {feeCalculation && amount && amount >= minWithdrawal && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-muted/50 border-border space-y-2 rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-semibold">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Fee ({feePercentage}%):
                      </span>
                      <span className="text-destructive font-semibold">
                        -{formatCurrency(feeCalculation.fee)}
                      </span>
                    </div>
                    <div className="border-border border-t pt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          You&apos;ll receive:
                        </span>
                        <span className="text-success text-lg font-bold">
                          {formatCurrency(feeCalculation.netAmount)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Withdrawal Address Status */}
                {hasDefaultAddress && actualAddress ? (
                  <Alert className="bg-success/10 border-success/20">
                    <div className="flex items-start gap-3">
                      <Lock className="text-success mt-0.5 h-4 w-4" />
                      <AlertDescription>
                        <div>
                          <p className="text-success mb-1 flex items-center gap-2 font-semibold">
                            Withdrawing to:{' '}
                            <span className="font-mono text-sm">
                              {actualAddress}
                            </span>{' '}
                            <span className="text-xs">(permanent)</span>
                          </p>
                          <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                            <Lock className="h-3 w-3" />
                            This address is permanently set and cannot be
                            changed. Contact support if needed.
                          </p>
                        </div>
                      </AlertDescription>
                    </div>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div>
                        <p className="mb-2 font-semibold">
                          Withdrawal Address Required
                        </p>
                        <p className="mb-3 text-sm">
                          You must set your withdrawal address before making a
                          withdrawal. This address cannot be changed once set.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Check if address is already set
                            if (hasDefaultAddress && actualAddress) {
                              toast.error('Address already set', {
                                description: `Your withdrawal address (${actualAddress.slice(0, 10)}...${actualAddress.slice(-10)}) is permanently set and cannot be changed. Contact support if needed.`,
                                duration: 5000,
                              });
                              return;
                            }
                            setStep('setup-address');
                            // Generate a BEP20 test address by default
                            const testAddress =
                              generateTestWalletAddress('BEP20');
                            setAddressToSet(testAddress);
                          }}
                        >
                          Set Withdrawal Address
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* 2FA Input */}
                <div>
                  <Label htmlFor="twoFACode">2FA Code (Required)</Label>
                  <div className="mt-2">
                    <TwoFactorInput
                      value={twoFactorCode}
                      onChange={setTwoFactorCode}
                      onComplete={handle2FAComplete}
                      isLoading={createWithdrawal.isPending}
                      error={
                        createWithdrawal.error
                          ? 'Invalid 2FA code. Please try again.'
                          : undefined
                      }
                    />
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                {/* Warning */}
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="mb-1 font-semibold">Important:</p>
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      <li>
                        Double-check your wallet address - transactions cannot
                        be reversed
                      </li>
                      <li>
                        Processing time:{' '}
                        {isInstantWithdrawal
                          ? limits?.processingTimes.instant
                          : limits?.processingTimes.standard}
                      </li>
                      <li>2FA verification is mandatory</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={
                    createWithdrawal.isPending ||
                    limitsLoading ||
                    defaultAddressLoading ||
                    !canWithdrawToday ||
                    !hasDefaultAddress ||
                    !actualAddress ||
                    !amount ||
                    amount < minWithdrawal ||
                    twoFactorCode.length !== 6
                  }
                  className="w-full"
                  size="lg"
                >
                  {createWithdrawal.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Submit Withdrawal
                    </>
                  )}
                </Button>
              </motion.form>
            ) : (
              // Success Step
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 py-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                  className="bg-success/10 inline-flex rounded-full p-6"
                >
                  <CheckCircle2 className="text-success h-12 w-12" />
                </motion.div>

                <div>
                  <h3 className="mb-2 text-2xl font-bold">
                    Withdrawal Submitted!
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    {withdrawalResult?.requiresApproval
                      ? 'Your withdrawal request is pending admin approval'
                      : 'Your withdrawal is being processed'}
                  </p>
                </div>

                {withdrawalResult && (
                  <div className="bg-muted space-y-2 rounded-xl p-4 text-left text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-semibold">
                        {formatCurrency(withdrawalResult.netAmount)} USDT
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network:</span>
                      <span className="font-semibold">
                        {withdrawalResult.network}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-warning font-semibold">
                        {withdrawalResult.requiresApproval
                          ? '⏳ Requires Approval'
                          : '⏳ Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reference:</span>
                      <span className="font-mono text-xs">
                        {withdrawalResult.reference}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Processing Time:
                      </span>
                      <span className="font-semibold">
                        {withdrawalResult.estimatedProcessingTime}
                      </span>
                    </div>
                  </div>
                )}

                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    You&apos;ll receive a notification once your withdrawal is
                    processed.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={() => onOpenChange(false)}
                  className="w-full"
                  size="lg"
                >
                  Done
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
