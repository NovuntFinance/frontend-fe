/**
 * API Response Types
 * All API responses follow these standardized formats
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
  code?: string; // Error code for specific error types (e.g., 'CORS_ERROR', 'ERR_NETWORK')
  // Backend registration error fields (from FRONTEND_INTEGRATION_REGISTRATION_FIXES.md)
  field?: string; // Which field caused the error ('email', 'username', etc.)
  action?: string; // Suggested action ('login', 'change_username', etc.)
  canResetPassword?: boolean; // Whether password reset is available
  // Preserve original response for compatibility
  response?: {
    data?: {
      message?: string;
      field?: string;
      action?: string;
      canResetPassword?: boolean;
      [key: string]: unknown;
    };
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

// Generic list response
export interface ListResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
