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
 */
export interface RankProgressData {
    current_rank: string;
    current_rank_icon?: string;
    next_rank: string | null;
    next_rank_icon?: string;
    progress_percent: number;
    requirements: RankRequirements;
    pool_qualification: PoolQualification;
    overall_progress_percent: number;
    premium_progress_percent: number;
    details: TaskDetails;
}

/**
 * Individual requirement structure
 */
export interface Requirement {
    current: number;
    required: number;
    remaining: number;
    progress_percent: number;
    is_met: boolean;
}

/**
 * Lower rank requirement with description
 */
export interface LowerRankRequirement extends Requirement {
    description: string;
}

/**
 * All rank requirements
 */
export interface RankRequirements {
    personal_stake: Requirement;
    team_stake: Requirement;
    direct_downlines: Requirement;
    lower_rank_downlines: LowerRankRequirement;
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
