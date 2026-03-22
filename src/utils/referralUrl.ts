/**
 * Utilities for referral URL handling (register → signup redirect, signup auto-fill)
 * Supports ref, referralCode, and referral query params
 */

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

/**
 * Extract referral code from search params (supports ref, referralCode, referral)
 */
export function getReferralCodeFromParams(
  params: SearchParamsRecord
): string | null {
  const ref = params?.ref ?? params?.referralCode ?? params?.referral;
  const refStr = Array.isArray(ref) ? ref[0] : ref;
  const trimmed = typeof refStr === 'string' ? refStr.trim() : '';
  return trimmed || null;
}

/**
 * Build signup redirect URL preserving referral param
 * Used by /register when redirecting to /signup
 */
export function buildSignupRedirectUrl(params: SearchParamsRecord): string {
  const code = getReferralCodeFromParams(params);
  return code ? `/signup?ref=${encodeURIComponent(code)}` : '/signup';
}
