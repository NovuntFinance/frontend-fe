/**
 * User Service - Phase 1 Implementation
 * Handles user profile, KYC, and search operations
 * 
 * Backend API: http://localhost:5000/api/v1/users
 * Based on: PHASE_1_AUTHENTICATION_USER_MANAGEMENT.md
 * 
 * Phase 1 User Endpoints:
 * 1. GET /users/profile - Get authenticated user's complete profile
 * 2. PUT/PATCH /users/profile - Update user profile
 * 3. POST /users/kyc/upload - Upload KYC documents
 * 4. GET /users/kyc/status - Get KYC verification status
 * 5. GET /users/search?query=username - Search users by username
 * 6. GET /users/user/:id - Get user by ID (admin or self)
 * 7. PATCH /users/user/:id/profile-picture - Update profile picture
 */

import { api } from './api';
import type { ApiResponse } from '@/types/api';

// ============================================
// TYPES
// ============================================

export interface UserProfile {
  userId: string;
  email: string;
  username: string;
  fname: string;
  lname: string;
  profilePicture?: string;
  phoneNumber?: string;
  countryCode?: string;
  role: string;
  referralCode?: string;
  referralBonusBalance?: number;
  twoFAEnabled?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  profile?: {
    firstName: string;
    lastName: string;
    fullName: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    bio?: string;
    phone?: string;
    alternativePhone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    socialMediaHandle?: string;
    socialMediaAccounts?: unknown[];
    idVerification?: {
      status: 'pending' | 'approved' | 'rejected';
      documentType?: 'passport' | 'national_id' | 'drivers_license';
      verifiedAt?: string;
    };
    completionPercentage?: number;
    completedFields?: string[];
    missingFields?: string[];
    isProfileVerified?: boolean;
    profileVerifiedAt?: string;
  };
}

export interface UpdateProfilePayload {
  // User model fields
  fname?: string;
  lname?: string;
  phoneNumber?: string;
  countryCode?: string;
  
