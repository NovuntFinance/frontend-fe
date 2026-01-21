export type AdminTransactionDirection = 'in' | 'out';

export type AdminTransactionListSortBy =
  | 'createdAt'
  | 'amount'
  | 'status'
  | 'processedAt';

export type AdminTransactionListSortOrder = 'asc' | 'desc';

export interface AdminTransactionUserRef {
  id: string;
  email: string;
  username: string;
  fullName?: string | null;
}

export interface AdminTransactionRow {
  id: string;
  reference?: string;
  type: string;
  category?: string | null;
  status: string;
  amount: number;
  displayAmount: number;
  direction: AdminTransactionDirection;
  fee?: number | null;
  netAmount?: number | null;
  title?: string | null;
  description?: string | null;
  method?: string | null;
  txId?: string | null;
  walletAddress?: string | null;
  network?: string | null;
  blockchainTxHash?: string | null;
  sourceWallet?: string | null;
  destinationWallet?: string | null;
  requiresAdminApproval?: boolean;
  processedAt?: string | null;
  createdAt?: string | null;
  user?: AdminTransactionUserRef | null;
}

export interface AdminTransactionsSummary {
  totalAmount: number;
  count: number;
  pending: number;
  requiresApproval: number;
  failed: number;
  completed: number;
}

export interface AdminTransactionsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminTransactionsListResponse {
  success: boolean;
  data: {
    transactions: AdminTransactionRow[];
    pagination: AdminTransactionsPagination;
    summary?: AdminTransactionsSummary;
  };
}

export interface AdminTransactionDetailResponse {
  success: boolean;
  data: {
    transaction: Record<string, unknown> & {
      id: string;
      direction?: AdminTransactionDirection;
      displayAmount?: number;
    };
  };
}
