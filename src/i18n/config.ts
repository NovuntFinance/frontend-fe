/**
 * Internationalization (i18n) Configuration
 * Prepares the platform for multi-language support
 */

export const supportedLocales = ['en', 'es', 'fr', 'de', 'pt', 'zh', 'ja'] as const;
export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  zh: '中文',
  ja: '日本語',
};

export const localeConfig = {
  defaultLocale,
  supportedLocales,
  localeNames,
  // RTL languages (if needed in future)
  rtlLocales: [] as Locale[],
};

/**
 * Get user's preferred locale from browser
 */
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;

  const browserLang = navigator.language.split('-')[0];
  return supportedLocales.includes(browserLang as Locale)
    ? (browserLang as Locale)
    : defaultLocale;
}

/**
 * Format currency based on locale
 */
export function formatCurrency(
  amount: number,
  locale: Locale = defaultLocale,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date based on locale
 */
export function formatDate(
  date: Date | string,
  locale: Locale = defaultLocale,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Format number based on locale
 */
export function formatNumber(
  number: number,
  locale: Locale = defaultLocale,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : locale, options).format(number);
}

