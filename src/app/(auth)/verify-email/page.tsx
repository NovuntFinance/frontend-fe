'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import { verifyEmailSchema, type VerifyEmailFormData } from '@/lib/validation';
import { useCompleteRegistration, useResendVerification } from '@/lib/mutations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TwoFactorInput } from '@/components/auth/TwoFactorInput';

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
        message: 'Email address is required. Please register again or check the verification link.',
      });
    }
  }, [email, setError]);

  const handleVerify = useCallback(
    async (code: string) => {
      // Prevent multiple simultaneous verification attempts
      if (completeRegistrationMutation.isPending) {
        console.log('[VerifyEmail] Verification already in progress, skipping...');
        return;
      }

      // Validate email is present
      if (!email || email.trim() === '') {
        console.error('[VerifyEmail] Email is missing from URL parameters');
        setError('root', {
          message: 'Email address is required. Please register again or check the verification link.',
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

      console.log('[VerifyEmail] Completing registration:', { email, code, codeLength: code.length });
      
      try {
        // Backend expects: { email, verificationCode }
        const result = await completeRegistrationMutation.mutateAsync({ 
          email: email.trim(), 
          verificationCode: code 
        });
        console.log('[VerifyEmail] Registration complete:', result);
        // Redirect handled in useEffect on success
      } catch (error: unknown) {
        console.error('[VerifyEmail] Verification failed:', error);
        
        const message =
          error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string'
            ? (error as { message: string }).message
            : 'Invalid verification code';
        
        // Check if email is already verified
        if (message.toLowerCase().includes('already verified')) {
          console.log('[VerifyEmail] Email already verified, redirecting to login...');
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
      console.log('[VerifyEmail] Email already verified on mount, redirecting...');
      setTimeout(() => {
        router.push('/login?verified=true&message=Email already verified');
      }, 2000);
    }
  }, [errors.root?.message, router]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
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
        error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string'
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
    if (completeRegistrationMutation.isSuccess) {
      // Get response data to check for nextStep and requiresLogin
      const response = completeRegistrationMutation.data;
      let redirectPath = '/login?verified=true';
      
      // Check if backend specified a nextStep
      if (response) {
        const responseData = (response as any)?.data || response;
        const nextStep = responseData?.nextStep;
        const requiresLogin = responseData?.requiresLogin;
        
        if (nextStep) {
          redirectPath = nextStep === '/login' 
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
      
      // Always redirect to login (backend requires manual login)
      const timer = setTimeout(() => {
        router.push(redirectPath);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [completeRegistrationMutation.isSuccess, completeRegistrationMutation.data, router]);

  // If verification is successful
  if (completeRegistrationMutation.isSuccess) {
    return (
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center"
        >
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Email Verified!</h1>
          <p className="text-muted-foreground">
            Your email has been successfully verified. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Verify your email</h1>
        <p className="text-muted-foreground">
          We&apos;ve sent a 6-digit verification code to
          <br />
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      {/* Error Alert */}
      {errors.root && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      {/* Resend Success Alert */}
      {resendMutation.isSuccess && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Verification code resent successfully! Check your email.
          </AlertDescription>
        </Alert>
      )}

      {/* Verification Form */}
      <Card className="shadow-2xl border-border/50 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="text-2xl">Enter Verification Code</CardTitle>
          <CardDescription>
            Please enter the 6-digit code we sent to your email
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="relative z-10">
            <TwoFactorInput
              value={verificationCode}
              onChange={setVerificationCode}
              disabled={isSubmitting || completeRegistrationMutation.isPending}
            />
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 relative z-10 pt-8">
            {/* Verify Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
              disabled={verificationCode.length !== 6 || isSubmitting || completeRegistrationMutation.isPending}
            >
              {(isSubmitting || completeRegistrationMutation.isPending) && (
                <NovuntSpinner size="sm" className="mr-2" />
              )}
              Verify Email
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {/* Resend Button */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Didn&apos;t receive the code? </span>
              <Button
                type="button"
                variant="link"
                className="px-0 font-semibold h-auto"
                onClick={handleResend}
                disabled={!canResend || resendMutation.isPending}
              >
                {resendMutation.isPending ? (
                  <>
                    <NovuntSpinner size="sm" className="mr-2" />
                    Sending...
                  </>
                ) : canResend ? (
                  'Resend code'
                ) : (
                  `Resend code (${resendTimer}s)`
                )}
              </Button>
            </div>

            {/* Change Email Link */}
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => router.push('/signup')}
            >
              Use a different email
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Help Text */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>Check your spam folder if you don&apos;t see the email</p>
        <p>The code will expire in 15 minutes</p>
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
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <NovuntSpinner size="lg" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
