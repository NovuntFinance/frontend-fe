import axios from 'axios';
import { adminAuthService } from './adminAuthService';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface Generate2FASecretResponse {
  success?: boolean;
  message?: string;
  data?: {
    setupDetails?: {
      qrCode: string; // Base64 encoded QR code image
      secret: string;
    };
    verificationToken?: string;
  };
  setupMethods?: {
    qrCode?: {
      qrImageUrl: string;
    };
  };
  secret?: string;
  verificationToken?: string;
}

export interface Enable2FAResponse {
  success?: boolean;
  message: string;
  data?: {
    backupCodes?: string[];
    user?: {
      _id: string;
      email: string;
      username?: string;
      role: 'admin' | 'superAdmin';
      twoFAEnabled: boolean;
      fname?: string;
      lname?: string;
      isActive?: boolean;
      emailVerified?: boolean;
    };
  };
}

export interface Verify2FAResponse {
  success: boolean;
  message: string;
}

class TwoFAService {
  /**
   * Step 1: Generate 2FA Secret
   * POST /api/v1/better-auth/mfa/setup
   */
  async generateSecret(): Promise<Generate2FASecretResponse> {
    const token = adminAuthService.getToken();
    if (!token) throw new Error('Not authenticated');

    // Backend extracts user from auth token, so send empty body
    const response = await axios.post<Generate2FASecretResponse>(
      `${API_BASE_URL}/better-auth/mfa/setup`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );

    return response.data;
  }

  /**
   * Step 2: Enable 2FA
   * POST /api/v1/better-auth/mfa/verify
   */
  async enable2FA(
    verificationToken: string,
    verificationCode: string
  ): Promise<Enable2FAResponse> {
    const token = adminAuthService.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await axios.post<Enable2FAResponse>(
      `${API_BASE_URL}/better-auth/mfa/verify`,
      {
        verificationToken,
        verificationCode, // 6-digit code from authenticator app
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );

    // Extract user object from response (backend now includes updated user)
    const responseData = response.data as any;
    if (responseData.success !== false && responseData.data?.user) {
      const updatedUser = responseData.data.user;

      // Update admin user state with the complete user object from backend
      adminAuthService.updateUser({
        _id: updatedUser._id,
        email: updatedUser.email,
        username:
          updatedUser.username || updatedUser.email?.split('@')[0] || '',
        role: updatedUser.role as 'admin' | 'superAdmin',
        twoFAEnabled: updatedUser.twoFAEnabled,
        fname: updatedUser.fname,
        lname: updatedUser.lname,
        isActive: updatedUser.isActive !== false,
        emailVerified: updatedUser.emailVerified !== false,
      });
    }

    return response.data;
  }

  /**
   * Verify 2FA Code (for testing)
   * POST /api/v1/better-auth/verify-2fa
   */
  async verifyCode(code: string): Promise<Verify2FAResponse> {
    const token = adminAuthService.getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await axios.post<Verify2FAResponse>(
      `${API_BASE_URL}/better-auth/verify-2fa`,
      { code },
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );

    return response.data;
  }
}

export const twoFAService = new TwoFAService();
export default twoFAService;
