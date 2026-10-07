'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { LOCALES } from '@aerotech/domain';
import { GlobeIcon } from '@/components/icons';
import { usePathname, useRouter } from '@/i18n/navigation';

const MARKET_FLAGS: Record<string, string> = { DE: '🇩🇪', IR: '🇮🇷', AE: '🇦🇪' };
const MARKET_NAMES: Record<string, string> = { DE: 'Germany', IR: 'Iran', AE: 'UAE' };
const LANG_NAMES: Record<string, string> = {
  en: 'English',
  de: 'Deutsch',
  fa: 'فارسی',
  ar: 'العربية',
};

function presentation(value: string) {
  const [language = 'en', market = ''] = value.split('-');
  const marketKey = market.toUpperCase();
  return {
    flag: MARKET_FLAGS[marketKey] ?? '🌐',
    lang: LANG_NAMES[language] ?? language.toUpperCase(),
    market: MARKET_NAMES[marketKey] ?? marketKey,
  };
}

/**
 * Language / market switcher — globe pill showing the current market and language
 * (e.g. "Germany · English"). Selecting an RTL locale flips the document to dir="rtl".
 */
export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const current = presentation(locale);

  return (
    <label className="relative inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-neutral-300 bg-white px-3.5 text-xs font-semibold text-neutral-800 shadow-sm transition-colors hover:border-neutral-400 hover:bg-neutral-50">
      <GlobeIcon className="size-4 shrink-0 text-neutral-600" />
      <span className="whitespace-nowrap">
        {current.market} · {current.lang}
      </span>
      <span className="sr-only">{t('label')}</span>
      <select
        aria-label={t('label')}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-wait"
        value={locale}
        disabled={isPending}
        onChange={(event) => {
          const next = event.target.value;
          startTransition(() => {
            router.replace(pathname, { locale: next });
          });
        }}
      >
        {LOCALES.map((value) => {
          const option = presentation(value);
          return (
            <option key={value} value={value} className="text-black">
              {option.flag} {option.market} · {option.lang}
            </option>
          );
        })}
      </select>
      <svg
        viewBox="0 0 16 16"
        className="pointer-events-none size-3 shrink-0 text-neutral-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}
