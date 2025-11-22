/**
 * Transfer Types - Based on Backend Transfer Integration Guide
 * All types match the verified backend API responses
 */

export interface TransferRequest {
  recipientId?: string;        // MongoDB ObjectId (optional if recipientUsername provided)
  recipientUsername?: string;  // Username (optional if recipientId provided)
  amount: number;              // Required: Positive number, minimum 1 USDT
  memo?: string;               // Optional: Note for the transfer
  twoFACode: string;           // Required: 6-digit 2FA code from authenticator app
}

export interface TransferResponse {
  success: boolean;
  message: string;
  txId: string;               // Transaction ID
  details: {
    amount: number;
    recipient: string;         // Recipient username
    fee: number;              // Always 0 (transfers are FREE)
    feePercentage: number;    // Always 0
    totalDeducted: number;    // Amount deducted from sender
    transferredToWallet: string; // Always "transfer"
    note: string;             // "P2P transfers are FREE"
  };
}

export interface Transfer {
  id: string;                  // Transaction ID
  direction: 'in' | 'out';     // Transfer direction
  amount: number;              // Transfer amount
  fee: number;                // Always 0
  recipient?: string;          // Recipient username (for outgoing)
  sender?: string;             // Sender username (for incoming)
  memo?: string;               // Optional memo
  timestamp: string;           // ISO timestamp
  status?: 'completed' | 'pending' | 'failed';
}

export interface TransferHistoryResponse {
  success: boolean;
  data: {
    transfers: Transfer[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface TransferHistoryFilters {
  page?: number;               // Default: 1
  limit?: number;             // Default: 10, Max: 100
  direction?: 'in' | 'out' | 'all';  // Default: 'all'
}

export interface TransferNotification {
  _id: string;
  title: string;               // "Transfer Successful" or "Funds Received"
  message: string;             // Detailed message
  type: 'success' | 'info' | 'warning' | 'error';
  category: 'general' | 'rank_system' | string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  metadata?: {
    amount?: number;
    recipientId?: string;
    recipientUsername?: string;
    senderId?: string;
    senderUsername?: string;
    txId?: string;
    timestamp?: string;
  };
  createdAt: string;           // ISO timestamp
}

export interface TransferNotificationsResponse {
  success: boolean;
  data: TransferNotification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  };
  unreadCount: number;
}

export interface UserSearchResult {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  memberSince: string;
}

export interface TwoFACodeResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      email: string;
      username: string;
    };
    codes: {
      current: string;         // Current 6-digit code
      previous: string;        // Previous code (valid for 2 minutes)
      next: string;            // Next code (valid for 2 minutes)
    };
    timeRemaining: number;     // Seconds until code expires
    validFor: string;          // "2 minutes"
  };
}

export interface TransferError {
  success: false;
  message: string;              // Human-readable error message
  code?: string;               // Error code (e.g., "INSUFFICIENT_BALANCE")
  error?: {
    code: string;
    message: string;
  };
}

// Transfer validation constants
export const TRANSFER_LIMITS = {
  MIN_AMOUNT: 1,              // Minimum 1 USDT
  MAX_AMOUNT: 1000000,        // Maximum per transfer
  FEE: 0,                     // Transfers are FREE
  FEE_PERCENTAGE: 0,          // No fee percentage
} as const;

// Transfer error codes
export const TRANSFER_ERROR_CODES = {
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_2FA_CODE: '2FA_CODE_INVALID',
  RECIPIENT_NOT_FOUND: 'RECIPIENT_NOT_FOUND',
  DUPLICATE_TRANSFER: 'DUPLICATE_TRANSFER_REQUEST',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY_DETECTED',
  SELF_TRANSFER: 'SELF_TRANSFER_NOT_ALLOWED',
  MIN_AMOUNT: 'MIN_AMOUNT_NOT_MET',
  MAX_AMOUNT: 'MAX_AMOUNT_EXCEEDED',
} as const;

// Transfer notification types
export const TRANSFER_NOTIFICATION_TITLES = {
  SENT: 'Transfer Successful',
  RECEIVED: 'Funds Received',
} as const;

