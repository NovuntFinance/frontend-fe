import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { getErrorMessageForUI } from '@/lib/error-utils';

export interface ApiError {
  success: false;
  message: string;
  error: {
    code: string;
    message: string;
    details?: unknown;
    action?: string;
    helpUrl?: string;
  };
}

/** User-facing error messages for known codes; never expose raw backend messages. */
const SAFE_MESSAGES: Record<string, string> = {
  '2FA_MANDATORY': '2FA is required. Please set it up first.',
  '2FA_SETUP_INCOMPLETE': '2FA is required. Please set it up first.',
  '2FA_CODE_REQUIRED': '2FA code is required for this operation.',
  '2FA_CODE_INVALID': 'Invalid 2FA code. Please try again.',
  AUTH_REQUIRED: 'Please log in to continue.',
  ADMIN_REQUIRED: 'Admin access required.',
  INSUFFICIENT_PERMISSIONS: "You don't have permission to perform this action.",
};

export function handleApiError(error: unknown): void {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError<ApiError>;
    const errorData = axiosError.response?.data;

    if (errorData?.error) {
      const { code, message } = errorData.error;
      const safeMessage = SAFE_MESSAGES[code] ?? getErrorMessageForUI(message);

      switch (code) {
        case '2FA_MANDATORY':
        case '2FA_SETUP_INCOMPLETE':
          toast.error(safeMessage, {
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

        case 'AUTH_REQUIRED':
          toast.error(safeMessage);
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
          }
          break;

        default:
          toast.error(safeMessage);
      }
    } else {
      toast.error(getErrorMessageForUI(error));
    }
  } else {
    toast.error(getErrorMessageForUI(error));
  }
}
