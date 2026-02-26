/**
 * Email & verification timing – aligned with backend docs/FRONTEND_EMAIL_TIMING_REFERENCE.md
 * Use these when the API does not return expiresIn or waitSeconds.
 * When the API returns values, prefer them over these constants.
 */

// Action OTP (transfer, withdrawal, change password, wallet address)
export const ACTION_OTP_EXPIRY_SECONDS = 600; // 10 minutes
export const ACTION_OTP_RESEND_COOLDOWN_SECONDS = 60; // 1 minute

// Registration (sign up email code)
export const REGISTRATION_CODE_EXPIRY_SECONDS = 300; // 5 minutes

// Password reset (link/code)
export const PASSWORD_RESET_EXPIRY_SECONDS = 900; // 15 minutes
export const PASSWORD_RESET_RESEND_COOLDOWN_SECONDS = 60; // 1 minute (use waitSeconds when provided)

// Verify email (post-registration)
export const VERIFY_EMAIL_CODE_EXPIRY_SECONDS = 3600; // 1 hour
