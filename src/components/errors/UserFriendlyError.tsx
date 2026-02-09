/**
 * User-Friendly Error Components
 * Provides consistent, helpful error messages with recovery actions
 */

'use client';

import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ErrorInfo {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Get user-friendly error message from error object
 */
export function getUserFriendlyError(error: unknown): ErrorInfo {
  // Network errors
  if (error instanceof Error) {
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return {
        title: 'Connection Problem',
        description:
          'Unable to connect to the server. Please check your internet connection and try again.',
        action: {
          label: 'Try Again',
          onClick: () => window.location.reload(),
        },
        secondaryAction: {
          label: 'Go Home',
          onClick: () => (window.location.href = '/dashboard'),
        },
      };
    }

    if (error.message.includes('timeout')) {
      return {
        title: 'Request Timed Out',
        description:
          'Backend request timed out. Please check your internet connection.',
        action: {
          label: 'Retry',
          onClick: () => window.location.reload(),
        },
      };
    }
  }

  // API errors (Axios)
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as {
      response?: { status?: number; data?: { error?: { message?: string } } };
    };
    const status = axiosError.response?.status;
    const message = axiosError.response?.data?.error?.message;

    switch (status) {
      case 400:
        return {
          title: 'Invalid Request',
          description: message || 'Please check your input and try again.',
        };
      case 401:
        return {
          title: 'Authentication Required',
          description: 'Your session has expired. Please log in again.',
          action: {
            label: 'Go to Login',
            onClick: () => (window.location.href = '/login'),
          },
        };
      case 403:
        return {
          title: 'Access Denied',
          description: "You don't have permission to perform this action.",
          secondaryAction: {
            label: 'Go Back',
            onClick: () => window.history.back(),
          },
        };
      case 404:
        return {
          title: 'Not Found',
          description: 'The requested resource could not be found.',
          action: {
            label: 'Go Home',
            onClick: () => (window.location.href = '/dashboard'),
          },
        };
      case 429:
        return {
          title: 'Too Many Requests',
          description:
            "You've made too many requests. Please wait a moment and try again.",
          action: {
            label: 'Retry',
            onClick: () => window.location.reload(),
          },
        };
      case 500:
      case 502:
      case 503:
        return {
          title: 'Server Error',
          description:
            "Something went wrong on our end. We're working to fix it. Please try again later.",
          action: {
            label: 'Try Again',
            onClick: () => window.location.reload(),
          },
        };
      default:
        return {
          title: 'Something Went Wrong',
          description:
            message || 'An unexpected error occurred. Please try again.',
          action: {
            label: 'Try Again',
            onClick: () => window.location.reload(),
          },
        };
    }
  }

  // Default error
  return {
    title: 'Unexpected Error',
    description:
      'Something went wrong. Please try again or contact support if the problem persists.',
    action: {
      label: 'Try Again',
      onClick: () => window.location.reload(),
    },
    secondaryAction: {
      label: 'Go Home',
      onClick: () => (window.location.href = '/dashboard'),
    },
  };
}

interface UserFriendlyErrorProps {
  error: unknown;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
  variant?: 'card' | 'inline' | 'minimal';
}

/**
 * User-Friendly Error Component
 * Displays errors in a helpful, actionable way
 */
export function UserFriendlyError({
  error,
  onRetry,
  onGoHome,
  className,
  variant = 'card',
}: UserFriendlyErrorProps) {
  const router = useRouter();
  const errorInfo = getUserFriendlyError(error);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      router.push('/dashboard');
    }
  };

  if (variant === 'minimal') {
    return (
      <div
        className={cn(
          'text-destructive flex items-center gap-2 text-sm',
          className
        )}
        role="alert"
      >
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{errorInfo.description}</span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'border-destructive/50 bg-destructive/10 rounded-lg border p-4',
          className
        )}
        role="alert"
      >
        <div className="flex items-start gap-3">
          <AlertCircle
            className="text-destructive h-5 w-5 shrink-0"
            aria-hidden="true"
          />
          <div className="flex-1">
            <h3 className="text-destructive font-semibold">
              {errorInfo.title}
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {errorInfo.description}
            </p>
            {(errorInfo.action || onRetry) && (
              <div className="mt-3 flex gap-2">
                {onRetry && (
                  <Button size="sm" variant="outline" onClick={handleRetry}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className={cn('border-destructive/50', className)} role="alert">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-destructive/10 flex h-10 w-10 items-center justify-center rounded-full">
            <AlertCircle
              className="text-destructive h-5 w-5"
              aria-hidden="true"
            />
          </div>
          <div>
            <CardTitle className="text-destructive">
              {errorInfo.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {errorInfo.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      {(errorInfo.action ||
        errorInfo.secondaryAction ||
        onRetry ||
        onGoHome) && (
        <CardFooter className="flex gap-2">
          {(errorInfo.action || onRetry) && (
            <Button onClick={handleRetry} variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              {errorInfo.action?.label || 'Try Again'}
            </Button>
          )}
          {(errorInfo.secondaryAction || onGoHome) && (
            <Button onClick={handleGoHome} variant="outline">
              <Home className="mr-2 h-4 w-4" />
              {errorInfo.secondaryAction?.label || 'Go Home'}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * Error Boundary Fallback Component
 */
export function ErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <UserFriendlyError
        error={error}
        onRetry={resetError}
        variant="card"
        className="max-w-md"
      />
    </div>
  );
}

/**
 * Offline Error Component
 */
export function OfflineError({ onRetry }: { onRetry?: () => void }) {
  return (
    <UserFriendlyError
      error={new Error('Network')}
      onRetry={onRetry}
      variant="card"
    />
  );
}