  // UserProfile fields
  firstName?: string;
  lastName?: string;
  fullName?: string;
  dateOfBirth?: string; // Format: "YYYY-MM-DD" (required for registration bonus)
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'; // Required for registration bonus
  bio?: string;
  phone?: string;
  alternativePhone?: string;
  address?: {
    street: string;
    city: string; // Used by backend for geocoding (30+ cities supported)
    state: string;
    postalCode?: string; // Backend uses postalCode
    zipCode?: string; // Alternative name
    country: string; // Used by backend for geocoding (15+ countries supported, handles abbreviations)
    // Coordinates are automatically populated by backend geocoding service
    // Backend geocodes using city + country (offline, instant, non-blocking)
    // Supports abbreviations: USA/US, UK/GB, NG/Nigeria, etc.
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
  profilePhoto?: string; // URL to profile photo (required for registration bonus)
  socialMediaHandle?: string;
}

export interface UploadKYCPayload {
  documentType: 'passport' | 'national_id' | 'drivers_license';
  documentImageUrl: string;
  selfieImageUrl: string;
}

export interface KYCStatus {
  status: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  documentType?: string;
  uploadedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  message?: string;
}

export interface UserSearchResult {
  _id: string;
  username: string;
  email?: string;  // May be masked
  fullName?: string;
  memberSince?: string;
}

export interface UserSearchResponse {
  message: string;
  results: UserSearchResult[];
  totalFound: number;
  query: string;
}

export interface UploadKYCResponse {
  success: boolean;
  message: string;
  data: {
    documentId: string;
    type: string;
    status: string;
    uploadedAt: string;
  };
}

type InternalUserProfileResponse = ApiResponse<UserProfile>;
type InternalKYCStatusResponse = ApiResponse<KYCStatus>;
type InternalUserSearchResponse = UserSearchResponse | ApiResponse<UserSearchResponse>;
type InternalUploadKYCResponse = UploadKYCResponse | ApiResponse<UploadKYCResponse>;
type InternalGenericResponse = ApiResponse<{ message?: string }>;

// ============================================
// USER SERVICE
// ============================================

export const userService = {
  /**
   * Get authenticated user's complete profile
   * GET /users/profile
   * @returns Complete user profile with nested profile data
   */
  getProfile: async (): Promise<InternalUserProfileResponse> => {
    return api.get<InternalUserProfileResponse>('/users/profile');
  },

  /**
   * Update user profile
   * PUT /api/v1/users/profile (updated endpoint)
   * @param payload - Profile update data (partial updates supported)
   * @returns Updated user profile
   * 
   * Registration Bonus Required Fields:
   * - dateOfBirth: "YYYY-MM-DD" format
   * - gender: "male", "female", "other", or "prefer_not_to_say"
   * - profilePhoto: Profile photo URL
   * - address: Address object with street, city, state, country, postalCode
   * 
   * Auto-Geocoding:
   * - Backend automatically geocodes address using city + country
   * - Populates coordinates.latitude and coordinates.longitude
   * - Non-blocking: profile updates even if geocoding fails
   * - Supports 30+ cities and 15+ countries (offline, instant)
   * - Handles abbreviations: USA/US, UK/GB, NG/Nigeria, etc.
   */
  updateProfile: async (payload: UpdateProfilePayload & { userId?: string }): Promise<InternalUserProfileResponse> => {
    console.log('[userService.updateProfile] Sending PATCH request to /users/profile');
    console.log('[userService.updateProfile] Payload:', JSON.stringify(payload, null, 2));
    console.log('[userService.updateProfile] User ID from payload:', (payload as any).userId);
    
    // Extract userId if provided (for fallback endpoint)
    const userId = (payload as any).userId;
    delete (payload as any).userId; // Remove userId from payload before sending
    
    // Try PATCH /users/profile first (standard endpoint for updating own profile)
    try {
      const response = await api.patch<InternalUserProfileResponse>('/users/profile', payload);
      console.log('[userService.updateProfile] Success response:', response);
      return response;
    } catch (error: any) {
      // If PATCH returns 404 and we have userId, try user-specific endpoint
      if (error?.response?.status === 404 && userId) {
        console.warn('[userService.updateProfile] PATCH /users/profile returned 404, trying /users/user/:id endpoint...');
        try {
          const response = await api.patch<InternalUserProfileResponse>(`/users/user/${userId}`, payload);
          console.log('[userService.updateProfile] User ID endpoint success:', response);
          return response;
        } catch (userIdError: any) {
          console.error('[userService.updateProfile] User ID endpoint also failed:', {
            message: userIdError?.message,
            statusCode: userIdError?.response?.status,
            responseData: userIdError?.response?.data,
          });
          // Fall through to try PUT
        }
      }
      
      // If PATCH failed, try PUT as fallback
      if (error?.response?.status === 404) {
        console.warn('[userService.updateProfile] PATCH returned 404, trying PUT instead...');
        try {
          const response = await api.put<InternalUserProfileResponse>('/users/profile', payload);
          console.log('[userService.updateProfile] PUT success response:', response);
          return response;
        } catch (putError: any) {
          console.error('[userService.updateProfile] PUT also failed:', {
            message: putError?.message,
            code: putError?.code,
            statusCode: putError?.response?.status,
            statusText: putError?.response?.statusText,
            responseData: putError?.response?.data,
            requestURL: putError?.config?.url,
            requestMethod: putError?.config?.method,
            hasAuthHeader: !!putError?.config?.headers?.Authorization,
          });
          throw putError;
        }
      } else {
        console.error('[userService.updateProfile] Error details:', {
          message: error?.message,
          code: error?.code,
          statusCode: error?.response?.status,
          statusText: error?.response?.statusText,
          responseData: error?.response?.data,
          requestURL: error?.config?.url,
          requestMethod: error?.config?.method,
          hasAuthHeader: !!error?.config?.headers?.Authorization,
        });
        throw error;
      }
    }
  },

  /**
   * Upload KYC documents
   * POST /users/kyc/upload
   * @param payload - Document type and image URLs
   * @returns Upload confirmation
   */
  uploadKYC: async (payload: UploadKYCPayload): Promise<InternalUploadKYCResponse> => {
    return api.post<InternalUploadKYCResponse>('/users/kyc/upload', payload);
  },

  /**
   * Get KYC verification status
   * GET /users/kyc/status
   * @returns KYC status information
   */
  getKYCStatus: async (): Promise<InternalKYCStatusResponse> => {
    return api.get<InternalKYCStatusResponse>('/users/kyc/status');
  },

  /**
   * Search users by username
   * GET /users/search?query=username
   * @param query - Username search string (minimum 2 characters)
   * @returns Search results
   */
  searchUsers: async (query: string): Promise<InternalUserSearchResponse> => {
    return api.get<InternalUserSearchResponse>('/users/search', {
      params: { query },
    });
  },

  /**
   * Get user by ID
   * GET /users/user/:id
   * @param id - User MongoDB ObjectId
   * @returns User details
   */
  getUserById: async (id: string): Promise<InternalUserProfileResponse> => {
    return api.get<InternalUserProfileResponse>(`/users/user/${id}`);
  },

  /**
   * Update profile picture
   * PATCH /users/user/:id/profile-picture
   * @param id - User ID
   * @param profilePicture - Image URL (should be uploaded to Cloudinary/S3 first)
   * @returns Success message with updated profile picture URL
   */
  updateProfilePicture: async (id: string, profilePicture: string): Promise<InternalGenericResponse & { profilePicture?: string }> => {
    return api.patch<InternalGenericResponse & { profilePicture?: string }>(`/users/user/${id}/profile-picture`, {
      profilePicture,
    });
  },

  /**
   * Validate referral code (public endpoint)
   * GET /referral/validate?referralCode=ABC123
   * @param referralCode - Referral code to validate
   * @returns Validation result with referrer name if valid
   */
  validateReferralCode: async (referralCode: string): Promise<ApiResponse<{ isValid: boolean; referrerName?: string }>> => {
    return api.get<ApiResponse<{ isValid: boolean; referrerName?: string }>>('/referral/validate', {
      params: { referralCode },
    });
  },
};

