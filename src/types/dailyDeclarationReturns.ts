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

// Test ROS functionality has been removed from backend (see FRONTEND_UPDATE_TEST_ROS_REMOVED.md)
// All distributions now run via scheduled production flow only

// ==================== TODAY'S DISTRIBUTION (NEW) ====================

/**
 * Today's Distribution Status Response
 * GET /api/v1/admin/daily-declaration-returns/today/status
 */
export interface TodayStatusResponse {
  success: boolean;
  data: {
    today: string; // YYYY-MM-DD (current date)
    status:
      | 'EMPTY'
      | 'PENDING'
      | 'SCHEDULED'
      | 'EXECUTING'
      | 'COMPLETED'
      | 'FAILED';
    scheduledFor: string | null; // ISO 8601 timestamp (e.g., "2026-02-10T14:59:59Z")
    values: {
      rosPercentage: number;
      premiumPoolAmount: number;
      performancePoolAmount: number;
      description: string;
    };
    lastExecution: {
      status: 'COMPLETED' | 'FAILED' | null;
      rosStats?: {
        processedStakes: number;
        totalDistributed: number;
      };
      premiumPoolStats?: {
        usersReceived: number;
        totalDistributed: number;
      };
      performancePoolStats?: {
        usersReceived: number;
        totalDistributed: number;
      };
      executionTimeMs?: number;
      executedAt?: string;
      error?: string;
    } | null;
  };
}

/**
 * Queue Distribution Request
 * POST /api/v1/admin/daily-declaration-returns/today/queue
 */
export interface QueueDistributionRequest {
  rosPercentage: number; // 0-100
  premiumPoolAmount: number; // >= 0
  performancePoolAmount: number; // >= 0
  description?: string;
  twoFACode?: string; // Required if admin has 2FA enabled
}

/**
 * Queue Distribution Response
 * POST /api/v1/admin/daily-declaration-returns/today/queue
 */
export interface QueueDistributionResponse {
  success: boolean;
  message: string;
  data: TodayStatusResponse['data']; // Returns updated status
}

/**
 * Modify Distribution Request
 * PATCH /api/v1/admin/daily-declaration-returns/today/modify
 */
export interface ModifyDistributionRequest {
  rosPercentage?: number;
  premiumPoolAmount?: number;
  performancePoolAmount?: number;
  description?: string;
  twoFACode?: string;
}

/**
 * Modify Distribution Response
 * PATCH /api/v1/admin/daily-declaration-returns/today/modify
 */
export interface ModifyDistributionResponse {
  success: boolean;
  message: string;
  data: TodayStatusResponse['data']; // Returns updated status
}

/**
 * Cancel Distribution Request
 * DELETE /api/v1/admin/daily-declaration-returns/today/cancel
 */
export interface CancelDistributionRequest {
  twoFACode?: string;
}

/**
 * Cancel Distribution Response
 * DELETE /api/v1/admin/daily-declaration-returns/today/cancel
 */
export interface CancelDistributionResponse {
  success: boolean;
  message: string;
}

/**
 * History Entry (from history list)
 */
export interface HistoryEntry {
  date: string; // YYYY-MM-DD
  status: 'COMPLETED' | 'FAILED';
  rosPercentage: number;
  poolsAmount: number;
  usersCount: number;
  executedAt: string; // Display format (e.g., "3:59:59 PM")
  executedAtISO: string; // ISO 8601 timestamp
  error?: string; // If failed
}

/**
 * History Filters
 * GET /api/v1/admin/daily-declaration-returns/history
 */
export interface HistoryFilters {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  status?: 'COMPLETED' | 'FAILED' | 'ALL'; // Default: 'ALL'
  queuedBy?: string; // Admin ID/email
  page?: number; // Default: 1
  limit?: number; // Default: 50
}

/**
 * Get History Response
 * GET /api/v1/admin/daily-declaration-returns/history
 */
export interface GetHistoryResponse {
  success: boolean;
  data: {
    records: HistoryEntry[];
    totalRecords: number;
    currentPage: number;
    pageLimit: number;
  };
}

/**
 * Distribution Details Response
 * GET /api/v1/admin/daily-declaration-returns/{date}/details
 */
export interface DistributionDetailsResponse {
  success: boolean;
  data: {
    date: string;
    status: 'COMPLETED' | 'FAILED';
    queuedBy: {
      _id: string;
      email: string;
      username: string;
    };
    queuedAt: string;
    executedAt: string;
    values: {
      rosPercentage: number;
      premiumPoolAmount: number;
      performancePoolAmount: number;
      description?: string;
    };
    rosDistribution?: {
      processedStakes: number;
      totalDistributed: number;
    };
    poolDistribution?: {
      premium: {
        usersCount: number;
        totalAmount: number;
      };
      performance: {
        usersCount: number;
        totalAmount: number;
      };
    };
    executionTimeMs: number;
    error?: string;
  };
}
