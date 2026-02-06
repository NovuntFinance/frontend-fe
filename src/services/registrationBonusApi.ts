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
   * GET /api/v1/registration-bonus/status
   * @returns Complete registration bonus status with requirements and progress
   */
  async getStatus(): Promise<RegistrationBonusStatusResponse> {
    try {
      const response = await api.get<any>('/registration-bonus/status');

      let normalizedResponse: RegistrationBonusStatusResponse;

      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response) {
          normalizedResponse = response as RegistrationBonusStatusResponse;
        } else if ('status' in response) {
          normalizedResponse = {
            success: true,
            data: response as any,
          };
        } else {
          normalizedResponse = {
            success: true,
            data: response as any,
          };
        }
      } else {
        normalizedResponse = {
          success: false,
          message: 'Invalid response format',
        };
      }

      // Add helper fields for backward compatibility if needed,
      // but backend V2 now provides the source of truth for progress
      if (normalizedResponse.data) {
        const data = normalizedResponse.data;

        // Ensure timeRemaining is calculated for UI timers
        if (data.daysRemaining !== undefined) {
          data.timeRemaining = data.daysRemaining * 24 * 60 * 60 * 1000;
        }
      }

      return normalizedResponse;
    } catch (error: any) {
      const status =
        error?.statusCode || error?.response?.status || error?.status;
      if (status === 404) {
        console.warn('⚠️ [registrationBonusApi] No bonus record found (404)');
      } else {
        console.error(
          '❌ [registrationBonusApi] Failed to fetch status:',
          error
        );
      }
      throw error;
    }
  },

  /**
   * Complete social media step manually
   * POST /api/v1/registration-bonus/complete-social
   */
  async completeSocialStep(
    platform: SocialMediaPlatform | string,
    handle?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      return await api.post('/registration-bonus/complete-social', {
        platform,
        handle,
      });
    } catch (error) {
      console.error(
        '[registrationBonusApi] Failed to complete social step:',
        error
      );
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
