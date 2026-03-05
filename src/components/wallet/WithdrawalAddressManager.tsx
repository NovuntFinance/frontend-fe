'use client';

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
import { TurnstileWidget } from '@/components/auth/TurnstileWidget';
import { toast } from '@/components/ui/enhanced-toast';
import { cn } from '@/lib/utils';
import { copyToClipboard } from '@/lib/utils';
import neuStyles from '@/styles/neumorphic.module.css';
import walletStyles from '@/styles/wallet-page.module.css';

const NEU_ACCENT = 'rgba(0,155,242,0.95)';
const NEU_MUTED = 'rgba(0,155,242,0.55)';

/**
 * Withdrawal Address Manager – Neumorphic wallet style
 * Mobile: Destination Address + 2FA + "Confirm & Save Address"
 * Desktop: Withdrawal Whitelist + "Enter wallet address (0x...)" + "Add Address"
 */
export function WithdrawalAddressManager() {
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
  const turnstileRef = React.useRef<{
    reset: () => void;
    getToken: () => string | null;
  }>(null);

  useEffect(() => {
    const addr =
      addressData?.address ??
      (addressData as { data?: { address?: string } })?.data?.address;
    if (addr) setNewAddress(addr);
  }, [addressData]);

  const handleCopy = () => {
    if (savedAddress) {
      copyToClipboard(savedAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Address copied to clipboard');
    }
  };

  const handleRequestOtp = async () => {
    try {
      const turnstileToken = turnstileRef.current?.getToken?.() || undefined;
      await requestOtp.mutateAsync(turnstileToken);
      setOtpSent(true);
      otpCooldown.triggerCooldown({ waitSeconds: 60 });
    } catch (err) {
      const handled = otpCooldown.triggerCooldown(err);
      if (!handled) {
        toast.error('Failed to send verification code');
      }
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
    const turnstileToken = turnstileRef.current?.getToken?.() || undefined;
    setAddress(
      {
        address: newAddress,
        network: 'BEP20',
        twoFACode: twoFACode || undefined,
        emailOtp: emailOtp || undefined,
        turnstileToken,
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

  if (isLoading) {
    return (
      <div
        className={`flex h-40 items-center justify-center rounded-[18px] ${neuStyles['neu-card']}`}
      >
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: 'var(--neu-accent)' }}
        />
      </div>
    );
  }

  const savedAddress =
    addressData?.address ??
    (addressData as { data?: { address?: string } })?.data?.address ??
    '';
  const hasAddress = savedAddress.length > 0;
  const moratorium = addressData?.moratorium;
  const canChange = addressData?.canChange && !moratorium?.active;

  const inputClass = cn(
    'w-full rounded-[16px] border px-4 py-3 text-sm transition-[box-shadow,border-color] duration-[250ms]',
    'bg-[var(--neu-bg)] text-[rgba(0,155,242,0.95)] placeholder:opacity-50',
    'focus:outline-none focus:ring-2 focus:ring-[var(--neu-focus-ring)]'
  );
  const inputStyle = {
    boxShadow: 'var(--neu-shadow-inset)',
    borderColor: 'var(--neu-border)',
  };

  return (
    <div className={`rounded-[18px] p-4 sm:p-6 ${neuStyles['neu-card']}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3
            className="text-base font-semibold sm:text-lg"
            style={{ color: NEU_ACCENT }}
          >
            Withdrawal Whitelist
          </h3>
          {hasAddress && !isEditing && (
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full"
              style={{
                background: 'var(--neu-accent)',
                color: 'var(--neu-bg)',
              }}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          )}
        </div>
        {hasAddress && !isEditing && (
          <button
            type="button"
            disabled={!canChange}
            onClick={() => setIsEditing(true)}
            className={cn(
              'flex items-center gap-1.5 rounded-[16px] px-2 py-1.5 text-xs font-medium transition-[box-shadow,opacity] duration-[250ms] hover:opacity-90 focus:ring-2 focus:ring-[var(--neu-focus-ring)] focus:outline-none active:shadow-[var(--neu-shadow-inset)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none'
            )}
            style={{
              color: 'var(--neu-accent)',
              background: 'var(--neu-bg)',
              boxShadow: 'var(--neu-shadow-raised)',
              border: '1px solid var(--neu-border)',
            }}
          >
            <Edit className="h-3.5 w-3.5" />
            Modify
          </button>
        )}
      </div>

      {moratorium?.active && (
        <div
          className="mb-4 flex items-start gap-2 rounded-[18px] border px-3 py-2 text-xs transition-[box-shadow] duration-[250ms]"
          style={{
            borderColor: 'rgba(0,155,242,0.2)',
            background: 'rgba(0,155,242,0.08)',
            color: 'rgba(0,155,242,0.95)',
          }}
        >
          <Clock className="h-4 w-4 shrink-0" />
          <div>
            <span className="font-semibold">Security Hold Active.</span> Address
            changed recently. Withdrawals locked for 72h. Remaining:{' '}
            {moratorium.hoursRemaining}h {moratorium.minutesRemaining}m
          </div>
        </div>
      )}

      {isEditing || !hasAddress ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              className={`block ${walletStyles.labelUppercase}`}
              style={{ color: NEU_MUTED }}
            >
              Destination Address
            </label>
            <div className="relative">
              <span
                className="absolute top-1/2 left-3 -translate-y-1/2"
                style={{ color: NEU_MUTED }}
              >
                <ExternalLink className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Enter wallet address (0x...)"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className={cn(inputClass, 'pl-10')}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Turnstile widget */}
          <TurnstileWidget widgetRef={turnstileRef} size="normal" />

          {/* Email OTP (required when modifying existing address) */}
          {hasAddress && (
            <div className="space-y-1.5">
              <label
                className={`block ${walletStyles.labelUppercase}`}
                style={{ color: NEU_MUTED }}
              >
                Email Verification Code
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="6-digit code"
                  value={emailOtp}
                  onChange={(e) =>
                    setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  maxLength={6}
                  className={cn(
                    inputClass,
                    'w-32 text-center font-mono tracking-widest'
                  )}
                  style={inputStyle}
                />
                <button
                  type="button"
                  disabled={requestOtp.isPending || otpCooldown.isOnCooldown}
                  onClick={handleRequestOtp}
                  className="rounded-[16px] px-3 py-2 text-xs font-medium transition-[box-shadow,opacity] duration-[250ms] hover:opacity-90 disabled:opacity-50"
                  style={{
                    background: 'var(--neu-bg)',
                    color: 'var(--neu-accent)',
                    boxShadow: 'var(--neu-shadow-raised)',
                    border: '1px solid var(--neu-border)',
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
                <p className="text-xs" style={{ color: NEU_MUTED }}>
                  Code sent to your email
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label
              className={`block ${walletStyles.labelUppercase}`}
              style={{ color: NEU_MUTED }}
            >
              2FA Verification Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit code"
              value={twoFACode}
              onChange={(e) =>
                setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              maxLength={6}
              className={inputClass}
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={isPending || !newAddress}
              className="flex flex-1 items-center justify-center gap-2 rounded-[18px] py-3 text-sm font-semibold transition-[box-shadow,transform,opacity] duration-[250ms] hover:opacity-90 focus:ring-2 focus:ring-[var(--neu-focus-ring)] focus:outline-none active:shadow-[var(--neu-shadow-inset)] disabled:opacity-50 disabled:shadow-none"
              style={{
                background: 'var(--neu-accent)',
                color: 'var(--neu-bg)',
                boxShadow: 'var(--neu-shadow-raised)',
              }}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {hasAddress ? 'Update Address' : 'Confirm & Save Address'}
            </button>
            {hasAddress && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setNewAddress(savedAddress);
                }}
                className="rounded-[18px] px-4 py-3 text-sm font-medium transition-[box-shadow,opacity] duration-[250ms] hover:opacity-90 focus:ring-2 focus:ring-[var(--neu-focus-ring)] focus:outline-none active:shadow-[var(--neu-shadow-inset)]"
                style={{
                  background: 'var(--neu-bg)',
                  color: 'var(--neu-accent)',
                  boxShadow: 'var(--neu-shadow-raised)',
                  border: '1px solid var(--neu-border)',
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div
            className="rounded-[18px] p-4"
            style={{
              background: 'var(--neu-bg)',
              boxShadow: 'var(--neu-shadow-inset)',
              border: '1px solid var(--neu-border)',
            }}
          >
            <p
              className={`mb-2 ${walletStyles.labelUppercase}`}
              style={{ color: NEU_MUTED }}
            >
              Saved Address
            </p>
            <div className="flex items-center justify-between gap-3">
              <code
                className="min-w-0 flex-1 font-mono text-sm break-all"
                style={{ color: NEU_ACCENT }}
              >
                {savedAddress}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 rounded-[16px] p-2 transition-[box-shadow,opacity] duration-[250ms] hover:opacity-80 focus:ring-2 focus:ring-[var(--neu-focus-ring)] focus:outline-none"
                style={{
                  background: 'var(--neu-bg)',
                  boxShadow: 'var(--neu-shadow-raised)',
                  color: 'var(--neu-accent)',
                }}
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
              style={{ color: 'rgba(0,155,242,0.9)' }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              VERIFIED BEP20
            </div>
          </div>
          <div
            className="flex items-start gap-2 rounded-[16px] p-3 text-xs"
            style={{ color: NEU_MUTED }}
          >
            <Info className="h-4 w-4 shrink-0" />
            Changing your withdrawal address triggers a 72-hour moratorium when
            withdrawals are disabled for your protection.
          </div>
        </div>
      )}
    </div>
  );
}
