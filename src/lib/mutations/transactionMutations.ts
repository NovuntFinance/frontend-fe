import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { queryKeys } from '@/lib/queries';

/**
 * Transaction Types
 */
export interface DepositRequest {
  amount: number;
  currency: 'USDT';
  network?: 'BEP20'; // Optional, defaults to BEP20 (only supported network)
}

export type DepositStatus =
  | 'pending'
  | 'processing'
  | 'confirming'
  | 'awaiting_payment'
  | 'completed'
  | 'confirmed'
  | 'failed'
  | 'expired';

export interface DepositResponse {
  transactionId: string;
  invoiceId: string;
  depositAddress: string;
  amount: number;
  currency: string;
  network: string;
  expiresAt: string;
  status: DepositStatus | string;
  paymentUrl?: string;
  paymentAddress?: string;
  qrCodeUrl?: string;
  statusLabel?: string;
  mockMode?: boolean;
  details?: Record<string, unknown>;
  instructions?:
    | string
    | string[]
    | {
        step1?: string;
        step2?: string;
        step3?: string;
        step4?: string;
        [key: string]: string | undefined;
      };
  // Alternative field names from different payment providers (NowPayments, etc.)
  pay_address?: string;
  payAddress?: string;
  address?: string;
  paymentAddressLegacy?: string;
}

export interface WithdrawRequest {
  amount: number;
  currency?: string;
  network?: 'BEP20'; // Optional, defaults to BEP20 (only supported network)
  address: string;
}

export interface WithdrawResponse {
  transactionId: string;
  reference: string;
  amount: number;
  fee: number;
  netAmount: number;
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'completed'
    | 'rejected'
    | 'failed';
  requiresApproval: boolean;
  estimatedProcessingTime: string;
  note?: string;
}

export interface P2PTransferRequest {
  recipientUserId: string;
  amount: number;
  currency?: string;
  note?: string;
}

export interface P2PTransferResponse {
  transactionId: string;
  recipientUsername: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  completedAt: string;
  senderNewBalance?: number;
  recipientNewBalance?: number;
}

export interface TransactionStatusResponse {
  transactionId?: string;
  invoiceId?: string;
  status: string;
  amount?: number;
  fee?: number;
  confirmations?: number;
  actualAmount?: number;
  completedAt?: string;
  rejectionReason?: string;
  network?: string;
  paymentAddress?: string;
  qrCodeUrl?: string;
  statusLabel?: string;
  mockMode?: boolean;
  details?: Record<string, unknown>;
}

export interface UserSearchResult {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isVerified: boolean;
}

/**
 * Initiate Deposit (NowPayments)
 * POST /api/transaction/deposit
 */
export function useInitiateDeposit() {
  const queryClient = useQueryClient();

  return useMutation<DepositResponse, Error, DepositRequest>({
    mutationFn: async (data) => {
      console.log('[useInitiateDeposit] 📤 Sending deposit request:', data);

      try {
        const response = await apiRequest<{
          success: boolean;
          message: string;
          data: DepositResponse;
        }>('post', '/transaction/deposit', {
          amount: data.amount,
          currency: data.currency,
          network: data.network,
        });

        console.log('[useInitiateDeposit] 📥 Received response:', response);

        // Backend might return data directly or wrapped in { data: ... }
        const depositData = response.data || response;

        console.log('[useInitiateDeposit] ✅ Deposit data:', depositData);
        if (depositData?.details) {
          console.log(
            '[useInitiateDeposit] ℹ️ Backend details:',
            depositData.details
          );
        }
        if (depositData?.status) {
          console.log(
            '[useInitiateDeposit] 🔁 Initial deposit status:',
            depositData.status
          );
        }

        return depositData;
      } catch (error: any) {
        console.error('[useInitiateDeposit] ❌ API request failed:', error);
        console.error(
          '[useInitiateDeposit] Error response:',
          error?.response?.data
        );
        throw error;
      }
    },
    onSuccess: () => {
      console.log('[useInitiateDeposit] 🎉 Deposit mutation successful');
      // Invalidate wallet balance to show updated balance
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
    },
    onError: (error: any) => {
      console.error('[useInitiateDeposit] 💥 Mutation error:', error);
      console.error('[useInitiateDeposit] Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
    },
  });
}

/**
 * Initiate Withdrawal (NowPayments)
 * POST /api/v1/withdrawals/withdraw
 */
export function useInitiateWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation<WithdrawResponse, Error, WithdrawRequest>({
    mutationFn: async (data) => {
      const response = await apiRequest<{ data: WithdrawResponse }>(
        'post',
        '/withdrawals/withdraw',
        {
          amount: data.amount,
          walletAddress: data.address, // Backend uses 'walletAddress' not 'address'
          // No currency or network fields needed
        }
      );
      return response.data; // Extract data from wrapper
    },
    onSuccess: () => {
      // Invalidate wallet balance and transactions
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
    },
  });
}

