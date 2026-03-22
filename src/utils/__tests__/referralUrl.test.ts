/**
 * Referral URL utilities - tests for /register redirect and signup param parsing
 */

import {
  getReferralCodeFromParams,
  buildSignupRedirectUrl,
} from '../referralUrl';

describe('referralUrl utils', () => {
  describe('getReferralCodeFromParams', () => {
    it('returns ref param when present', () => {
      expect(getReferralCodeFromParams({ ref: 'ABC123' })).toBe('ABC123');
    });

    it('returns referralCode param when present', () => {
      expect(getReferralCodeFromParams({ referralCode: 'XYZ789' })).toBe(
        'XYZ789'
      );
    });

    it('returns referral param when present', () => {
      expect(getReferralCodeFromParams({ referral: 'DEF456' })).toBe('DEF456');
    });

    it('prefers ref over referralCode when both present', () => {
      expect(
        getReferralCodeFromParams({ ref: 'FIRST', referralCode: 'SECOND' })
      ).toBe('FIRST');
    });

    it('trims whitespace', () => {
      expect(getReferralCodeFromParams({ ref: '  CODE  ' })).toBe('CODE');
    });

    it('returns null for empty params', () => {
      expect(getReferralCodeFromParams({})).toBeNull();
    });

    it('returns null for empty ref', () => {
      expect(getReferralCodeFromParams({ ref: '' })).toBeNull();
    });

    it('handles array values (takes first)', () => {
      expect(getReferralCodeFromParams({ ref: ['CODE1', 'CODE2'] })).toBe(
        'CODE1'
      );
    });

    it('returns null for undefined params', () => {
      expect(getReferralCodeFromParams({ ref: undefined })).toBeNull();
    });
  });

  describe('buildSignupRedirectUrl', () => {
    it('appends ref param when present', () => {
      expect(buildSignupRedirectUrl({ ref: 'ABC123' })).toBe(
        '/signup?ref=ABC123'
      );
    });

    it('redirects to /signup only when no referral param', () => {
      expect(buildSignupRedirectUrl({})).toBe('/signup');
    });

    it('preserves referralCode as ref in URL', () => {
      expect(buildSignupRedirectUrl({ referralCode: 'XYZ789' })).toBe(
        '/signup?ref=XYZ789'
      );
    });

    it('preserves referral as ref in URL', () => {
      expect(buildSignupRedirectUrl({ referral: 'DEF456' })).toBe(
        '/signup?ref=DEF456'
      );
    });

    it('encodes special characters in ref', () => {
      expect(buildSignupRedirectUrl({ ref: 'CODE+123' })).toBe(
        '/signup?ref=CODE%2B123'
      );
    });

    it('handles code with spaces (trimmed)', () => {
      expect(buildSignupRedirectUrl({ ref: '  TRIM  ' })).toBe(
        '/signup?ref=TRIM'
      );
    });
  });
});
