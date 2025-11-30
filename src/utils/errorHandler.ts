import { AxiosError } from 'axios';
import { toast } from 'sonner';

export interface ApiError {
  success: false;
  message: string;
  error: {
    code: string;
    message: string;
    details?: any;
    action?: string;
    helpUrl?: string;
  };
}

export function handleApiError(error: unknown): void {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError<ApiError>;
    const errorData = axiosError.response?.data;

    if (errorData?.error) {
      const { code, message } = errorData.error;

      // Handle specific error codes
      switch (code) {
        case '2FA_MANDATORY':
        case '2FA_SETUP_INCOMPLETE':
          toast.error('2FA is required. Please set it up first.', {
            action: {
              label: 'Setup 2FA',
              onClick: () => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/admin/setup-2fa';
                }
              },
            },
          });
          break;

        case '2FA_CODE_REQUIRED':
          toast.error('2FA code is required for this operation');
          break;

        case '2FA_CODE_INVALID':
          toast.error('Invalid 2FA code. Please try again.');
          break;

        case 'AUTH_REQUIRED':
          toast.error('Please login to continue');
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
          }
          break;

        case 'ADMIN_REQUIRED':
          toast.error('Admin access required');
          break;

        case 'INSUFFICIENT_PERMISSIONS':
          toast.error("You don't have permission to perform this action");
          break;

        default:
          toast.error(message || 'An error occurred');
      }
    } else {
      toast.error('An unexpected error occurred');
    }
  } else if (error instanceof Error) {
    toast.error(
      error.message || 'Network error. Please check your connection.'
    );
  } else {
    toast.error('An unknown error occurred');
  }
}
