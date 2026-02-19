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
 * Platform now only supports BEP20 (Binance Smart Chain)
 * @param address - Wallet address to validate
 * @param network - Network type (should be 'BEP20', TRC20 is rejected)
 * @returns Validation result with error message if invalid
 */
export function validateWalletAddress(
  address: string,
  network: string = 'BEP20'
): { valid: boolean; error?: string } {
  if (!address || address.trim() === '') {
    return { valid: false, error: 'Wallet address is required' };
  }

  const trimmedAddress = address.trim();

  // Reject TRC20 addresses explicitly
  if (trimmedAddress.startsWith('T') && trimmedAddress.length === 34) {
    return {
      valid: false,
      error:
        'TRC20 addresses are no longer supported. Only BEP20 (Binance Smart Chain) addresses starting with 0x are accepted.',
    };
  }

  // Only BEP20 is supported
  if (network !== 'BEP20') {
    return {
      valid: false,
      error: 'Only BEP20 (Binance Smart Chain) network is supported.',
    };
  }

  // BEP20 validation: 0x followed by 40 hex characters
  const bep20Regex = /^0x[a-fA-F0-9]{40}$/;
  if (!bep20Regex.test(trimmedAddress)) {
    return {
      valid: false,
      error:
        'Invalid BEP20 address format. Address must start with 0x followed by 40 hexadecimal characters.',
    };
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
 * @param typeLabel - Optional typeLabel from API (preferred)
 * @returns Human-readable label
 *
 * IMPORTANT:
 * - Only registration_bonus should display as "Bonus"
 * - All other earnings (referral_bonus, ros_payout, pool payouts) should display as "Earning" or descriptive labels
 * - This ensures uniform transaction history across the platform
 */
export function formatTransactionType(
  type: string,
  typeLabel?: string
): string {
  // Always use "Daily ROS Payout" for ros_payout type, regardless of typeLabel
  if (type === 'ros_payout') {
    return 'Daily ROS Payout';
  }

  if (type === 'test_ros_payout') {
    return 'Test ROS Payout';
  }

  // Referral bonuses are earnings, not bonuses - display as "Earning"
  if (type === 'referral_bonus') {
    return 'Earning';
  }

  // Use typeLabel if provided (from API), but clean it up
  if (typeLabel) {
    // Replace "Weekly ROS Payout" with "Daily ROS Payout"
    let label = typeLabel.replace(/Weekly ROS Payout/gi, 'Daily ROS Payout');

    // Replace "Referral Bonus" with "Earning" to ensure consistency
    label = label.replace(/Referral Bonus/gi, 'Earning');

    // Replace "REF: BONUS" or similar patterns with "Earning"
    label = label.replace(/REF:\s*BONUS/gi, 'Earning');
    label = label.replace(/REF\s*BONUS/gi, 'Earning');

    return label;
  }

  const types: Record<string, string> = {
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    transfer_out: 'Transfer Out',
    transfer_in: 'Transfer In',
    transfer: 'Transfer',
    stake: 'Stake',
    unstake: 'Unstake',
    ros_payout: 'Daily ROS Payout',
    test_ros_payout: 'Test ROS Payout',
    stake_completion: 'Stake Completion',
    stake_pool_payout: 'Stake Pool Payout',
    performance_pool_payout: 'Performance Pool Payout',
    premium_pool_payout: 'Premium Pool Payout',
    registration_bonus: 'Registration Bonus', // Only this one shows as "Bonus"
    referral_bonus: 'Earning', // Changed from "Referral Bonus" to "Earning"
    bonus_activation: 'Bonus Activation',
    ranking_bonus: 'Ranking Bonus',
    bonus: 'Bonus',
    fee: 'Fee',
    adjustment: 'Adjustment',
    refund: 'Refund',
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
  const statusMap: Record<
    string,
    { label: string; color: string; bgColor: string }
  > = {
    pending: {
      label: 'Pending',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    processing: {
      label: 'Processing',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    confirmed: {
      label: 'Confirmed',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    completed: {
      label: 'Completed',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    failed: {
      label: 'Failed',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    expired: {
      label: 'Expired',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    requires_approval: {
      label: 'Requires Approval',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  };

  return (
    statusMap[status] || {
      label: status,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    }
  );
}

/**
 * Format amount with direction sign
 * @param amount - Transaction amount
 * @param direction - Transaction direction ('in', 'out', 'neutral')
 * @returns Formatted amount string with sign
 */
export function formatAmountWithDirection(
  amount: number,
  direction: 'in' | 'out' | 'neutral'
): string {
  const sign = direction === 'out' ? '-' : direction === 'in' ? '+' : '';
  return `${sign}${formatCurrency(Math.abs(amount), { showCurrency: false })}`;
}

/**
 * Get status color for display
 * @param status - Transaction status
 * @returns Color string
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'orange',
    processing: 'blue',
    confirmed: 'green',
    completed: 'green',
    failed: 'red',
    cancelled: 'gray',
    expired: 'gray',
    requires_approval: 'yellow',
  };
  return colors[status] || 'gray';
}

/**
 * Get direction icon
 * @param direction - Transaction direction
 * @returns Icon character
 */
export function getDirectionIcon(direction: 'in' | 'out' | 'neutral'): string {
  return direction === 'in' ? '↓' : direction === 'out' ? '↑' : '↔';
}

/**
 * Format date for display
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatTransactionDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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

/**
 * Generate a random test wallet address for development/testing
 * Platform now only supports BEP20
 * @param network - Network type (defaults to BEP20, TRC20 is no longer supported)
 * @returns A valid-looking test BEP20 wallet address
 *
 * NOTE: This is for TESTING ONLY. Do not use in production.
 * These addresses are randomly generated and not real wallet addresses.
 */
export function generateTestWalletAddress(
  network: 'BEP20' | 'ERC20' = 'BEP20'
): string {
  // Only BEP20/ERC20: 0x + 40 hex characters
  const hexChars = '0123456789abcdef';
  const randomHex = Array.from(
    { length: 40 },
    () => hexChars[Math.floor(Math.random() * hexChars.length)]
  ).join('');
  return `0x${randomHex}`;
}

/**
 * Validate BEP20 address format
 * Platform now only supports BEP20 (Binance Smart Chain)
 * BEP20 addresses are Ethereum-compatible (0x followed by 40 hex characters)
 * @param address - Address to validate
 * @returns true if valid BEP20 address
 */
export function validateBEP20Address(address: string): boolean {
  if (!address || typeof address !== 'string') return false;

  const cleanAddress = address.trim().toLowerCase();

  // Reject TRC20 addresses explicitly
  if (cleanAddress.startsWith('t') && cleanAddress.length === 34) {
    return false;
  }

  // BEP20 validation: 0x followed by 40 hex characters
  const bep20Regex = /^0x[a-f0-9]{40}$/;
  return bep20Regex.test(cleanAddress);
}

/**
 * Format address for display (shows first 6 and last 4 characters)
 * @param address - Address to format
 * @returns Formatted address (e.g., "0x1234...5678")
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Copy text to clipboard with fallback support
 * @param text - Text to copy
 * @returns Promise that resolves to true if successful
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}
