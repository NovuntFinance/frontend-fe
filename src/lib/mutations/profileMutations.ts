import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';

/**
 * Social Media Platform Types
 * Updated to match backend enum: FACEBOOK, INSTAGRAM, YOUTUBE, TIKTOK, TELEGRAM
 */
export type SocialMediaPlatform = 'FACEBOOK' | 'INSTAGRAM' | 'YOUTUBE' | 'TIKTOK' | 'TELEGRAM';

/**
 * Social Media Verification Request
 * POST /api/v1/social-media/verify
 */
export interface SocialMediaVerifyRequest {
  platform: SocialMediaPlatform;
  followUrl: string;
  dwellTime: number; // Time in milliseconds (minimum 30000ms = 30 seconds)
}

/**
 * Social Media Verification Response
 */
export interface SocialMediaVerifyResponse {
  success: boolean;
  message: string;
  data: {
    platform: string;
    isVerified: boolean;
    verifiedPlatforms: number;
    totalPlatforms: number;
    registrationBonusProgress: number; // Progress percentage after this verification
  };
}

export interface UpdateProfilePictureRequest {
  profilePicture: string; // URL from DiceBear or Cloudinary
}

export interface UpdateProfilePictureResponse {
  message: string;
  profilePicture: string;
}

/**
 * Verify Social Media Follow (New API)
 * POST /api/v1/social-media/verify
 * 
 * This replaces the old visit/confirm flow with a single endpoint that requires dwellTime
 */
export function useVerifySocialMedia() {
  const queryClient = useQueryClient();

  return useMutation<SocialMediaVerifyResponse, Error, SocialMediaVerifyRequest>({
    mutationFn: async (data) => {
      const response = await apiRequest<SocialMediaVerifyResponse>(
        'post',
        '/social-media/verify',
        data
      );
      return response;
    },
    onSuccess: async (data) => {
      console.log('[useVerifySocialMedia] Verification successful:', {
        platform: data.data.platform,
        progress: data.data.registrationBonusProgress,
        verifiedCount: data.data.verifiedPlatforms,
      });
      
      queryClient.invalidateQueries({ queryKey: ['verified-social-media'] });
    },
  });
}

/**
 * @deprecated Use useVerifySocialMedia instead
 * Kept for backward compatibility during migration
 */
export function useVisitSocialMedia() {
  console.warn('[useVisitSocialMedia] This endpoint is deprecated. Use useVerifySocialMedia with dwellTime instead.');
  return useMutation<any, Error, SocialMediaPlatform>({
    mutationFn: async () => {
      throw new Error('This endpoint is deprecated. Use useVerifySocialMedia instead.');
    },
  });
}

/**
 * @deprecated Use useVerifySocialMedia instead
 * Kept for backward compatibility during migration
 */
export function useConfirmSocialMedia() {
  console.warn('[useConfirmSocialMedia] This endpoint is deprecated. Use useVerifySocialMedia with dwellTime instead.');
  return useMutation<any, Error, { platform: SocialMediaPlatform; token: string }>({
    mutationFn: async () => {
      throw new Error('This endpoint is deprecated. Use useVerifySocialMedia instead.');
    },
  });
}

/**
 * Update Profile Picture (URL-based, not file upload)
 * PATCH /api/v1/users/user/:userId/profile-picture
 */
export function useUpdateProfilePicture(userId: string) {
  const queryClient = useQueryClient();

  return useMutation<UpdateProfilePictureResponse, Error, UpdateProfilePictureRequest>({
    mutationFn: async (data) => {
      const response = await apiRequest<UpdateProfilePictureResponse>(
        'patch',
        `/users/user/${userId}/profile-picture`,
        data
      );
      return response;
    },
    onSuccess: async (data) => {
      console.log('[useUpdateProfilePicture] Avatar updated successfully:', data.profilePicture);
      
      // Invalidate user data queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

/**
 * Upload Image to Cloudinary
 * Returns the secure URL to be sent to backend
 */
export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

export function useUploadToCloudinary() {
  return useMutation<CloudinaryUploadResponse, Error, File>({
    mutationFn: async (file) => {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'novunt_profiles');
      formData.append('folder', 'novunt/avatars');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to upload image');
      }

      const data = await response.json();
      return data;
    },
  });
}

/**
 * Complete Avatar Upload Flow
 * 1. Upload to Cloudinary
 * 2. Send URL to backend
 */
export function useCompleteAvatarUpload(userId: string) {
  const uploadToCloudinary = useUploadToCloudinary();
  const updateProfilePicture = useUpdateProfilePicture(userId);

  return useMutation<UpdateProfilePictureResponse, Error, File>({
    mutationFn: async (file) => {
      // Step 1: Upload to Cloudinary
      const cloudinaryResult = await uploadToCloudinary.mutateAsync(file);

      // Step 2: Send URL to backend
      const backendResult = await updateProfilePicture.mutateAsync({
        profilePicture: cloudinaryResult.secure_url,
      });

      return backendResult;
    },
  });
}

