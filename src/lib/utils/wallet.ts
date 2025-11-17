/**
 * Wallet Utility Functions
 * Currency formatting, validation, and calculations
 */

/**
 * Format currency amount
 * @param amount - Amount to format
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "$1,234.57 USDT")
 */
export function formatCurrency(
  amount: number,
  options: {
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showCurrency?: boolean;
  } = {}
): string {
  const {
    currency = 'USDT',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showCurrency = true,
  } = options;

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // Display as USD but label as USDT
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);

  return showCurrency ? `${formatted} ${currency}` : formatted.replace('$', '');
}

/**
 * Validate wallet address format
 * @param address - Wallet address to validate
 * @param network - Network type (BEP20, TRC20, ERC20)
 * @returns Validation result with error message if invalid
 */
export function validateWalletAddress(
  address: string,
  network: string
): { valid: boolean; error?: string } {
  if (!address || address.trim() === '') {
    return { valid: false, error: 'Wallet address is required' };
  }

  const trimmedAddress = address.trim();

  switch (network) {
    case 'BEP20':
    case 'ERC20':
      // Ethereum-style: 0x followed by 40 hex characters
      const ethRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!ethRegex.test(trimmedAddress)) {
        return {
          valid: false,
          error: 'Invalid BEP20/ERC20 address format. Must start with 0x and be 42 characters.',
        };
      }
      break;

    case 'TRC20':
      // Tron-style: T followed by 33 base58 characters
      const tronRegex = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
      if (!tronRegex.test(trimmedAddress)) {
        return {
          valid: false,
          error: 'Invalid TRC20 address format. Must start with T and be 34 characters.',
        };
      }
      break;

    default:
      return { valid: false, error: 'Unsupported network' };
  }

  return { valid: true };
}

/**
 * Calculate withdrawal fee
 * @param amount - Withdrawal amount
 * @param feePercentage - Percentage fee (e.g., 2.5)
 * @param feeFixed - Fixed fee in USDT (e.g., 1)
 * @returns Fee breakdown and net amount
 */
export function calculateWithdrawalFee(
  amount: number,
  feePercentage: number,
  feeFixed: number
): {
  percentageFee: number;
  fixedFee: number;
  totalFee: number;
  netAmount: number;
  breakdown: string;
} {
  const percentageFee = (amount * feePercentage) / 100;
  const totalFee = percentageFee + feeFixed;
  const netAmount = amount - totalFee;

  return {
    percentageFee,
    fixedFee: feeFixed,
    totalFee,
    netAmount,
    breakdown: `${feePercentage}% + ${feeFixed} USDT`,
  };
}

/**
 * Mask wallet address for display
 * Shows first 6 and last 4 characters
 * @param address - Wallet address to mask
 * @returns Masked address (e.g., "0x742d...0bEb")
 */
export function maskWalletAddress(address: string): string {
  if (!address || address.length < 10) return address;
  const start = address.slice(0, 6);
  const end = address.slice(-4);
  return `${start}...${end}`;
}

/**
 * Format transaction type for display
 * @param type - Transaction type
 * @returns Human-readable label
 */
export function formatTransactionType(type: string): string {
  const types: Record<string, string> = {
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    transfer: 'Transfer',
    stake: 'Stake',
    bonus: 'Bonus',
  };
  return types[type] || type;
}

/**
 * Format transaction status with color
 * @param status - Transaction status
 * @returns Status info with color class
 */
export function formatTransactionStatus(status: string): {
  label: string;
  color: string;
  bgColor: string;
} {
  const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: {
      label: 'Pending',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    confirmed: {
      label: 'Confirmed',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    failed: {
      label: 'Failed',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  };

  return statusMap[status] || {
    label: status,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  };
}

/**
 * Calculate time remaining until expiration
 * @param expiresAt - ISO 8601 expiration date
 * @returns Time remaining in milliseconds, or null if expired
 */
export function getTimeRemaining(expiresAt: string): number | null {
  const expiration = new Date(expiresAt);
  const now = new Date();
  const remaining = expiration.getTime() - now.getTime();
  return remaining > 0 ? remaining : null;
}

/**
 * Format time remaining as human-readable string
 * @param milliseconds - Time in milliseconds
 * @returns Formatted string (e.g., "5m 30s")
 */
export function formatTimeRemaining(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

