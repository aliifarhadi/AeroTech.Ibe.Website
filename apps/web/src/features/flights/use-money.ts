'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Currency } from '@aerotech/domain';
import { toBcp47 } from '@aerotech/ui';

/**
 * Prices in the currency of the market: Toman in Iran, euro elsewhere in this mocked build.
 * Amounts are whole units of the currency.
 */
export function useMoney() {
  const t = useTranslations('currency');
  const appLocale = useLocale();
  const locale = toBcp47(appLocale);
  const currency: Currency = appLocale.endsWith('-ir') ? 'IRT' : 'EUR';
  const euro = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });
  const plain = new Intl.NumberFormat(locale);
  const compact = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 });

  return {
    currency,
    format: (amount: number) =>
      currency === 'EUR' ? euro.format(amount) : t('IRT', { amount: plain.format(amount) }),
    /** For tight spaces such as the date ribbon: "2.4M" rather than "2,400,000 Toman". */
    short: (amount: number) => (currency === 'EUR' ? euro.format(amount) : compact.format(amount)),
  };
}
