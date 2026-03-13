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
   * Transfer Funds
   * POST /api/v1/transfer
   * Backend accepts: recipientId, recipientUsername, recipientEmail, amount, memo,
   * twoFACode, turnstileToken, cf-turnstile-response, idempotencyKey
   */
  async transferFunds(data: TransferRequest): Promise<TransferResponse> {
    const payload: Record<string, unknown> = {
      amount: data.amount,
      twoFACode: data.twoFACode,
    };
    if (data.recipientId) payload.recipientId = data.recipientId;
    if (data.recipientUsername)
      payload.recipientUsername = data.recipientUsername.toLowerCase();
    if (data.recipientEmail)
      payload.recipientEmail = data.recipientEmail.toLowerCase().trim();
    if (data.memo) payload.memo = data.memo;
    // Backend accepts turnstileToken or cf-turnstile-response when Turnstile is configured
    if (data.turnstileToken) {
      payload.turnstileToken = data.turnstileToken;
      payload['cf-turnstile-response'] = data.turnstileToken;
    }

    const response = await apiRequest<
      | TransferResponse
      | { success: boolean; message: string; data?: Record<string, unknown> }
    >('post', '/transfer', payload);

    // Normalize backend response: backend returns data.transactionId, frontend expects txId + details
    if (response && typeof response === 'object') {
      const r = response as Record<string, unknown>;
      if (r.data && typeof r.data === 'object') {
        const d = r.data as Record<string, unknown>;
        return {
          success: true,
          message: (r.message as string) || 'Transfer successful',
          txId: (d.transactionId as string) || (r.txId as string) || '',
          details: {
            amount: (d.amount as number) ?? 0,
            recipient: (d.recipient as string) || '',
            fee: 0,
            feePercentage: 0,
            totalDeducted: (d.amount as number) ?? 0,
            transferredToWallet:
              (d.transferredToWallet as string) || 'transfer',
            note: (d.note as string) || 'P2P transfers are FREE',
          },
        };
      }
      if (r.txId) {
        return response as TransferResponse;
      }
    }
    return response as TransferResponse;
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
      totalRecords: response.data?.pagination?.totalRecords || 0,
      currentPage: response.data?.pagination?.currentPage || 1,
      transfersCount: response.data?.transfers?.length || 0,
    });

    // Return with defaults if data is missing
    if (!response.data) {
      return {
        success: response.success || false,
        data: {
          transfers: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalRecords: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      };
    }

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
      timeRemaining: response.data?.data?.timeRemaining || 0,
      user: response.data?.data?.user?.username || 'unknown',
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
   * Uses actual backend error message — never shows "under development"
   */
  formatErrorMessage(error: any): string {
    // Extract backend message/code from response (api interceptor puts it in response.data)
    const backendCode =
      error?.response?.data?.code || error?.code || error?.error?.code;
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      error?.error?.message ||
      '';

    // Never show "under development" — backend returns specific errors
    if (
      typeof backendMessage === 'string' &&
      backendMessage.toLowerCase().includes('under development')
    ) {
      return 'Transfer failed. Please try again.';
    }

    // Handle backend error codes (per FRONTEND_TRANSFER_FIX doc)
    if (backendCode) {
      switch (backendCode) {
        case 'INSUFFICIENT_FUNDS':
        case 'INSUFFICIENT_BALANCE':
          return 'Insufficient balance for this transfer';
        case 'INVALID_2FA_CODE':
        case '2FA_CODE_INVALID':
          return 'Invalid 2FA code. Please try again.';
        case '2FA_REQUIRED':
          return 'Two-factor authentication is required. Please enter your 2FA code.';
        case '2FA_NOT_CONFIGURED':
          return 'Please complete 2FA setup before transferring.';
        case 'TURNSTILE_FAILED':
          return 'Verification failed. Please complete the security check and try again.';
        case 'RATE_LIMIT_EXCEEDED':
          return backendMessage || 'Too many attempts. Please try again later.';
        case 'SUSPICIOUS_ACTIVITY_DETECTED':
          return 'Transfer temporarily blocked. Please contact support.';
        case 'TRANSFER_OPERATION_IN_PROGRESS':
        case 'DUPLICATE_TRANSFER_IN_PROGRESS':
          return 'Please wait — another transfer is in progress.';
        case 'RECIPIENT_NOT_FOUND':
          return 'Recipient not found. Please check the email, username, or user ID.';
        case 'SELF_TRANSFER_NOT_ALLOWED':
          return 'You cannot transfer to yourself.';
        case 'LOCK_FAILED':
          return 'Please try again.';
      }
    }

    // Use backend message if it's actionable
    if (backendMessage && typeof backendMessage === 'string') {
      const msg = backendMessage.trim();
      if (msg.length > 0) return msg;
    }

    // Fallback patterns for common backend messages
    const message = String(backendMessage || '');
    if (message.includes('Minimum transfer') || message.includes('minimum')) {
      return 'Transfer amount is below the minimum.';
    }
    if (message.includes('Maximum transfer') || message.includes('maximum')) {
      return 'Transfer amount exceeds the maximum.';
    }
    if (message.includes('Insufficient') || message.includes('balance')) {
      return 'Insufficient balance for this transfer';
    }
    if (message.includes('Invalid 2FA') || message.includes('2FA')) {
      return 'Invalid 2FA code. Please try again.';
    }
    if (message.includes('not found') || message.includes('User with')) {
      return 'Recipient not found. Please check the email, username, or user ID.';
    }
    if (
      message.includes('cannot transfer to yourself') ||
      message.includes('yourself')
    ) {
      return 'You cannot transfer to yourself.';
    }
    if (message.includes('P2P transfers are temporarily disabled')) {
      return message;
    }

    return 'Transfer failed. Please try again.';
  },
};
