# Transaction History API - Frontend Integration Guide

## Base URL

```
Production: https://your-api-domain.com
Development: http://localhost:5000
```

---

## Authentication

All endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Get Transaction History

```
GET /api/v1/enhanced-transactions/history
```

#### Query Parameters

| Parameter   | Type   | Default   | Description                               |
| ----------- | ------ | --------- | ----------------------------------------- |
| `page`      | number | 1         | Page number                               |
| `limit`     | number | 20        | Items per page (max: 100)                 |
| `type`      | string | all       | Filter by transaction type                |
| `category`  | string | all       | Filter by category                        |
| `status`    | string | all       | Filter by status                          |
| `search`    | string | -         | Search in reference, title, description   |
| `dateFrom`  | string | -         | Start date (ISO format: `2025-01-01`)     |
| `dateTo`    | string | -         | End date (ISO format: `2025-12-31`)       |
| `amountMin` | number | -         | Minimum amount                            |
| `amountMax` | number | -         | Maximum amount                            |
| `sortBy`    | string | timestamp | Sort field: `timestamp`, `amount`, `type` |
| `sortOrder` | string | desc      | Sort order: `asc` or `desc`               |

#### Available Filter Values

**Types:**

```
deposit, withdrawal, transfer_out, transfer_in, stake, unstake,
ros_payout, stake_completion, stake_pool_payout, performance_pool_payout,
premium_pool_payout, registration_bonus, referral_bonus, bonus_activation,
fee, adjustment, refund
```

**Categories:**

```
deposit, withdrawal, staking, earnings, transfer, bonus, fee, system
```

**Statuses:**

```
pending, processing, confirmed, completed, failed, cancelled, expired, requires_approval
```

---

## Response Structure

### Success Response

```json
{
  "success": true,
  "data": {
    "transactions": [...],
    "pagination": {...},
    "summary": {...},
    "categoryBreakdown": {...},
    "filters": {...},
    "availableFilters": {...}
  }
}
```

### Transaction Object

```json
{
  "_id": "6926efaa2de7476c555bb780",
  "type": "deposit",
  "typeLabel": "Deposit",
  "category": "deposit",
  "direction": "in",
  "amount": 1000,
  "fee": 0,
  "netAmount": 1000,
  "title": "Deposit",
  "description": "Deposit of $1000.00 USDT credited to your Deposit Wallet.",
  "status": "completed",
  "requiresAdminApproval": false,
  "reference": "f41669ed-ca36-471b-bb7a-464aa9c968ec",
  "txId": "blockchain_tx_hash_if_available",
  "sourceWallet": "external",
  "destinationWallet": "funded",
  "walletAddress": "TF35ENTDrRaR1t252k2v1QGFKi9YgMj8pV",
  "method": "nowpayments",
  "fromUser": null,
  "toUser": null,
  "metadata": {
    "invoiceId": "f41669ed-ca36-471b-bb7a-464aa9c968ec",
    "currency": "USDT",
    "network": "BEP20"
  },
  "balanceBefore": 500,
  "balanceAfter": 1500,
  "timestamp": "2025-11-26T12:16:42.098Z",
  "processedAt": "2025-11-26T12:17:00.000Z",
  "createdAt": "2025-11-26T12:16:42.098Z"
}
```

### Pagination Object

```json
{
  "currentPage": 1,
  "totalPages": 5,
  "totalItems": 95,
  "itemsPerPage": 20,
  "hasNext": true,
  "hasPrev": false
}
```

### Summary Object

```json
{
  "deposits": {
    "total": 2000,
    "count": 13
  },
  "withdrawals": {
    "total": 500,
    "count": 2
  },
  "staking": {
    "totalStaked": 1000,
    "stakeCount": 5,
    "totalCompletions": 200,
    "completionCount": 1
  },
  "earnings": {
    "rosPayouts": 150,
    "rosCount": 10,
    "poolPayouts": 50
  },
  "bonuses": {
    "total": 100,
    "count": 3
  },
  "transfers": {
    "sent": 200,
    "received": 300
  },
  "fees": 25,
  "netInflow": 1875
}
```

### Category Breakdown Object

```json
{
  "deposit": { "count": 13, "totalAmount": 2000 },
  "staking": { "count": 5, "totalAmount": 1000 },
  "earnings": { "count": 10, "totalAmount": 200 },
  "bonus": { "count": 3, "totalAmount": 100 }
}
```

---

## TypeScript Interfaces

