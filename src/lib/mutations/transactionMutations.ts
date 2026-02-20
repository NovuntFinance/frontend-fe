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
  /** Fallback payment URL from API (e.g. NowPayments invoice URL) */
  invoiceUrl?: string;
  paymentAddress?: string;
  qrCodeUrl?: string;
  statusLabel?: string;
  mockMode?: boolean;
  /** True when deposit was created in sandbox/test environment */
  isSandbox?: boolean;
  isTestMode?: boolean;
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
 * Use the correct endpoint based on flow:
 * - Transaction flow: POST /api/transaction/deposit/:transactionId/check-status
 * - Enhanced flow: GET /api/v1/enhanced-transactions/deposit/status/:invoiceId
 */
export function useGetDepositStatus(
  transactionId: string | null,
  invoiceId: string | null,
  useEnhancedEndpoint = false
) {
  return useMutation<TransactionStatusResponse, Error, void>({
    mutationFn: async () => {
      if (useEnhancedEndpoint) {
        if (!invoiceId) throw new Error('Invoice ID is required');
        const response = await apiRequest<TransactionStatusResponse>(
          'get',
          `/enhanced-transactions/deposit/status/${invoiceId}`
        );
        return response as TransactionStatusResponse;
      }
      if (!transactionId) throw new Error('Transaction ID is required');
      const response = await apiRequest<TransactionStatusResponse>(
        'post',
        `/transaction/deposit/${transactionId}/check-status`
      );
      return response as TransactionStatusResponse;
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
 * Params for deposit status polling.
 * - For /api/transaction/deposit: pass transactionId → POST .../deposit/{transactionId}/check-status
 * - For /api/v1/enhanced-transactions/deposit: pass invoiceId only → GET .../deposit/status/{invoiceId}
 */
export interface PollDepositStatusParams {
  /** Use for POST /api/transaction/deposit/:transactionId/check-status */
  transactionId?: string | null;
  /** Use for GET /api/v1/enhanced-transactions/deposit/status/:invoiceId */
  invoiceId?: string | null;
}

/**
 * Helper: Poll Deposit Status
 * Uses the correct endpoint based on which deposit API was used.
 * Polls every `interval` ms (recommended 10–15s) until status is final.
 */
export function pollDepositStatus(
  params: PollDepositStatusParams,
  onUpdate: (status: TransactionStatusResponse) => void,
  onComplete: (status: TransactionStatusResponse) => void,
  onError: (error: Error) => void,
  interval = 12000 // 10–15 seconds (backend recommends 10-15s)
): () => void {
  const { transactionId, invoiceId } = params;
  const useTransactionEndpoint = Boolean(transactionId);
  const useEnhancedEndpoint = !useTransactionEndpoint && Boolean(invoiceId);

  let timeoutId: NodeJS.Timeout;
  let isCancelled = false;

  const finalStatuses = ['confirmed', 'completed', 'failed', 'expired'];

  function getUserFriendlyMessage(err: unknown): string {
    if (err && typeof err === 'object') {
      const status =
        (err as { response?: { status?: number }; statusCode?: number })
          .response?.status ?? (err as { statusCode?: number }).statusCode;
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? (err as Error).message;
      if (status === 404)
        return 'Deposit or payment not found. It may have expired.';
      if (status === 500)
        return 'Server error checking status. Please try again in a moment.';
      if (message && !String(message).toLowerCase().includes('network'))
        return message;
    }
    return 'Unable to check deposit status. Please check your connection and try again.';
  }

  const poll = async () => {
    if (isCancelled) return;

    try {
      let status: TransactionStatusResponse;

      if (useTransactionEndpoint && transactionId) {
        // POST /api/transaction/deposit/:transactionId/check-status
        const response = await apiRequest<
          TransactionStatusResponse & {
            transaction?: unknown;
            checkedAt?: string;
          }
        >('post', `/transaction/deposit/${transactionId}/check-status`);
        // apiRequest unwraps { data } from backend; response may be the status object directly
        const raw =
          response && typeof response === 'object' && 'data' in response
            ? (response as { data: TransactionStatusResponse }).data
            : response;
        status = (
          raw && typeof raw === 'object' && 'status' in raw ? raw : response
        ) as TransactionStatusResponse;
      } else if (useEnhancedEndpoint && invoiceId) {
        // GET /api/v1/enhanced-transactions/deposit/status/:invoiceId
        const response = await apiRequest<TransactionStatusResponse>(
          'get',
          `/enhanced-transactions/deposit/status/${invoiceId}`
        );
        const raw =
          response && typeof response === 'object' && 'data' in response
            ? (response as { data: TransactionStatusResponse }).data
            : response;
        status = (
          raw && typeof raw === 'object' && 'status' in raw ? raw : response
        ) as TransactionStatusResponse;
      } else {
        onError(
          new Error('Missing transaction or invoice ID for status check.')
        );
        return;
      }

      if (isCancelled) return;

      onUpdate(status);

      const normalizedStatus = status?.status
        ? String(status.status).toLowerCase()
        : '';
      if (finalStatuses.includes(normalizedStatus)) {
        onComplete(status);
        return;
      }

      timeoutId = setTimeout(poll, interval);
    } catch (error) {
      if (!isCancelled) {
        onError(new Error(getUserFriendlyMessage(error)));
      }
    }
  };

  poll();

  return () => {
    isCancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
  };
}
