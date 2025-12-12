/**
 * Rank Progress Types
 * Type definitions for the Rank Progress API
 */

/**
 * Main response from the Rank Progress API
 */
export interface RankProgressResponse {
  success: boolean;
  data: RankProgressData;
  meta: {
    response_time_ms: number;
  };
}

/**
 * Rank progress data structure
 *
 * Note: Lightweight endpoint returns basic fields (progress_percent, requirements with is_met)
 * Detailed endpoint returns all fields including pool_qualification, details, etc.
 */
export interface RankProgressData {
  current_rank: string;
  current_rank_icon?: string | null;
  next_rank: string | null;
  next_rank_icon?: string | null;
  progress_percent: number; // Always present (lightweight and detailed)
  requirements: RankRequirements;
  // Optional fields (only in detailed endpoint)
  pool_qualification?: PoolQualification;
  overall_progress_percent?: number; // Only in detailed endpoint
  premium_progress_percent?: number; // Only in detailed endpoint
  details?: TaskDetails; // Only in detailed endpoint
  _meta?: {
    // Only in lightweight endpoint
    is_lightweight: boolean;
    detailed_endpoint: string;
  };
}

/**
 * Individual requirement structure
 *
 * Note: Both lightweight and detailed endpoints include is_met
 * Lightweight endpoint: current, required, progress_percent, is_met
 * Detailed endpoint: all fields including remaining
 */
export interface Requirement {
  current: number;
  required: number;
  progress_percent: number;
  is_met: boolean; // Always present in both lightweight and detailed endpoints
  // Optional fields (only in detailed endpoint)
  remaining?: number;
  description?: string; // For lower_rank_downlines
}

/**
 * Lower rank requirement with description
 */
export interface LowerRankRequirement extends Requirement {
  description: string;
}

/**
 * All rank requirements
 *
 * Note: Lightweight endpoint has basic requirements (personal_stake, team_stake, direct_downlines)
 * Detailed endpoint includes lower_rank_downlines
 */
export interface RankRequirements {
  personal_stake: Requirement;
  team_stake: Requirement;
  direct_downlines: Requirement;
  lower_rank_downlines?: LowerRankRequirement; // Only in detailed endpoint
}

/**
 * Pool qualification information
 */
export interface PoolQualification {
  performance_pool: PoolStatus;
  premium_pool: PremiumPoolStatus;
}

/**
 * Performance pool status
 */
export interface PoolStatus {
  is_qualified: boolean;
  icon: string;
  message: string;
}

/**
 * Premium pool status with additional fields
 */
export interface PremiumPoolStatus extends PoolStatus {
  cached_status: boolean;
  last_verified: string | null;
  using_cached: boolean;
}

/**
 * Task completion details
 */
export interface TaskDetails {
  tasks_completed: string[];
  tasks_remaining: string[];
}

/**
 * Error response structure
 */
export interface RankProgressErrorResponse {
  success: false;
  message: string;
  error?: string;
  meta?: {
    response_time_ms: number;
  };
}
