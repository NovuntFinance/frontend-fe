'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User as UserIcon,
  Mail,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  AtSign,
  Key,
  Smartphone,
  Sun,
  Moon,
  Wallet,
  ArrowUpRight,
} from 'lucide-react';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import { useAuth } from '@/hooks/useAuth';
import {
  useChangePassword,
  useRequestChangePasswordOtp,
} from '@/lib/mutations';
import { useProfile } from '@/lib/queries';
import { useAuthStore } from '@/store/authStore';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/enhanced-toast';
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from '@/components/auth/TurnstileWidget';
import { passwordSchema } from '@/lib/validation';
import { useTheme } from 'next-themes';
import { useDefaultWithdrawalAddress } from '@/hooks/useWallet';
import { useUIStore } from '@/store/uiStore';

// Change password schema – 2FA is required for all users (default ON at registration, cannot be turned off)
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
    emailOtp: z
      .string()
      .min(1, 'Email OTP is required')
      .regex(/^\d{6}$/, 'Enter the 6-digit code from your email'),
    twoFACode: z
      .string()
      .min(1, '2FA code is required')
      .regex(/^\d{6}$/, '2FA code must be 6 digits'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout?: () => void;
}

export function ProfileEditModal({
  open,
  onOpenChange,
  onLogout,
}: ProfileEditModalProps) {
  const { user } = useAuth();
  const { updateUser } = useAuthStore();
  const { data: profileData } = useProfile();
  const changePasswordMutation = useChangePassword();
  const requestOtpMutation = useRequestChangePasswordOtp();
  const [activeTab, setActiveTab] = useState('personal');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [themeMounted, setThemeMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const turnstileRef = useRef<TurnstileWidgetHandle | null>(null);
  const { data: defaultWithdrawalAddress } = useDefaultWithdrawalAddress();
  const hasWhitelistedWallet =
    defaultWithdrawalAddress?.hasDefaultAddress ?? false;
  const { openModal } = useUIStore();

  // Change password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    setValue: setPasswordValue,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Update profile data
  useEffect(() => {
    if (profileData) {
      updateUser(profileData as Partial<import('@/types/user').User>);
    }
  }, [profileData, updateUser]);

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  const selectedTheme = theme ?? 'system';
  const appearanceOptions: Array<{
    value: 'system' | 'light' | 'dark';
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      value: 'system',
      label: 'System',
      description: 'Follow your device theme automatically.',
      icon: Smartphone,
    },
    {
      value: 'light',
      label: 'Light',
      description: 'Always use the light theme.',
      icon: Sun,
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Always use the dark theme.',
      icon: Moon,
    },
  ];

  const onSubmitPassword = async (data: ChangePasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmNewPassword,
        emailOtp: data.emailOtp,
        twoFACode: data.twoFACode,
      });
      resetPasswordForm();
      turnstileRef.current?.reset();
      setActiveTab('personal');
    } catch {
      // Error toast is shown by useChangePassword
    }
  };

  const handleSendOtp = () => {
    const turnstileToken = turnstileRef.current?.getToken() ?? undefined;
    if (!turnstileToken) {
      toast.error('Verification required', {
        description: 'Please complete the verification check above first.',
      });
      return;
    }
    requestOtpMutation.mutate(
      { turnstileToken },
      {
        onError: (error: unknown) => {
          const err = error as { response?: { data?: { code?: string } } };
          if (err?.response?.data?.code === 'TURNSTILE_FAILED') {
            turnstileRef.current?.reset();
          }
        },
      }
    );
  };

  if (!user) return null;

  const neuCardRaised = {
    background: 'var(--neu-modal-bg)',
    border: '1px solid var(--neu-border)',
    borderRadius: '1.5rem',
    boxShadow:
      '6px 6px 16px var(--neu-shadow-dark), -6px -6px 16px var(--neu-shadow-light), inset 1px 1px 0 rgba(255,255,255,0.03)',
  };
  const neuSectionInset = {
    background: 'var(--neu-bg)',
    border: '1px solid var(--neu-border)',
    borderRadius: '1rem',
    boxShadow: 'var(--neu-shadow-inset)',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-4 sm:max-w-xl sm:p-6 md:max-w-2xl"
        style={neuCardRaised}
      >
        <DialogHeader>
          <DialogTitle
            className="text-xl font-bold sm:text-2xl"
            style={{ color: 'var(--neu-text-primary)' }}
          >
            Edit Profile
          </DialogTitle>
          <DialogDescription
            className="text-sm sm:text-base"
            style={{ color: 'var(--neu-text-secondary)' }}
          >
            Update your personal information and account settings
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className="grid w-full grid-cols-3 rounded-xl p-1"
            style={neuSectionInset}
          >
            <TabsTrigger
              value="personal"
              className="data-[state=active]:bg-[rgba(var(--neu-accent-rgb),0.15)] data-[state=active]:text-[var(--neu-text-primary)]"
              style={{ color: 'var(--neu-text-secondary)' }}
            >
              Personal Info
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-[rgba(var(--neu-accent-rgb),0.15)] data-[state=active]:text-[var(--neu-text-primary)]"
              style={{ color: 'var(--neu-text-secondary)' }}
            >
              Security
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="data-[state=active]:bg-[rgba(var(--neu-accent-rgb),0.15)] data-[state=active]:text-[var(--neu-text-primary)]"
              style={{ color: 'var(--neu-text-secondary)' }}
            >
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="mt-6 space-y-6">
            {/* Read-only Account Information – neumorphic inset card */}
            <div className="space-y-4 rounded-xl p-4" style={neuSectionInset}>
              <h3 className="text-sm font-semibold text-[var(--neu-text-secondary)]">
                Account Information (Cannot be changed)
              </h3>

              {/* Full Name (Read-only) */}
              <div className="space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-[var(--neu-text-primary)]/90"
                >
                  Full Name
                </Label>
                <div className="relative">
                  <UserIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--neu-text-muted)]" />
                  <Input
                    id="fullName"
                    value={
                      user?.fullName ??
                      ([user?.firstName, user?.lastName]
                        .filter(Boolean)
                        .join(' ') ||
                        ((profileData as any)?.profile?.fullName ?? ''))
                    }
                    disabled
                    className="cursor-not-allowed border-[var(--neu-border)] bg-[rgba(var(--neu-accent-rgb),0.05)] pl-10 text-[var(--neu-text-primary)]/60 opacity-60"
                  />
                </div>
                <p className="text-xs text-[var(--neu-text-primary)]/60">
                  Full name is set during registration and cannot be changed
                </p>
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-[var(--neu-text-primary)]/90"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--neu-text-muted)]" />
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="cursor-not-allowed border-[var(--neu-border)] bg-[rgba(var(--neu-accent-rgb),0.05)] pl-10 text-[var(--neu-text-primary)]/60 opacity-60"
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  Email is your login credential and cannot be changed
                </p>
              </div>

              {/* Username (Read-only) */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-[var(--neu-text-primary)]/90"
                >
                  Username
                </Label>
                <div className="relative">
                  <AtSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--neu-text-muted)]" />
                  <Input
                    id="username"
                    value={user.username}
                    disabled
                    className="cursor-not-allowed border-[var(--neu-border)] bg-[rgba(var(--neu-accent-rgb),0.05)] pl-10 text-[var(--neu-text-primary)]/60 opacity-60"
                  />
                </div>
                <p className="text-xs text-[var(--neu-text-primary)]/60">
                  Username is permanent and cannot be changed
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <div className="rounded-xl p-4 sm:p-5" style={neuSectionInset}>
              {/* Wallet whitelist setup CTA */}
              {!hasWhitelistedWallet && (
                <div className="mb-6 space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <Wallet className="mt-0.5 h-5 w-5 text-amber-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                        Wallet setup required
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Whitelist your BEP20 withdrawal address to unlock
                        transfers and withdrawals.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onOpenChange(false);
                          openModal('wallet');
                        }}
                        className="mt-2 inline-flex items-center rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm transition hover:bg-amber-600"
                      >
                        Open wallet security
                        <ArrowUpRight className="ml-1 h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2FA Reset Pending Notice & Setup CTA */}
              {(user as any)?.twoFactorResetPending && (
                <div className="mb-6 space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <Smartphone className="mt-0.5 h-5 w-5 text-amber-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                        Your 2FA was reset by an administrator
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        For your security, please set up a new two-factor
                        authentication method using an authenticator app. Until
                        you complete setup, your account is protected only by
                        your password.
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          window.dispatchEvent(
                            new CustomEvent('openTwoFactorModal')
                          )
                        }
                        className="mt-2 inline-flex items-center rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm transition hover:bg-amber-600"
                      >
                        Set up 2FA now
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <form
                onSubmit={handlePasswordSubmit(onSubmitPassword)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--neu-text-primary)]">
                    Change Password
                  </h3>
                  <p className="text-sm text-[var(--neu-text-primary)]/60">
                    Enter your passwords first, then complete verification
                    below.
                  </p>
                </div>

                {/* Passwords – at the top */}
                <div className="space-y-2">
                  <Label
                    htmlFor="currentPassword"
                    className="text-[var(--neu-text-primary)]/90"
                  >
                    Current Password <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--neu-text-muted)]" />
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      {...registerPassword('currentPassword')}
                      className="border-[var(--neu-border)] bg-[rgba(var(--neu-accent-rgb),0.1)] pr-10 pl-10 text-[var(--neu-text-primary)] placeholder:text-[var(--neu-text-muted)] focus:border-[var(--neu-border)] focus:bg-[rgba(var(--neu-accent-rgb),0.12)]"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--neu-text-muted)] hover:text-[var(--neu-text-primary)]/80"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-red-400">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="text-[var(--neu-text-primary)]/90"
                  >
                    New Password <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--neu-text-muted)]" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      {...registerPassword('newPassword')}
                      className="border-[var(--neu-border)] bg-[rgba(var(--neu-accent-rgb),0.1)] pr-10 pl-10 text-[var(--neu-text-primary)] placeholder:text-[var(--neu-text-muted)] focus:border-[var(--neu-border)] focus:bg-[rgba(var(--neu-accent-rgb),0.12)]"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--neu-text-muted)] hover:text-[var(--neu-text-primary)]/80"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-400">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    Must be at least 8 characters with uppercase, lowercase,
                    number, and special character (@_$!%*?&)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmNewPassword"
                    className="text-[var(--neu-text-primary)]/90"
                  >
                    Confirm New Password <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--neu-text-muted)]" />
                    <Input
                      id="confirmNewPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...registerPassword('confirmNewPassword')}
                      className="border-[var(--neu-border)] bg-[rgba(var(--neu-accent-rgb),0.1)] pr-10 pl-10 text-[var(--neu-text-primary)] placeholder:text-[var(--neu-text-muted)] focus:border-[var(--neu-border)] focus:bg-[rgba(var(--neu-accent-rgb),0.12)]"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--neu-text-muted)] hover:text-[var(--neu-text-primary)]/80"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmNewPassword && (
                    <p className="text-sm text-red-400">
                      {passwordErrors.confirmNewPassword.message}
                    </p>
                  )}
                </div>

                {/* Verification – after passwords */}
                <div className="border-t border-[var(--neu-border)] pt-6">
                  <p className="mb-4 text-sm font-medium text-[var(--neu-text-primary)]">
                    Then complete verification (in order):
                  </p>
                </div>

                {/* 1. Turnstile */}
                <div className="space-y-2">
                  <Label className="text-[var(--neu-text-primary)]/90">
                    1. Verification <span className="text-red-400">*</span>
                  </Label>
                  <TurnstileWidget widgetRef={turnstileRef} size="normal" />
                  <p className="text-xs text-[var(--neu-text-primary)]/60">
                    Complete the check above, then request your email code.
                  </p>
                </div>

                {/* 2. Email OTP */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label
                      htmlFor="emailOtp"
                      className="text-[var(--neu-text-primary)]/90"
                    >
                      2. Email verification code{' '}
                      <span className="text-red-400">*</span>
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={requestOtpMutation.isPending}
                      onClick={handleSendOtp}
                      className="border-[var(--neu-border)] bg-[rgba(var(--neu-accent-rgb),0.05)] text-[var(--neu-text-primary)]/90 hover:bg-[rgba(var(--neu-accent-rgb),0.1)]"
                    >
                      {requestOtpMutation.isPending ? (
                        <>
                          <NovuntSpinner size="sm" className="mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Send OTP to my email
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="relative">
                    <Key className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--neu-text-muted)]" />
                    <Input
                      id="emailOtp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="000000"
                      {...registerPassword('emailOtp', {
                        onChange: (e) => {
                          const v = e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 6);
                          e.target.value = v;
                          setPasswordValue('emailOtp', v, {
                            shouldValidate: true,
                          });
                        },
                      })}
                      className="border-[var(--neu-border)] bg-[rgba(var(--neu-accent-rgb),0.1)] pl-10 font-mono tracking-widest text-[var(--neu-text-primary)] placeholder:text-[var(--neu-text-muted)] focus:border-[var(--neu-border)] focus:bg-[rgba(var(--neu-accent-rgb),0.12)]"
                    />
                  </div>
                  {passwordErrors.emailOtp && (
                    <p className="text-sm text-red-400">
                      {passwordErrors.emailOtp.message}
                    </p>
                  )}
                  <p className="text-xs text-[var(--neu-text-primary)]/60">
                    Enter the 6-digit code from your email
                  </p>
                </div>

                {/* 3. 2FA code */}
                <div className="space-y-2">
                  <Label
                    htmlFor="twoFACode"
                    className="text-[var(--neu-text-primary)]/90"
                  >
                    3. 2FA code <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--neu-text-muted)]" />
                    <Input
                      id="twoFACode"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      {...registerPassword('twoFACode', {
                        onChange: (e) => {
                          const v = e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 6);
                          e.target.value = v;
                          setPasswordValue('twoFACode', v, {
                            shouldValidate: true,
                          });
                        },
                      })}
                      className="border-[var(--neu-border)] bg-[rgba(var(--neu-accent-rgb),0.1)] pl-10 font-mono tracking-widest text-[var(--neu-text-primary)] placeholder:text-[var(--neu-text-muted)] focus:border-[var(--neu-border)] focus:bg-[rgba(var(--neu-accent-rgb),0.12)]"
                    />
                  </div>
                  {passwordErrors.twoFACode && (
                    <p className="text-sm text-red-400">
                      {passwordErrors.twoFACode.message}
                    </p>
                  )}
                  <p className="text-xs text-[var(--neu-text-primary)]/60">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetPasswordForm();
                      setActiveTab('personal');
                    }}
                    className="border-[var(--neu-border)] bg-[rgba(var(--neu-accent-rgb),0.05)] text-[var(--neu-text-primary)]/90 backdrop-blur-sm hover:border-white/30 hover:bg-[rgba(var(--neu-accent-rgb),0.1)]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPasswordSubmitting}
                    className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-[var(--neu-text-primary)] shadow-lg shadow-orange-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/70 active:scale-[0.98]"
                  >
                    {isPasswordSubmitting ? (
                      <>
                        <NovuntSpinner size="sm" className="mr-2" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="mt-6">
            <div className="space-y-4 rounded-xl border border-[var(--neu-border)] bg-[var(--neu-bg)] p-4 shadow-[var(--neu-shadow-inset)] sm:p-5">
              <div>
                <h3 className="text-lg font-semibold text-[var(--neu-text-primary)]">
                  Theme Preference
                </h3>
                <p className="text-sm text-[var(--neu-text-primary)]/60">
                  Keep system mode, or choose a manual light/dark override.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {appearanceOptions.map((option) => {
                  const Icon = option.icon;
                  const active = selectedTheme === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTheme(option.value)}
                      disabled={!themeMounted}
                      className={`rounded-xl border p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-70 ${
                        active
                          ? 'border-[rgba(var(--neu-accent-rgb),0.65)] bg-[rgba(var(--neu-accent-rgb),0.16)]'
                          : 'border-[var(--neu-border)] bg-[rgba(var(--neu-accent-rgb),0.05)]'
                      }`}
                      aria-label={`Set ${option.label} theme`}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <Icon className="h-4 w-4 text-[var(--neu-text-primary)]" />
                        <span className="font-medium text-[var(--neu-text-primary)]">
                          {option.label}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--neu-text-secondary)]">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-[var(--neu-text-primary)]/60">
                Active display theme:{' '}
                {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
              </p>

              <div className="border-t border-[var(--neu-border)] pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    onLogout?.();
                  }}
                  className="w-full border-red-400/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
