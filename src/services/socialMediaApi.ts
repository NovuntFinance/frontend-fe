/**
 * Social Media Verification API Service
 * Handles social media platform verification for registration bonus
 */

import { api } from '@/lib/api';

export interface VisitPlatformResponse {
  success: boolean;
  message: string;
  data?: {
    platform: string;
    url: string;
    token?: string;
    expiresAt?: string;
  };
}

export interface ConfirmPlatformResponse {
  success: boolean;
  message: string;
  data?: {
    platform: string;
    isVerified: boolean;
    verifiedAt: string;
  };
}

export interface VerifiedPlatformsResponse {
  success: boolean;
  data?: {
    verifiedPlatforms: Array<{
      platform: string;
      isVerified: boolean;
      verifiedAt: string;
    }>;
    totalVerified: number;
    totalRequired: number;
  };
}

export const socialMediaApi = {
  /**
   * Visit a social media platform
   * GET /api/v1/social-media/visit/:platform
   * @param platform - Platform name (facebook, instagram, youtube, tiktok, telegram)
   * @returns Platform URL (redirects to platform) or JSON response if json=1
   */
  async visitPlatform(platform: string, jsonResponse = false): Promise<VisitPlatformResponse> {
    try {
      // Ensure platform name is lowercase (backend expects lowercase)
      const platformName = platform.toLowerCase();
      
      const url = jsonResponse 
        ? `/social-media/visit/${platformName}?json=1`
        : `/social-media/visit/${platformName}`;
      
      console.log('[socialMediaApi] Visiting platform:', {
        original: platform,
        normalized: platformName,
        url,
        jsonResponse,
      });
      
      // Set Accept header for JSON response (backend needs this to return JSON instead of redirect)
      const config = jsonResponse 
        ? { headers: { 'Accept': 'application/json' } }
        : undefined;
      
      const response = await api.get<VisitPlatformResponse | VisitPlatformResponse['data']>(
        url,
        config
      );
      
      console.log('[socialMediaApi] Visit platform response:', response);
      console.log('[socialMediaApi] Response type check:', {
        isWrapped: response && typeof response === 'object' && 'success' in response,
        hasData: response && typeof response === 'object' && 'data' in response,
        hasToken: response && typeof response === 'object' && ('token' in response || (response as any).data?.token),
        fullResponse: JSON.stringify(response, null, 2),
      });
      
      // Handle unwrapped response (api.get might unwrap it)
      if (response && typeof response === 'object') {
        // If response has success/data structure, return as-is
        if ('success' in response && 'data' in response) {
          return response as VisitPlatformResponse;
        }
        // If response is already the data object, wrap it
        if ('url' in response || 'token' in response) {
          return {
            success: true,
            message: 'Platform visit initiated',
            data: response as VisitPlatformResponse['data'],
          };
        }
      }
      
      // Fallback: wrap the response
      return {
        success: true,
        message: 'Platform visit initiated',
        data: response as VisitPlatformResponse['data'],
      };
    } catch (error: any) {
      // Better error logging
      const err = error as { 
        code?: string; 
        message?: string; 
        response?: { status?: number; data?: any }; 
        statusCode?: number;
      };
      
      console.error('[socialMediaApi] Failed to visit platform:', {
        code: err?.code,
        message: err?.message,
        status: err?.response?.status || err?.statusCode,
        responseData: err?.response?.data,
        platform,
        jsonResponse,
      });
      
      // Check for network errors
      const isNetworkError = err?.code === 'ERR_NETWORK' || 
                            err?.message?.includes('Network Error') ||
                            err?.message?.includes('Failed to fetch') ||
                            (!err?.response && !err?.statusCode);
      
      if (isNetworkError) {
        console.warn('[socialMediaApi] ⚠️ Network error - backend might be unavailable');
      }
      
      throw error;
    }
  },

  /**
   * Confirm social media platform visit
   * POST /api/v1/social-media/confirm/:platform
   * @param platform - Platform name
   * @param token - Verification token from visit response (optional)
   * @returns Confirmation response
   */
  async confirmPlatform(platform: string, token?: string): Promise<ConfirmPlatformResponse> {
    try {
      // Ensure platform name is lowercase (backend expects lowercase)
      const platformName = platform.toLowerCase();
      
      // Always include token field in request body (even if undefined)
      // Backend might require the field to be present
      const requestBody = { token: token || null };
      
      console.log('[socialMediaApi] Confirming platform:', {
        original: platform,
        normalized: platformName,
        token: token ? 'provided' : 'none',
        requestBody,
      });
      
      const response = await api.post<ConfirmPlatformResponse | ConfirmPlatformResponse['data']>(
        `/social-media/confirm/${platformName}`,
        requestBody
      );
      
      console.log('[socialMediaApi] Confirm platform response:', response);
      console.log('[socialMediaApi] Response type check:', {
        isWrapped: response && typeof response === 'object' && 'success' in response,
        hasData: response && typeof response === 'object' && 'data' in response,
        fullResponse: JSON.stringify(response, null, 2),
      });
      
      // Handle unwrapped response (api.post might unwrap it)
      if (response && typeof response === 'object') {
        // If response has success/data structure, return as-is
        if ('success' in response && 'data' in response) {
          return response as ConfirmPlatformResponse;
        }
        // If response is already the data object, wrap it
        if ('platform' in response || 'isVerified' in response) {
          return {
            success: true,
            message: 'Platform verified successfully',
            data: response as ConfirmPlatformResponse['data'],
          };
        }
      }
      
      // Fallback: wrap the response
      return {
        success: true,
        message: 'Platform verified successfully',
        data: response as ConfirmPlatformResponse['data'],
      };
    } catch (error: any) {
      console.error('[socialMediaApi] Failed to confirm platform:', error);
      console.error('[socialMediaApi] Error details:', {
        status: error?.response?.status,
        statusCode: error?.statusCode,
        data: error?.response?.data,
        responseData: error?.responseData,
        message: error?.message,
      });
      throw error;
    }
  },

  /**
   * Get verified social media platforms
   * GET /api/v1/social-media/verified
   * @returns List of verified platforms and counts
   */
  async getVerifiedPlatforms(): Promise<VerifiedPlatformsResponse> {
    try {
      const response = await api.get<VerifiedPlatformsResponse>('/social-media/verified');
      
      console.log('[socialMediaApi] Verified platforms response:', response);
      return response;
    } catch (error: any) {
      console.error('[socialMediaApi] Failed to get verified platforms:', error);
      throw error;
    }
  },
};

