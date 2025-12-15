import { createAdminApi } from './adminService';
import type {
  PoolQualifiersResponse,
  PreviewDistributionRequest,
  PreviewDistributionResponse,
  DeclarePoolRequest,
  DeclarePoolResponse,
  DistributePoolRequest,
  DistributePoolResponse,
} from '@/types/pool';

/**
 * Pool Service
 *
 * Handles all pool declaration and distribution operations for admin
 */
class PoolService {
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
   * Get qualifier counts for Performance and Premium pools
   * GET /api/v1/admin/pool/qualifiers
   */
  async getQualifiers(): Promise<PoolQualifiersResponse> {
    const api = createAdminApi(this.get2FACode);
    const response = await api.get<PoolQualifiersResponse>(
      '/admin/pool/qualifiers'
    );
    return response.data;
  }

  /**
   * Preview distribution before declaring
   * POST /api/v1/admin/pool/preview
   */
  async previewDistribution(
    data: PreviewDistributionRequest
  ): Promise<PreviewDistributionResponse> {
    const api = createAdminApi(this.get2FACode);
    const response = await api.post<PreviewDistributionResponse>(
      '/admin/pool/preview',
      data
    );
    return response.data;
  }

  /**
   * Declare pool amounts (with optional auto-distribution)
   * POST /api/v1/admin/pool/declare
   */
  async declarePools(data: DeclarePoolRequest): Promise<DeclarePoolResponse> {
    const api = createAdminApi(this.get2FACode);
    const response = await api.post<DeclarePoolResponse>(
      '/admin/pool/declare',
      data
    );
    return response.data;
  }

  /**
   * Manually distribute declared pool amounts
   * POST /api/v1/admin/pool/distribute
   */
  async distributePools(
    data: DistributePoolRequest
  ): Promise<DistributePoolResponse> {
    const api = createAdminApi(this.get2FACode);
    const response = await api.post<DistributePoolResponse>(
      '/admin/pool/distribute',
      data
    );
    return response.data;
  }
}

// Export singleton instance
export const poolService = new PoolService();
