'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import { verifyEmailSchema, type VerifyEmailFormData } from '@/lib/validation';
import {
  useCompleteRegistration,
  useResendVerification,
} from '@/lib/mutations';
import { TwoFactorInput } from '@/components/auth/TwoFactorInput';
import styles from '@/styles/auth.module.css';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  // Phase 1: Use completeRegistration to finish registration with verification code
  const completeRegistrationMutation = useCompleteRegistration();
  const resendMutation = useResendVerification();

  const [verificationCode, setVerificationCode] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email,
      code: '',
    },
  });

  // Check if email is missing on mount (after form is initialized)
  useEffect(() => {
    if (!email || email.trim() === '') {
      console.warn('[VerifyEmail] Email is missing from URL parameters');
      setError('root', {
        message:
          'Email address is required. Please register again or check the verification link.',
      });
    }
  }, [email, setError]);

  const handleVerify = useCallback(
    async (code: string) => {
      // Prevent multiple simultaneous verification attempts
      if (completeRegistrationMutation.isPending) {
        console.log(
          '[VerifyEmail] Verification already in progress, skipping...'
        );
        return;
      }

      // Validate email is present
      if (!email || email.trim() === '') {
        console.error('[VerifyEmail] Email is missing from URL parameters');
        setError('root', {
          message:
            'Email address is required. Please register again or check the verification link.',
        });
        return;
      }

      // Validate code is present
      if (!code || code.length !== 6) {
        console.error('[VerifyEmail] Invalid verification code:', code);
        setError('root', {
          message: 'Please enter a valid 6-digit verification code.',
        });
        return;
      }

      console.log('[VerifyEmail] Completing registration:', {
        email,
        code,
        codeLength: code.length,
      });

      try {
        // Backend expects: { email, verificationCode }
        const result = await completeRegistrationMutation.mutateAsync({
          email: email.trim(),
          verificationCode: code,
        });
        console.log('[VerifyEmail] Registration complete:', result);
        // Redirect handled in useEffect on success
      } catch (error: unknown) {
        console.error('[VerifyEmail] Verification failed:', error);

        const message =
          error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof (error as { message?: string }).message === 'string'
            ? (error as { message: string }).message
            : 'Invalid verification code';

        // Check if email is already verified
        if (message.toLowerCase().includes('already verified')) {
          console.log(
            '[VerifyEmail] Email already verified, redirecting to login...'
          );
          setTimeout(() => {
            router.push('/login?verified=true&message=Email already verified');
          }, 2000);
          return;
        }

        setError('root', {
          message,
        });
        setVerificationCode('');
      }
    },
    [email, router, setError, completeRegistrationMutation]
  );

  // Check if user is already verified on mount
  useEffect(() => {
    // If the error message in root contains "already verified", auto-redirect
    if (errors.root?.message?.toLowerCase().includes('already verified')) {
      console.log(
        '[VerifyEmail] Email already verified on mount, redirecting...'
      );
      setTimeout(() => {
        router.push('/login?verified=true&message=Email already verified');
      }, 2000);
    }
  }, [errors.root?.message, router]);

  // Countdown timer for resend button
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (resendTimer > 0) {
      timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [resendTimer]);

  // Auto-submit when code is complete
  useEffect(() => {
    if (verificationCode.length === 6) {
      handleVerify(verificationCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationCode]); // Only depend on verificationCode to avoid infinite loop

  // Handle resend verification
  const handleResend = async () => {
    if (!canResend) return;

    try {
      await resendMutation.mutateAsync({ email });
      setResendTimer(60);
      setCanResend(false);
      setVerificationCode('');
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message?: string }).message === 'string'
          ? (error as { message: string }).message
          : 'Failed to resend verification code';
      setError('root', {
        message,
      });
    }
  };

  // Handle form submission (if not auto-submitted)
  const onSubmit = async (data: VerifyEmailFormData) => {
    await handleVerify(data.code);
  };

  // Handle redirect after successful verification
  useEffect(() => {
    if (!completeRegistrationMutation.isSuccess) {
      return undefined;
    }

    // Get response data to check for nextStep and requiresLogin
    const response = completeRegistrationMutation.data;
    let redirectPath = '/login?verified=true';

    // Check if backend specified a nextStep
    if (response) {
      const responseData = (response as any)?.data || response;
      const nextStep = responseData?.nextStep;
      const requiresLogin = responseData?.requiresLogin;

      if (nextStep) {
        redirectPath =
          nextStep === '/login'
            ? '/login?verified=true'
            : `${nextStep}?verified=true`;
      }

      console.log('[VerifyEmail] Redirect info:', {
        nextStep,
        requiresLogin,
        redirectPath,
        emailVerified: responseData?.user?.emailVerified,
      });
    }

    const timer = setTimeout(() => {
      router.push(redirectPath);
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    completeRegistrationMutation.isSuccess,
    completeRegistrationMutation.data,
    router,
  ]);

  // If verification is successful
  if (completeRegistrationMutation.isSuccess) {
    return (
      <div className="space-y-6 text-center">
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
            Email Verified!
          </h1>
          <p className={styles.neuTextSecondary}>
            Your email has been successfully verified. Redirecting to login...
          </p>
        </div>
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
          Verify your email
        </h1>
        <p className={styles.neuTextSecondary}>
          We&apos;ve sent a 6-digit verification code to
          <br />
          <span className="font-medium" style={{ color: 'var(--neu-text)' }}>
            {email}
          </span>
        </p>
      </div>

      {errors.root && (
        <div className={styles.neuErrorAlert}>
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
          <span>{errors.root.message}</span>
        </div>
      )}

      {resendMutation.isSuccess && (
        <div
          className={styles.neuErrorAlert}
          style={{ borderColor: 'rgba(52, 211, 153, 0.3)', color: '#86efac' }}
        >
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>Verification code resent successfully! Check your email.</span>
        </div>
      )}

      <div className={`${styles.neuAuthCard} p-6 sm:p-8`}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TwoFactorInput
            value={verificationCode}
            onChange={setVerificationCode}
            disabled={isSubmitting || completeRegistrationMutation.isPending}
          />
          <div className="mt-6 flex flex-col gap-4">
            <button
              type="submit"
              className={`${styles.neuBtnPrimary} flex w-full items-center justify-center gap-2 py-3.5 ${verificationCode.length !== 6 || isSubmitting || completeRegistrationMutation.isPending ? styles.neuBtnDisabled : ''}`}
              disabled={
                verificationCode.length !== 6 ||
                isSubmitting ||
                completeRegistrationMutation.isPending
              }
            >
              {(isSubmitting || completeRegistrationMutation.isPending) && (
                <NovuntSpinner size="sm" className="mr-2" />
              )}
              <span className="text-sm font-bold tracking-wider text-white uppercase">
                Verify Email
              </span>
              <ArrowRight className="h-4 w-4 text-white" />
            </button>
            <div className="text-center text-sm">
              <span className={styles.neuTextMuted}>
                Didn&apos;t receive the code?{' '}
              </span>
              <button
                type="button"
                className={styles.neuLink}
                onClick={handleResend}
                disabled={!canResend || resendMutation.isPending}
              >
                {resendMutation.isPending ? (
                  <>
                    <NovuntSpinner size="sm" className="mr-1 inline" />
                    Sending...
                  </>
                ) : canResend ? (
                  'Resend code'
                ) : (
                  `Resend code (${resendTimer}s)`
                )}
              </button>
            </div>
            <button
              type="button"
              className={`${styles.neuBtnBack} w-full rounded-xl py-3`}
              onClick={() => router.push('/signup')}
            >
              Use a different email
            </button>
          </div>
        </form>
      </div>

      <div className={`${styles.neuBottomLink} text-sm`}>
        <p className={styles.neuTextMuted}>
          Check your spam folder if you don&apos;t see the email. Code expires
          in 15 minutes.
        </p>
      </div>
    </div>
  );
}

/**
 * Email Verification Page
 * Verify user email with 6-digit code
 */
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <NovuntSpinner size="lg" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
