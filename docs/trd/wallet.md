# Wallet Module Technical Requirements Document (TRD)

**Version:** 1.0.0  
**Last Updated:** 2025-01-XX  
**Status:** Ready for Implementation  
**Source:** Backend Repository - `FRONTEND_WALLET_IMPLEMENTATION_PHASE1.md`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [API Endpoints & Contracts](#api-endpoints--contracts)
4. [Data Models & Payloads](#data-models--payloads)
5. [Business Logic & Rules](#business-logic--rules)
6. [Frontend Implementation Guide](#frontend-implementation-guide)

---

## 🎯 Overview

### Purpose
Phase 1 implements the core wallet functionality: viewing balances, making deposits, requesting withdrawals, and viewing transaction history. This phase establishes the foundation for the complete wallet module.

### Scope
- ✅ Wallet balance display (Two-Wallet System)
- ✅ Deposit creation and status tracking
- ✅ Withdrawal requests with 2FA
- ✅ Transaction history with filtering
- ✅ Real-time balance updates
- ✅ Error handling and loading states

---

## 🏗️ System Architecture

### Two-Wallet System

The backend uses a **Two-Wallet System**:

1. **Funded Wallet** (`fundedWallet`)
   - **Sources:** Deposits, P2P transfers received
   - **Can be used for:** Staking only
   - **Cannot be used for:** Withdrawals

2. **Earning Wallet** (`earningWallet`)
   - **Sources:** Stake returns, bonuses, referrals, pool distributions
   - **Can be used for:** Staking + Withdrawals
   - **Primary withdrawal source**

### Key Concepts

```
Total Balance = fundedWallet + earningWallet
Stakable Amount = fundedWallet + earningWallet
Withdrawable Amount = earningWallet only
```

---

## 🔌 API Endpoints & Contracts

### Base URL
```
/api/v1
```

### Authentication
All endpoints require:
```typescript
Headers: {
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

### Rate Limiting
All wallet endpoints use `financialOpsLimiter`:
- **Limit:** 10 requests per minute per user
- **Response:** `429 Too Many Requests` if exceeded

---

### Endpoint 1: Get Wallet Info

**`GET /api/v1/wallets/info`**

#### Purpose
Get authenticated user's wallet overview with balances and capabilities.

#### Success Response (200)
```typescript
{
  success: true,
  wallet: {
    totalBalance: number,
    fundedWallet: number,
    earningWallet: number,
    canStake: boolean,
    canWithdraw: boolean,
    canTransfer: boolean,
    statistics: {
      totalDeposited: number,
      totalWithdrawn: number,
      totalTransferReceived: number,
      totalTransferSent: number,
      totalStaked: number,
      totalStakeReturns: number
    },
    walletAddress: string | null,
    createdAt: string
  }
}
```

---

### Endpoint 2: Create Deposit

**`POST /api/v1/enhanced-transactions/deposit/create`**

#### Request Body
```typescript
{
  amount: number  // Minimum: 10 USDT, Maximum: 100,000 USDT
}
```

#### Success Response (200)
```typescript
{
  success: true,
  message: string,
  data: {
    depositId: string,
    invoiceId: string,
    amount: number,
    status: "pending",
    paymentUrl: string,
    qrCode: string,
    expiresAt: string,
    supportedNetworks: string[]
  }
}
```

---

### Endpoint 3: Check Deposit Status

**`GET /api/v1/enhanced-transactions/deposit/status/:invoiceId`**

#### Success Response (200)
```typescript
{
  success: true,
  data: {
    depositId: string,
    invoiceId: string,
    amount: number,
    status: "pending" | "confirmed" | "failed",
    paymentUrl: string | null,
    qrCode: string | null,
    expiresAt: string,
    confirmedAt: string | null,
    txId: string | null,
    network: string | null
  }
}
```

---

### Endpoint 4: Get Withdrawal Limits

**`GET /api/v1/enhanced-transactions/withdrawal/limits`**

#### Success Response (200)
```typescript
{
  success: true,
  data: {
    minWithdrawal: number,
    maxWithdrawal: number,
    dailyLimit: number,
    dailyCount: number,
    resetTime: string,
    feePercentage: number,
    feeFixed: number,
    feeCalculation: string,
    availableBalance: number,
    canWithdraw: boolean,
    requiresKYC: boolean,
    requires2FA: boolean,
    supportedNetworks: string[]
  }
}
```

---

### Endpoint 5: Create Withdrawal Request

**`POST /api/v1/enhanced-transactions/withdrawal/create`**

#### Request Body
```typescript
{
  amount: number,
  walletAddress: string,
  network?: string  // "BEP20" | "TRC20" | "ERC20"
}
```

#### Success Response (200)
```typescript
{
  success: true,
  message: string,
  data: {
    withdrawalId: string,
    amount: number,
    fee: number,
    netAmount: number,
    walletAddress: string,
    network: string,
    status: "pending",
    requestedAt: string,
    estimatedProcessingTime: string
  }
}
```

---

### Endpoint 6: Get Transaction History

**`GET /api/v1/enhanced-transactions/history`**

#### Query Parameters
```typescript
{
  page?: number,
  limit?: number,
  type?: "deposit" | "withdrawal" | "transfer" | "stake" | "bonus",
  status?: "pending" | "confirmed" | "failed",
  search?: string,
  dateFrom?: string,
  dateTo?: string
}
```

#### Success Response (200)
```typescript
{
  success: true,
  data: {
    transactions: Transaction[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number,
      hasNext: boolean,
      hasPrev: boolean
    }
  }
}
```

---

## 📊 Data Models & Payloads

### UserWallet Interface
```typescript
interface UserWallet {
  totalBalance: number;
  fundedWallet: number;
  earningWallet: number;
  canStake: boolean;
  canWithdraw: boolean;
  canTransfer: boolean;
  statistics: {
    totalDeposited: number;
    totalWithdrawn: number;
    totalTransferReceived: number;
    totalTransferSent: number;
    totalStaked: number;
    totalStakeReturns: number;
  };
  walletAddress: string | null;
  createdAt: string;
}
```

### Transaction Interface
```typescript
interface Transaction {
  _id: string;
  type: "deposit" | "withdrawal" | "transfer" | "stake" | "bonus";
  amount: number;
  status: "pending" | "confirmed" | "failed";
  reference: string;
  txId: string | null;
  fee: number | null;
  netAmount: number | null;
  walletAddress: string | null;
  network: string | null;
  metadata: Record<string, any>;
  timestamp: string;
  processedAt: string | null;
}
```

---

## 💼 Business Logic & Rules

### Deposit Rules
1. **Minimum Amount:** 10 USDT
2. **Maximum Amount:** 100,000 USDT
3. **Supported Networks:** BEP20, TRC20
4. **Processing Time:** Instant (via NowPayments)
5. **Destination:** Always goes to `fundedWallet`
6. **Expiration:** Payment links expire after 1 hour

### Withdrawal Rules
1. **Minimum Amount:** 20 USDT
2. **Maximum Amount:** 10,000 USDT per transaction
3. **Daily Limit:** 2 withdrawals per day
4. **Fee Calculation:** `(amount * feePercentage / 100) + feeFixed`
5. **Source:** Only from `earningWallet`
6. **Processing Time:** 24-48 hours (admin approval required)
7. **Requirements:**
   - ✅ 2FA verification (always required)
   - ⚠️ KYC verification (if enabled in settings)

### Balance Calculation
```typescript
Total Balance = fundedWallet + earningWallet
Stakable Amount = totalBalance
Withdrawable Amount = earningWallet only
```

---

## 🎨 Frontend Implementation Guide

### Design System Integration
- Use existing UI components from `src/components/ui`
- Follow glassmorphism patterns from existing cards
- Use Framer Motion for animations
- Respect dark mode compatibility
- Use design tokens from `tailwind.config.ts`

### Component Structure
```
src/
├── components/
│   └── wallet/
│       ├── WalletDashboard.tsx
│       ├── WalletBreakdown.tsx
│       ├── DepositModal.tsx
│       ├── WithdrawalModal.tsx
│       └── TransactionHistory.tsx
├── hooks/
│   └── useWallet.ts
├── services/
│   └── walletApi.ts
└── lib/
    └── utils/
        └── wallet.ts
```

### State Management
- **React Query** for server state (caching, refetching)
- **Zustand** for client state (optional)
- Auto-refetch wallet info every 30 seconds
- Poll deposit status every 5 seconds when pending

### Error Handling
- Display user-friendly error messages
- Handle 401 (Unauthorized) with token refresh
- Handle 403 (2FA Required) with 2FA modal
- Handle 429 (Rate Limit) with retry logic
- Handle network errors gracefully

---

## ✅ Acceptance Criteria

### Wallet Balance Display
- [x] Displays total balance correctly
- [x] Shows funded wallet and earning wallet separately
- [x] Updates in real-time (every 30 seconds)
- [x] Shows loading state while fetching
- [x] Handles errors gracefully

### Deposit Flow
- [x] User can enter deposit amount
- [x] Validates amount (10-100,000 USDT)
- [x] Creates deposit and shows payment URL/QR code
- [x] Polls deposit status every 5 seconds
- [x] Updates balance when deposit confirmed
- [x] Shows expiration countdown

### Withdrawal Flow
- [x] Fetches withdrawal limits on load
- [x] Validates amount (20-10,000 USDT)
- [x] Validates wallet address format
- [x] Requires 2FA before submission
- [x] Calculates and displays fees
- [x] Shows daily limit status

### Transaction History
- [x] Displays transactions in reverse chronological order
- [x] Supports pagination
- [x] Filters by type and status
- [x] Search functionality
- [x] Shows transaction details

---

**Last Updated:** 2025-01-XX  
**Maintained By:** Frontend Team  
**Reference:** Backend Repository - `FRONTEND_WALLET_IMPLEMENTATION_PHASE1.md`

