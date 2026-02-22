/**
 * Transfer API Service
 * Handles all transfer-related API requests
 * Based on Backend Transfer Integration Guide
 */

import axios from 'axios';
import { apiRequest } from '@/lib/api';
import type {
  TransferRequest,
  TransferResponse,
  TransferHistoryResponse,
  TransferHistoryFilters,
  UserSearchResult,
  TwoFACodeResponse,
} from '@/types/transfer';

export const transferApi = {
  /**
   * Detect identifier type from user input
   * Returns the appropriate identifier fields based on input
   */
  detectIdentifierType(input: string): {
    recipientId?: string;
    recipientUsername?: string;
    recipientEmail?: string;
  } {
    const trimmed = input.trim();

    // Check if it's an email (contains @)
    if (trimmed.includes('@')) {
      return { recipientEmail: trimmed.toLowerCase() };
    }

    // Check if it's a MongoDB ObjectId (24 hex characters)
    if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
      return { recipientId: trimmed };
    }

    // Otherwise, treat as username
    return { recipientUsername: trimmed.toLowerCase() };
  },

  /**
   * Request transfer OTP
   * POST /api/v1/transfer/request-otp
   * Sends 6-digit OTP to user's email (expires in 10 minutes)
   */
  async requestTransferOtp(data: {
    recipientId?: string;
    recipientUsername?: string;
    recipientEmail?: string;
    amount: number;
    'cf-turnstile-response'?: string;
    turnstileToken?: string;
  }): Promise<{ success: boolean; message: string; expiresIn?: number }> {
    const payload: Record<string, unknown> = {
      amount: data.amount,
      ...(data.recipientId && { recipientId: data.recipientId }),
      ...(data.recipientUsername && {
        recipientUsername: data.recipientUsername,
      }),
      ...(data.recipientEmail && { recipientEmail: data.recipientEmail }),
    };
    const turnstile =
      data['cf-turnstile-response'] || (data as any).turnstileToken;
    if (turnstile) payload['cf-turnstile-response'] = turnstile;

    return apiRequest<{
      success: boolean;
      message: string;
      expiresIn?: number;
    }>('post', '/transfer/request-otp', payload);
  },

  /**
   * Transfer Funds
   * POST /api/v1/transfer
   */
  async transferFunds(data: TransferRequest): Promise<TransferResponse> {
    console.log('[transferApi] Initiating transfer:', {
      recipient:
        data.recipientEmail || data.recipientUsername || data.recipientId,
      amount: data.amount,
      hasMemo: !!data.memo,
    });

    const idempotencyKey =
      data.idempotencyKey ??
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `tf-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const payload: Record<string, unknown> = {
      recipientId: data.recipientId,
      recipientUsername: data.recipientUsername?.toLowerCase(),
      recipientEmail: data.recipientEmail?.toLowerCase().trim(),
      amount: data.amount,
      memo: data.memo,
      twoFACode: data.twoFACode,
      emailOtp: data.emailOtp,
      idempotencyKey,
    };
    const turnstile = data['cf-turnstile-response'] || data.turnstileToken;
    if (turnstile) payload['cf-turnstile-response'] = turnstile;

    const response = await apiRequest<TransferResponse>(
      'post',
      '/transfer',
      payload,
      { headers: { 'Idempotency-Key': idempotencyKey as string } }
    );

    console.log('[transferApi] Transfer successful:', {
      txId: response.txId,
      recipient: response.details.recipient,
      amount: response.details.amount,
    });

    return response;
  },

  /**
   * Get Transfer History
   * GET /api/v1/transfer
   */
  async getTransferHistory(
    filters: TransferHistoryFilters = {}
  ): Promise<TransferHistoryResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.direction) params.append('direction', filters.direction);

    const queryString = params.toString();
    const url = queryString ? `/transfer?${queryString}` : '/transfer';

    console.log('[transferApi] Fetching transfer history:', filters);

    const response = await apiRequest<TransferHistoryResponse>('get', url);

    console.log('[transferApi] Transfer history fetched:', {
      totalRecords: response.data.pagination.totalRecords,
      currentPage: response.data.pagination.currentPage,
      transfersCount: response.data.transfers.length,
    });

    return response;
  },

  /**
   * Search Users for Transfer
   * Only returns users from transfer history (past recipients)
   * Does NOT search all users in database - users must type full username for new recipients
   */
  async searchUsers(query: string): Promise<UserSearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    console.log('[transferApi] Searching past recipients:', query);

    try {
      // Get outgoing transfers to find past recipients
      const historyResponse = await this.getTransferHistory({
        direction: 'out',
        limit: 100, // Get more results to find all past recipients
        page: 1,
      });

      const transfers = historyResponse.data?.transfers || [];
      const searchLower = query.trim().toLowerCase();

      // Extract unique recipients from transfer history
      const pastRecipients = new Map<string, UserSearchResult>();

      transfers.forEach((transfer) => {
        // Check if transfer has a recipient (for outgoing transfers)
        if (transfer.recipient && transfer.direction === 'out') {
          const username = transfer.recipient.toLowerCase();
          // Only include if username starts with search query
          if (username.startsWith(searchLower)) {
            if (!pastRecipients.has(username)) {
              pastRecipients.set(username, {
                userId: '', // ID not available in transfer history
                username: transfer.recipient,
                fullName: transfer.recipient, // Use username as display name
                email: '', // Email not available in transfer history
                memberSince: transfer.timestamp || new Date().toISOString(), // Use transfer timestamp
              });
            }
          }
        }
      });

      const results = Array.from(pastRecipients.values());

      console.log('[transferApi] Past recipients found:', results.length);

      return results;
    } catch (error) {
      console.error('[transferApi] Error fetching past recipients:', error);
      return [];
    }
  },

  /**
   * Get 2FA Code (Development/Testing Only)
   * GET /api/test/2fa-code
   *
   * NOTE: This endpoint is for testing purposes only.
   * In production, users generate codes from their authenticator app.
   *
   * IMPORTANT: This endpoint is at /api/test/2fa-code (not /api/v1/test/2fa-code)
   */
  async get2FACode(): Promise<TwoFACodeResponse> {
    console.log('[transferApi] Fetching 2FA code (testing only)');

    // The test endpoint is at /api/test/2fa-code (not /api/v1/test/2fa-code)
    // So we need to use the base URL without /v1
    const baseURL =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const testBaseURL = baseURL.replace('/api/v1', '/api');

    // Get auth token
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken') ||
          localStorage.getItem('authToken')
        : null;

    // Use axios directly since this endpoint is outside the /v1 namespace
    const response = await axios.get<TwoFACodeResponse>(
      `${testBaseURL}/test/2fa-code`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Include cookies for authentication
      }
    );

    console.log('[transferApi] 2FA code retrieved:', {
      timeRemaining: response.data.data.timeRemaining,
      user: response.data.data.user.username,
    });

    return response.data;
  },

  /**
   * Validate Transfer Amount
   * Client-side validation before API call
   */
  validateTransferAmount(
    amount: number,
    availableBalance: number
  ): {
    isValid: boolean;
    error?: string;
  } {
    if (!amount || amount <= 0) {
      return {
        isValid: false,
        error: 'Amount must be greater than 0',
      };
    }

    if (amount < 1) {
      return {
        isValid: false,
        error: 'Minimum transfer amount is 1 USDT',
      };
    }

    if (amount > 1000000) {
      return {
        isValid: false,
        error: 'Maximum transfer amount is 1,000,000 USDT',
      };
    }

    if (amount > availableBalance) {
      return {
        isValid: false,
        error: 'Insufficient balance for this transfer',
      };
    }

    return { isValid: true };
  },

  /**
   * Validate Recipient Identifier
   * Validates email, username, or user ID format
   */
  validateRecipientIdentifier(identifier: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!identifier || identifier.trim().length === 0) {
      return {
        isValid: false,
        error: 'Recipient email, username, or user ID is required',
      };
    }

    const trimmed = identifier.trim();

    // If it looks like an email, validate email format
    if (trimmed.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return {
          isValid: false,
          error: 'Please enter a valid email address',
        };
      }
    }

    // If it looks like a MongoDB ObjectId, validate format
    if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
      // Valid ObjectId format
      return { isValid: true };
    }

    // Username validation (basic check - at least 2 characters)
    if (trimmed.length < 2) {
      return {
        isValid: false,
        error: 'Username must be at least 2 characters',
      };
    }

    return { isValid: true };
  },

  /**
   * Validate 2FA Code
   * Client-side validation before API call
   */
  validate2FACode(code: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!code || code.trim().length === 0) {
      return {
        isValid: false,
        error: '2FA code is required',
      };
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return {
        isValid: false,
        error: 'Please enter a valid 6-digit 2FA code',
      };
    }

    return { isValid: true };
  },

  /**
   * Format Transfer Error Message
   * Converts backend error to user-friendly message
   */
  formatErrorMessage(error: any): string {
    // Handle specific error codes
    const code = error?.code || error?.response?.data?.code;
    if (code) {
      switch (code) {
        case 'SUPPORT_REQUIRED':
          return 'Too many failed attempts. Please contact support or try again later.';
        case 'TURNSTILE_FAILED':
          return 'Security check failed. Please try again.';
        case 'INVALID_EMAIL_OTP':
        case 'INVALID_OTP':
          return 'Invalid or expired verification code.';
        case 'INSUFFICIENT_BALANCE':
          return 'Insufficient balance for this transfer';
        case '2FA_CODE_INVALID':
        case 'INVALID_2FA_CODE':
          return 'Invalid 2FA code. Please enter the 6-digit code from your authenticator app.';
        case '2FA_REQUIRED':
          return '2FA code is required.';
        case 'DUPLICATE_TRANSFER_REQUEST':
          return 'Duplicate transfer detected. Please wait a moment before trying again.';
        case 'SUSPICIOUS_ACTIVITY_DETECTED':
          return 'Transfer blocked due to suspicious activity. Please contact support.';
        case 'RECIPIENT_NOT_FOUND':
          return 'Recipient not found. Please check the username.';
        case 'SELF_TRANSFER_NOT_ALLOWED':
          return 'You cannot transfer funds to your own account';
      }
    }

    // Handle specific error messages
    const message = error?.message || error?.error?.message || '';

    if (message.includes('Minimum transfer')) {
      return 'Transfer amount is below the minimum (1 USDT)';
    }
    if (message.includes('Maximum transfer')) {
      return 'Transfer amount exceeds the maximum';
    }
    if (message.includes('Insufficient balance')) {
      return 'Insufficient balance for this transfer';
    }
    if (message.includes('Invalid 2FA')) {
      return 'Invalid 2FA code. Please try again.';
    }
    // Handle email-specific errors
    if (
      (message.includes('email') && message.includes('not found')) ||
      message.includes('No user found with that email')
    ) {
      return 'No user found with that email address';
    }
    // Handle username-specific errors
    if (
      (message.includes('username') && message.includes('not found')) ||
      message.includes('User with username')
    ) {
      return 'No user found with that username';
    }
    // Handle generic "not found" errors
    if (
      message.includes('not found') ||
      message.includes('Recipient not found')
    ) {
      return 'Recipient not found. Please check the email, username, or user ID.';
    }
    // Handle invalid identifier errors
    if (message.includes('Invalid recipient identifier')) {
      return 'Please enter a valid email, username, or user ID';
    }
    if (message.includes('Duplicate transfer')) {
      return 'A similar transfer is already being processed. Please wait.';
    }
    if (message.includes('cannot transfer to yourself')) {
      return 'You cannot transfer funds to your own account';
    }

    // Default error message
    return (
      message || 'An error occurred during the transfer. Please try again.'
    );
  },
};
