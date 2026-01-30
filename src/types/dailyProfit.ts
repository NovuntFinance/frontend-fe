/**
 * Daily Profit System - TypeScript Types
 *
 * Types for the daily profit declaration and distribution system
 */

/**
 * Daily Profit (Admin View)
 * Includes all information including future dates
 */
export interface DailyProfit {
  id: string;
  date: string; // YYYY-MM-DD format
  profitPercentage: number; // 0-2.2 (legacy field; backend still accepts it for compatibility)
  premiumPoolAmount: number; // Dollar amount for premium pool
  performancePoolAmount: number; // Dollar amount for performance pool
  rosPercentage: number; // 0-100 (testing; revert to 0-2.2 for production)
  description?: string;
  isActive: boolean;
  isDistributed: boolean;
  distributedAt?: string; // ISO 8601 timestamp
  distributedBy?: {
    _id: string;
    email: string;
    username: string;
  };
  declaredBy: {
    _id: string;
    email: string;
    username: string;
  };
  declaredAt: string; // ISO 8601 timestamp
  createdAt: string;
  updatedAt: string;
}

/**
 * Daily Profit (User View - Today Only)
 * Users can only see today's profit, not future dates
 */
export interface TodayProfit {
  date: string; // YYYY-MM-DD format
  profitPercentage: number; // Legacy field (compat)
  premiumPoolAmount: number; // Dollar amount for premium pool
  performancePoolAmount: number; // Dollar amount for performance pool
  rosPercentage: number; // 0-100 (testing; revert to 0-2.2 for production)
  isDistributed: boolean;
}

/**
 * Daily Profit History (User View - Past Dates Only)
 * Users can see past profit history
 */
export interface DailyProfitHistoryItem {
  date: string; // YYYY-MM-DD format
  profitPercentage: number; // Legacy field (compat)
  premiumPoolAmount: number; // Dollar amount for premium pool
  performancePoolAmount: number; // Dollar amount for performance pool
  rosPercentage: number; // 0-100 (testing; revert to 0-2.2 for production)
  isDistributed: boolean;
}

/**
 * Daily Profit History Response
 */
export interface DailyProfitHistoryResponse {
  profits: DailyProfitHistoryItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

/**
 * Declare Single Day Profit Request
 */
export interface DeclareProfitRequest {
  date: string; // YYYY-MM-DD format
  profitPercentage?: number; // 0-2.2 (legacy, optional; prefer rosPercentage)
  premiumPoolAmount: number; // Dollar amount for premium pool
  performancePoolAmount: number; // Dollar amount for performance pool
  rosPercentage: number; // 0-100 (testing; revert to 0-2.2 for production)
  description?: string;
  twoFACode?: string; // Optional - interceptor will add it if not provided
}

/**
 * Declare Bulk Profit Request
 */
export interface DeclareBulkProfitRequest {
  declarations: Array<{
    date: string; // YYYY-MM-DD format
    profitPercentage?: number; // 0-2.2 (legacy, optional; prefer rosPercentage)
    premiumPoolAmount: number; // Dollar amount for premium pool
    performancePoolAmount: number; // Dollar amount for performance pool
    rosPercentage: number; // 0-100 (testing; revert to 0-2.2 for production)
    description?: string;
  }>;
  twoFACode?: string; // Optional - interceptor will add it if not provided
}

/**
 * Update Profit Request
 */
export interface UpdateProfitRequest {
  profitPercentage?: number; // 0-2.2 (legacy; prefer rosPercentage)
  premiumPoolAmount?: number; // Dollar amount for premium pool
  performancePoolAmount?: number; // Dollar amount for performance pool
  rosPercentage?: number; // 0-100 (testing; revert to 0-2.2 for production)
  description?: string;
  twoFACode?: string; // Optional - interceptor will add it if not provided
}

/**
 * Delete Profit Request
 */
export interface DeleteProfitRequest {
  twoFACode?: string; // Optional - interceptor will add it if not provided
}

/**
 * Test Distribution Request
 */
export interface TestDistributionRequest {
  date: string; // YYYY-MM-DD format
  twoFACode?: string; // Optional - interceptor will add it if not provided
}

/**
 * Distribution Result
 */
export interface DistributionResult {
  profitPercentage: number; // Legacy field
  premiumPoolAmount: number;
  performancePoolAmount: number;
  rosPercentage: number;
  totalStakes: number;
  processedStakes: number;
  completedStakes: number;
  totalDistributed: number; // Total USDT distributed across all three pools
  premiumPoolDistributed: number; // USDT from premium pool
  performancePoolDistributed: number; // USDT from performance pool
  rosDistributed: number; // USDT from ROS
  errors?: string[]; // Array of error messages if any
}

/**
 * Get Declared Profits Filters
 */
export interface DeclaredProfitsFilters {
  startDate?: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format
  isDistributed?: boolean;
}

/**
 * API Response Types
 */
export interface DeclareProfitResponse {
  success: boolean;
  message: string;
  data: {
    dailyProfit: DailyProfit;
  };
}

export interface DeclareBulkProfitResponse {
  success: boolean;
  message: string;
  data: {
    declared: DailyProfit[];
    errors?: Array<{
      date: string;
      error: string;
    }>;
  };
}

export interface GetDeclaredProfitsResponse {
  success: boolean;
  data: {
    dailyProfits: DailyProfit[];
  };
}

export interface UpdateProfitResponse {
  success: boolean;
  message: string;
  data: {
    dailyProfit: DailyProfit;
  };
}

export interface DeleteProfitResponse {
  success: boolean;
  message: string;
}

export interface TestDistributionResponse {
  success: boolean;
  message: string;
  data: DistributionResult;
}

export interface TodayProfitResponse {
  success: boolean;
  data: TodayProfit;
}

export interface ProfitHistoryResponse {
  success: boolean;
  data: DailyProfitHistoryResponse;
}

/**
 * Error Response
 */
export interface DailyProfitError {
  success: false;
  error: {
    code:
      | 'VALIDATION_ERROR'
      | 'INVALID_PERCENTAGE'
      | 'INVALID_DATE'
      | 'DATE_TOO_FAR'
      | 'ALREADY_DISTRIBUTED'
      | 'NOT_FOUND'
      | '2FA_CODE_REQUIRED'
      | '2FA_CODE_INVALID'
      | 'FORBIDDEN'
      | 'INTERNAL_SERVER_ERROR';
    message: string;
    details?: Record<string, string>; // For validation errors
  };
}
