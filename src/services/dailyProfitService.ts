import { createAdminApi } from './adminService';
import { adminAuthService } from './adminAuthService';
import axios from 'axios';
import type {
  DeclareProfitRequest,
  DeclareProfitResponse,
  DeclareBulkProfitRequest,
  DeclareBulkProfitResponse,
  GetDeclaredProfitsResponse,
  UpdateProfitRequest,
  UpdateProfitResponse,
  DeleteProfitRequest,
  DeleteProfitResponse,
  TestDistributionRequest,
  TestDistributionResponse,
  TodayProfitResponse,
  ProfitHistoryResponse,
  DeclaredProfitsFilters,
} from '@/types/dailyProfit';

// Get API base URL - handle both with and without /api/v1 prefix
const getAPIBaseURL = (): string => {
  const envURL = process.env.NEXT_PUBLIC_API_URL;

  if (envURL) {
    // Remove /api/v1 if it's already in the URL to avoid duplication
    return envURL.replace(/\/api\/v1$/, '') || envURL;
  }

  // Fallback without /api/v1 (we'll add it in endpoints)
  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://api.novunt.com';
};

const API_BASE_URL = getAPIBaseURL();

/**
 * Daily Profit Service
 *
 * Handles all daily profit operations for both admin and user endpoints
 */
class DailyProfitService {
  private get2FACode: () => Promise<string | null>;

  constructor() {
    // Default: prompt for 2FA code (will be set by admin layout)
    this.get2FACode = async () => {
      return new Promise((resolve) => {
        const code = prompt('Enter 2FA code from your authenticator app:');
        resolve(code || null);
      });
    };
  }

  /**
   * Set custom 2FA code getter (e.g., from React context)
   */
  set2FACodeGetter(getter: () => Promise<string | null>): void {
    this.get2FACode = getter;
  }

  /**
   * Get the current 2FA code getter
   */
  get2FACodeGetter(): (() => Promise<string | null>) | undefined {
    return this.get2FACode;
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Declare profit for a single day
   * POST /api/v1/admin/daily-profit/declare
   */
  async declareProfit(
    data: DeclareProfitRequest
  ): Promise<DeclareProfitResponse> {
    const api = createAdminApi(this.get2FACode);
    const response = await api.post<DeclareProfitResponse>(
      '/admin/daily-profit/declare',
      data
    );
    return response.data;
  }

  /**
   * Declare profits for multiple days (bulk)
   * POST /api/v1/admin/daily-profit/declare-bulk
   */
  async declareBulkProfit(
    data: DeclareBulkProfitRequest
  ): Promise<DeclareBulkProfitResponse> {
    const api = createAdminApi(this.get2FACode);
    const response = await api.post<DeclareBulkProfitResponse>(
      '/admin/daily-profit/declare-bulk',
      data
    );
    return response.data;
  }

  /**
   * Get all declared profits (admin view - includes future dates)
   * GET /api/v1/admin/daily-profit/declared
   * Note: GET requests do NOT require 2FA
   */
  async getDeclaredProfits(
    filters?: DeclaredProfitsFilters
  ): Promise<GetDeclaredProfitsResponse> {
    // Use no-op 2FA getter for GET requests (backend doesn't require 2FA for reads)
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);
    const params: Record<string, string> = {};

    if (filters?.startDate) {
      params.startDate = filters.startDate;
    }
    if (filters?.endDate) {
      params.endDate = filters.endDate;
    }
    if (filters?.isDistributed !== undefined) {
      params.isDistributed = String(filters.isDistributed);
    }

    const response = await api.get<GetDeclaredProfitsResponse>(
      '/admin/daily-profit/declared',
      { params }
    );
    return response.data;
  }

  /**
   * Update a future profit declaration
   * PATCH /api/v1/admin/daily-profit/:date
   */
  async updateProfit(
    date: string,
    data: UpdateProfitRequest
  ): Promise<UpdateProfitResponse> {
    const api = createAdminApi(this.get2FACode);
    const response = await api.patch<UpdateProfitResponse>(
      `/admin/daily-profit/${date}`,
      data
    );
    return response.data;
  }

  /**
   * Delete a future profit declaration
   * DELETE /api/v1/admin/daily-profit/:date
   */
  async deleteProfit(
    date: string,
    data: DeleteProfitRequest
  ): Promise<DeleteProfitResponse> {
    const api = createAdminApi(this.get2FACode);
    const response = await api.delete<DeleteProfitResponse>(
      `/admin/daily-profit/${date}`,
      { data }
    );
    return response.data;
  }

  /**
   * Test distribution for a specific date (manual trigger)
   * POST /api/v1/admin/daily-profit/test-distribute
   */
  async testDistribute(
    data: TestDistributionRequest
  ): Promise<TestDistributionResponse> {
    const api = createAdminApi(this.get2FACode);
    const response = await api.post<TestDistributionResponse>(
      '/admin/daily-profit/test-distribute',
      data
    );
    return response.data;
  }

  // ==================== USER ENDPOINTS ====================

  /**
   * Get today's profit (user view - only today, no future dates)
   * GET /api/v1/daily-profit/today
   */
  async getTodayProfit(): Promise<TodayProfitResponse> {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;

    if (!token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await axios.get<TodayProfitResponse>(
        `${API_BASE_URL}/api/v1/daily-profit/today`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      // Handle 404 gracefully - no profit available
      // Users see previous day's profit. Today's profit becomes visible at 23:59:59 BIT after distribution.
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        const backendMessage = error.response?.data?.error?.message;
        throw new Error(
          backendMessage ||
            "No profit available. Today's profit becomes visible at 23:59:59 BIT after distribution."
        );
      }
      throw error;
    }
  }

  /**
   * Get profit history (user view - only past dates)
   * GET /api/v1/daily-profit/history
   */
  async getProfitHistory(
    limit: number = 30,
    offset: number = 0
  ): Promise<ProfitHistoryResponse> {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;

    if (!token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await axios.get<ProfitHistoryResponse>(
        `${API_BASE_URL}/api/v1/daily-profit/history`,
        {
          params: { limit, offset },
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[dailyProfitService.getProfitHistory] Response:', {
          status: response.status,
          hasData: !!response.data,
          success: response.data?.success,
          profitsCount: response.data?.data?.profits?.length || 0,
          profits: response.data?.data?.profits,
        });
      }

      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.message || error?.response?.data?.message;

      // Enhanced error logging
      if (process.env.NODE_ENV === 'development') {
        console.error('[dailyProfitService.getProfitHistory] Error:', {
          status,
          message,
          url: `${API_BASE_URL}/api/v1/daily-profit/history`,
          params: { limit, offset },
          error,
        });
      }

      // If 404, return empty response instead of throwing (endpoint might not exist yet)
      if (status === 404) {
        console.warn(
          '[dailyProfitService.getProfitHistory] ⚠️ 404 - Endpoint not found or no data. Returning empty response.'
        );
        return {
          success: true,
          data: {
            profits: [],
            pagination: {
              limit,
              offset,
              total: 0,
            },
          },
        };
      }

      throw error;
    }
  }
}

// Export singleton instance
export const dailyProfitService = new DailyProfitService();
