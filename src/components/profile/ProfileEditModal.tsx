'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  AtSign,
  Calendar,
  Home as MapPinIcon,
} from 'lucide-react';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import PhoneInput from 'react-phone-number-input';
import { parsePhoneNumber } from 'libphonenumber-js';
import '@/styles/phone-input.css';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile } from '@/lib/mutations';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/enhanced-toast';
import { AvatarSelector } from '@/components/profile/AvatarSelector';
import { BadgeAvatarSelector } from '@/components/achievements/BadgeAvatarSelector';
import { passwordSchema } from '@/lib/validation';

// Profile edit schema
const profileEditSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'First name can only contain letters, spaces, hyphens, and apostrophes'
    ),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'Last name can only contain letters, spaces, hyphens, and apostrophes'
    ),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      // Validate date format and age (must be at least 18 years old)
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      const actualAge =
        monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      return actualAge >= 18;
    }, 'You must be at least 18 years old'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
    message: 'Please select a gender option',
  }),
  addressStreet: z
    .string()
    .min(2, 'Street address is required')
    .max(200, 'Street address must not exceed 200 characters'),
  addressCity: z
    .string()
    .min(2, 'City is required')
    .max(100, 'City must not exceed 100 characters'),
  addressState: z
    .string()
    .min(2, 'State/Province is required')
    .max(100, 'State/Province must not exceed 100 characters'),
  addressCountry: z
    .string()
    .min(2, 'Country is required')
    .max(100, 'Country must not exceed 100 characters'),
  addressPostalCode: z
    .string()
    .min(2, 'Postal/ZIP code is required')
    .max(20, 'Postal/ZIP code must not exceed 20 characters'),
  profilePhoto: z.string().optional(),
});

// Change password schema
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

