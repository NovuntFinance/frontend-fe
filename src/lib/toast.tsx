/**
 * Toast Notification Helper
 * Enhanced wrapper around Sonner with banking-grade styling
 */

import { toast as sonnerToast, ExternalToast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
} from 'lucide-react';

// Custom toast options with banking-grade styling
const defaultOptions: ExternalToast = {
  duration: 4000,
  classNames: {
    toast: 'bg-background border shadow-lg',
    title: 'text-foreground font-semibold',
    description: 'text-muted-foreground text-sm',
    actionButton: 'bg-primary text-primary-foreground hover:bg-primary/90',
    cancelButton: 'bg-muted text-muted-foreground hover:bg-muted/80',
    closeButton: 'bg-background border hover:bg-muted',
  },
};

/**
 * Success toast with checkmark icon
 */
export const success = (
  message: string,
  description?: string,
  options?: ExternalToast
) => {
  return sonnerToast.success(message, {
    ...defaultOptions,
    description,
    icon: <CheckCircle2 className="text-success h-5 w-5" />,
    ...options,
  });
};

/**
 * Error toast with error icon
 */
export const error = (
  message: string,
  description?: string,
  options?: ExternalToast
) => {
  return sonnerToast.error(message, {
    ...defaultOptions,
    description,
    icon: <XCircle className="text-error h-5 w-5" />,
    // Error messages stay visible longer - 15 seconds or until manually dismissed
    duration: options?.duration || 15000,
    ...options,
  });
};

/**
 * Warning toast with warning icon
 */
export const warning = (
  message: string,
  description?: string,
  options?: ExternalToast
) => {
  return sonnerToast.warning(message, {
    ...defaultOptions,
    description,
    icon: <AlertCircle className="text-warning h-5 w-5" />,
    ...options,
  });
};

/**
 * Info toast with info icon
 */
export const info = (
  message: string,
  description?: string,
  options?: ExternalToast
) => {
  return sonnerToast.info(message, {
    ...defaultOptions,
    description,
    icon: <Info className="text-info h-5 w-5" />,
    ...options,
  });
};

/**
 * Loading toast with spinner
 */
export const loading = (
  message: string,
  description?: string,
  options?: ExternalToast
) => {
  return sonnerToast.loading(message, {
    ...defaultOptions,
    description,
    icon: <Loader2 className="text-primary h-5 w-5 animate-spin" />,
    duration: Infinity, // Loading toasts don't auto-dismiss
    ...options,
  });
};

/**
 * Promise toast - automatically shows loading, success, or error
 */
export const promise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error | unknown) => string);
  },
  options?: ExternalToast
) => {
  return sonnerToast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    ...defaultOptions,
    ...options,
  });
};

/**
 * Custom toast with full control
 */
export const custom = (message: string, options?: ExternalToast) => {
  return sonnerToast(message, {
    ...defaultOptions,
    ...options,
  });
};

/**
 * Dismiss a specific toast by ID
 */
export const dismiss = (toastId?: string | number) => {
  return sonnerToast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAll = () => {
  return sonnerToast.dismiss();
};

// Export as named object for easy importing
export const toast = {
  success,
  error,
  warning,
  info,
  loading,
  promise,
  custom,
  dismiss,
  dismissAll,
};

// Example usage in components:
// import { toast } from '@/lib/toast';
//
// toast.success('Transaction completed', 'Your funds have been transferred');
// toast.error('Failed to process', 'Please try again later');
// toast.loading('Processing transaction...');
//
// const toastId = toast.loading('Saving...');
// // Later...
// toast.dismiss(toastId);
// toast.success('Saved successfully');
//
// toast.promise(
//   fetch('/api/data'),
//   {
//     loading: 'Loading...',
//     success: 'Data loaded successfully',
//     error: 'Failed to load data',
//   }
// );
