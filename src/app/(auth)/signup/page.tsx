'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  User,
  Gift,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  AtSign,
} from 'lucide-react';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import {
  signupSchema,
  type SignupFormData,
  calculatePasswordStrength,
} from '@/lib/validation';
import { useSignup } from '@/lib/mutations';
import { NeuField, NeuPasswordField } from '@/components/auth/NeuField';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { EmailExistsDialog } from '@/components/auth/EmailExistsDialog';
// Turnstile disabled for signup - import removed
import { toast } from '@/components/ui/enhanced-toast';
import styles from '@/styles/auth.module.css';
import { useAuthFooter } from '@/contexts/AuthFooterContext';
import onboardingStyles from '@/styles/onboarding.module.css';

// Disable static generation
export const dynamic = 'force-dynamic';

const STEPS = [
  { id: 1, title: 'Account Details', description: 'Set up your credentials' },
  { id: 2, title: 'Personal Info', description: 'Tell us about yourself' },
  { id: 3, title: 'Referral & Terms', description: 'Almost there!' },
];

/**
 * Signup Page Component (wrapped in Suspense)
 * Multi-step registration form with neumorphic design
 */
function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signupMutation = useSignup();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailExistsDialog, setEmailExistsDialog] = useState({
    open: false,
    email: '',
    canResetPassword: false,
  });
  // Turnstile disabled for signup - removed all Turnstile-related code

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
      referralCode: '',
      acceptedTerms: false,
    },
  });

  // Auto-populate referral code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref')?.trim();
    if (!refCode) return;

    const currentValue = watch('referralCode');
    if (!currentValue || currentValue === refCode) {
      setValue('referralCode', refCode, { shouldValidate: false });

      if (!sessionStorage.getItem('referralCodeToastShown')) {
        toast.success('Referral code applied!', {
          description: `Code ${refCode} — your referrer earns bonus rewards on signup.`,
        });
        sessionStorage.setItem('referralCodeToastShown', 'true');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setValue]);

  const password = watch('password');
  const passwordStrength = password
    ? calculatePasswordStrength(password)
    : null;

  const handleNext = useCallback(async () => {
    const valid = await trigger(getFieldsForStep(currentStep));
    if (valid) setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  }, [currentStep, trigger]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }, []);

  function getFieldsForStep(step: number): (keyof SignupFormData)[] {
    switch (step) {
      case 1:
        return ['email', 'password', 'confirmPassword'];
      case 2:
        return ['firstName', 'lastName', 'username'];
      case 3:
        return ['referralCode', 'acceptedTerms'];
      default:
        return [];
    }
  }

  const closeEmailDialog = () =>
    setEmailExistsDialog({ open: false, email: '', canResetPassword: false });

  // Handle form submission
  const onSubmit = async (data: SignupFormData) => {
    try {
      const payload = {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        username: data.username.trim().toLowerCase(),
        ...(data.referralCode?.trim()
          ? { referralCode: data.referralCode.trim() }
          : {}),
      };

      const required = [
        'firstName',
        'lastName',
        'email',
        'username',
      ] as const;
      if (
        required.some(
          (k) => !(payload as Record<string, unknown>)[k]
        )
      ) {
        toast.error('Validation Error', {
          description: 'Please fill in all required fields',
        });
        return;
      }

      // Turnstile disabled for signup - removed token
      console.log('[Signup] Sending payload:', {
        ...payload,
        password: '***',
        confirmPassword: '***',
      });

      await signupMutation.mutateAsync(payload);

      // Store user info for welcome modal after verification
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'novunt_new_user',
          JSON.stringify({
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            timestamp: Date.now(),
          })
        );
      }
      router.push(`/verify-email?email=${encodeURIComponent(payload.email)}`);
    } catch (error: unknown) {
      console.error('[Signup Error]', error);

      // Turnstile disabled for signup - removed error handling

      // Extract structured error
      let errorResponse: {
        message?: string;
        field?: string;
        action?: string;
        canResetPassword?: boolean;
      } = {};
      if (typeof error === 'object' && error !== null) {
        const e = error as {
          response?: { data?: unknown };
          message?: unknown;
          field?: string;
          action?: string;
          canResetPassword?: boolean;
        };
        if (e.field || e.action) {
          errorResponse = {
            message: typeof e.message === 'string' ? e.message : undefined,
            field: e.field,
            action: e.action,
            canResetPassword: e.canResetPassword,
          };
        } else if (e.response?.data && typeof e.response.data === 'object') {
          errorResponse = e.response.data as typeof errorResponse;
        } else if (typeof e.message === 'string') {
          errorResponse.message = e.message;
        }
      }

      const message = errorResponse.message || 'Failed to create account';
      const msgLower = message.toLowerCase();

      if (errorResponse.action === 'login' && errorResponse.field === 'email') {
        setEmailExistsDialog({
          open: true,
          email: data.email,
          canResetPassword: errorResponse.canResetPassword || false,
        });
        return;
      }

      if (
        (errorResponse.field === 'username' ||
          errorResponse.action === 'change_username' ||
          msgLower.includes('username')) &&
        (msgLower.includes('taken') || msgLower.includes('exists'))
      ) {
        setError('username', {
          type: 'manual',
          message: 'This username is already taken.',
        });
        toast.error('Username already taken');
        return;
      }

      setError('root', { message });
      toast.error(message);
    }
  };

  const isLoading = isSubmitting || signupMutation.isPending;
  const { setFooterContent } = useAuthFooter();

  // Set footer content (buttons and login link)
  React.useEffect(() => {
    setFooterContent(
      <>
        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className={`${styles.neuBtnBack} flex flex-1 items-center justify-center gap-2 rounded-xl py-5`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wider uppercase">
                Back
              </span>
            </button>
          )}

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className={`${styles.neuBtnPrimary} flex flex-1 items-center justify-center gap-2 rounded-xl py-5`}
            >
              <span className="text-sm font-bold tracking-wider text-white uppercase">
                Continue
              </span>
              <ArrowRight className="h-4 w-4 text-white" />
            </button>
          ) : (
            <button
              type="submit"
              form="signup-form"
              disabled={isLoading}
              className={`${styles.neuBtnSuccess} flex flex-1 items-center justify-center gap-2 rounded-xl py-5 ${isLoading ? styles.neuBtnDisabled : ''}`}
            >
              {isLoading && <NovuntSpinner size="sm" className="mr-1" />}
              <span className="text-sm font-bold tracking-wider text-white uppercase">
                Create Account
              </span>
            </button>
          )}
        </div>

        {/* Login Link */}
        <p className="pb-2 text-center">
          <span
            className="text-sm"
            style={{
              color: 'var(--neu-text-muted, rgba(226, 232, 240, 0.55))',
            }}
          >
            Already have an account?{' '}
          </span>
          <Link href="/login" className={onboardingStyles.loginLink}>
            Log in
          </Link>
        </p>
      </>
    );
    return () => setFooterContent(null);
  }, [currentStep, isLoading, setFooterContent, handlePrevious, handleNext]);

  return (
    <div className="w-full space-y-4">
      {/* Title */}
      <h1
        className="w-full text-center font-semibold tracking-tight whitespace-nowrap"
        style={{
          color: 'var(--neu-text, #e2e8f0)',
          fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
        }}
      >
        Welcome to Novunt — Start Growing Your Wealth
      </h1>

      {/* Root Error */}
      {errors.root && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${styles.neuErrorAlert} mb-2`}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
          <span>{errors.root.message}</span>
        </motion.div>
      )}

      {/* ── Form Card ── */}
      <div className={`${styles.neuAuthCard} p-5 sm:p-6`}>
        <form id="signup-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {/* ═══ Step 1 ═══ */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <NeuField
                    id="email"
                    label="Email Address"
                    icon={Mail}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={errors.email}
                    register={register}
                    registerName="email"
                    delay={0}
                  />
                  <NeuPasswordField
                    id="password"
                    label="Password"
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    error={errors.password}
                    register={register}
                    registerName="password"
                    delay={0.05}
                    showPassword={showPassword}
                    onToggle={() => setShowPassword((p) => !p)}
                    strengthIndicator={
                      password && passwordStrength ? (
                        <PasswordStrengthIndicator
                          strength={passwordStrength}
                        />
                      ) : null
                    }
                  />
                  <NeuPasswordField
                    id="confirmPassword"
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    error={errors.confirmPassword}
                    register={register}
                    registerName="confirmPassword"
                    delay={0.1}
                    showPassword={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((p) => !p)}
                  />
                </motion.div>
              )}

              {/* ═══ Step 2 ═══ */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <NeuField
                    id="username"
                    label="Username"
                    icon={AtSign}
                    placeholder="johndoe"
                    autoComplete="username"
                    error={errors.username}
                    register={register}
                    registerName="username"
                    delay={0}
                  />
                  <NeuField
                    id="firstName"
                    label="First Name"
                    icon={User}
                    placeholder="John"
                    autoComplete="given-name"
                    error={errors.firstName}
                    register={register}
                    registerName="firstName"
                    delay={0.05}
                  />
                  <NeuField
                    id="lastName"
                    label="Last Name"
                    icon={User}
                    placeholder="Doe"
                    autoComplete="family-name"
                    error={errors.lastName}
                    register={register}
                    registerName="lastName"
                    delay={0.1}
                  />
                </motion.div>
              )}

              {/* ═══ Step 3 ═══ */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <NeuField
                    id="referralCode"
                    label="Referral Code"
                    icon={Gift}
                    placeholder="Enter referral code"
                    error={errors.referralCode}
                    register={register}
                    registerName="referralCode"
                    delay={0}
                    hint={
                      searchParams.get('ref')
                        ? `Code "${searchParams.get('ref')}" applied — your referrer earns bonus rewards!`
                        : 'Have a code? Enter it to support your referrer.'
                    }
                  />

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.3 }}
                    className={`${styles.neuTermsSurface} space-y-4`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="acceptedTerms"
                        className={`${styles.neuCheckbox} mt-1`}
                        {...register('acceptedTerms')}
                      />
                      <label
                        htmlFor="acceptedTerms"
                        className={`cursor-pointer text-sm leading-relaxed ${styles.neuTextSecondary}`}
                      >
                        I agree to the{' '}
                        <Link href="/terms" className={styles.neuLink}>
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className={styles.neuLink}>
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                    {errors.acceptedTerms?.message && (
                      <p className={styles.neuFieldError}>
                        {errors.acceptedTerms.message}
                      </p>
                    )}
                  </motion.div>

                  {/* Turnstile disabled for signup - removed widget */}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>

      {/* Email Exists Dialog */}
      <EmailExistsDialog
        open={emailExistsDialog.open}
        onClose={closeEmailDialog}
        email={emailExistsDialog.email}
        canResetPassword={emailExistsDialog.canResetPassword}
        onLogin={() => {
          router.push(
            `/login?email=${encodeURIComponent(emailExistsDialog.email)}`
          );
          closeEmailDialog();
        }}
        onResetPassword={() => {
          router.push(
            `/forgot-password?email=${encodeURIComponent(emailExistsDialog.email)}`
          );
          closeEmailDialog();
        }}
      />
    </div>
  );
}

/**
 * Signup Page — wrapped with Suspense for useSearchParams
 */
export default function SignupPage() {
  return (
    <Suspense fallback={<NovuntSpinner size="lg" />}>
      <SignupPageContent />
    </Suspense>
  );
}
