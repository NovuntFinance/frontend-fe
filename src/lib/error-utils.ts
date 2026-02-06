/**
 * Error Handling Utilities
 * Standardized error processing and message extraction.
 * Security: Never expose stack traces, paths, or internal backend details to the UI.
 */

import { ApiError } from '@/types/api';
import { logger } from './logger';

/**
 * Error message dictionary for consistent user-facing messages.
 * MUST be declared before functions that reference it.
 */
export const ERROR_MESSAGES = {
  // Network & Connection
  NETWORK_ERROR:
    'Unable to connect to the server. Please check your internet connection.',
  CORS_ERROR:
    'Connection blocked. Please ensure the backend server is running.',
  TIMEOUT: 'Request timed out. Please try again.',

  // Authentication
  AUTH_REQUIRED: 'Please log in to continue.',
  INVALID_TOKEN: 'Your session has expired. Please log in again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  INVALID_CREDENTIALS: 'Invalid email or password.',

  // Validation
  VALIDATION_ERROR: 'Please check your input and try again.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_FORMAT: 'Invalid format. Please check your input.',

  // Server Errors
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',

  // Generic
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  OPERATION_FAILED: 'Operation failed. Please try again.',
} as const;

/** Patterns that indicate internal/unsafe content (paths, stack traces, tokens). */
const UNSAFE_PATTERNS = [
  /\/[a-z0-9_.-]+\/[a-z0-9_.-]+/i, // path segments
  /at\s+\S+\s+\(/i, // stack "at File ("
  /^\s*at\s+/m, // stack lines
  /[a-f0-9]{32,}/i, // long hex (tokens/ids)
  /eyJ[A-Za-z0-9_-]+\./i, // JWT start
];

/**
 * Sanitize a message for display in the UI. Removes stack traces, paths, and token-like content.
 * Use this for any error message shown to users (toast, alert, form error).
 */
export function sanitizeErrorMessageForUI(
  message: string | null | undefined
): string {
  if (message == null || typeof message !== 'string')
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  let out = message.trim();
  if (!out) return ERROR_MESSAGES.UNKNOWN_ERROR;
  for (const re of UNSAFE_PATTERNS) {
    if (re.test(out)) return ERROR_MESSAGES.UNKNOWN_ERROR;
  }
  // Cap length to avoid dumping large backend responses
  if (out.length > 200) out = out.slice(0, 197) + '...';
  return out;
}

/**
 * Extract user-friendly error message from various error formats.
 * Returns a message suitable for logging. For UI display, pass through sanitizeErrorMessageForUI.
 */
export function getErrorMessage(
  error: unknown,
  fallback: string = ERROR_MESSAGES.UNKNOWN_ERROR
): string {
  if (!error) return fallback;

  if (typeof error === 'string') return error;

  if (error instanceof Error) return error.message;

  if (typeof error === 'object') {
    const err = error as Record<string, unknown>;

    if (
      err.code === 'CORS_ERROR' ||
      err.code === 'ERR_NETWORK' ||
      err.statusCode === 0
    ) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }

    if (typeof err.message === 'string') return err.message;

    if (err.response && typeof err.response === 'object') {
      const response = err.response as Record<string, unknown>;

      if (response.data && typeof response.data === 'object') {
        const data = response.data as Record<string, unknown>;

        if (typeof data.message === 'string') return data.message;

        if (data.error && typeof data.error === 'object') {
          const dataError = data.error as Record<string, unknown>;
          if (typeof dataError.message === 'string') return dataError.message;
        }
      }

      const status = response.status as number;
      return getStatusMessage(status);
    }

    if (typeof err.statusCode === 'number') {
      return getStatusMessage(err.statusCode);
    }
  }

  return fallback;
}

/**
 * Get a safe message for UI display only. Sanitizes so we never show stack traces or internal details.
 */
export function getErrorMessageForUI(
  error: unknown,
  fallback: string = ERROR_MESSAGES.UNKNOWN_ERROR
): string {
  return sanitizeErrorMessageForUI(getErrorMessage(error, fallback));
}

/**
 * Get user-friendly message based on HTTP status code
 */
export function getStatusMessage(statusCode: number): string {
  const statusMessages: Record<number, string> = {
    400: ERROR_MESSAGES.VALIDATION_ERROR,
    401: ERROR_MESSAGES.INVALID_TOKEN,
    403: ERROR_MESSAGES.UNAUTHORIZED,
    404: ERROR_MESSAGES.NOT_FOUND,
    408: ERROR_MESSAGES.TIMEOUT,
    429: ERROR_MESSAGES.RATE_LIMIT,
    500: ERROR_MESSAGES.SERVER_ERROR,
    502: 'Bad gateway. The server is temporarily unavailable.',
    503: 'Service unavailable. Please try again later.',
    504: 'Gateway timeout. The server took too long to respond.',
  };

  return statusMessages[statusCode] || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    return (
      err.code === 'NETWORK_ERROR' ||
      err.code === 'CORS_ERROR' ||
      err.code === 'ERR_NETWORK' ||
      err.statusCode === 0
    );
  }
  return false;
}

/**
 * Check if error requires re-authentication
 */
export function requiresReauth(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    return (
      err.code === 'AUTH_REQUIRED' ||
      err.code === 'INVALID_TOKEN' ||
      err.code === 'TOKEN_EXPIRED' ||
      err.statusCode === 401
    );
  }
  return false;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    return err.statusCode === 400 || !!err.errors;
  }
  return false;
}

/**
 * Extract validation errors from API error
 */
export function getValidationErrors(
  error: unknown
): Record<string, string[]> | null {
  if (typeof error === 'object' && error !== null) {
    const err = error as ApiError;
    if (err.errors) return err.errors;

    // Try to extract from response
    if (err.response?.data && typeof err.response.data === 'object') {
      const data = err.response.data as Record<string, unknown>;
      if (data.errors && typeof data.errors === 'object') {
        return data.errors as Record<string, string[]>;
      }
    }
  }
  return null;
}

/**
 * Log error with context
 */
export function logError(
  message: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  logger.error(message, error, context);
}

/**
 * Create error handler for async operations
 */
export function createErrorHandler(
  operation: string,
  onError?: (error: unknown) => void
) {
  return (error: unknown) => {
    const message = getErrorMessage(error);
    logError(`${operation} failed`, error, { operation, message });

    if (onError) {
      onError(error);
    }
  };
}

/**
 * Safe async wrapper with error handling
 */
export async function withErrorHandling<T>(
  operation: string,
  fn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    logError(`${operation} failed`, error);
    return fallback;
  }
}
