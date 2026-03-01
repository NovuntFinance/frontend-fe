'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AtSign,
  Key,
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
import { AvatarSelector } from '@/components/profile/AvatarSelector';
import { BadgeAvatarSelector } from '@/components/achievements/BadgeAvatarSelector';
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from '@/components/auth/TurnstileWidget';
import { passwordSchema } from '@/lib/validation';

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
}

export function ProfileEditModal({
  open,
  onOpenChange,
}: ProfileEditModalProps) {
  const { user } = useAuth();
  const { updateUser } = useAuthStore();
  const { data: profileData, refetch: refetchProfile } = useProfile();
  const changePasswordMutation = useChangePassword();
  const requestOtpMutation = useRequestChangePasswordOtp();
  const [activeTab, setActiveTab] = useState('personal');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string | undefined>(
    undefined
  );
  const turnstileRef = useRef<TurnstileWidgetHandle | null>(null);

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

  const handleAvatarUploadComplete = (url: string) => {
    setCurrentAvatar(url);
    // Update avatar immediately in the store
    updateUser({ avatar: url });
    // Update the profilePhoto field in the form
    // Note: The AvatarSelector uses useUpdateProfilePicture which updates separately
    // This is just for form state consistency
    // Force refetch to ensure consistency
    refetchProfile();
    // Force reload to update all avatar instances (toast removed to avoid duplicate before reload)
    setTimeout(() => {
      window.location.href = window.location.href;
    }, 500);
  };

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
        className="max-h-[85vh] max-w-[95vw] overflow-y-auto p-4 backdrop-blur-xl sm:max-h-[90vh] sm:max-w-xl sm:p-6 md:max-w-2xl"
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
              value="avatar"
              className="data-[state=active]:bg-[rgba(var(--neu-accent-rgb),0.15)] data-[state=active]:text-[var(--neu-text-primary)]"
              style={{ color: 'var(--neu-text-secondary)' }}
            >
              Avatar
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-[rgba(var(--neu-accent-rgb),0.15)] data-[state=active]:text-[var(--neu-text-primary)]"
              style={{ color: 'var(--neu-text-secondary)' }}
            >
              Security
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

          {/* Avatar Tab */}
          <TabsContent value="avatar" className="mt-6">
            <div
              className="space-y-6 rounded-xl p-4 sm:p-5"
              style={neuSectionInset}
            >
              {/* Sub-tabs for Avatar Selection */}
              <Tabs defaultValue="notionist" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-lg border border-[var(--neu-border)] bg-[rgba(var(--neu-accent-rgb),0.05)] p-1">
                  <TabsTrigger
                    value="notionist"
                    className="text-[var(--neu-text-secondary)] data-[state=active]:bg-[rgba(var(--neu-accent-rgb),0.1)] data-[state=active]:text-[var(--neu-text-primary)]"
                  >
                    Notionist
                  </TabsTrigger>
                  <TabsTrigger
                    value="badges"
                    className="text-[var(--neu-text-secondary)] data-[state=active]:bg-[rgba(var(--neu-accent-rgb),0.1)] data-[state=active]:text-[var(--neu-text-primary)]"
                  >
                    Badge Avatars
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="notionist" className="mt-4">
                  <AvatarSelector
                    currentAvatar={currentAvatar || user?.avatar}
                    userId={user.id || user._id || ''}
                    userName={user.username || user.email || 'User'}
                    onAvatarSelected={handleAvatarUploadComplete}
                    allowedStyles={['notionists']}
                  />
                </TabsContent>

                <TabsContent value="badges" className="mt-4">
                  <BadgeAvatarSelector
                    user={user}
                    currentAvatar={currentAvatar || user?.avatar}
                    onClose={() => {
                      // Refresh user data after badge selection
                      if (handleAvatarUploadComplete) {
                        handleAvatarUploadComplete(
                          currentAvatar || user?.avatar || ''
                        );
                      }
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <div className="rounded-xl p-4 sm:p-5" style={neuSectionInset}>
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
