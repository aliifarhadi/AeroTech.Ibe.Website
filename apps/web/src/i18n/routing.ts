import { defineRouting } from 'next-intl/routing';
import { DEFAULT_LOCALE, LOCALES } from '@aerotech/domain';

/**
 * Locale routing for the app. Locales are `{language}-{market}` (e.g. en-de, fa-ir),
 * because market — not just language — drives pricing, legal terms, and payment methods.
 * Reading direction (LTR/RTL) is derived from the locale in `@aerotech/domain`.
 */
export const routing = defineRouting({
  locales: [...LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
});
