/**
 * Daily Declaration Returns - TypeScript Types
 *
 * Types for the unified Daily Declaration Returns API
 * Combines Pool Declaration + Daily Profit functionality
 */

/**
 * Declare Returns Request
 * POST /api/v1/admin/daily-declaration-returns/declare
 */
export interface DeclareReturnsRequest {
  date: string; // YYYY-MM-DD format
  premiumPoolAmount: number; // >= 0
  performancePoolAmount: number; // >= 0
  rosPercentage: number; // 0-100 (testing; revert to 0-2.2 for production)
  description?: string;
  autoDistributePools?: boolean; // Default: false
  autoDistributeROS?: boolean; // Default: false
  twoFACode?: string; // Required if admin has 2FA enabled
}

/**
 * Update Declaration Request
 * PATCH /api/v1/admin/daily-declaration-returns/:date
 */
export interface UpdateDeclarationRequest {
  premiumPoolAmount?: number;
  performancePoolAmount?: number;
  rosPercentage?: number;
  description?: string;
  twoFACode?: string;
}

/**
 * Delete Declaration Request
 * DELETE /api/v1/admin/daily-declaration-returns/:date
 */
export interface DeleteDeclarationRequest {
  twoFACode?: string;
}

/**
 * Distribute Declaration Request
 * POST /api/v1/admin/daily-declaration-returns/:date/distribute
 */
export interface DistributeDeclarationRequest {
  distributePools: boolean;
  distributeROS: boolean;
  twoFACode?: string;
}

/**
 * Get Declared Returns Query Parameters
 * GET /api/v1/admin/daily-declaration-returns/declared
 */
export interface GetDeclaredReturnsFilters {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  includeDistributed?: boolean; // Default: true
}

/**
 * Declaration Object (from API response)
 */
export interface DailyDeclarationReturn {
  date: string; // YYYY-MM-DD
  premiumPoolAmount: number;
  performancePoolAmount: number;
  rosPercentage: number;
  description?: string;
  totalPoolAmount: number;
  poolsDistributed: boolean;
  poolsDistributedAt: string | null;
  rosDistributed: boolean;
  rosDistributedAt: string | null;
  declaredBy: {
    _id: string;
    email: string;
    username: string;
  };
  declaredAt: string; // ISO 8601 timestamp
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Pool Distribution Details
 */
export interface PoolDistributionDetails {
  distributed: boolean;
  distributedAt: string | null;
  performancePool: {
    distributed: number; // Number of users
    totalDistributed: number; // Total amount
  };
  premiumPool: {
    distributed: number;
    totalDistributed: number;
  };
  totalDistributed: number;
}

/**
 * ROS Distribution Details
 */
export interface ROSDistributionDetails {
  scheduled: boolean;
  scheduledFor: string | null;
  distributed: boolean;
  distributedAt: string | null;
}

/**
 * Qualifiers Information
 */
export interface QualifiersInfo {
  performancePool: {
    totalQualifiers: number;
    byRank: Record<string, number>;
  };
  premiumPool: {
    totalQualifiers: number;
    byRank: Record<string, number>;
  };
}

/**
 * Declare Returns Response
 * POST /api/v1/admin/daily-declaration-returns/declare
 */
export interface DeclareReturnsResponse {
  success: boolean;
  message: string;
  data: {
    declaration: {
      date: string;
      premiumPoolAmount: number;
      performancePoolAmount: number;
      rosPercentage: number;
      description?: string;
      totalPoolAmount: number;
      declaredBy: {
        _id: string;
        email: string;
        username: string;
      };
      declaredAt: string;
    };
    poolDistribution: PoolDistributionDetails;
    rosDistribution: ROSDistributionDetails;
    qualifiers: QualifiersInfo;
  };
}

/**
 * Get Declared Returns Response
 * GET /api/v1/admin/daily-declaration-returns/declared
 */
export interface GetDeclaredReturnsResponse {
  success: boolean;
  data: {
    declarations: DailyDeclarationReturn[];
    summary: {
      totalDates: number;
      totalPoolAmount: number;
      totalROSDeclared: number;
      distributedDates: number;
      pendingDates: number;
    };
  };
  meta: {
    startDate: string;
    endDate: string;
    count: number;
  };
}

/**
 * Get Declaration by Date Response
 * GET /api/v1/admin/daily-declaration-returns/:date
 */
export interface GetDeclarationByDateResponse {
  success: boolean;
  data: DailyDeclarationReturn;
}

/**
 * Update Declaration Response
 * PATCH /api/v1/admin/daily-declaration-returns/:date
 */
export interface UpdateDeclarationResponse {
  success: boolean;
  message: string;
  data: {
    declaration: {
      date: string;
      premiumPoolAmount: number;
      performancePoolAmount: number;
      rosPercentage: number;
      description?: string;
      totalPoolAmount: number;
      declaredBy: {
        _id: string;
        email: string;
        username: string;
      };
      declaredAt: string;
    };
    poolDistribution: PoolDistributionDetails;
    rosDistribution: ROSDistributionDetails;
    qualifiers: QualifiersInfo;
  };
}

/**
 * Delete Declaration Response
 * DELETE /api/v1/admin/daily-declaration-returns/:date
 */
export interface DeleteDeclarationResponse {
  success: boolean;
  message: string;
}

/**
 * Distribute Declaration Response
 * POST /api/v1/admin/daily-declaration-returns/:date/distribute
 */
export interface DistributeDeclarationResponse {
  success: boolean;
  message: string;
  data: {
    date: string;
    poolDistribution: {
      distributed: boolean;
      distributedAt: string;
      performancePool: {
        distributed: number;
        totalDistributed: number;
      };
      premiumPool: {
        distributed: number;
        totalDistributed: number;
      };
      totalDistributed: number;
    };
    rosDistribution: {
      distributed: boolean;
      distributedAt: string;
      rosPercentage: number;
      totalStakes: number;
      processedStakes: number;
      totalDistributed: number;
    };
  };
}
