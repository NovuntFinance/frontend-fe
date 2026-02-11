import { createAdminApi } from './adminService';
import type {
  DeclareReturnsRequest,
  DeclareReturnsResponse,
  GetDeclaredReturnsFilters,
  GetDeclaredReturnsResponse,
  GetDeclarationByDateResponse,
  UpdateDeclarationRequest,
  UpdateDeclarationResponse,
  DeleteDeclarationRequest,
  DeleteDeclarationResponse,
  DistributeDeclarationRequest,
  DistributeDeclarationResponse,
  TodayStatusResponse,
  QueueDistributionRequest,
  QueueDistributionResponse,
  ModifyDistributionRequest,
  ModifyDistributionResponse,
  CancelDistributionRequest,
  CancelDistributionResponse,
  GetHistoryResponse,
  HistoryFilters,
  DistributionDetailsResponse,
} from '@/types/dailyDeclarationReturns';

/**
 * Daily Declaration Returns Service
 *
 * Handles unified Daily Declaration Returns operations (pools + ROS)
 * Uses the new unified endpoints: /api/v1/admin/daily-declaration-returns/*
 */
class DailyDeclarationReturnsService {
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

  // ==================== UNIFIED ENDPOINTS ====================

  /**
   * Declare pools + ROS for a specific date
   * POST /api/v1/admin/daily-declaration-returns/declare
   * Backend returns 202 Accepted when autoDistributeROS and rosPercentage > 0 (ROS in background).
   */
  async declareReturns(
    data: DeclareReturnsRequest
  ): Promise<{ data: DeclareReturnsResponse; status: number }> {
    const api = createAdminApi(this.get2FACode);
    const response = await api.post<DeclareReturnsResponse>(
      '/admin/daily-declaration-returns/declare',
      data
    );
    return { data: response.data, status: response.status };
  }

  /**
   * Get all declarations for a date range
   * GET /api/v1/admin/daily-declaration-returns/declared
   * Note: GET requests do NOT require 2FA
   */
  async getDeclaredReturns(
    filters?: GetDeclaredReturnsFilters
  ): Promise<GetDeclaredReturnsResponse> {
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
    if (filters?.includeDistributed !== undefined) {
      params.includeDistributed = String(filters.includeDistributed);
    }

    const response = await api.get<GetDeclaredReturnsResponse>(
      '/admin/daily-declaration-returns/declared',
      { params }
    );
    return response.data;
  }

