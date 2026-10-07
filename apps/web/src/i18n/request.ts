import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { getLanguage } from '@aerotech/domain';
import { routing } from './routing';

/**
 * Per-request i18n config. Messages are stored by language (en, de, fa, ar) and shared
 * across markets of the same language, so en-de and en-us both load `en.json`.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const language = getLanguage(locale);

  return {
    locale,
    messages: (await import(`../../messages/${language}.json`)).default,
  };
});
