/**
 * Web Vitals Monitoring
 * Track and report Core Web Vitals
 */

import type { Metric } from 'web-vitals';
import { logger } from './logger';

/**
 * Report web vitals
 * In production, you would send these to an analytics service
 */
export function reportWebVitals(metric: Metric) {
  const { name, value, rating, delta, id } = metric;

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`Web Vital: ${name}`, {
      value,
      rating,
      delta,
      id,
    });
  }

  // In production, send to analytics
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        event_label: id,
        non_interaction: true,
      });
    }

    // Example: Send to custom analytics endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          value,
          rating,
          delta,
          id,
          page: window.location.pathname,
          timestamp: Date.now(),
        }),
      }).catch((error) => {
        logger.error('Failed to send web vitals', error);
      });
    }
  }

  // Track poor metrics
  if (rating === 'poor') {
    logger.warn(`Poor ${name} detected`, {
      value,
      threshold: getThreshold(name),
    });
  }
}

/**
 * Get threshold for each metric
 */
function getThreshold(metricName: string): number {
  const thresholds: Record<string, number> = {
    CLS: 0.1,
    FID: 100,
    FCP: 1800,
    INP: 200,
    LCP: 2500,
    TTFB: 800,
  };
  return thresholds[metricName] || 0;
}

/**
 * Initialize web vitals tracking
 */
export async function initWebVitals() {
  if (typeof window === 'undefined') return;

  try {
    const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');

    onCLS(reportWebVitals);
    onINP(reportWebVitals);
    onFCP(reportWebVitals);
    onLCP(reportWebVitals);
    onTTFB(reportWebVitals);

    logger.info('Web Vitals monitoring initialized');
  } catch (error) {
    logger.error('Failed to initialize Web Vitals', error);
  }
}

export default reportWebVitals;