/**
 * Initiate P2P Transfer
 * POST /api/v1/transfer
 */
export function useInitiateP2PTransfer() {
  const queryClient = useQueryClient();

  return useMutation<P2PTransferResponse, Error, P2PTransferRequest>({
    mutationFn: async (data) => {
      const response = await apiRequest<{ data: P2PTransferResponse }>(
        'post',
        '/transfer',
        {
          recipientId: data.recipientUserId, // Backend uses 'recipientId' not 'recipientUserId'
          amount: data.amount,
          memo: data.note, // Backend uses 'memo' not 'note'
          // No currency field needed - always USDT
        }
      );
      return response.data; // Extract data from wrapper
    },
    onSuccess: () => {
      // Invalidate wallet balance and transactions
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });
    },
  });
}

/**
 * Get Deposit Transaction Status
 * GET /api/v1/transactions/deposit/status/:invoiceId
 */
export function useGetDepositStatus(invoiceId: string | null) {
  return useMutation<TransactionStatusResponse, Error, void>({
    mutationFn: async () => {
      if (!invoiceId) {
        throw new Error('Invoice ID is required');
      }

      const response = await apiRequest<{ data: TransactionStatusResponse }>(
        'get',
        `/transaction/deposit/status/${invoiceId}`
      );
      return response.data; // Extract data from wrapper
    },
  });
}

/**
 * Search Users for P2P Transfer
 * GET /api/v1/users/search?query=...
 */
export function useSearchUsers() {
  return useMutation<UserSearchResult[], Error, string>({
    mutationFn: async (query) => {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const response = await apiRequest<{
        results: Array<{
          _id: string;
          username: string;
          email: string;
          fullName: string;
          memberSince: string;
        }>;
      }>('get', `/users/search?query=${encodeURIComponent(query)}`);

      // Backend returns { results: [...] }
      // Convert to our UserSearchResult format
      if (response && response.results) {
        return response.results.map((user) => ({
          userId: user._id, // Convert _id to userId
          username: user.username,
          firstName: user.fullName.split(' ')[0] || user.username,
          lastName: user.fullName.split(' ').slice(1).join(' ') || '',
          avatar: undefined,
          isVerified: true, // Assume verified if in search results
        }));
      }

      return [];
    },
  });
}

/**
 * Helper: Poll Deposit Status
 * Polls every `interval` ms until status is final
 * Uses invoiceId from deposit initiation
 */
export function pollDepositStatus(
  invoiceId: string,
  onUpdate: (status: TransactionStatusResponse) => void,
  onComplete: (status: TransactionStatusResponse) => void,
  onError: (error: Error) => void,
  interval = 10000 // 10 seconds (backend recommends 10-15s)
): () => void {
  let timeoutId: NodeJS.Timeout;
  let isCancelled = false;

  // Final statuses per backend: confirmed, failed, expired
  const finalStatuses = ['confirmed', 'completed', 'failed', 'expired'];

  const poll = async () => {
    if (isCancelled) return;

    try {
      const response = await apiRequest<{ data: TransactionStatusResponse }>(
        'get',
        `/transaction/deposit/status/${invoiceId}`
      );

      if (isCancelled) return;

      const status = response.data;
      onUpdate(status);

      // Check if status is final
      const normalizedStatus = status.status ? status.status.toLowerCase() : '';
      if (finalStatuses.includes(normalizedStatus)) {
        onComplete(status);
        return;
      }

      // Continue polling
      timeoutId = setTimeout(poll, interval);
    } catch (error) {
      if (!isCancelled) {
        onError(
          error instanceof Error
            ? error
            : new Error('Failed to check deposit status')
        );
      }
    }
  };

  // Start polling
  poll();

  // Return cancel function
  return () => {
    isCancelled = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}
