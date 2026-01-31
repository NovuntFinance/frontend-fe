/**
 * Registration Bonus API Service
 * Handles all API calls for registration bonus feature
 */

import { api } from '@/lib/api';
import type {
  RegistrationBonusStatusResponse,
  ProcessStakeRequest,
  ProcessStakeResponse,
  BonusPayoutHistoryResponse,
} from '@/types/registrationBonus';
import { SocialMediaPlatform } from '@/types/registrationBonus';

export const registrationBonusApi = {
  /**
   * Get registration bonus status
   * GET /api/v1/bonuses/registration/status
   * @returns Complete registration bonus status with requirements and progress
   */
  async getStatus(): Promise<RegistrationBonusStatusResponse> {
    try {
      // api.get may unwrap the response automatically
      const response = await api.get<any>('/bonuses/registration/status');

      // Handle different response formats:
      // Format 1: { success: true, data: {...} } (if not unwrapped)
      // Format 2: { status: "pending", progressPercentage: 50, ... } (if unwrapped)
      let normalizedResponse: RegistrationBonusStatusResponse;

      if (response && typeof response === 'object') {
        // Check if it's already in the expected format with success/data wrapper
        if ('success' in response && 'data' in response) {
          // Format 1: Already wrapped - use as-is
          normalizedResponse = response as RegistrationBonusStatusResponse;
        } else if ('status' in response) {
          // Format 2: Direct data format (api.get unwrapped it) - wrap it
          normalizedResponse = {
            success: true,
            data: response as any,
          };
        } else {
          // Unknown format - try to wrap it anyway
          normalizedResponse = {
            success: true,
            data: response as any,
          };
        }
      } else {
        // Fallback
        normalizedResponse = {
          success: false,
          message: 'Invalid response format',
        };
      }

      // Normalize and calculate progress from new API structure
      if (normalizedResponse.data) {
        const data = normalizedResponse.data;

        // Calculate progressPercentage based on requirements (25% per requirement)
        // 25% = Registration (automatic)
        // 50% = Registration + Profile Complete
        // 75% = Registration + Profile + Social Media (at least 1 verified)
        // 100% = Registration + Profile + Social + First Stake
        let progressPercentage = 25; // Registration is automatic

        if (
          data.requirements?.profileCompletion?.completed &&
          data.requirements.profileCompletion.percentage === 100
        ) {
          progressPercentage = 50;
        }

        // Give 25% progress when at least 1 social media is verified
        const socialVerifiedCount =
          data.requirements?.socialMediaVerification?.verifiedCount || 0;
        if (socialVerifiedCount >= 1) {
          progressPercentage = 75;
        }

        if (data.requirements?.firstStake?.completed) {
          progressPercentage = 100;
        }

        data.progressPercentage = progressPercentage;

        // Calculate timeRemaining from daysRemaining
        if (data.daysRemaining !== undefined && data.expiresAt) {
          const expiresAt = new Date(data.expiresAt);
          const now = new Date();
          data.timeRemaining = Math.max(0, expiresAt.getTime() - now.getTime());
          data.deadline = data.expiresAt;
        }

        // Calculate currentStep from progress
        if (progressPercentage <= 25) {
          data.currentStep = 1;
        } else if (progressPercentage <= 50) {
          data.currentStep = 2;
        } else if (progressPercentage <= 75) {
          data.currentStep = 3;
        } else {
          data.currentStep = 4;
        }

        // Generate nextStepDescription
        if (!data.allRequirementsMet) {
          if (
            !data.requirements?.profileCompletion?.completed ||
            data.requirements.profileCompletion.percentage < 100
          ) {
            data.nextStepDescription =
              'Complete your profile to unlock 25% progress';
          } else if (!data.requirements?.socialMediaVerification?.completed) {
            data.nextStepDescription = `Verify ${data.requirements.socialMediaVerification.totalRequired - data.requirements.socialMediaVerification.verifiedCount} more social platforms`;
          } else if (!data.requirements?.firstStake?.completed) {
            data.nextStepDescription =
              'Create your first stake to activate the bonus';
          }
        } else {
          data.nextStepDescription = 'All requirements met! Bonus activated.';
        }

        // Map new structure to legacy structure for backward compatibility
        if (data.requirements) {
          // Map profileCompletion to legacy profile structure
          data.profile = {
            completionPercentage:
              data.requirements.profileCompletion?.percentage || 0,
            details: [], // Will be populated if backend provides details
          };

          // Map socialMediaVerification to legacy socialMedia structure
          // Create complete list of all 5 platforms with verification status
          const verifiedPlatforms =
            data.requirements.socialMediaVerification?.platforms || [];

          const allPlatforms = [
            SocialMediaPlatform.FACEBOOK,
            SocialMediaPlatform.INSTAGRAM,
            SocialMediaPlatform.YOUTUBE,
            SocialMediaPlatform.TIKTOK,
            SocialMediaPlatform.TELEGRAM,
          ];

          const platformDetails = allPlatforms.map((platformName) => {
            // Case-insensitive comparison (backend might send 'Instagram' or 'instagram')
            const isVerified = verifiedPlatforms.some(
              (p: string) => p?.toLowerCase() === platformName.toLowerCase()
            );

            return {
              platform: platformName,
              isVerified,
              verifiedAt: isVerified ? new Date().toISOString() : null,
              accountHandle: null,
            };
          });

          data.socialMedia = {
            completed:
              data.requirements.socialMediaVerification?.verifiedCount || 0,
            total:
              data.requirements.socialMediaVerification?.totalRequired || 5,
            minimumRequired: 1, // Only 1 required for 25% progress
            details: platformDetails,
          };

          // Map firstStake to legacy structure using firstStakeOld for backward compatibility
          data.firstStakeOld = {
            completed: data.requirements.firstStake?.completed || false,
            amount: 0, // Not provided in new API - use 0 as placeholder
            stakeId: data.requirements.firstStake?.stakeId || null,
          };
        }
      }

      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[registrationBonusApi] Raw response:', response);
        console.log('[registrationBonusApi] Normalized response:', {
          success: normalizedResponse.success,
          hasData: !!normalizedResponse.data,
          status: normalizedResponse.data?.status,
          progressPercentage: normalizedResponse.data?.progressPercentage,
        });
      }

      return normalizedResponse;
    } catch (error: any) {
      // Enhanced error logging
      const status =
        error?.statusCode || error?.response?.status || error?.status;
      const message =
        error?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        'Unknown error';

      // 404 is expected for users without a bonus record - use warn instead of error
      // This prevents Next.js error overlay from showing
      const isExpectedError = status === 404;
      const logMethod = isExpectedError ? console.warn : console.error;
      const logPrefix = isExpectedError
        ? '⚠️ [registrationBonusApi] Expected 404 - no bonus record'
        : '❌ [registrationBonusApi] Failed to fetch status';

      // Better error serialization to avoid empty objects
      const errorInfo: Record<string, unknown> = {
        status,
        message,
        url: error?.config?.url || error?.request?.responseURL,
      };

      // Only include full error in development
      if (process.env.NODE_ENV === 'development') {
        errorInfo.fullError = error;
        errorInfo.errorType = error?.constructor?.name;
        errorInfo.hasResponse = !!error?.response;
        errorInfo.responseData = error?.response?.data;
      }

      logMethod(logPrefix, errorInfo);

      // In development, provide helpful context for 404
      if (process.env.NODE_ENV === 'development' && status === 404) {
        console.info(
          '[registrationBonusApi] 💡 404 means no bonus record exists. ' +
            'This is normal for existing accounts. Register a new account to see the banner.'
        );
      }

      throw error;
    }
  },

  /**
   * Process first stake for bonus
   * POST /api/v1/registration-bonus/process-stake
   * @param stakeId - MongoDB ObjectId of the stake
   * @param stakeAmount - Exact stake amount (use exact value from stake document)
   * @returns Success message and bonus amount if activated
   */
  async processStake(
    stakeId: string,
    stakeAmount: number
  ): Promise<ProcessStakeResponse> {
    try {
      const request: ProcessStakeRequest = {
        stakeId,
        stakeAmount,
      };

      console.log('[registrationBonusApi] Processing stake:', request);

      const response = await api.post<ProcessStakeResponse>(
        '/registration-bonus/process-stake',
        request
      );

      console.log('[registrationBonusApi] Stake processed:', response);
      return response;
    } catch (error: any) {
      console.error('[registrationBonusApi] Failed to process stake:', error);
      throw error;
    }
  },

  /**
   * Get bonus payout history with pagination
   * GET /api/v1/registration-bonus/payout-history
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @returns Paginated list of bonus payouts
   */
  async getPayoutHistory(
    page: number = 1,
    limit: number = 10
  ): Promise<BonusPayoutHistoryResponse> {
    try {
      console.log('[registrationBonusApi] Fetching payout history:', {
        page,
        limit,
      });

      const response = await api.get<BonusPayoutHistoryResponse>(
        '/registration-bonus/payout-history',
        {
          params: { page, limit },
        }
      );

      console.log('[registrationBonusApi] Payout history fetched:', response);
      return response;
    } catch (error: any) {
      console.error(
        '[registrationBonusApi] Failed to fetch payout history:',
        error
      );
      throw error;
    }
  },
};
