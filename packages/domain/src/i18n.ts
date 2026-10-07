/**
 * Internationalization and bidirectional (LTR/RTL) primitives.
 *
 * Direction is a property of the locale's language subtag, not the market. The
 * resolved direction drives the `dir` attribute on the document root and the use
 * of CSS logical properties throughout the UI. See `07_pwa_performance_seo_a11y.md`.
 */

export type Direction = 'ltr' | 'rtl';

/** Language subtags that are written right-to-left. Extend as markets are added. */
export const RTL_LANGUAGES = new Set(['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'dv', 'yi']);

/**
 * Supported app locales in `{language}-{market}` form (lowercase in URLs).
 * Market affects pricing, legal terms, payment methods, and taxes, so locale is
 * never treated as the only context. Includes at least one RTL locale from day one.
 */
export const LOCALES = ['en-de', 'de-de', 'fa-ir', 'ar-ae'] as const;
export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'en-de';

export function isAppLocale(value: string): value is AppLocale {
  return (LOCALES as readonly string[]).includes(value);
}

/** The language subtag of a locale, e.g. `fa-ir` -> `fa`. */
export function getLanguage(locale: string): string {
  return locale.split('-')[0]?.toLowerCase() ?? locale.toLowerCase();
}

/** The market/region subtag of a locale, e.g. `fa-ir` -> `IR`. */
export function getMarket(locale: string): string {
  return (locale.split('-')[1] ?? '').toUpperCase();
}

/** Resolve the reading direction for a locale. Defaults to LTR for unknown languages. */
export function getDirection(locale: string): Direction {
  return RTL_LANGUAGES.has(getLanguage(locale)) ? 'rtl' : 'ltr';
}

export type SalesChannel = 'WEB' | 'PWA';

export type MarketContext = {
  market: string; // e.g. DE
  locale: string; // e.g. en-DE
  currency: string; // e.g. EUR
  direction: Direction; // derived from locale; drives the document dir
  salesChannel: SalesChannel;
  timezone?: string;
};

/** Default currency per market for the V1 mocked build. Replace with real config later. */
const MARKET_CURRENCY: Record<string, string> = {
  DE: 'EUR',
  IR: 'IRR',
  AE: 'AED',
};

export function resolveMarketContext(
  locale: string,
  salesChannel: SalesChannel = 'WEB',
): MarketContext {
  const market = getMarket(locale) || 'DE';
  return {
    market,
    locale,
    currency: MARKET_CURRENCY[market] ?? 'EUR',
    direction: getDirection(locale),
    salesChannel,
  };
}
