/**
 * Enhanced Toast Notification System
 * Provides action buttons, grouping, and better UX
 */

'use client';

import { toast as sonnerToast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive';
}

interface EnhancedToastOptions {
  action?: ToastAction;
  secondaryAction?: ToastAction;
  duration?: number;
  description?: string;
  onDismiss?: () => void;
}

/**
 * Enhanced Toast Functions
 */
export const toast = {
  success: (message: string, options?: EnhancedToastOptions) => {
    return sonnerToast.success(message, {
      ...options,
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
      cancel: options?.secondaryAction
        ? {
            label: options.secondaryAction.label,
            onClick: options.secondaryAction.onClick,
          }
        : undefined,
      icon: <CheckCircle2 className="h-5 w-5" />,
      onDismiss: options?.onDismiss,
    });
  },

  error: (message: string, options?: EnhancedToastOptions) => {
    return sonnerToast.error(message, {
      ...options,
      description: options?.description,
      duration: options?.duration || 6000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
      cancel: options?.secondaryAction
        ? {
            label: options.secondaryAction.label,
            onClick: options.secondaryAction.onClick,
          }
        : undefined,
      icon: <XCircle className="h-5 w-5" />,
      onDismiss: options?.onDismiss,
    });
  },

  warning: (message: string, options?: EnhancedToastOptions) => {
    return sonnerToast.warning(message, {
      ...options,
      description: options?.description,
      duration: options?.duration || 5000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
      cancel: options?.secondaryAction
        ? {
            label: options.secondaryAction.label,
            onClick: options.secondaryAction.onClick,
          }
        : undefined,
      icon: <AlertCircle className="h-5 w-5" />,
      onDismiss: options?.onDismiss,
    });
  },

  info: (message: string, options?: EnhancedToastOptions) => {
    return sonnerToast.info(message, {
      ...options,
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
      cancel: options?.secondaryAction
        ? {
            label: options.secondaryAction.label,
            onClick: options.secondaryAction.onClick,
          }
        : undefined,
      icon: <Info className="h-5 w-5" />,
      onDismiss: options?.onDismiss,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  custom: (message: string, options?: EnhancedToastOptions & { type?: ToastType }) => {
    const type = options?.type || 'info';
    const toastFn = toast[type];
    return toastFn(message, options);
  },
};

/**
 * Toast with action button example
 */
export function showToastWithAction() {
  toast.success('Transaction completed!', {
    description: 'Your deposit of $100 has been processed.',
    action: {
      label: 'View Details',
      onClick: () => {
        // Navigate to transaction details
        console.log('View transaction details');
      },
    },
    secondaryAction: {
      label: 'Dismiss',
      onClick: () => {
        console.log('Dismissed');
      },
    },
  });
}

/**
 * Toast with promise (loading state)
 */
export function showPromiseToast<T>(promise: Promise<T>) {
  return toast.promise(promise, {
    loading: 'Processing your request...',
    success: (data) => `Success! ${JSON.stringify(data)}`,
    error: (err) => `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
  });
}

