'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { TwoFactorInput } from '@/components/auth/TwoFactorInput';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import {
  useRequestPasswordReset,
  useResetPassword,
  useVerifyResetOtp,
} from '@/lib/mutations';
import { calculatePasswordStrength } from '@/lib/validation';
import styles from '@/styles/auth.module.css';

type ResetStep = 'code' | 'password' | 'success';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

interface ParsedApiError {
  status?: number;
  code?: string;
  message?: string;
}

function parseApiError(error: unknown): ParsedApiError {
  const err = error as {
    statusCode?: number;
    code?: string;
    message?: string;
    response?: {
      status?: number;
      data?: {
        code?: string;
        error?: string;
        message?: string;
      };
    };
    responseData?: {
      code?: string;
      error?: string;
      message?: string;
    };
  };

  const responseData = err?.response?.data || err?.responseData;
  const code = responseData?.code || responseData?.error || err?.code;

  return {
    status: err?.statusCode || err?.response?.status,
    code,
    message: responseData?.message || err?.message,
  };
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const verifyResetOtpMutation = useVerifyResetOtp();
  const resetPasswordMutation = useResetPassword();
  const requestPasswordResetMutation = useRequestPasswordReset();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<ResetStep>('code');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [supportLocked, setSupportLocked] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendTimer <= 0) return undefined;

    const timer = setTimeout(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendTimer]);

  const strength = useMemo(() => {
    if (!newPassword) {
      return null;
    }
    return calculatePasswordStrength(newPassword);
  }, [newPassword]);

  const requirements = useMemo(
    () => [
      {
        label: 'At least 8 characters',
        met: newPassword.length >= 8,
      },
      {
        label: 'At least one uppercase letter (A-Z)',
        met: /[A-Z]/.test(newPassword),
      },
      {
        label: 'At least one lowercase letter (a-z)',
        met: /[a-z]/.test(newPassword),
      },
      {
        label: 'At least one digit (0-9)',
        met: /\d/.test(newPassword),
      },
      {
        label: 'At least one special character',
        met: /[\W_]/.test(newPassword),
      },
    ],
    [newPassword]
  );

  const handleVerifyCode = async (completedOtp?: string) => {
    setErrorMessage(null);

    const otpToUse = completedOtp ?? otp;

    if (!email.trim()) {
      setErrorMessage('Email is required.');
      return;
    }

    if (!/^\d{6}$/.test(otpToUse)) {
      setErrorMessage('Please enter a valid 6-digit code.');
      return;
    }

    try {
      const response = await verifyResetOtpMutation.mutateAsync({
        email: email.trim(),
        otp: otpToUse,
      });

      // Extract resetToken from response (handles nested API response shapes)
      const res = response as unknown as Record<string, unknown>;
      const data = (res?.data ?? res) as Record<string, unknown>;
      const innerData = (data?.data ?? data) as Record<string, unknown>;
      const token =
        (innerData?.resetToken as string) ||
        (data?.resetToken as string) ||
        (res?.resetToken as string) ||
        '';

      if (!token) {
        setErrorMessage(
          'Verification succeeded but no reset token was returned.'
        );
        return;
      }

      setResetToken(token);
      setOtp(otpToUse);
      setStep('password');
      setSupportLocked(false);
    } catch (error: unknown) {
      const parsed = parseApiError(error);

      if (parsed.status === 403) {
        setErrorMessage(
          parsed.message || 'Invalid or expired verification code.'
        );
        return;
      }

      if (parsed.status === 429) {
        setErrorMessage('Too many attempts. Please wait and try again.');
        return;
      }

      setErrorMessage(parsed.message || 'Failed to verify the code.');
    }
  };

  const handleResendCode = async () => {
    if (
      !email.trim() ||
      resendTimer > 0 ||
      requestPasswordResetMutation.isPending
    ) {
      return;
    }

    setErrorMessage(null);

    try {
      await requestPasswordResetMutation.mutateAsync({ email: email.trim() });
      setResendTimer(60);
    } catch (error: unknown) {
      const parsed = parseApiError(error);
      if (parsed.status === 429) {
        setErrorMessage('Too many requests, please wait and try again.');
        return;
      }
      setErrorMessage(parsed.message || 'Failed to resend the code.');
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage(null);

    if (!resetToken) {
      setStep('code');
      setOtp('');
      setErrorMessage('Your session expired. Please verify the code again.');
      return;
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      setErrorMessage('Password does not meet the required criteria.');
      return;
    }

    if (confirmPassword !== newPassword) {
      setErrorMessage("Passwords don't match.");
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        resetToken,
        newPassword,
      });

      setStep('success');
      setTimeout(() => {
        router.push('/login?reset=true');
      }, 1500);
    } catch (error: unknown) {
      const parsed = parseApiError(error);

      if (parsed.status === 403) {
        setStep('code');
        setOtp('');
        setResetToken('');
        setErrorMessage('Reset token expired. Please verify the code again.');
        return;
      }

      if (parsed.status === 429) {
        setErrorMessage('Too many requests, please wait and try again.');
        return;
      }

      setErrorMessage(parsed.message || 'Failed to reset password.');
    }
  };

  if (step === 'success') {
    return (
      <div className="space-y-6">
        <div className="space-y-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20"
          >
            <CheckCircle2 className="h-8 w-8 text-green-400" />
          </motion.div>
          <div className="space-y-2">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--neu-text)' }}
            >
              Password Updated
            </h1>
            <p className={styles.neuTextSecondary}>
              Your password has been reset successfully. Redirecting to login...
            </p>
          </div>
        </div>
        <Link
          href="/login"
          className={`${styles.neuBtnPrimary} flex w-full items-center justify-center gap-2 rounded-xl py-3 no-underline`}
        >
          <span className="text-sm font-bold tracking-wider text-white uppercase">
            Back to Log In
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2 text-center">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: 'var(--neu-text)' }}
        >
          {step === 'code' ? 'Reset Your Password' : 'Set New Password'}
        </h1>
        <p className={styles.neuTextSecondary}>
          {step === 'code'
            ? 'Step 1 of 2: Enter the 6-digit code from your email'
            : 'Step 2 of 2: Create your new password'}
        </p>
      </div>

      {errorMessage && (
        <div className={styles.neuErrorAlert}>
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className={`${styles.neuAuthCard} space-y-5 p-6 sm:p-8`}>
        {step === 'code' && (
          <>
            <div className="space-y-2">
              <label
                htmlFor="reset-email"
                className={`text-sm font-medium ${styles.neuLabel}`}
              >
                Email address
              </label>
              <div className={styles.neuInputIconWrap}>
                <Mail className={styles.neuInputIcon} />
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.neuInput}
                  autoComplete="email"
                  placeholder="Email address"
                  disabled={supportLocked}
                />
              </div>
            </div>

            <TwoFactorInput
              value={otp}
              onChange={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
              onComplete={(completedCode) => {
                if (!verifyResetOtpMutation.isPending && !supportLocked) {
                  void handleVerifyCode(completedCode);
                }
              }}
              disabled={supportLocked || verifyResetOtpMutation.isPending}
              showHelpLink={false}
            />

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleVerifyCode()}
                disabled={
                  supportLocked ||
                  verifyResetOtpMutation.isPending ||
                  otp.length !== 6
                }
                className={`${styles.neuBtnPrimary} flex w-full items-center justify-center gap-2 rounded-xl py-3 ${supportLocked || verifyResetOtpMutation.isPending || otp.length !== 6 ? styles.neuBtnDisabled : ''}`}
              >
                {verifyResetOtpMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                )}
                <span className="text-sm font-bold tracking-wider text-white uppercase">
                  Verify Code
                </span>
                <ArrowRight className="h-4 w-4 text-white" />
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={
                  supportLocked ||
                  resendTimer > 0 ||
                  requestPasswordResetMutation.isPending
                }
                className={`${styles.neuBtnBack} flex w-full items-center justify-center gap-2 rounded-xl py-3 ${
                  supportLocked ||
                  resendTimer > 0 ||
                  requestPasswordResetMutation.isPending
                    ? styles.neuBtnDisabled
                    : ''
                }`}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm font-semibold">
                  {requestPasswordResetMutation.isPending
                    ? 'Sending...'
                    : resendTimer > 0
                      ? `Resend code (${resendTimer}s)`
                      : 'Resend code'}
                </span>
              </button>
            </div>
          </>
        )}

        {step === 'password' && (
          <>
            <div className="space-y-2">
              <label
                htmlFor="new-password"
                className={`text-sm font-medium ${styles.neuLabel}`}
              >
                New password
              </label>
              <div className={styles.neuInputIconWrap}>
                <Lock className={styles.neuInputIcon} />
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.neuInput}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                />
              </div>
            </div>

            {strength && <PasswordStrengthIndicator strength={strength} />}

            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className={`text-sm font-medium ${styles.neuLabel}`}
              >
                Confirm new password
              </label>
              <div className={styles.neuInputIconWrap}>
                <Lock className={styles.neuInputIcon} />
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.neuInput}
                  autoComplete="new-password"
                  placeholder="Confirm your new password"
                />
              </div>
            </div>

            <div className={styles.neuTermsSurface}>
              <p className={`mb-2 text-sm font-medium ${styles.neuLabel}`}>
                Password requirements
              </p>
              <ul className={`space-y-1 text-sm ${styles.neuTextSecondary}`}>
                {requirements.map((item) => (
                  <li key={item.label}>
                    {item.met ? 'OK' : '-'} {item.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetPasswordMutation.isPending}
                className={`${styles.neuBtnSuccess} flex w-full items-center justify-center gap-2 rounded-xl py-3 ${resetPasswordMutation.isPending ? styles.neuBtnDisabled : ''}`}
              >
                {resetPasswordMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                )}
                <span className="text-sm font-bold tracking-wider text-white uppercase">
                  Reset Password
                </span>
                <ArrowRight className="h-4 w-4 text-white" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('code');
                  setErrorMessage(null);
                }}
                className={`${styles.neuBtnBack} flex w-full items-center justify-center rounded-xl py-3`}
              >
                Back to Code Entry
              </button>
            </div>
          </>
        )}
      </div>

      <div className={`${styles.neuBottomLink} text-sm`}>
        <span className={styles.neuTextMuted}>Remember your password? </span>
        <Link href="/login" className={styles.neuLink}>
          Log in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