type ProfileEditFormData = z.infer<typeof profileEditSchema>;
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
  const updateProfileMutation = useUpdateProfile();
  const [activeTab, setActiveTab] = useState('personal');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string | undefined>(
    undefined
  );

  // Profile edit form
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isSubmitting },
    setError,
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: (() => {
        // Format phone number to E.164 if missing + prefix
        // Check both user object and profileData for phone number
        let phone =
          user?.phoneNumber || (profileData as any)?.phoneNumber || '';

        // If still empty, check nested profile structure
        if (!phone && profileData) {
          const profile = (profileData as any)?.profile;
          phone = profile?.phone || profile?.phoneNumber || '';
        }

        // If phone number exists but doesn't start with +, add country code
        if (phone && !phone.startsWith('+')) {
          const countryCode =
            user?.countryCode || (profileData as any)?.countryCode || '+1';
          phone = `${countryCode}${phone}`;
        }

        // If phone is still empty but we have country code, set default format
        if (
          !phone &&
          (user?.countryCode || (profileData as any)?.countryCode)
        ) {
          const countryCode =
            user?.countryCode || (profileData as any)?.countryCode || '+1';
          phone = countryCode; // Just country code as placeholder
        }

        return phone;
      })(),
      dateOfBirth: (() => {
        // Format date from profile data if available
        // profileData may have nested profile or flat structure
        const profile = (profileData as any)?.profile || profileData;
        if (profile?.dateOfBirth) {
          const date = new Date(profile.dateOfBirth);
          return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }
        return '';
      })(),
      gender: ((profileData as any)?.profile?.gender ||
        (profileData as any)?.gender ||
        'prefer_not_to_say') as
        | 'male'
        | 'female'
        | 'other'
        | 'prefer_not_to_say',
      addressStreet: ((profileData as any)?.profile?.address?.street ||
        '') as string,
      addressCity: ((profileData as any)?.profile?.address?.city ||
        '') as string,
      addressState: ((profileData as any)?.profile?.address?.state ||
        '') as string,
      addressCountry: ((profileData as any)?.profile?.address?.country ||
        '') as string,
      addressPostalCode: ((profileData as any)?.profile?.address?.zipCode ||
        '') as string,
      profilePhoto: ((profileData as any)?.profile?.profilePhoto ||
        profileData?.avatar ||
        '') as string,
    },
  });

  // Change password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Update form when user data changes
  useEffect(() => {
    if (user && profileData) {
      // Format phone number to E.164 if it's missing the + prefix
      // Check both user object and profileData for phone number
      let formattedPhone =
        user.phoneNumber || (profileData as any)?.phoneNumber || '';

      // If still empty, check nested profile structure
      if (!formattedPhone) {
        const profile = (profileData as any)?.profile;
        formattedPhone = profile?.phone || profile?.phoneNumber || '';
      }

      // If phone number exists but doesn't start with +, add country code
      if (formattedPhone && !formattedPhone.startsWith('+')) {
        // Try to construct E.164 format with country code
        const countryCode =
          user.countryCode || (profileData as any)?.countryCode || '+1'; // Default to US
        formattedPhone = `${countryCode}${formattedPhone}`;
      }

      // If phone is still empty but we have country code, set default format
      if (
        !formattedPhone &&
        (user.countryCode || (profileData as any)?.countryCode)
      ) {
        const countryCode =
          user.countryCode || (profileData as any)?.countryCode || '+1';
        formattedPhone = countryCode; // Just country code as placeholder
      }

      // Format date of birth
      let formattedDateOfBirth = '';
      const profile = (profileData as any)?.profile || profileData;
      if (profile?.dateOfBirth) {
        const date = new Date(profile.dateOfBirth);
        formattedDateOfBirth = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      }

      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: formattedPhone,
        dateOfBirth: formattedDateOfBirth,
        gender: ((profileData as any)?.profile?.gender ||
          (profileData as any)?.gender ||
          'prefer_not_to_say') as
          | 'male'
          | 'female'
          | 'other'
          | 'prefer_not_to_say',
        addressStreet: ((profileData as any)?.profile?.address?.street ||
          '') as string,
        addressCity: ((profileData as any)?.profile?.address?.city ||
          '') as string,
        addressState: ((profileData as any)?.profile?.address?.state ||
          '') as string,
        addressCountry: ((profileData as any)?.profile?.address?.country ||
          '') as string,
        addressPostalCode: ((profileData as any)?.profile?.address?.zipCode ||
          '') as string,
        profilePhoto: ((profileData as any)?.profile?.profilePhoto ||
          profileData?.avatar ||
          '') as string,
      });
    }
  }, [user, profileData, reset]);

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

  const onSubmitProfile = async (data: ProfileEditFormData) => {
    try {
      // Parse phone number to extract country code
      let phoneNumber = data.phoneNumber || '';
      let countryCode = '';

      // Skip parsing if phone number is empty or just country code
      if (!phoneNumber || phoneNumber.length <= 4) {
        toast.error('Please enter a valid phone number with country code');
        setError('phoneNumber', {
          type: 'manual',
          message: 'Phone number is required',
        });
        return;
      }

      try {
        const parsed = parsePhoneNumber(phoneNumber);
        if (parsed && parsed.isValid()) {
          phoneNumber = parsed.nationalNumber;
          countryCode = `+${parsed.countryCallingCode}`;
        } else {
          // If phone is not valid, try to extract country code manually
          if (phoneNumber.startsWith('+')) {
            const parts = phoneNumber.match(/^\+(\d{1,3})(.+)$/);
            if (parts) {
              countryCode = `+${parts[1]}`;
              phoneNumber = parts[2];
            } else {
              throw new Error('Invalid phone number format');
            }
          } else {
            // Assume US if no country code
            countryCode = '+1';
          }
        }
      } catch (error: any) {
        console.error('Failed to parse phone number:', error);
        console.error('Phone number value:', phoneNumber);

        // If parsing fails, try to handle gracefully
        if (phoneNumber.startsWith('+')) {
          // Try to extract country code manually
          const match = phoneNumber.match(/^\+(\d{1,3})(.+)$/);
          if (match && match[2].length >= 7) {
            countryCode = `+${match[1]}`;
            phoneNumber = match[2];
          } else {
            toast.error(
              'Please enter a valid phone number with country code (e.g., +1234567890)'
            );
            setError('phoneNumber', {
              type: 'manual',
              message: 'Invalid phone number format',
            });
            return;
          }
        } else {
          toast.error(
            'Please enter a valid phone number with country code (e.g., +1234567890)'
          );
          setError('phoneNumber', {
            type: 'manual',
            message: 'Phone number must include country code',
          });
          return;
        }
      }

      // Prepare payload according to backend API: PUT /api/v1/user/profile
      // Build fullName from firstName and lastName
      const fullName = `${data.firstName} ${data.lastName}`.trim();

      // Build address object according to schema
      // Note: Backend automatically geocodes using city/country and populates coordinates
      // Geocoding is non-blocking - profile updates even if geocoding fails
      // Supports 30+ cities and 15+ countries (offline, instant, no API calls)
      const addressObject = {
        street: data.addressStreet,
        city: data.addressCity,
        state: data.addressState,
        country: data.addressCountry,
        postalCode: data.addressPostalCode,
        // Coordinates (latitude/longitude) are automatically populated by backend
        // Backend uses city + country for geocoding (supports abbreviations like USA/US, UK/GB)
      };

      // Build phone number in E.164 format (with country code)
      const fullPhoneNumber =
        countryCode && phoneNumber
          ? `${countryCode}${phoneNumber}`
          : data.phoneNumber;

      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: fullName, // Required for registration bonus
        phoneNumber: fullPhoneNumber, // Send full E.164 format (e.g., +1234567890)
        phone: fullPhoneNumber, // Also send as 'phone' for UserProfile schema (E.164 format)
        countryCode, // Also send country code separately
        // Registration bonus required fields
        dateOfBirth: data.dateOfBirth, // Format: "YYYY-MM-DD"
        gender: data.gender, // "male", "female", "other", or "prefer_not_to_say"
        address: addressObject, // Address object with nested fields
        profilePhoto: data.profilePhoto || undefined, // Profile photo URL
      };

      console.log('[ProfileEditModal] Phone number details:', {
        original: data.phoneNumber,
        parsed: { phoneNumber, countryCode },
        fullPhoneNumber,
      });

      // Add user ID to payload if available (for fallback endpoint)
      const payloadWithUserId = {
        ...payload,
        userId:
          user?._id || user?.id || profileData?._id || (profileData as any)?.id,
      };

      console.log(
        '[ProfileEditModal] Submitting profile update:',
        payloadWithUserId
      );
      console.log('[ProfileEditModal] User ID:', payloadWithUserId.userId);
      await updateProfileMutation.mutateAsync(payloadWithUserId);
      // Toast is shown by the mutation itself - no need for duplicate
      refetchProfile();
    } catch (error: any) {
      // Better error logging with serialization
      const errorDetails = {
        message: error instanceof Error ? error.message : String(error),
        code: error?.code,
        statusCode: error?.statusCode,
        response: error?.response
          ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            }
          : undefined,
        request: error?.request
          ? {
              url: error.request.responseURL,
              method: error?.config?.method,
            }
          : undefined,
      };

      console.error('Profile update error:', errorDetails);
      console.error('Full error object:', error);

      // Extract error message
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        errorDetails.message ||
        'Failed to update profile';

      // Handle username uniqueness error (username is not in form, show as root error)
      if (
        errorMessage.toLowerCase().includes('username') &&
        (errorMessage.toLowerCase().includes('taken') ||
          errorMessage.toLowerCase().includes('exists') ||
          errorMessage.toLowerCase().includes('already'))
      ) {
        setError('root', {
          type: 'manual',
          message:
            'This username is already taken. Please choose a different one.',
        });
        toast.error('Username already taken', {
          description:
            'This username is already in use. Please choose another.',
        });
        return;
      }

      // Handle phone number uniqueness error
      if (
        (errorMessage.toLowerCase().includes('phone') ||
          errorMessage.toLowerCase().includes('phoneNumber')) &&
        (errorMessage.toLowerCase().includes('taken') ||
          errorMessage.toLowerCase().includes('exists') ||
          errorMessage.toLowerCase().includes('already'))
      ) {
        setError('phoneNumber', {
          type: 'manual',
          message:
            'This phone number is already registered. Please use a different number.',
        });
        toast.error('Phone number already registered', {
          description:
            'This phone number is already in use. Please use a different number.',
        });
        return;
      }

      // Handle "under development" error
      if (
        errorMessage.toLowerCase().includes('under development') ||
        errorMessage.toLowerCase().includes('not implemented')
      ) {
        toast.error('Feature not available', {
          description:
            'This feature is currently under development. Please try again later.',
        });
        return;
      }

      // Generic error
      toast.error('Failed to update profile', {
        description: errorMessage,
      });
    }
  };

  const onSubmitPassword = async (data: ChangePasswordFormData) => {
    try {
      // TODO: Implement password change API call
      console.log('Change password:', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully!');
      resetPasswordForm();
      setActiveTab('personal');
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to change password. Please try again.');
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-[95vw] overflow-y-auto border border-white/10 bg-gradient-to-br from-slate-900/95 via-indigo-950/95 to-slate-900/95 p-4 shadow-2xl backdrop-blur-xl sm:max-h-[90vh] sm:max-w-xl sm:p-6 md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white sm:text-2xl">
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-sm text-white/70 sm:text-base">
            Update your personal information and account settings
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 border border-white/10 bg-white/5 backdrop-blur-sm">
            <TabsTrigger
              value="personal"
              className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              Personal Info
            </TabsTrigger>
            <TabsTrigger
              value="avatar"
              className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              Avatar
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              Security
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="mt-6 space-y-6">
            {/* Editable Fields Form */}
            <form
              onSubmit={handleSubmit(onSubmitProfile)}
              className="space-y-6"
            >
              {/* Name Section */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <h3 className="mb-4 text-sm font-semibold text-white">
                  Full Name
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white/90">
                      First Name <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/50" />
                      <Input
                        id="firstName"
                        {...register('firstName')}
                        className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
                        placeholder="John"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-sm text-red-400">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-white/90">
                      Last Name <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/50" />
                      <Input
                        id="lastName"
                        {...register('lastName')}
                        className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
                        placeholder="Doe"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-sm text-red-400">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Phone Number Section */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <h3 className="mb-4 text-sm font-semibold text-white">
                  Phone Number
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-white/90">
                    Phone Number <span className="text-red-400">*</span>
                  </Label>
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        international
                        defaultCountry="US"
                        value={field.value}
                        onChange={field.onChange}
                        className="phone-input-container"
                        placeholder="Enter phone number"
                      />
                    )}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-400">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                  <p className="text-xs text-white/60">
                    Include country code (e.g., +1 for USA)
                  </p>
                </div>
              </div>

              {/* Date of Birth Section */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <h3 className="mb-4 text-sm font-semibold text-white">
                  Date of Birth
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-white/90">
                    Date of Birth <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register('dateOfBirth')}
                      className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
                      max={(() => {
                        // Set max date to 18 years ago
                        const today = new Date();
                        const maxDate = new Date(
                          today.getFullYear() - 18,
                          today.getMonth(),
                          today.getDate()
                        );
                        return maxDate.toISOString().split('T')[0];
                      })()}
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-400">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                  <p className="text-xs text-white/60">
                    You must be at least 18 years old
                  </p>
                </div>
              </div>

              {/* Gender Section */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <h3 className="mb-4 text-sm font-semibold text-white">
                  Gender
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-white/90">
                    Gender <span className="text-red-400">*</span>
                  </Label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/15">
                          <UserIcon className="mr-2 h-4 w-4 text-white/50" />
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-slate-900/95 text-white backdrop-blur-xl">
                          <SelectItem
                            value="prefer_not_to_say"
                            className="text-white focus:bg-white/10"
                          >
                            Prefer not to say
                          </SelectItem>
                          <SelectItem
                            value="male"
                            className="text-white focus:bg-white/10"
                          >
                            Male
                          </SelectItem>
                          <SelectItem
                            value="female"
                            className="text-white focus:bg-white/10"
                          >
                            Female
                          </SelectItem>
                          <SelectItem
                            value="other"
                            className="text-white focus:bg-white/10"
                          >
                            Other
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.gender && (
                    <p className="text-sm text-red-400">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Address Section */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <h3 className="mb-4 text-sm font-semibold text-white">
                  Address
                </h3>
                <div className="space-y-4">
                  {/* Street Address */}
                  <div className="space-y-2">
                    <Label htmlFor="addressStreet" className="text-white/90">
                      Street Address <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <MapPinIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/50" />
                      <Input
                        id="addressStreet"
                        {...register('addressStreet')}
                        className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
                        placeholder="123 Main Street"
                      />
                    </div>
                    {errors.addressStreet && (
                      <p className="text-sm text-red-400">
                        {errors.addressStreet.message}
                      </p>
                    )}
                  </div>

                  {/* City and State */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="addressCity" className="text-white/90">
                        City <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="addressCity"
                        {...register('addressCity')}
                        className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
                        placeholder="City"
                      />
                      {errors.addressCity && (
                        <p className="text-sm text-red-400">
                          {errors.addressCity.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressState" className="text-white/90">
                        State/Province <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="addressState"
                        {...register('addressState')}
                        className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
                        placeholder="State/Province"
                      />
                      {errors.addressState && (
                        <p className="text-sm text-red-400">
                          {errors.addressState.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Country and Postal Code */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="addressCountry" className="text-white/90">
                        Country <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="addressCountry"
                        {...register('addressCountry')}
                        className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
                        placeholder="Country"
                      />
                      {errors.addressCountry && (
                        <p className="text-sm text-red-400">
                          {errors.addressCountry.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="addressPostalCode"
                        className="text-white/90"
                      >
                        Postal/ZIP Code <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="addressPostalCode"
                        {...register('addressPostalCode')}
                        className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
                        placeholder="12345"
                      />
                      {errors.addressPostalCode && (
                        <p className="text-sm text-red-400">
                          {errors.addressPostalCode.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-3">
                <Button
                  type="submit"
                  disabled={!isDirty || isSubmitting}
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/70 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <NovuntSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Read-only Fields */}
            <div className="space-y-4 border-t border-white/10 pt-6">
              <h3 className="text-sm font-semibold text-white/70">
                Account Information (Cannot be changed)
              </h3>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/50" />
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="cursor-not-allowed border-white/10 bg-white/5 pl-10 text-white/60 opacity-60"
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  Email is your login credential and cannot be changed
                </p>
              </div>

              {/* Username (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/90">
                  Username
                </Label>
                <div className="relative">
                  <AtSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/50" />
                  <Input
                    id="username"
                    value={user.username}
                    disabled
                    className="cursor-not-allowed border-white/10 bg-white/5 pl-10 text-white/60 opacity-60"
                  />
                </div>
                <p className="text-xs text-white/60">
                  Username is permanent and cannot be changed
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Avatar Tab */}
          <TabsContent value="avatar" className="mt-6">
            <div className="space-y-6">
              {/* Sub-tabs for Avatar Selection */}
              <Tabs defaultValue="generated" className="w-full">
                <TabsList className="grid w-full grid-cols-2 border border-white/10 bg-white/5 backdrop-blur-sm">
                  <TabsTrigger
                    value="generated"
                    className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    Generated Avatars
                  </TabsTrigger>
                  <TabsTrigger
                    value="badges"
                    className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    Badge Avatars
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="generated" className="mt-4">
                  <AvatarSelector
                    currentAvatar={currentAvatar || user?.avatar}
                    userId={user.id || user._id || ''}
                    userName={user.username || user.email || 'User'}
                    onAvatarSelected={handleAvatarUploadComplete}
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
          <TabsContent value="security" className="mt-6 space-y-6">
            <form
              onSubmit={handlePasswordSubmit(onSubmitPassword)}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Change Password
                </h3>
                <p className="text-sm text-white/60">
                  Ensure your account stays secure by using a strong password
                </p>
              </div>

              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-white/90">
                  Current Password <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/50" />
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    {...registerPassword('currentPassword')}
                    className="border-white/20 bg-white/10 pr-10 pl-10 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-white/50 hover:text-white/80"
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

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white/90">
                  New Password <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/50" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    {...registerPassword('newPassword')}
                    className="border-white/20 bg-white/10 pr-10 pl-10 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-white/50 hover:text-white/80"
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

              {/* Confirm New Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword" className="text-white/90">
                  Confirm New Password <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/50" />
                  <Input
                    id="confirmNewPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...registerPassword('confirmNewPassword')}
                    className="border-white/20 bg-white/10 pr-10 pl-10 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-white/50 hover:text-white/80"
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

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetPasswordForm();
                    setActiveTab('personal');
                  }}
                  className="border-white/20 bg-white/5 text-white/90 backdrop-blur-sm hover:border-white/30 hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPasswordSubmitting}
                  className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white shadow-lg shadow-orange-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/70 active:scale-[0.98]"
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
