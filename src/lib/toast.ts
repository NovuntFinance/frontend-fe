/**
 * Toast Notification Utilities
 * Standardized toast notifications across the app
 */

import { toast as sonnerToast } from 'sonner';
import { fmt4 } from '@/utils/formatters';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastOptions {
  duration?: number;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Standardized Toast Notifications
 */
class Toast {
  /**
   * Success toast (green)
   */
  success(message: string, options?: ToastOptions) {
    return sonnerToast.success(message, {
      duration: options?.duration || 4000,
      description: options?.description,
      action: options?.action,
    });
  }

  /**
   * Error toast (red)
   */
  error(message: string, options?: ToastOptions) {
    return sonnerToast.error(message, {
      duration: options?.duration || 6000,
      description: options?.description,
      action: options?.action,
    });
  }

  /**
   * Warning toast (yellow)
   */
  warning(message: string, options?: ToastOptions) {
    return sonnerToast.warning(message, {
      duration: options?.duration || 5000,
      description: options?.description,
      action: options?.action,
    });
  }

  /**
   * Info toast (blue)
   */
  info(message: string, options?: ToastOptions) {
    return sonnerToast.info(message, {
      duration: options?.duration || 4000,
      description: options?.description,
      action: options?.action,
    });
  }

  /**
   * Loading toast (with spinner)
   */
  loading(message: string, options?: Omit<ToastOptions, 'action'>) {
    return sonnerToast.loading(message, {
      duration: options?.duration || Infinity,
      description: options?.description,
    });
  }

  /**
   * Promise toast (auto success/error)
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) {
    return sonnerToast.promise(promise, messages);
  }

  /**
   * Dismiss a toast
   */
  dismiss(toastId?: string | number) {
    sonnerToast.dismiss(toastId);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    sonnerToast.dismiss();
  }
}

// Singleton instance
export const toast = new Toast();

/**
 * Convenience functions for common scenarios
 */
export const ToastMessages = {
  // Authentication
  loginSuccess: () =>
    toast.success('Welcome back!', {
      description: 'You have successfully logged in',
    }),

  logoutSuccess: () =>
    toast.success('Logged out', {
      description: 'You have been logged out successfully',
    }),

  signupSuccess: () =>
    toast.success('Account created!', {
      description: 'Please check your email to verify your account',
    }),

  // Wallet operations
  depositInitiated: () =>
    toast.loading('Processing deposit...', {
      description: 'Please complete payment in the popup window',
    }),

  depositSuccess: (amount: number) =>
    toast.success('Deposit successful!', {
      description: `$${fmt4(amount)} has been added to your account`,
    }),

  withdrawalInitiated: () =>
    toast.loading('Processing withdrawal...', {
      description: 'This may take a few minutes',
    }),

  withdrawalSuccess: (amount: number) =>
    toast.success('Withdrawal requested!', {
      description: `$${fmt4(amount)} will be sent to your account`,
    }),

  // Staking
  stakeCreated: (amount: number) =>
    toast.success('Stake created!', {
      description: `Successfully staked $${fmt4(amount)}`,
    }),

  // Errors
  networkError: () =>
    toast.error('Network error', {
      description: 'Please check your connection and try again',
      action: {
        label: 'Retry',
        onClick: () => window.location.reload(),
      },
    }),

  authenticationRequired: () =>
    toast.error('Authentication required', {
      description: 'Please log in to continue',
    }),

  permissionDenied: () =>
    toast.error('Permission denied', {
      description: 'You do not have permission to perform this action',
    }),

  validationError: (field: string) =>
    toast.error('Validation error', {
      description: `Please check the ${field} field`,
    }),

  // Generic
  copiedToClipboard: (label = 'Text') =>
    toast.success('Copied!', { description: `${label} copied to clipboard` }),

  saveSuccess: () =>
    toast.success('Saved!', { description: 'Your changes have been saved' }),

  deleteSuccess: () =>
    toast.success('Deleted!', {
      description: 'Item has been deleted successfully',
    }),
};

/**
 * Example usage:
 *
 * import { toast, ToastMessages } from '@/lib/toast';
 *
 * // Direct usage
 * toast.success('Operation completed');
 * toast.error('Something went wrong', { duration: 5000 });
 *
 * // With description
 * toast.info('New feature', { description: 'Check out our new dashboard' });
 *
 * // Convenience functions
 * ToastMessages.loginSuccess();
 * ToastMessages.depositSuccess(100);
 *
 * // Promise handling
 * toast.promise(
 *   apiCall(),
 *   {
 *     loading: 'Processing...',
 *     success: 'Success!',
 *     error: 'Failed',
 *   }
 * );
 */
