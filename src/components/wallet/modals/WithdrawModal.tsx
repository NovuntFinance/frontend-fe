'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useWalletBalance } from '@/lib/queries';
import { useInitiateWithdrawal } from '@/lib/mutations/transactionMutations';
import { LargeWithdrawalDialog } from '@/components/dialogs/LargeWithdrawalDialog';
import { DailyLimitDialog } from '@/components/dialogs/DailyLimitDialog';
import { useWithdrawalConfig } from '@/hooks/useWithdrawalConfig';
import { useDefaultWithdrawalAddress } from '@/hooks/useWallet';
import { formatAddress } from '@/lib/utils/wallet';
import { fmt4 } from '@/utils/formatters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BaseModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  InfoCallout,
  PrimaryButton,
  SecondaryButton,
} from '@/components/neumorphic-modal';
import {
  NEU_TOKENS,
  neuInset,
  neuRaised,
  neuRadius,
} from '@/components/neumorphic-modal/tokens';

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
    network: 'BEP20' as const, // Only BEP20 is supported
  });
  const [error, setError] = useState('');
  const [withdrawalId, setWithdrawalId] = useState('');

  // Modal states
  const [showLargeWithdrawalDialog, setShowLargeWithdrawalDialog] =
    useState(false);
  const [showDailyLimitDialog, setShowDailyLimitDialog] = useState(false);
  // Get withdrawal config from dynamic config system
  const withdrawalConfig = useWithdrawalConfig();
  const MIN_WITHDRAWAL = withdrawalConfig.minAmount;
  const FEE_PERCENTAGE = withdrawalConfig.feePercentage;
  const DAILY_LIMIT = withdrawalConfig.dailyLimit;

  const availableBalance = wallet?.earnings?.availableBalance || 0;
  const amount = parseFloat(formData.amount) || 0;
  const fee = (amount * FEE_PERCENTAGE) / 100;
  const youReceive = amount - fee;

  const { data: defaultAddressData, isLoading: defaultAddressLoading } =
    useDefaultWithdrawalAddress();
  const hasWhitelistedAddress =
    defaultAddressData?.hasDefaultAddress && !!defaultAddressData?.address;
  const whitelistedAddress = defaultAddressData?.address ?? '';

  // Reset on open; pre-fill whitelisted address when available
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      const initialAddress = hasWhitelistedAddress ? whitelistedAddress : '';
      setFormData({
        amount: '',
        walletAddress: initialAddress,
        network: 'BEP20' as const,
      });
      setError('');
      refetch();
    }
  }, [isOpen, refetch, hasWhitelistedAddress, whitelistedAddress]);

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

    // Check if withdrawal amount exceeds instant withdrawal threshold
    if (!skipDialogs && amount > withdrawalConfig.instantThreshold) {
      setShowLargeWithdrawalDialog(true);
      return;
    }

    // TODO: Check daily withdrawal count from backend
    // For now, this is a placeholder - backend should return this in the error

    try {
      const response = await withdrawMutation.mutateAsync({
        amount,
        address: formData.walletAddress,
        network: 'BEP20' as const, // Only BEP20 is supported
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
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={handleClose}
        preventClose={step === 'submitting'}
      >
        {step === 'form' && (
          <>
            <ModalHeader
              title="Withdraw USDT"
              subtitle="Cash out your earnings"
              onClose={handleClose}
              disableClose={false}
            />
            <ModalBody>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4 sm:space-y-5 lg:space-y-6"
              >
                <div className="rounded-xl p-4" style={insetStyle}>
                  <p className="text-xs" style={{ color: NEU_TOKENS.white60 }}>
                    Available for Withdrawal
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: NEU_TOKENS.accent }}
                  >
                    $
                    {availableBalance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: NEU_TOKENS.white40 }}
                  >
                    From Earnings Wallet only
                  </p>
                </div>

                <InfoCallout
                  icon={
                    <AlertCircle
                      className="size-4"
                      style={{ color: NEU_TOKENS.accent }}
                    />
                  }
                  title="Withdrawal Limits"
                  description={
                    <>
                      Min: {MIN_WITHDRAWAL} USDT • Fee: {FEE_PERCENTAGE}%
                      <br />• Daily Limit: {DAILY_LIMIT} withdrawals
                      <br />• Processing: 1-24 hours (admin approval required)
                    </>
                  }
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="amount"
                      className="text-sm font-medium"
                      style={{ color: NEU_TOKENS.white60 }}
                    >
                      Amount (USDT)
                    </Label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          amount: availableBalance.toString(),
                        })
                      }
                      className="text-xs font-semibold transition-opacity hover:opacity-90"
                      style={{ color: NEU_TOKENS.accent }}
                    >
                      Use max balance
                    </button>
                  </div>
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
                    className="neu-input h-12 w-full border-0 text-lg focus-visible:ring-0"
                  />
                </div>

                <InfoCallout
                  icon={
                    <span
                      className="text-xs font-bold"
                      style={{ color: NEU_TOKENS.accent }}
                    >
                      BEP20
                    </span>
                  }
                  title="Binance Smart Chain (BEP20)"
                  description="Only BEP20 network is supported for withdrawals."
                />

                <div className="space-y-1.5">
                  <Label
                    htmlFor="address"
                    className="text-sm font-medium"
                    style={{ color: NEU_TOKENS.white60 }}
                  >
                    Your BEP20 Wallet Address
                  </Label>
                  {defaultAddressLoading ? (
                    <div
                      className="flex h-11 items-center rounded-lg px-4 text-sm"
                      style={{ ...insetStyle, color: NEU_TOKENS.white40 }}
                    >
                      Loading address…
                    </div>
                  ) : hasWhitelistedAddress ? (
                    <>
                      <Select
                        value={formData.walletAddress}
                        onValueChange={(value) =>
                          setFormData({ ...formData, walletAddress: value })
                        }
                      >
                        <SelectTrigger
                          id="address"
                          className="neu-input border-0 font-mono text-sm focus:ring-0 focus:ring-offset-0 [&>span]:line-clamp-1"
                        >
                          <SelectValue placeholder="Select withdrawal address" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value={whitelistedAddress}
                            className="font-mono"
                          >
                            My whitelisted address (
                            {formatAddress(whitelistedAddress)})
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p
                        className="text-xs"
                        style={{ color: NEU_TOKENS.white40 }}
                      >
                        Withdrawals go to your saved BEP20 address. Change it in
                        Settings → Security if needed.
                      </p>
                    </>
                  ) : (
                    <>
                      <Input
                        id="address"
                        type="text"
                        placeholder="Enter your BEP20 wallet address"
                        value={formData.walletAddress}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            walletAddress: e.target.value,
                          })
                        }
                        className="neu-input border-0 font-mono text-sm focus-visible:ring-0"
                      />
                      <p
                        className="text-xs"
                        style={{ color: NEU_TOKENS.white40 }}
                      >
                        Set a default withdrawal address in Settings → Security
                        to use it here next time.
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: NEU_TOKENS.white40 }}
                      >
                        ⚠️ Double-check your address. Incorrect address may
                        result in loss of funds.
                      </p>
                    </>
                  )}
                </div>

                {amount >= MIN_WITHDRAWAL && (
                  <div
                    className="space-y-2 rounded-xl p-4 text-sm"
                    style={insetStyle}
                  >
                    <div className="flex justify-between">
                      <span style={{ color: NEU_TOKENS.white60 }}>Amount:</span>
                      <span
                        className="font-semibold"
                        style={{ color: NEU_TOKENS.white80 }}
                      >
                        ${fmt4(amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: NEU_TOKENS.white60 }}>
                        Fee ({FEE_PERCENTAGE}%):
                      </span>
                      <span className="neu-error font-semibold">
                        -${fmt4(fee)}
                      </span>
                    </div>
                    <div
                      className="my-2 h-px"
                      style={{ background: NEU_TOKENS.border }}
                    />
                    <div className="flex justify-between">
                      <span
                        className="font-semibold"
                        style={{ color: NEU_TOKENS.white80 }}
                      >
                        You&apos;ll receive:
                      </span>
                      <span
                        className="text-lg font-bold"
                        style={{ color: NEU_TOKENS.accent }}
                      >
                        ${fmt4(youReceive)}
                      </span>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="neu-error text-xs font-medium">{error}</p>
                )}

                <ModalFooter className="pt-2">
                  <PrimaryButton
                    onClick={() => validateForm() && setStep('confirm')}
                    disabled={
                      withdrawMutation.isPending ||
                      !formData.amount ||
                      !formData.walletAddress
                    }
                    loading={withdrawMutation.isPending}
                  >
                    Continue
                  </PrimaryButton>
                </ModalFooter>
              </motion.div>
            </ModalBody>
          </>
        )}

        {step === 'confirm' && (
          <>
            <ModalHeader
              title="Withdraw USDT"
              subtitle="Review your withdrawal details"
              onClose={handleClose}
              disableClose={withdrawMutation.isPending}
            />
            <ModalBody>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4 sm:space-y-5 lg:space-y-6"
              >
                <InfoCallout
                  icon={
                    <CheckCircle2
                      className="size-4"
                      style={{ color: NEU_TOKENS.accent }}
                    />
                  }
                  title="Review details"
                  description="Please review your withdrawal details carefully."
                />
                <div className="space-y-3 rounded-xl p-4" style={insetStyle}>
                  <div>
                    <p
                      className="text-xs"
                      style={{ color: NEU_TOKENS.white60 }}
                    >
                      Amount
                    </p>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: NEU_TOKENS.white80 }}
                    >
                      ${fmt4(amount)} USDT
                    </p>
                  </div>
                  <div
                    className="h-px"
                    style={{ background: NEU_TOKENS.border }}
                  />
                  <div>
                    <p
                      className="text-xs"
                      style={{ color: NEU_TOKENS.white60 }}
                    >
                      Network
                    </p>
                    <p
                      className="font-semibold"
                      style={{ color: NEU_TOKENS.white80 }}
                    >
                      {formData.network}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs"
                      style={{ color: NEU_TOKENS.white60 }}
                    >
                      Wallet Address
                    </p>
                    <p
                      className="font-mono text-sm break-all"
                      style={{ color: NEU_TOKENS.white80 }}
                    >
                      {formData.walletAddress}
                    </p>
                  </div>
                  <div
                    className="h-px"
                    style={{ background: NEU_TOKENS.border }}
                  />
                  <div className="flex justify-between text-sm">
                    <span style={{ color: NEU_TOKENS.white60 }}>
                      Fee ({FEE_PERCENTAGE}%)
                    </span>
                    <span className="neu-error font-semibold">
                      -${fmt4(fee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className="font-semibold"
                      style={{ color: NEU_TOKENS.white80 }}
                    >
                      You&apos;ll receive
                    </span>
                    <span
                      className="text-xl font-bold"
                      style={{ color: NEU_TOKENS.accent }}
                    >
                      ${fmt4(youReceive)}
                    </span>
                  </div>
                </div>
                <InfoCallout
                  icon={
                    <AlertCircle
                      className="size-4"
                      style={{ color: NEU_TOKENS.accent }}
                    />
                  }
                  title="Important"
                  description={
                    <>
                      Withdrawals require admin approval and may take 1-24 hours
                      to process. Ensure your wallet address is correct.
                    </>
                  }
                  borderColor="rgba(248, 113, 113, 0.3)"
                />
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => setStep('form')}
                    variant="outline"
                    className="h-11 flex-1 border-0"
                    style={raisedStyle}
                  >
                    <span style={{ color: NEU_TOKENS.white60 }}>Back</span>
                  </Button>
                  <PrimaryButton
                    onClick={() => handleSubmit()}
                    disabled={withdrawMutation.isPending}
                    loading={withdrawMutation.isPending}
                    className="h-11 flex-1"
                  >
                    {withdrawMutation.isPending
                      ? 'Submitting...'
                      : 'Confirm Withdrawal'}
                  </PrimaryButton>
                </div>
              </motion.div>
            </ModalBody>
          </>
        )}

        {step === 'success' && (
          <div className="px-4 py-6 text-center sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="mx-auto inline-flex rounded-full p-6"
              style={raisedStyle}
            >
              <Clock className="size-12" style={{ color: NEU_TOKENS.accent }} />
            </motion.div>
            <h3
              className="mb-2 text-2xl font-bold"
              style={{ color: NEU_TOKENS.accent }}
            >
              Withdrawal Submitted!
            </h3>
            <p className="text-lg" style={{ color: NEU_TOKENS.white60 }}>
              Your withdrawal request is pending admin approval
            </p>
            <div
              className="mx-auto mt-6 max-w-sm space-y-2 rounded-xl p-4 text-left text-sm"
              style={insetStyle}
            >
              <div className="flex justify-between">
                <span style={{ color: NEU_TOKENS.white60 }}>Amount:</span>
                <span
                  className="font-semibold"
                  style={{ color: NEU_TOKENS.white80 }}
                >
                  ${fmt4(youReceive)} USDT
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: NEU_TOKENS.white60 }}>Network:</span>
                <span
                  className="font-semibold"
                  style={{ color: NEU_TOKENS.white80 }}
                >
                  {formData.network}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: NEU_TOKENS.white60 }}>Status:</span>
                <span
                  className="font-semibold"
                  style={{ color: NEU_TOKENS.accent }}
                >
                  ⏳ Pending
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: NEU_TOKENS.white60 }}>Request ID:</span>
                <span
                  className="font-mono text-xs"
                  style={{ color: NEU_TOKENS.white80 }}
                >
                  {withdrawalId}
                </span>
              </div>
            </div>
            <InfoCallout
              icon={
                <Clock
                  className="size-4"
                  style={{ color: NEU_TOKENS.accent }}
                />
              }
              title="Processing"
              description="You'll receive a notification once your withdrawal is approved. Expected processing time: 1-24 hours."
            />
            <PrimaryButton onClick={onClose} className="mt-6">
              Done
            </PrimaryButton>
          </div>
        )}
      </BaseModal>

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
        dailyLimit={withdrawalConfig.dailyLimit} // Uses dynamic config
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
