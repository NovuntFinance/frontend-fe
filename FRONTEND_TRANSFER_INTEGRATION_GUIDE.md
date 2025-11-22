# Frontend Transfer Feature Integration Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [API Endpoints](#api-endpoints)
4. [Feature Integration](#feature-integration)
5. [Error Handling](#error-handling)
6. [UI/UX Recommendations](#uiux-recommendations)
7. [Code Examples](#code-examples)
8. [Testing Checklist](#testing-checklist)

---

## Overview

This guide covers the integration of **10 fully tested and verified transfer features**:

✅ **Feature 1**: Basic Transfer Execution  
✅ **Feature 2**: Wallet Balance Updates  
✅ **Feature 3**: Email Notifications  
✅ **Feature 4**: In-App Notifications (Sender)  
✅ **Feature 5**: In-App Notifications (Recipient)  
✅ **Feature 6**: Transfer History (Outgoing)  
✅ **Feature 7**: Transfer History (Incoming)  
✅ **Feature 10**: Input Validation  
✅ **Feature 11**: Balance Validation  
✅ **Feature 12**: Transfer Limits  

All features have been tested and verified working on the backend (tested with Postman).

---

## Prerequisites

### Required Setup
1. **Authentication**: User must be authenticated (JWT token required)
2. **2FA Setup**: Users must have 2FA enabled and configured
3. **Base URL**: `http://localhost:5000/api/v1` (development) or your production URL

### Required Headers
All API requests require:
```javascript
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

---

## API Endpoints

### 1. Transfer Funds
**Endpoint**: `POST /api/v1/transfer`

**Request Body**:
```typescript
{
  recipientId?: string;        // MongoDB ObjectId (optional if recipientUsername provided)
  recipientUsername?: string;  // Username (optional if recipientId provided)
  amount: number;              // Required: Positive number, minimum 1 USDT
  memo?: string;               // Optional: Note for the transfer
  twoFACode: string;           // Required: 6-digit 2FA code from authenticator app
}
```

**Success Response (200)**:
```typescript
{
  success: true;
  message: "Transfer successful";
  txId: string;               // Transaction ID
  details: {
    amount: number;
    recipient: string;         // Recipient username
    fee: number;              // Always 0 (transfers are FREE)
    feePercentage: number;    // Always 0
    totalDeducted: number;    // Amount deducted from sender
    transferredToWallet: "transfer"; // Always "transfer"
    note: "P2P transfers are FREE";
  };
}
```

**Error Responses**:
- `400`: Invalid input, validation errors, insufficient balance, transfer limits
- `401`: Unauthorized (missing/invalid token)
- `403`: 2FA code invalid or missing
- `404`: Recipient not found
- `409`: Duplicate transfer detected
- `429`: Suspicious activity detected

---

### 2. Get Transfer History
**Endpoint**: `GET /api/v1/transfer`

**Query Parameters**:
```typescript
{
  page?: number;      // Default: 1
  limit?: number;     // Default: 10, Max: 100
  direction?: "in" | "out" | "all";  // Default: "all"
}
```

**Success Response (200)**:
```typescript
{
  success: true;
  data: {
    transfers: Array<{
      id: string;              // Transaction ID
      direction: "in" | "out"; // Transfer direction
      amount: number;          // Transfer amount
      fee: number;            // Always 0
      recipient?: string;      // Recipient username (for outgoing)
      sender?: string;         // Sender username (for incoming)
      memo?: string;           // Optional memo
      timestamp: string;       // ISO timestamp
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}
```

---

### 3. Get Notifications
**Endpoint**: `GET /api/v1/notifications`

**Query Parameters**:
```typescript
{
  page?: number;           // Default: 1
  limit?: number;         // Default: 20, Max: 50
  category?: string;       // Filter by category (e.g., "general")
  type?: string;          // Filter by type (e.g., "success")
  unreadOnly?: boolean;    // Default: false
}
```

**Success Response (200)**:
```typescript
{
  success: true;
  data: Array<{
    _id: string;
    title: string;         // "Transfer Successful" or "Funds Received"
    message: string;       // Detailed message
    type: "success" | "info" | "warning" | "error";
    category: "general" | "rank_system" | ...;
    priority?: "low" | "medium" | "high" | "urgent";
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
    createdAt: string;     // ISO timestamp
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  };
  unreadCount: number;
}
```

---

### 4. Get 2FA Code (Testing/Development)
**Endpoint**: `GET /api/test/2fa-code`

**Note**: This endpoint is for testing purposes. In production, users will generate codes from their authenticator app.

**Success Response (200)**:
```typescript
{
  success: true;
  message: "2FA codes generated successfully";
  data: {
    user: {
      email: string;
      username: string;
    };
    codes: {
      current: string;    // Current 6-digit code
      previous: string;   // Previous code (valid for 2 minutes)
      next: string;       // Next code (valid for 2 minutes)
    };
    timeRemaining: number; // Seconds until code expires
    validFor: "2 minutes";
  };
}
```

---

## Feature Integration

### Feature 1: Basic Transfer Execution

This is the core transfer functionality. When a user initiates a transfer, the system:
- Validates the request (recipient, amount, 2FA)
- Processes the transfer atomically
- Creates a transaction record
- Returns a success response with transaction ID

**Success Response Details**:
- `txId`: Unique transaction identifier (use this for tracking)
- `details.amount`: The transferred amount
- `details.recipient`: Recipient username
- `details.fee`: Always 0 (transfers are FREE)
- `details.totalDeducted`: Amount deducted from sender

**Important**: Always check for `success: true` in the response before showing success message.

---

### Feature 2: Wallet Balance Updates

After a successful transfer, wallet balances are automatically updated:
- **Sender**: Balance decreases (from `earningWallet` first, then `fundedWallet` if needed)
- **Recipient**: Balance increases (added to `fundedWallet`)
- **Statistics**: `totalTransferSent` and `totalTransferReceived` counters are updated

**Frontend Implementation**:
1. **Fetch Wallet Balance**: Use `GET /api/v1/wallets/info` to get current balance
2. **Display Balance**: Show both `earningWallet` and `fundedWallet` balances
3. **Update After Transfer**: Refresh wallet balance immediately after successful transfer
4. **Show Available Balance**: Display "Available: X USDT" in transfer form

**Wallet Info Endpoint**:
```typescript
GET /api/v1/wallets/info
Headers: { "Authorization": "Bearer <TOKEN>" }

Response:
{
  success: true,
  wallet: {
    totalBalance: number;        // Total available balance
    earningWallet: number;       // Earning wallet balance
    fundedWallet: number;        // Funded wallet balance
    canTransfer: boolean;        // Whether user can transfer
    statistics: {
      totalTransferSent: number;     // Total sent by user
      totalTransferReceived: number;  // Total received by user
    }
  }
}
```

**Example: Display Balance in Transfer Form**:
```typescript
const [walletBalance, setWalletBalance] = useState({
  totalBalance: 0,
  earningWallet: 0,
  fundedWallet: 0
});

useEffect(() => {
  const fetchBalance = async () => {
    const response = await fetch('/api/v1/wallets/info', {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    const data = await response.json();
    if (data.success) {
      setWalletBalance(data.wallet);
    }
  };
  fetchBalance();
}, []);

// In your transfer form:
<div className="balance-display">
  <div>Total Balance: {walletBalance.totalBalance} USDT</div>
  <div>Earning Wallet: {walletBalance.earningWallet} USDT</div>
  <div>Funded Wallet: {walletBalance.fundedWallet} USDT</div>
  <div className="available-balance">
    Available for Transfer: {walletBalance.totalBalance} USDT
  </div>
</div>
```

---

### Feature 3: Email Notifications

Email notifications are sent automatically by the backend when a transfer is completed. **No frontend action required** - emails are handled server-side.

**Email Details**:

**Sender Email**:
- **Subject**: "✅ Transfer Confirmation - Your Transfer Was Successful"
- **Content**: 
  - Confirmation of transfer to recipient
  - Transaction ID
  - Amount transferred
  - Note about transfer wallet restrictions

**Recipient Email**:
- **Subject**: "💰 Funds Received - You've Got USDT!"
- **Content**:
  - Notification of received funds
  - Sender username
  - Transaction ID
  - Amount received
  - Information about transfer wallet usage

**Frontend Note**: 
- Emails are sent automatically - no API call needed
- Users will receive emails in their registered email address
- Consider showing a message: "A confirmation email has been sent to your registered email address"

---

### Feature 4: Transfer Funds Form

#### Step 1: Create Transfer Form Component
```typescript
interface TransferFormData {
  recipientUsername: string;
  amount: number;
  memo?: string;
  twoFACode: string;
}

const TransferForm = () => {
  const [formData, setFormData] = useState<TransferFormData>({
    recipientUsername: '',
    amount: 0,
    memo: '',
    twoFACode: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.recipientUsername.trim()) {
      newErrors.recipientUsername = 'Recipient username is required';
    }
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (formData.amount < 1) {
      newErrors.amount = 'Minimum transfer amount is 1 USDT';
    }
    
    if (!formData.twoFACode || formData.twoFACode.length !== 6) {
      newErrors.twoFACode = 'Please enter a valid 6-digit 2FA code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/v1/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientUsername: formData.recipientUsername.toLowerCase(),
          amount: formData.amount,
          memo: formData.memo,
          twoFACode: formData.twoFACode
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Show success message
        showNotification('Transfer successful!', 'success');
        // Refresh wallet balance
        refreshWalletBalance();
        // Refresh transfer history
        refreshTransferHistory();
        // Clear form
        setFormData({ recipientUsername: '', amount: 0, memo: '', twoFACode: '' });
      } else {
        // Handle errors (see Error Handling section)
        handleTransferError(data, response.status);
      }
    } catch (error) {
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

#### Step 2: Add Real-time Balance Check
```typescript
// Before allowing transfer, check available balance
const checkBalance = async (amount: number): Promise<boolean> => {
  try {
    const response = await fetch('/api/v1/wallets/info', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    const data = await response.json();
    const totalBalance = data.wallet?.totalBalance || 0;
    
    if (totalBalance < amount) {
      showNotification('Insufficient balance', 'error');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking balance:', error);
    return false;
  }
};
```

---

### Feature 5: Transfer History Display

#### Step 1: Create Transfer History Component
```typescript
interface TransferHistoryProps {
  direction?: 'in' | 'out' | 'all';
}

const TransferHistory: React.FC<TransferHistoryProps> = ({ direction = 'all' }) => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0
  });
  
  const fetchTransferHistory = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/v1/transfer?direction=${direction}&page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setTransfers(data.data.transfers);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching transfer history:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTransferHistory();
  }, [direction]);
  
  return (
    <div>
      {/* Transfer list */}
      {transfers.map(transfer => (
        <TransferItem key={transfer.id} transfer={transfer} />
      ))}
      
      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={fetchTransferHistory}
      />
    </div>
  );
};
```

#### Step 2: Create Transfer Item Component
```typescript
const TransferItem: React.FC<{ transfer: Transfer }> = ({ transfer }) => {
  const isOutgoing = transfer.direction === 'out';
  const otherParty = isOutgoing ? transfer.recipient : transfer.sender;
  
  return (
    <div className={`transfer-item ${isOutgoing ? 'outgoing' : 'incoming'}`}>
      <div className="transfer-icon">
        {isOutgoing ? <ArrowUpIcon /> : <ArrowDownIcon />}
      </div>
      <div className="transfer-details">
        <div className="transfer-party">
          {isOutgoing ? `To: ${otherParty}` : `From: ${otherParty}`}
        </div>
        <div className="transfer-amount">
          {isOutgoing ? '-' : '+'} {transfer.amount} USDT
        </div>
        <div className="transfer-date">
          {formatDate(transfer.timestamp)}
        </div>
        {transfer.memo && (
          <div className="transfer-memo">{transfer.memo}</div>
        )}
      </div>
    </div>
  );
};
```

---

### Feature 6: In-App Notifications

#### Step 1: Create Notifications Hook
```typescript
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        '/api/v1/notifications?category=general&limit=20',
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return { notifications, unreadCount, refreshNotifications: fetchNotifications };
};
```

#### Step 2: Display Transfer Notifications
```typescript
const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const isTransferNotification = 
    notification.title === 'Transfer Successful' || 
    notification.title === 'Funds Received';
  
  if (!isTransferNotification) return null;
  
  const metadata = notification.metadata || {};
  const isReceived = notification.title === 'Funds Received';
  
  return (
    <div className={`notification-item ${notification.type} ${notification.priority}`}>
      <div className="notification-icon">
        {isReceived ? <IncomingIcon /> : <OutgoingIcon />}
      </div>
      <div className="notification-content">
        <div className="notification-title">{notification.title}</div>
        <div className="notification-message">{notification.message}</div>
        {metadata.amount && (
          <div className="notification-amount">
            Amount: {metadata.amount} USDT
          </div>
        )}
        {metadata.txId && (
          <div className="notification-txid">
            TX ID: {metadata.txId}
          </div>
        )}
      </div>
      {!notification.isRead && <div className="unread-indicator" />}
    </div>
  );
};
```

---

## Error Handling

### Error Response Format
```typescript
{
  success: false;
  message: string;        // Human-readable error message
  code?: string;         // Error code (e.g., "INSUFFICIENT_BALANCE")
  error?: {
    code: string;
    message: string;
  };
}
```

### Error Handling Function
```typescript
const handleTransferError = (errorData: any, statusCode: number) => {
  const errorMessages: Record<string, string> = {
    // 400 Errors
    'Invalid input. Recipient ID or username, and positive amount are required.': 
      'Please provide a valid recipient and amount',
    'You cannot transfer to yourself.': 
      'You cannot transfer funds to your own account',
    'Minimum transfer amount is': 
      `Transfer amount is below the minimum`,
    'Maximum transfer amount is': 
      `Transfer amount exceeds the maximum`,
    'Insufficient balance': 
      'You do not have sufficient balance for this transfer',
    
    // 403 Errors
    '2FA code is required': 
      'Please enter your 2FA code',
    'Invalid 2FA code': 
      'The 2FA code you entered is invalid. Please try again.',
    
    // 404 Errors
    'User with username': 
      'Recipient not found. Please check the username.',
    
    // 409 Errors
    'Duplicate transfer request detected': 
      'A similar transfer is already being processed. Please wait a moment.',
    'Identical transfer request detected': 
      'You just made this transfer. Please wait before trying again.',
    
    // 429 Errors
    'Suspicious activity detected': 
      'Transfer temporarily blocked due to suspicious activity. Please contact support.',
  };
  
  // Find matching error message
  const errorMessage = errorData.message || 'An error occurred';
  let displayMessage = errorMessage;
  
  // Check for specific error codes
  if (errorData.code) {
    switch (errorData.code) {
      case 'INSUFFICIENT_BALANCE':
        displayMessage = 'Insufficient balance for this transfer';
        break;
      case '2FA_CODE_INVALID':
        displayMessage = 'Invalid 2FA code. Please enter the 6-digit code from your authenticator app.';
        break;
      case 'DUPLICATE_TRANSFER_REQUEST':
        displayMessage = 'Duplicate transfer detected. Please wait a moment before trying again.';
        break;
      case 'SUSPICIOUS_ACTIVITY_DETECTED':
        displayMessage = 'Transfer blocked due to suspicious activity. Please contact support.';
        break;
    }
  }
  
  // Show error notification
  showNotification(displayMessage, 'error');
  
  // Log error for debugging
  console.error('Transfer error:', {
    statusCode,
    errorData,
    displayMessage
  });
};
```

### Error Handling in Transfer Form
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setLoading(true);
  setErrors({});
  
  try {
    const response = await fetch('/api/v1/transfer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipientUsername: formData.recipientUsername.toLowerCase(),
        amount: formData.amount,
        memo: formData.memo,
        twoFACode: formData.twoFACode
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 403 && data.code === '2FA_CODE_INVALID') {
        setErrors({ 
          twoFACode: 'Invalid 2FA code. Please check and try again.' 
        });
        // Clear 2FA input to allow retry
        setFormData(prev => ({ ...prev, twoFACode: '' }));
      } else if (response.status === 404) {
        setErrors({ 
          recipientUsername: 'User not found. Please check the username.' 
        });
      } else if (response.status === 400) {
        // Handle validation errors
        if (data.message.includes('Minimum')) {
          setErrors({ amount: data.message });
        } else if (data.message.includes('Maximum')) {
          setErrors({ amount: data.message });
        } else if (data.message.includes('Insufficient')) {
          setErrors({ amount: 'Insufficient balance for this transfer' });
        }
      }
      
      handleTransferError(data, response.status);
      return;
    }
    
    if (data.success) {
      // Success handling
      showNotification('Transfer successful!', 'success');
      refreshWalletBalance();
      refreshTransferHistory();
      setFormData({ recipientUsername: '', amount: 0, memo: '', twoFACode: '' });
    }
  } catch (error) {
    showNotification('Network error. Please check your connection.', 'error');
  } finally {
    setLoading(false);
  }
};
```

---

## UI/UX Recommendations

### 1. Transfer Form UI
- **Recipient Input**: 
  - Use autocomplete/search for username lookup
  - Show user avatar/name when found
  - Validate username in real-time
  
- **Amount Input**:
  - Show current balance prominently
  - Display "Available: X USDT" below input
  - Add "Max" button to transfer all available balance
  - Show transfer limits (min/max) as helper text
  
- **2FA Input**:
  - 6-digit input with auto-focus
  - Show countdown timer for code validity (2 minutes)
  - Provide link to "Get 2FA code" (for testing/dev)
  - Clear error state when user starts typing new code

- **Memo Field**:
  - Optional, character limit (e.g., 200 chars)
  - Show character count

- **Submit Button**:
  - Disable during loading
  - Show loading spinner
  - Disable if form is invalid

### 2. Transfer History UI
- **Filter Tabs**: "All", "Sent", "Received"
- **Search**: Filter by username, amount, date
- **Sort**: By date (newest first), amount
- **Empty State**: Friendly message when no transfers
- **Loading State**: Skeleton loaders

### 3. Notifications UI
- **Badge**: Show unread count on notification icon
- **Real-time Updates**: Poll every 30 seconds or use WebSocket
- **Grouping**: Group transfer notifications by date
- **Actions**: Mark as read, mark all as read
- **Priority Indicators**: Visual indicators for high-priority notifications

### 4. Error States
- **Inline Errors**: Show errors below relevant input fields
- **Toast Notifications**: For general errors
- **Error Recovery**: Clear errors when user corrects input
- **Retry Mechanism**: For network errors

---

## Code Examples

### Complete Transfer Service
```typescript
// services/transferService.ts
export class TransferService {
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
  
  async transferFunds(data: {
    recipientUsername: string;
    amount: number;
    memo?: string;
    twoFACode: string;
  }): Promise<TransferResponse> {
    const response = await fetch(`${this.baseUrl}/transfer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipientUsername: data.recipientUsername.toLowerCase(),
        amount: data.amount,
        memo: data.memo,
        twoFACode: data.twoFACode
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new TransferError(result.message, response.status, result.code);
    }
    
    return result;
  }
  
  async getTransferHistory(params: {
    direction?: 'in' | 'out' | 'all';
    page?: number;
    limit?: number;
  }): Promise<TransferHistoryResponse> {
    const queryParams = new URLSearchParams();
    if (params.direction) queryParams.append('direction', params.direction);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await fetch(
      `${this.baseUrl}/transfer?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      }
    );
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch transfer history');
    }
    
    return result;
  }
  
  async getWalletInfo(): Promise<WalletInfoResponse> {
    const response = await fetch(`${this.baseUrl}/wallets/info`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch wallet info');
    }
    
    return result;
  }
  
  private getAuthToken(): string {
    // Implement your token retrieval logic
    return localStorage.getItem('authToken') || '';
  }
}

export class TransferError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'TransferError';
  }
}
```

### React Hook for Transfers
```typescript
// hooks/useTransfer.ts
export const useTransfer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transferService = new TransferService();
  
  const transferFunds = async (data: TransferFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await transferService.transferFunds(data);
      return { success: true, data: result };
    } catch (err) {
      if (err instanceof TransferError) {
        setError(err.message);
        return { success: false, error: err };
      }
      setError('An unexpected error occurred');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };
  
  return { transferFunds, loading, error };
};
```

---

## Testing Checklist

### Feature 1: Basic Transfer Execution
- [ ] Transfer form submits successfully
- [ ] Success response received with `txId`
- [ ] Transaction ID is displayed to user
- [ ] Success message shows correct amount and recipient
- [ ] Form clears after successful transfer

### Feature 2: Wallet Balance Updates
- [ ] Wallet balance fetched correctly before transfer
- [ ] Balance decreases for sender after transfer
- [ ] Balance increases for recipient after transfer
- [ ] Balance refreshes automatically after transfer
- [ ] `totalTransferSent` counter updates for sender
- [ ] `totalTransferReceived` counter updates for recipient

### Feature 3: Email Notifications
- [ ] User informed that email will be sent
- [ ] Email notification message displayed (optional)
- [ ] Note: Emails are sent automatically by backend (no frontend action needed)

### Transfer Form
- [ ] Form validation works correctly
- [ ] Username lookup works (autocomplete/search)
- [ ] Amount validation (min/max) works
- [ ] 2FA code input accepts 6 digits
- [ ] Error messages display correctly
- [ ] Success message shows after transfer
- [ ] Form clears after successful transfer
- [ ] Loading state works during transfer

### Transfer History
- [ ] Outgoing transfers display correctly
- [ ] Incoming transfers display correctly
- [ ] Filter by direction works
- [ ] Pagination works
- [ ] Empty state displays when no transfers
- [ ] Loading state works

### Notifications
- [ ] Transfer notifications appear after transfer
- [ ] Unread count updates correctly
- [ ] Notification polling works (every 30s)
- [ ] Mark as read works
- [ ] Notification details display correctly

### Error Handling
- [ ] Invalid 2FA code shows error
- [ ] Invalid recipient shows error
- [ ] Insufficient balance shows error
- [ ] Transfer limits show error
- [ ] Network errors handled gracefully
- [ ] Duplicate transfer error handled

### Edge Cases
- [ ] Self-transfer prevented
- [ ] Zero/negative amounts prevented
- [ ] Very large amounts handled
- [ ] Special characters in username handled
- [ ] Expired 2FA codes handled

---

## Additional Notes

### 2FA Integration
- Users must have 2FA enabled to make transfers
- 2FA codes are valid for 2 minutes
- Frontend should prompt users to set up 2FA if not enabled
- Consider showing a countdown timer for code validity

### Balance Display
- Show both `earningWallet` and `fundedWallet` balances
- Transfers deduct from `earningWallet` first, then `fundedWallet` if needed
- Update balance immediately after successful transfer

### Real-time Updates
- Consider using WebSocket for real-time notifications
- Poll transfer history every 30-60 seconds if WebSocket not available
- Refresh wallet balance after each transfer

### Security Best Practices
- Never store 2FA codes
- Clear 2FA input after failed attempts
- Implement rate limiting on transfer attempts
- Show security warnings for large transfers

---

## Support

For questions or issues during integration, contact the backend team or refer to:
- API Documentation: `/docs/swagger` (if available)
- Error Codes: See `ERROR_CODES` in backend codebase
- Testing Guide: `TRANSFER_TESTING_GUIDE.md`

---

**Last Updated**: Based on backend testing completed on [Current Date]  
**Backend Version**: Tested and verified working  
**Status**: ✅ All 10 features ready for integration

---

## Feature Summary

### Core Features (Tested with Postman)
1. ✅ **Basic Transfer Execution** - Transfer funds between users
2. ✅ **Wallet Balance Updates** - Automatic balance updates after transfer
3. ✅ **Email Notifications** - Automatic email confirmations

### Display Features
4. ✅ **In-App Notifications (Sender)** - Real-time notifications for sender
5. ✅ **In-App Notifications (Recipient)** - Real-time notifications for recipient
6. ✅ **Transfer History (Outgoing)** - View sent transfers
7. ✅ **Transfer History (Incoming)** - View received transfers

### Validation Features
8. ✅ **Input Validation** - Form validation and error handling
9. ✅ **Balance Validation** - Insufficient balance checks
10. ✅ **Transfer Limits** - Min/max amount enforcement