```typescript
// Transaction Types
type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'transfer_out'
  | 'transfer_in'
  | 'stake'
  | 'unstake'
  | 'ros_payout'
  | 'stake_completion'
  | 'stake_pool_payout'
  | 'performance_pool_payout'
  | 'premium_pool_payout'
  | 'registration_bonus'
  | 'referral_bonus'
  | 'bonus_activation'
  | 'fee'
  | 'adjustment'
  | 'refund';

type TransactionCategory =
  | 'deposit'
  | 'withdrawal'
  | 'staking'
  | 'earnings'
  | 'transfer'
  | 'bonus'
  | 'fee'
  | 'system';

type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'confirmed'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'requires_approval';

type TransactionDirection = 'in' | 'out' | 'neutral';

type WalletType = 'funded' | 'earning' | 'external' | 'platform' | 'stake';

// Transaction Interface
interface Transaction {
  _id: string;
  type: TransactionType;
  typeLabel: string;
  category: TransactionCategory;
  direction: TransactionDirection;
  amount: number;
  fee: number;
  netAmount: number;
  title: string;
  description: string;
  status: TransactionStatus;
  requiresAdminApproval: boolean;
  reference: string;
  txId?: string;
  sourceWallet?: WalletType;
  destinationWallet?: WalletType;
  walletAddress?: string;
  method?: string;
  fromUser?: UserInfo | null;
  toUser?: UserInfo | null;
  metadata?: Record<string, any>;
  balanceBefore?: number;
  balanceAfter?: number;
  timestamp: string;
  processedAt?: string;
  createdAt: string;
}

interface UserInfo {
  username: string;
  name: string;
}

// Pagination Interface
interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Summary Interface
interface TransactionSummary {
  deposits: { total: number; count: number };
  withdrawals: { total: number; count: number };
  staking: {
    totalStaked: number;
    stakeCount: number;
    totalCompletions: number;
    completionCount: number;
  };
  earnings: {
    rosPayouts: number;
    rosCount: number;
    poolPayouts: number;
  };
  bonuses: { total: number; count: number };
  transfers: { sent: number; received: number };
  fees: number;
  netInflow: number;
}

// Category Breakdown
interface CategoryBreakdown {
  [category: string]: {
    count: number;
    totalAmount: number;
  };
}

// API Response Interface
interface TransactionHistoryResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    pagination: Pagination;
    summary: TransactionSummary;
    categoryBreakdown: CategoryBreakdown;
    filters: {
      type: string;
      category: string;
      status: string;
      dateFrom: string | null;
      dateTo: string | null;
      amountMin: number | null;
      amountMax: number | null;
      search: string | null;
    };
    availableFilters: {
      types: string[];
      categories: string[];
      statuses: string[];
    };
  };
}

// Query Parameters Interface
interface TransactionHistoryParams {
  page?: number;
  limit?: number;
  type?: TransactionType | 'all';
  category?: TransactionCategory | 'all';
  status?: TransactionStatus | 'all';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  sortBy?: 'timestamp' | 'amount' | 'type';
  sortOrder?: 'asc' | 'desc';
}
```

---

## API Service Example

```typescript
// services/transactionService.ts

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function getTransactionHistory(
  token: string,
  params: TransactionHistoryParams = {}
): Promise<TransactionHistoryResponse> {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== 'all') {
      queryParams.append(key, String(value));
    }
  });

  const url = `${API_BASE}/api/v1/enhanced-transactions/history?${queryParams}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

---

## Usage Examples

### Fetch All Transactions

```typescript
const data = await getTransactionHistory(token);
console.log(data.data.transactions);
console.log(data.data.summary);
```

### Filter by Category

```typescript
const earnings = await getTransactionHistory(token, {
  category: 'earnings',
});
```

### Filter by Type

```typescript
const deposits = await getTransactionHistory(token, {
  type: 'deposit',
});
```

### Search Transactions

```typescript
const results = await getTransactionHistory(token, {
  search: 'bonus',
});
```

### Date Range Filter

```typescript
const thisMonth = await getTransactionHistory(token, {
  dateFrom: '2025-11-01',
  dateTo: '2025-11-30',
});
```

### Pagination

```typescript
const page2 = await getTransactionHistory(token, {
  page: 2,
  limit: 10,
});
```

### Combined Filters

```typescript
const filtered = await getTransactionHistory(token, {
  category: 'earnings',
  status: 'completed',
  dateFrom: '2025-01-01',
  sortBy: 'amount',
  sortOrder: 'desc',
  limit: 50,
});
```

---

## Display Helpers

### Format Amount with Direction

```typescript
function formatAmount(transaction: Transaction): string {
  const sign = transaction.direction === 'out' ? '-' : '+';
  return `${sign}$${transaction.amount.toFixed(2)}`;
}
```

### Get Status Color

```typescript
function getStatusColor(status: TransactionStatus): string {
  const colors: Record<TransactionStatus, string> = {
    pending: 'orange',
    processing: 'blue',
    confirmed: 'green',
    completed: 'green',
    failed: 'red',
    cancelled: 'gray',
    expired: 'gray',
    requires_approval: 'yellow',
  };
  return colors[status];
}
```

### Get Direction Icon

```typescript
function getDirectionIcon(direction: TransactionDirection): string {
  return direction === 'in' ? '↓' : direction === 'out' ? '↑' : '↔';
}
```

### Format Date

```typescript
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
```

---

## Error Handling

```typescript
try {
  const data = await getTransactionHistory(token, params);
  // Handle success
} catch (error) {
  if (error.message.includes('401')) {
    // Token expired - redirect to login
  } else if (error.message.includes('429')) {
    // Rate limited - show retry message
  } else {
    // Generic error handling
  }
}
```

---

## Response Codes

| Code | Description                          |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 401  | Unauthorized - Invalid/expired token |
| 429  | Rate limited - Too many requests     |
| 500  | Server error                         |

---

## Notes

1. **Direction Field**: Use `direction` to show +/- for amounts
   - `"in"` = Money received (show as positive/green)
   - `"out"` = Money sent (show as negative/red)
   - `"neutral"` = Internal movement

2. **TypeLabel**: Use `typeLabel` for display instead of `type`

3. **Description**: The `description` field contains user-friendly text explaining the transaction

4. **Summary**: Use `summary` for dashboard totals and stats

5. **CategoryBreakdown**: Use for pie charts or category statistics

6. **Metadata**: Contains transaction-specific details (network, invoiceId, etc.)
