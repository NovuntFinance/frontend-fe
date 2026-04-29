'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Shield } from 'lucide-react';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWalletBalance } from '@/lib/queries';
import { useUIStore } from '@/store/uiStore';
import {
  useCreateWithdrawal,
  useDefaultWithdrawalAddress,
  useRequestWithdrawalOtp,
} from '@/hooks/useWallet';
import { useOtpCooldown } from '@/hooks/useOtpCooldown';
import { LargeWithdrawalDialog } from '@/components/dialogs/LargeWithdrawalDialog';
import { DailyLimitDialog } from '@/components/dialogs/DailyLimitDialog';
import { useWithdrawalConfig } from '@/hooks/useWithdrawalConfig';
import { formatAddress } from '@/lib/utils/wallet';
import { fmt4 } from '@/utils/formatters';
import { TwoFactorInput } from '@/components/auth/TwoFactorInput';
import {
  BaseModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  PrimaryButton,
  InfoCallout,
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

type WithdrawStep = 'form' | 'confirm' | '2fa' | 'submitting' | 'success';

/**
 * Withdraw Modal - Whitelist + 2FA (platform standard)
 * Step 1: Form (amount only; requires whitelisted address)
 * Step 2: Confirmation preview
 * Step 3: 2FA verification
 * Step 4: Success (pending admin approval)
 */
export function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const { data: wallet, refetch } = useWalletBalance();
  const [step, setStep] = useState<WithdrawStep>('form');

  const withdrawMutation = useCreateWithdrawal();
  const requestOtp = useRequestWithdrawalOtp();
  const otpCooldown = useOtpCooldown();
  const [formData, setFormData] = useState({ amount: '' });
  const [twoFACode, setTwoFACode] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
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

  const availableBalance = wallet?.earnings?.availableBalance || 0;
  const amount = parseFloat(formData.amount) || 0;
  const fee = (amount * FEE_PERCENTAGE) / 100;
  const youReceive = amount - fee;

  const { openModal } = useUIStore();
  const { data: defaultAddressData, isLoading: defaultAddressLoading } =
    useDefaultWithdrawalAddress();
  const hasWhitelistedAddress =
    defaultAddressData?.hasDefaultAddress && !!defaultAddressData?.address;
  const whitelistedAddress = defaultAddressData?.address ?? '';

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setFormData({ amount: '' });
      setTwoFACode('');
      setEmailOtp('');
      setOtpSent(false);
      otpCooldown.resetCooldown();
      setError('');
      refetch();
    }
  }, [isOpen, refetch]);

  const validateForm = () => {
    if (!hasWhitelistedAddress) {
      setError('Set your withdrawal address in Settings → Security first');
      return false;
    }
    if (amount < MIN_WITHDRAWAL) {
      setError(`Minimum withdrawal is ${MIN_WITHDRAWAL} USDT`);
      return false;
    }
    if (amount > availableBalance) {
      setError('Insufficient balance');
      return false;
    }
    return true;
  };

  const handleRequestOtp = async () => {
    setError('');
    try {
      await requestOtp.mutateAsync({ amount });
      setOtpSent(true);
      otpCooldown.triggerCooldown({ waitSeconds: 60 });
    } catch (err) {
      const handled = otpCooldown.triggerCooldown(err);
      if (!handled) {
        const apiErr = err as { message?: string };
        setError(apiErr?.message || 'Failed to send OTP');
      }
    }
  };

  const handleSubmit = async (skipDialogs = false) => {
    if (!validateForm()) return;
    if (!emailOtp || emailOtp.length !== 6) {
      setError('Enter the 6-digit email verification code');
      return;
    }
    if (!twoFACode || twoFACode.length !== 6) {
      setError('Enter your 6-digit 2FA code');
      return;
    }

    setError('');

    if (!skipDialogs && amount > withdrawalConfig.instantThreshold) {
      setShowLargeWithdrawalDialog(true);
      return;
    }

    try {
      setStep('submitting');
      const response = await withdrawMutation.mutateAsync({
        amount,
        twoFACode,
        emailOtp,
        network: 'BEP20' as const,
        // walletAddress omitted - backend uses default whitelisted address
      });

      const data = response?.data ?? response;
      setWithdrawalId(data?.transactionId ?? '');
      setStep('success');
      refetch();
    } catch (err) {
      const apiErr = err as {
        message?: string;
        response?: { data?: { code?: string; error?: { code?: string } } };
      };
      const code =
        apiErr?.response?.data?.code || apiErr?.response?.data?.error?.code;
      const errorMessage = apiErr?.message || 'Failed to submit withdrawal';

      if (
        code === 'DAILY_WITHDRAWAL_LIMIT_REACHED' ||
        code === 'DAILY_LIMIT_EXCEEDED' ||
        errorMessage.toLowerCase().includes('daily limit') ||
        errorMessage.toLowerCase().includes('limit exceeded')
      ) {
        setShowDailyLimitDialog(true);
        setStep('form');
        return;
      }
      if (
        code === '2FA_CODE_INVALID' ||
        code === '2FA_REQUIRED' ||
        code === 'INVALID_2FA_CODE' ||
        errorMessage.toLowerCase().includes('2fa')
      ) {
        setError('Invalid 2FA code. Please try again.');
        setTwoFACode('');
        setStep('2fa');
        return;
      }
      if (code === 'INVALID_EMAIL_OTP' || code === 'SUPPORT_REQUIRED') {
        setError(errorMessage);
        setStep('2fa');
        return;
      }

      setError(errorMessage);
      setStep('2fa');
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
              subtitle={`Available: $${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · BEP20`}
              onClose={handleClose}
            />
            <ModalBody>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {defaultAddressLoading ? (
                  <div
                    className="flex h-24 items-center justify-center rounded-xl text-sm"
                    style={{ ...insetStyle, color: NEU_TOKENS.white40 }}
                  >
                    Loading…
                  </div>
                ) : !hasWhitelistedAddress ? (
                  <InfoCallout
                    icon={
                      <Shield
                        className="size-4"
                        style={{ color: NEU_TOKENS.accent }}
                      />
                    }
                    title="Withdrawal address required"
                    description={
                      <>
                        Set your whitelisted BEP20 address to enable
                        withdrawals.{' '}
                        <button
                          type="button"
                          className="font-semibold underline"
                          style={{ color: NEU_TOKENS.accent }}
                          onClick={() => {
                            onClose();
                            openModal('wallet');
                          }}
                        >
                          Open Wallet → Withdrawal Whitelist
                        </button>
                      </>
                    }
                  />
                ) : (
                  <>
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
                            setFormData({ amount: availableBalance.toString() })
                          }
                          className="text-xs font-semibold transition-opacity hover:opacity-90"
                          style={{ color: NEU_TOKENS.accent }}
                        >
                          Use max
                        </button>
                      </div>
                      <Input
                        id="amount"
                        type="number"
                        min={MIN_WITHDRAWAL}
                        max={availableBalance}
                        step="0.01"
                        placeholder={`Min ${MIN_WITHDRAWAL} USDT · ${FEE_PERCENTAGE}% fee`}
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        className="neu-input h-12 w-full border-0 text-lg focus-visible:ring-0"
                      />
                    </div>

                    <div className="rounded-xl p-3 text-sm" style={insetStyle}>
                      <p
                        className="text-xs"
                        style={{ color: NEU_TOKENS.white60 }}
                      >
                        To (whitelisted)
                      </p>
                      <p
                        className="font-mono text-xs break-all"
                        style={{ color: NEU_TOKENS.white80 }}
                      >
                        {formatAddress(whitelistedAddress)}
                      </p>
                    </div>

                    {amount >= MIN_WITHDRAWAL && (
                      <p
                        className="text-sm"
                        style={{ color: NEU_TOKENS.white60 }}
                      >
                        You&apos;ll receive:{' '}
                        <span
                          className="font-semibold"
                          style={{ color: NEU_TOKENS.accent }}
                        >
                          ${fmt4(youReceive)} USDT
                        </span>{' '}
                        (fee {FEE_PERCENTAGE}%)
                      </p>
                    )}

                    {error && (
                      <p className="neu-error text-xs font-medium">{error}</p>
                    )}

                    <ModalFooter className="pt-2">
                      <PrimaryButton
                        onClick={() => validateForm() && setStep('confirm')}
                        disabled={
                          withdrawMutation.isPending || !formData.amount
                        }
                        loading={withdrawMutation.isPending}
                      >
                        Continue
                      </PrimaryButton>
                    </ModalFooter>
                  </>
                )}
              </motion.div>
            </ModalBody>
          </>
        )}

        {step === 'confirm' && (
          <>
            <ModalHeader
              title="Withdraw USDT"
              subtitle={`${fmt4(youReceive)} USDT · BEP20`}
              onClose={handleClose}
            />
            <ModalBody>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div
                  className="space-y-2 rounded-xl p-4 text-sm"
                  style={insetStyle}
                >
                  <div className="flex justify-between">
                    <span style={{ color: NEU_TOKENS.white60 }}>Amount</span>
                    <span style={{ color: NEU_TOKENS.white80 }}>
                      ${fmt4(amount)} USDT
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: NEU_TOKENS.white60 }}>Fee</span>
                    <span className="neu-error">-${fmt4(fee)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span style={{ color: NEU_TOKENS.white80 }}>
                      You receive
                    </span>
                    <span style={{ color: NEU_TOKENS.accent }}>
                      ${fmt4(youReceive)} USDT
                    </span>
                  </div>
                  <div className="pt-2">
                    <p
                      className="text-xs"
                      style={{ color: NEU_TOKENS.white60 }}
                    >
                      To
                    </p>
                    <p
                      className="font-mono text-xs break-all"
                      style={{ color: NEU_TOKENS.white80 }}
                    >
                      {formatAddress(whitelistedAddress)}
                    </p>
                  </div>
                </div>
                <p className="text-xs" style={{ color: NEU_TOKENS.white40 }}>
                  Processing: 1–24 hours. Admin approval required.
                </p>
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
                    onClick={() => setStep('2fa')}
                    className="h-11 flex-1"
                  >
                    Continue
                  </PrimaryButton>
                </div>
              </motion.div>
            </ModalBody>
          </>
        )}

        {step === '2fa' && (
          <>
            <ModalHeader
              title="Withdraw USDT"
              subtitle="Confirm with 2FA"
              onClose={handleClose}
              disableClose={withdrawMutation.isPending}
            />
            <ModalBody>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="rounded-xl p-4 text-center" style={insetStyle}>
                  <p className="text-sm" style={{ color: NEU_TOKENS.white60 }}>
                    ${fmt4(youReceive)} USDT →{' '}
                    {formatAddress(whitelistedAddress)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label
                    className="text-sm font-medium"
                    style={{ color: NEU_TOKENS.white60 }}
                  >
                    Email Verification Code
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="6-digit code"
                      value={emailOtp}
                      onChange={(e) =>
                        setEmailOtp(
                          e.target.value.replace(/\D/g, '').slice(0, 6)
                        )
                      }
                      className="neu-input w-32 border-0 text-center font-mono tracking-widest focus-visible:ring-0"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-0"
                      style={raisedStyle}
                      disabled={
                        requestOtp.isPending ||
                        otpCooldown.isOnCooldown ||
                        amount < MIN_WITHDRAWAL
                      }
                      onClick={handleRequestOtp}
                    >
                      {requestOtp.isPending ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Sending...
                        </>
                      ) : otpCooldown.isOnCooldown ? (
                        `Resend in ${otpCooldown.cooldownSeconds}s`
                      ) : otpSent ? (
                        'Resend Code'
                      ) : (
                        'Send Code'
                      )}
                    </Button>
                  </div>
                  {otpSent && (
                    <p
                      className="text-xs"
                      style={{ color: NEU_TOKENS.white40 }}
                    >
                      Code sent to your email
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    className="text-sm font-medium"
                    style={{ color: NEU_TOKENS.white60 }}
                  >
                    2FA Code
                  </Label>
                  <TwoFactorInput
                    value={twoFACode}
                    onChange={setTwoFACode}
                    error={error}
                    showHelpLink={false}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => {
                      setStep('confirm');
                      setTwoFACode('');
                      setError('');
                    }}
                    variant="outline"
                    className="h-11 flex-1 border-0"
                    style={raisedStyle}
                    disabled={withdrawMutation.isPending}
                  >
                    <span style={{ color: NEU_TOKENS.white60 }}>Back</span>
                  </Button>
                  <PrimaryButton
                    onClick={() => handleSubmit()}
                    disabled={
                      withdrawMutation.isPending ||
                      twoFACode.length !== 6 ||
                      emailOtp.length !== 6
                    }
                    loading={withdrawMutation.isPending}
                    className="h-11 flex-1"
                  >
                    {withdrawMutation.isPending ? 'Submitting…' : 'Confirm'}
                  </PrimaryButton>
                </div>
              </motion.div>
            </ModalBody>
          </>
        )}

        {step === 'submitting' && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <NovuntSpinner size="lg" />
            <p className="text-sm" style={{ color: NEU_TOKENS.white60 }}>
              Submitting withdrawal…
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="px-4 py-6 text-center sm:px-6 sm:py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="mx-auto inline-flex rounded-full p-6"
              style={raisedStyle}
            >
              <CheckCircle2
                className="size-12"
                style={{ color: NEU_TOKENS.accent }}
              />
            </motion.div>
            <h3
              className="mb-2 text-2xl font-bold"
              style={{ color: NEU_TOKENS.accent }}
            >
              Withdrawal submitted
            </h3>
            <p className="text-sm" style={{ color: NEU_TOKENS.white60 }}>
              ${fmt4(youReceive)} USDT · Pending approval (1–24 hours).
              You&apos;ll be notified when processed.
            </p>
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
        walletAddress={whitelistedAddress ?? ''}
        estimatedFees={fee}
        requires2FA={true}
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
