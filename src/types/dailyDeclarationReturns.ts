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
  rosDistributed: boolean; // Previously isDistributed
  rosDistributedAt: string | null; // Previously distributedAt
  poolsDistributionDetails?: {
    performancePool: {
      distributed: number; // Number of users
      totalDistributed: number; // Total amount
    };
    premiumPool: {
      distributed: number; // Number of users
      totalDistributed: number; // Total amount
    };
    totalDistributed: number;
    note?: string; // Optional note (e.g., "No qualified users - automatically marked as complete")
  };
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
  scheduled?: boolean;
  scheduledFor?: string | null;
  distributed: boolean;
  distributedAt?: string | null;
  status?: 'processing' | 'completed' | 'failed'; // For async responses
  message?: string; // For async responses (e.g., "ROS distribution is running in the background...")
}

/**
 * Qualifiers Information
 */
export interface QualifiersInfo {
  performancePool: {
    total: number; // Total qualifiers
    byRank: Record<string, number>; // Breakdown by rank
  };
  premiumPool: {
    total: number; // Total qualifiers
    byRank: Record<string, number>; // Breakdown by rank
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
      poolsDistributed: boolean; // May be true if 0 qualifiers
      rosDistributed: boolean;
    };
    qualifiers?: QualifiersInfo; // NEW - Qualifier counts
    poolDistribution?: PoolDistributionDetails | null; // NEW - Distribution result (if autoDistributePools=true)
    rosDistribution?: ROSDistributionDetails | null; // NEW - Distribution result (if autoDistributeROS=true)
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
      pendingROS: number; // NEW - Dates with ROS not distributed
      pendingPools: number; // NEW - Dates with pools not distributed
      partiallyDistributed: number; // NEW - Dates with only one distributed (ROS or pools)
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
 * Returns 202 Accepted for async processing
 */
export interface DistributeDeclarationResponse {
  success: boolean;
  message: string;
  data: {
    date: string;
    status: 'processing'; // NEW - Always "processing" for 202 responses
    poolDistribution?: {
      distributed: boolean;
      distributedAt?: string;
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
      status: 'processing';
      message: string; // e.g., "ROS distribution is running in the background. This may take several minutes."
    };
  };
}
