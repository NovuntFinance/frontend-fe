/**
 * Analytics Integration
 * Unified analytics wrapper supporting multiple providers
 */

// Analytics Events
export type AnalyticsEvent =
  | 'page_view'
  | 'user_signup'
  | 'user_login'
  | 'deposit_initiated'
  | 'deposit_completed'
  | 'withdrawal_initiated'
  | 'withdrawal_completed'
  | 'stake_created'
  | 'referral_shared'
  | 'profile_updated'
  | 'kyc_submitted'
  | 'error_occurred'
  | 'user_identified'
  | 'user_logout';

export interface AnalyticsEventData {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Vercel Analytics (recommended for Next.js)
 */
class VercelAnalytics {
  track(event: string, data?: AnalyticsEventData) {
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', event, data);
    }
  }
}

/**
 * Google Analytics 4
 */
class GoogleAnalytics {
  private gtag: any;

  constructor() {
    if (typeof window !== 'undefined') {
      this.gtag = (window as any).gtag;
    }
  }

  track(event: string, data?: AnalyticsEventData) {
    if (this.gtag) {
      this.gtag('event', event, data);
    }
  }

  pageView(url: string) {
    if (this.gtag) {
      this.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: url,
      });
    }
  }
}

/**
 * Plausible Analytics (privacy-focused)
 */
class PlausibleAnalytics {
  track(event: string, data?: AnalyticsEventData) {
    if (typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible(event, { props: data });
    }
  }
}

/**
 * Analytics Manager
 * Unified interface for all analytics providers
 */
class AnalyticsManager {
  private providers: Array<
    VercelAnalytics | GoogleAnalytics | PlausibleAnalytics
  > = [];
  private enabled: boolean = false;

  constructor() {
    // Only enable in production
    this.enabled = process.env.NODE_ENV === 'production';

    // Initialize providers based on environment variables
    if (process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === 'true') {
      this.providers.push(new VercelAnalytics());
    }

    if (process.env.NEXT_PUBLIC_GA_ID) {
      this.providers.push(new GoogleAnalytics());
    }

    if (process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) {
      this.providers.push(new PlausibleAnalytics());
    }
  }

  /**
   * Track custom event
   */
  track(event: AnalyticsEvent, data?: AnalyticsEventData) {
    if (!this.enabled) {
      console.log('[Analytics]', event, data);
      return;
    }

    this.providers.forEach((provider) => {
      try {
        provider.track(event, data);
      } catch (error) {
        console.error('[Analytics] Error tracking event:', error);
      }
    });
  }

  /**
   * Track page view
   */
  pageView(url: string) {
    if (!this.enabled) {
      console.log('[Analytics] Page view:', url);
      return;
    }

    this.providers.forEach((provider) => {
      try {
        if (provider instanceof GoogleAnalytics) {
          provider.pageView(url);
        } else {
          provider.track('page_view', { url });
        }
      } catch (error) {
        console.error('[Analytics] Error tracking page view:', error);
      }
    });
  }

  /**
   * Track user identification
   */
  identify(userId: string, traits?: Record<string, any>) {
    if (!this.enabled) {
      console.log('[Analytics] Identify:', userId, traits);
      return;
    }

    this.track('user_identified', {
      userId,
      ...traits,
    });
  }
}

// Singleton instance
export const analytics = new AnalyticsManager();

/**
 * React hook for analytics
 */
export function useAnalytics() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useEffect } = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { usePathname } = require('next/navigation');

  const pathname = usePathname();

  // Track page views
  useEffect(() => {
    if (pathname) {
      analytics.pageView(pathname);
    }
  }, [pathname]);

  return {
    track: analytics.track.bind(analytics),
    identify: analytics.identify.bind(analytics),
    pageView: analytics.pageView.bind(analytics),
  };
}

/**
 * Convenience functions for common events
 */
export const AnalyticsEvents = {
  // Authentication
  signup: (method: string) => analytics.track('user_signup', { method }),

  login: (method: string) => analytics.track('user_login', { method }),

  logout: () => analytics.track('user_logout', {}),

  // Wallet operations
  depositInitiated: (amount: number, currency: string) =>
    analytics.track('deposit_initiated', { amount, currency }),

  depositCompleted: (amount: number, currency: string, transactionId: string) =>
    analytics.track('deposit_completed', { amount, currency, transactionId }),

  withdrawalInitiated: (amount: number, currency: string) =>
    analytics.track('withdrawal_initiated', { amount, currency }),

  withdrawalCompleted: (
    amount: number,
    currency: string,
    transactionId: string
  ) =>
    analytics.track('withdrawal_completed', {
      amount,
      currency,
      transactionId,
    }),

  // Staking
  stakeCreated: (amount: number, source: string) =>
    analytics.track('stake_created', { amount, source }),

  // Referrals
  referralShared: (method: string) =>
    analytics.track('referral_shared', { method }),

  // Profile
  profileUpdated: (fields: string[]) =>
    analytics.track('profile_updated', { fields: fields.join(',') }),

  kycSubmitted: (documentType: string) =>
    analytics.track('kyc_submitted', { documentType }),

  // Errors
  errorOccurred: (errorType: string, errorMessage: string) =>
    analytics.track('error_occurred', { errorType, errorMessage }),
};

/**
 * Example usage in components:
 *
 * import { AnalyticsEvents } from '@/lib/analytics';
 *
 * const handleDeposit = () => {
 *   AnalyticsEvents.depositInitiated(amount, 'USD');
 *   // ... deposit logic
 * };
 */
