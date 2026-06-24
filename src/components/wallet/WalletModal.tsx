'use client';

/**
 * Wallet Modal – Withdrawal Whitelist
 * Single entry: clicking the featured "Wallet" button opens this modal.
 * Flow A: No withdrawal address set → setup form (Destination Address + 2FA + Confirm & Save).
 * Flow B: Address already set → show address + copy, option to modify (72h/48h moratorium on change).
 * Uses platform neumorphic modal template (BaseModal, ModalHeader, ModalBody, ModalFooter).
 */

import React, { useState, useEffect } from 'react';
import {
  Check,
  Copy,
  CheckCircle2,
  Clock,
  Edit,
  Loader2,
  Info,
  ExternalLink,
} from 'lucide-react';
import {
  useDefaultWithdrawalAddress,
  useSetDefaultWithdrawalAddress,
  useRequestAddressChangeOtp,
} from '@/hooks/useWallet';
import { useOtpCooldown } from '@/hooks/useOtpCooldown';
import { toast } from '@/components/ui/enhanced-toast';
import { copyToClipboard } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  BaseModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  PrimaryButton,
  SecondaryButton,
} from '@/components/neumorphic-modal';
import {
  NEU_TOKENS,
  neuInset,
  neuRadius,
} from '@/components/neumorphic-modal/tokens';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const insetStyle: React.CSSProperties = {
  background: NEU_TOKENS.bg,
  boxShadow: neuInset,
  border: `1px solid ${NEU_TOKENS.border}`,
  borderRadius: neuRadius.md,
};

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { data: addressData, isLoading } = useDefaultWithdrawalAddress();
  const { mutate: setAddress, isPending } = useSetDefaultWithdrawalAddress();
  const requestOtp = useRequestAddressChangeOtp();
  const otpCooldown = useOtpCooldown();

  const [isEditing, setIsEditing] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const savedAddress =
    addressData?.address ??
    (addressData as { data?: { address?: string } })?.data?.address ??
    '';
  const hasAddress = savedAddress.length > 0;
  const moratorium = addressData?.moratorium;
  const canChange = addressData?.canChange && !moratorium?.active;

  useEffect(() => {
    const addr =
      addressData?.address ??
      (addressData as { data?: { address?: string } })?.data?.address;
    if (addr) setNewAddress(addr);
  }, [addressData]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setTwoFACode('');
      setEmailOtp('');
      setOtpSent(false);
      otpCooldown.resetCooldown();
      if (savedAddress) setNewAddress(savedAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, savedAddress]);

  const handleRequestOtp = async () => {
    try {
      await requestOtp.mutateAsync(undefined);
      setOtpSent(true);
      otpCooldown.triggerCooldown({ waitSeconds: 60 });
    } catch (err) {
      const handled = otpCooldown.triggerCooldown(err);
      if (!handled) {
        toast.error('Failed to send verification code');
      }
    }
  };

  const handleCopy = () => {
    if (savedAddress) {
      copyToClipboard(savedAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Address copied to clipboard');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.startsWith('0x') || newAddress.length < 42) {
      toast.error('Invalid BEP20 Address', {
        description:
          'Please enter a valid Binance Smart Chain (BEP20) address starting with 0x.',
      });
      return;
    }
    const code = twoFACode?.trim();
    if (!code || code.length !== 6) {
      toast.error('2FA code required', {
        description:
          'Please enter your 6-digit verification code from your authenticator app.',
      });
      return;
    }
    if (hasAddress && emailOtp.length !== 6) {
      toast.error('Email code required', {
        description:
          'Please request an email verification code and enter it before updating your address.',
      });
      return;
    }
    setAddress(
      {
        address: newAddress,
        network: 'BEP20',
        twoFactorCode: code,
        ...(hasAddress ? { emailOtp } : {}),
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setTwoFACode('');
          setEmailOtp('');
          setOtpSent(false);
          otpCooldown.resetCooldown();
        },
      }
    );
  };

  const handleClose = () => {
    if (!isPending) onClose();
  };

  const showForm = !hasAddress || isEditing;

  if (isLoading) {
    return (
      <BaseModal isOpen={isOpen} onClose={onClose}>
        <div
          className="flex min-h-[200px] items-center justify-center"
          style={{ color: NEU_TOKENS.accent }}
        >
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} preventClose={isPending}>
      <ModalHeader
        title="Withdrawal Whitelist"
        subtitle={
          hasAddress
            ? 'Your saved withdrawal address. Changing it triggers a security hold.'
            : 'Set your BEP20 address to enable withdrawals.'
        }
        onClose={handleClose}
        disableClose={isPending}
      />
      <ModalBody>
        {moratorium?.active && (
          <div
            className="flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs"
            style={{
              borderColor: 'rgba(0,155,242,0.2)',
              background: 'rgba(0,155,242,0.08)',
              color: NEU_TOKENS.accent,
            }}
          >
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <span className="font-semibold">Security hold active.</span>{' '}
              Address changed recently. Withdrawals locked for{' '}
              {moratorium.moratoriumDurationHours ?? 72}h. Remaining:{' '}
              {moratorium.hoursRemaining}h {moratorium.minutesRemaining}m
            </div>
          </div>
        )}

        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="wallet-modal-address"
                className="text-xs font-medium tracking-wider uppercase"
                style={{ color: NEU_TOKENS.white60 }}
              >
                Destination Address
              </Label>
              <div className="relative">
                <span
                  className="absolute top-1/2 left-3 -translate-y-1/2"
                  style={{ color: NEU_TOKENS.white40 }}
                >
                  <ExternalLink className="h-4 w-4" />
                </span>
                <Input
                  id="wallet-modal-address"
                  type="text"
                  placeholder="Enter wallet address (0x...)"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className={cn(
                    'neu-input h-11 w-full border-0 pl-10 text-sm focus-visible:ring-0'
                  )}
                  style={insetStyle}
                />
              </div>
            </div>

            {/* Email OTP — required only when changing an existing address */}
            {hasAddress && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="wallet-modal-email-otp"
                  className="text-xs font-medium tracking-wider uppercase"
                  style={{ color: NEU_TOKENS.white60 }}
                >
                  Email Verification Code
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="wallet-modal-email-otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="6-digit code"
                    value={emailOtp}
                    onChange={(e) =>
                      setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    maxLength={6}
                    className="neu-input h-11 w-32 border-0 text-center font-mono text-sm tracking-widest focus-visible:ring-0"
                    style={insetStyle}
                  />
                  <button
                    type="button"
                    disabled={requestOtp.isPending || otpCooldown.isOnCooldown}
                    onClick={handleRequestOtp}
                    className="rounded-xl px-3 py-2 text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{
                      background: NEU_TOKENS.bg,
                      color: NEU_TOKENS.accent,
                      border: `1px solid ${NEU_TOKENS.border}`,
                    }}
                  >
                    {requestOtp.isPending
                      ? 'Sending...'
                      : otpCooldown.isOnCooldown
                        ? `Resend in ${otpCooldown.cooldownSeconds}s`
                        : otpSent
                          ? 'Resend Code'
                          : 'Send Code'}
                  </button>
                </div>
                {otpSent && (
                  <p className="text-xs" style={{ color: NEU_TOKENS.white60 }}>
                    Code sent to your email
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="wallet-modal-2fa"
                className="text-xs font-medium tracking-wider uppercase"
                style={{ color: NEU_TOKENS.white60 }}
              >
                2FA Verification Code
              </Label>
              <Input
                id="wallet-modal-2fa"
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                value={twoFACode}
                onChange={(e) =>
                  setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                maxLength={6}
                className="neu-input h-11 w-full border-0 text-sm focus-visible:ring-0"
                style={insetStyle}
              />
            </div>

            <ModalFooter className="pt-2">
              <PrimaryButton
                type="submit"
                disabled={
                  isPending ||
                  !newAddress ||
                  (twoFACode?.trim()?.length ?? 0) !== 6
                }
                loading={isPending}
              >
                {hasAddress ? 'Update Address' : 'Confirm & Save Address'}
              </PrimaryButton>
              {hasAddress && (
                <SecondaryButton
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setNewAddress(savedAddress);
                  }}
                  disabled={isPending}
                >
                  Cancel
                </SecondaryButton>
              )}
            </ModalFooter>
          </form>
        ) : (
          <>
            <div className="rounded-xl p-4" style={insetStyle}>
              <p
                className="mb-2 text-xs font-medium tracking-wider uppercase"
                style={{ color: NEU_TOKENS.white60 }}
              >
                Saved Address
              </p>
              <div className="flex items-center justify-between gap-3">
                <code
                  className="min-w-0 flex-1 font-mono text-sm break-all"
                  style={{ color: NEU_TOKENS.accent }}
                >
                  {savedAddress}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neu-focus-ring)]"
                  style={{
                    background: NEU_TOKENS.bg,
                    boxShadow: neuInset,
                    border: `1px solid ${NEU_TOKENS.border}`,
                    color: NEU_TOKENS.accent,
                  }}
                  aria-label="Copy address"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div
                className="mt-2 flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: NEU_TOKENS.accent }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                VERIFIED BEP20
              </div>
            </div>

            <div
              className="flex items-start gap-2 rounded-xl p-3 text-xs"
              style={{ color: NEU_TOKENS.white60 }}
            >
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              Changing your withdrawal address triggers a{' '}
              {moratorium?.moratoriumDurationHours ?? 72}-hour security hold
              when withdrawals are disabled for your protection.
            </div>

            {canChange && (
              <ModalFooter className="pt-2">
                <SecondaryButton
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Modify Address
                </SecondaryButton>
              </ModalFooter>
            )}
          </>
        )}
      </ModalBody>
    </BaseModal>
  );
}
