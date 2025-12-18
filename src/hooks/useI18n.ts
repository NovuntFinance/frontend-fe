/**
 * Internationalization Hook
 * Provides translation and locale utilities
 * 
 * Note: This is a foundation for i18n. Full implementation would use
 * next-intl or similar library. This provides the structure.
 */

import { useState, useEffect } from 'react';
import { defaultLocale, type Locale, getBrowserLocale } from '@/i18n/config';
import { messages as enMessages } from '@/i18n/messages/en';
import type { Messages } from '@/i18n/messages/en';

// For now, only English is implemented
// Other languages would be imported here
const translations: Record<Locale, Messages> = {
  en: enMessages,
  // Placeholder for future languages
  es: enMessages,
  fr: enMessages,
  de: enMessages,
  pt: enMessages,
  zh: enMessages,
  ja: enMessages,
};

/**
 * Hook to get translations and locale utilities
 */
export function useI18n() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    // Get locale from localStorage or browser
    const storedLocale = localStorage.getItem('novunt-locale') as Locale | null;
    if (storedLocale && translations[storedLocale]) {
      setLocale(storedLocale);
    } else {
      const browserLocale = getBrowserLocale();
      setLocale(browserLocale);
    }
  }, []);

  const t = (key: string, params?: Record<string, string | number>) => {
    const keys = key.split('.');
    let value: any = translations[locale];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    // Replace parameters
    if (params && typeof value === 'string') {
      return Object.entries(params).reduce(
        (str, [param, val]) => str.replace(`{${param}}`, String(val)),
        value
      );
    }

    return value || key;
  };

  const changeLocale = (newLocale: Locale) => {
    if (translations[newLocale]) {
      setLocale(newLocale);
      localStorage.setItem('novunt-locale', newLocale);
    }
  };

  return {
    locale,
    t,
    changeLocale,
    formatCurrency: (amount: number, currency = 'USD') => {
      // Import from config
      const { formatCurrency } = require('@/i18n/config');
      return formatCurrency(amount, locale, currency);
    },
    formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
      const { formatDate } = require('@/i18n/config');
      return formatDate(date, locale, options);
    },
    formatNumber: (number: number, options?: Intl.NumberFormatOptions) => {
      const { formatNumber } = require('@/i18n/config');
      return formatNumber(number, locale, options);
    },
  };
}

