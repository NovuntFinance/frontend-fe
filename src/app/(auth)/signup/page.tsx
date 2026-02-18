'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  User,
  Gift,
  AlertCircle,
  Check,
  ArrowRight,
  ArrowLeft,
  AtSign,
} from 'lucide-react';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import PhoneInput, { getCountries } from 'react-phone-number-input';
import { parsePhoneNumber } from 'libphonenumber-js';
import '@/styles/phone-input.css';
import {
  signupSchema,
  type SignupFormData,
  calculatePasswordStrength,
} from '@/lib/validation';
import { useSignup } from '@/lib/mutations';
import { NeuField, NeuPasswordField } from '@/components/auth/NeuField';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { EmailExistsDialog } from '@/components/auth/EmailExistsDialog';
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from '@/components/auth/TurnstileWidget';
import { toast } from '@/components/ui/enhanced-toast';
import styles from '@/styles/auth.module.css';

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
  const turnstileRef = useRef<TurnstileWidgetHandle | null>(null);
  const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  const {
    register,
    control,
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
      phoneNumber: '',
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

  const handleNext = async () => {
    const valid = await trigger(getFieldsForStep(currentStep));
    if (valid) setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  };

  const handlePrevious = () => setCurrentStep((s) => Math.max(s - 1, 1));

  function getFieldsForStep(step: number): (keyof SignupFormData)[] {
    switch (step) {
      case 1:
        return ['email', 'password', 'confirmPassword'];
      case 2:
        return ['firstName', 'lastName', 'username', 'phoneNumber'];
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
      let countryCode = '';
      let nationalNumber = '';

      try {
        const phoneNumberObj = parsePhoneNumber(data.phoneNumber);
        if (phoneNumberObj?.isValid()) {
          countryCode = phoneNumberObj.countryCallingCode;
          nationalNumber = phoneNumberObj.nationalNumber;
        } else {
          const match = data.phoneNumber.match(/^\+?(\d{1,3})(.+)$/);
          if (match) {
            countryCode = match[1];
            nationalNumber = match[2].replace(/\D/g, '');
          }
        }
      } catch {
        const match = data.phoneNumber.match(/^\+?(\d{1,3})(.+)$/);
        if (match) {
          countryCode = match[1];
          nationalNumber = match[2].replace(/\D/g, '');
        }
      }

      const finalPhoneNumber =
        nationalNumber || data.phoneNumber.replace(/\D/g, '');
      if (!finalPhoneNumber || finalPhoneNumber.length < 5) {
        setError('phoneNumber', {
          type: 'manual',
          message: 'Please enter a valid phone number',
        });
        return;
      }

      const payload = {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        username: data.username.trim().toLowerCase(),
        phoneNumber: finalPhoneNumber,
        countryCode: countryCode ? `+${countryCode}` : '+1',
        ...(data.referralCode?.trim()
          ? { referralCode: data.referralCode.trim() }
          : {}),
      };

      const required = [
        'firstName',
        'lastName',
        'email',
        'username',
        'phoneNumber',
        'countryCode',
      ] as const;
      if (required.some((k) => !payload[k])) {
        toast.error('Validation Error', {
          description: 'Please fill in all required fields',
        });
        return;
      }

      const turnstileToken = turnstileRef.current?.getToken() ?? undefined;
      const finalPayload = {
        ...payload,
        ...(turnstileToken ? { turnstileToken } : {}),
      };

      await signupMutation.mutateAsync(finalPayload);

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'novunt_new_user',
          JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            timestamp: Date.now(),
          })
        );
      }
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      console.error('[Signup Error]', error);

      // Turnstile failure
      const err = error as {
        statusCode?: number;
        response?: { status?: number; data?: unknown };
        responseData?: unknown;
      };
      const statusCode = err.statusCode ?? err.response?.status;
      const responseData = err.response?.data ?? err.responseData;
      if (
        statusCode === 400 &&
        responseData &&
        typeof responseData === 'object' &&
        (responseData as { code?: string }).code === 'TURNSTILE_FAILED'
      ) {
        turnstileRef.current?.reset();
        const msg =
          (responseData as { message?: string }).message ??
          'Security check failed. Please try again.';
        setError('root', { message: msg });
        toast.error('Security check failed', { description: msg });
        return;
      }

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

      if (
        (errorResponse.field === 'phoneNumber' || msgLower.includes('phone')) &&
        (msgLower.includes('taken') || msgLower.includes('exists'))
      ) {
        setError('phoneNumber', {
          type: 'manual',
          message: 'This phone number is already registered.',
        });
        toast.error('Phone number already registered');
        return;
      }

      setError('root', { message });
      toast.error(message);
    }
  };

  const isLoading = isSubmitting || signupMutation.isPending;

  return (
    <div className="space-y-5">
      {/* ── Step Progress ── */}
      <div className={`${styles.neuStepBar} mb-5 flex items-center`}>
        {STEPS.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-1 flex-col items-center">
              <motion.div
                animate={{ scale: currentStep === step.id ? 1.05 : 1 }}
                transition={{ duration: 0.3 }}
                className={`${styles.neuStepCircle} ${currentStep === step.id ? styles.neuStepActive : ''} ${currentStep > step.id ? styles.neuStepComplete : ''}`}
              >
                {currentStep > step.id ? (
                  <Check
                    className={`h-4 w-4 text-white ${styles.neuStepCheckIcon}`}
                  />
                ) : (
                  step.id
                )}
              </motion.div>
              <p
                className={`${styles.neuStepLabel} ${currentStep >= step.id ? styles.neuStepLabelActive : ''} hidden sm:block`}
              >
                {step.title}
              </p>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={styles.neuStepConnector}>
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: currentStep > step.id ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className={`${styles.neuStepConnectorFill} ${currentStep === step.id + 1 ? styles.neuStepConnectorFillActive : ''}`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Root Error */}
      {errors.root && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.neuErrorAlert}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
          <span>{errors.root.message}</span>
        </motion.div>
      )}

      {/* ── Form Card ── */}
      <div className={`${styles.neuAuthCard} p-6 sm:p-8`}>
        <form onSubmit={handleSubmit(onSubmit)}>
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

                  {/* Phone — unique layout, stays inline */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                    className="space-y-1.5"
                  >
                    <div
                      className={`${styles.neuPhoneWrapper} ${errors.phoneNumber ? styles.neuInputError : ''}`}
                    >
                      <Controller
                        name="phoneNumber"
                        control={control}
                        render={({ field }) => (
                          <PhoneInput
                            id="phoneNumber"
                            placeholder="Phone Number"
                            value={field.value}
                            onChange={field.onChange}
                            countries={getCountries().filter((c) => c !== 'US')}
                            defaultCountry="GB"
                            international
                            countryCallingCodeEditable={false}
                            limitMaxLength
                            smartCaret
                            aria-label="Phone Number"
                          />
                        )}
                      />
                    </div>
                    {errors.phoneNumber?.message && (
                      <p className={styles.neuFieldError}>
                        {errors.phoneNumber.message}
                      </p>
                    )}
                    <p className={`text-xs ${styles.neuTextMuted}`}>
                      Required for account verification
                    </p>
                  </motion.div>
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
                    className={`${styles.neuTermsSurface} space-y-3`}
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

                  {turnstileEnabled && (
                    <TurnstileWidget widgetRef={turnstileRef} size="normal" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Navigation Buttons ── */}
          <div className="mt-8 flex gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className={`${styles.neuBtnBack} flex flex-1 items-center justify-center gap-2 py-3.5`}
              >
                <ArrowLeft
                  className="h-4 w-4"
                  style={{ color: 'var(--neu-text)' }}
                />
                <span
                  className="text-sm font-semibold tracking-wider uppercase"
                  style={{ color: 'var(--neu-text)' }}
                >
                  Back
                </span>
              </button>
            )}

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className={`${styles.neuBtnPrimary} flex flex-1 items-center justify-center gap-2 py-3.5`}
              >
                <span className="text-sm font-bold tracking-wider text-white uppercase">
                  Continue
                </span>
                <ArrowRight className="h-4 w-4 text-white" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className={`${styles.neuBtnSuccess} flex flex-1 items-center justify-center gap-2 py-3.5 ${isLoading ? styles.neuBtnDisabled : ''}`}
              >
                {isLoading && <NovuntSpinner size="sm" className="mr-1" />}
                <span className="text-sm font-bold tracking-wider text-white uppercase">
                  Create Account
                </span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Sign In Link */}
      <div className={`${styles.neuBottomLink} text-sm`}>
        <span className={styles.neuTextMuted}>Already have an account? </span>
        <Link href="/login" className={styles.neuLink}>
          Sign in
        </Link>
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