  /**
   * Get declaration for a specific date
   * GET /api/v1/admin/daily-declaration-returns/:date
   * Note: GET requests do NOT require 2FA
   */
  async getDeclarationByDate(
    date: string
  ): Promise<GetDeclarationByDateResponse> {
    // Use no-op 2FA getter for GET requests
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);
    const response = await api.get<GetDeclarationByDateResponse>(
      `/admin/daily-declaration-returns/${date}`
    );
    return response.data;
  }

  /**
   * Update a future declaration
   * PATCH /api/v1/admin/daily-declaration-returns/:date
   */
  async updateDeclaration(
    date: string,
    data: UpdateDeclarationRequest
  ): Promise<UpdateDeclarationResponse> {
    const api = createAdminApi(this.get2FACode);
    const response = await api.patch<UpdateDeclarationResponse>(
      `/admin/daily-declaration-returns/${date}`,
      data
    );
    return response.data;
  }

  /**
   * Delete a future declaration
   * DELETE /api/v1/admin/daily-declaration-returns/:date
   */
  async deleteDeclaration(
    date: string,
    data: DeleteDeclarationRequest
  ): Promise<DeleteDeclarationResponse> {
    const api = createAdminApi(this.get2FACode);
    const response = await api.delete<DeleteDeclarationResponse>(
      `/admin/daily-declaration-returns/${date}`,
      { data }
    );
    return response.data;
  }

  /**
   * Manually trigger distribution for a specific date
   * POST /api/v1/admin/daily-declaration-returns/:date/distribute
   * Backend returns 202 Accepted when distributeROS is true (ROS runs in background).
   */
  async distributeDeclaration(
    date: string,
    data: DistributeDeclarationRequest
  ): Promise<{ data: DistributeDeclarationResponse; status: number }> {
    const api = createAdminApi(this.get2FACode);
    const response = await api.post<DistributeDeclarationResponse>(
      `/admin/daily-declaration-returns/${date}/distribute`,
      data
    );
    return { data: response.data, status: response.status };
  }

  // ==================== TODAY'S DISTRIBUTION (NEW) ====================

  /**
   * Get today's distribution status
   * GET /api/v1/admin/daily-declaration-returns/today/status
   * Note: GET requests do NOT require 2FA
   */
  async getTodayStatus(): Promise<TodayStatusResponse> {
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);
    const response = await api.get<TodayStatusResponse>(
      '/admin/daily-declaration-returns/today/status'
    );
    return response.data;
  }

  /**
   * Queue a distribution for today
   * POST /api/v1/admin/daily-declaration-returns/today/queue
   */
  async queueDistribution(
    data: QueueDistributionRequest
  ): Promise<QueueDistributionResponse> {
    const api = createAdminApi(this.get2FACode);
    const response = await api.post<QueueDistributionResponse>(
      '/admin/daily-declaration-returns/today/queue',
      data
    );
    return response.data;
  }

  /**
   * Modify queued distribution for today
   * PATCH /api/v1/admin/daily-declaration-returns/today/modify
   */
  async modifyDistribution(
    data: ModifyDistributionRequest
  ): Promise<ModifyDistributionResponse> {
    const api = createAdminApi(this.get2FACode);
    const response = await api.patch<ModifyDistributionResponse>(
      '/admin/daily-declaration-returns/today/modify',
      data
    );
    return response.data;
  }

  /**
   * Cancel queued distribution for today
   * DELETE /api/v1/admin/daily-declaration-returns/today/cancel
   */
  async cancelDistribution(
    data: CancelDistributionRequest
  ): Promise<CancelDistributionResponse> {
    const api = createAdminApi(this.get2FACode);
    const response = await api.delete<CancelDistributionResponse>(
      '/admin/daily-declaration-returns/today/cancel',
      { data }
    );
    return response.data;
  }

  /**
   * Get distribution history
   * GET /api/v1/admin/daily-declaration-returns/history
   * Note: GET requests do NOT require 2FA
   */
  async getHistory(filters?: HistoryFilters): Promise<GetHistoryResponse> {
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);
    const params: Record<string, string | number> = {};

    if (filters?.startDate) {
      params.startDate = filters.startDate;
    }
    if (filters?.endDate) {
      params.endDate = filters.endDate;
    }
    if (filters?.status && filters.status !== 'ALL') {
      params.status = filters.status;
    }
    if (filters?.queuedBy) {
      params.queuedBy = filters.queuedBy;
    }
    if (filters?.page) {
      params.page = filters.page;
    }
    if (filters?.limit) {
      params.limit = filters.limit;
    }

    const response = await api.get<GetHistoryResponse>(
      '/admin/daily-declaration-returns/history',
      { params }
    );
    return response.data;
  }

  /**
   * Get distribution details for a specific date
   * GET /api/v1/admin/daily-declaration-returns/{date}/details
   * Note: GET requests do NOT require 2FA
   */
  async getDistributionDetails(
    date: string
  ): Promise<DistributionDetailsResponse> {
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);
    const response = await api.get<DistributionDetailsResponse>(
      `/admin/daily-declaration-returns/${date}/details`
    );
    return response.data;
  }

  /**
   * Export distribution history
   * GET /api/v1/admin/daily-declaration-returns/history/export
   * Note: Returns file URL or triggers download
   */
  async exportHistory(format: 'csv' | 'pdf'): Promise<string> {
    const get2FACode = async () => null;
    const api = createAdminApi(get2FACode);
    const response = await api.get<{ data: { downloadUrl: string } }>(
      '/admin/daily-declaration-returns/history/export',
      { params: { format } }
    );
    return response.data.data.downloadUrl;
  }
}

// Export singleton instance
export const dailyDeclarationReturnsService =
  new DailyDeclarationReturnsService();
