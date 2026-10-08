'use client';

import { useLocale, useTranslations } from 'next-intl';
import { splitDuration } from '@aerotech/domain';
import { toBcp47 } from '@aerotech/ui';

/** Number and duration formatting in the digits and words of the current locale. */
export function useFormatters() {
  const t = useTranslations('Next.duration');
  const locale = toBcp47(useLocale());
  const number = new Intl.NumberFormat(locale, { useGrouping: false });
  const grouped = new Intl.NumberFormat(locale);

  return {
    locale,
    number: (value: number) => number.format(value),
    grouped: (value: number) => grouped.format(value),
    /** "1 h 25 min" */
    duration(totalMinutes: number) {
      const { hours, minutes } = splitDuration(totalMinutes);
      const values = { hours: number.format(hours), minutes: number.format(minutes) };
      if (!hours) return t('m', values);
      return minutes ? t('hm', values) : t('h', values);
    },
    /** "1:25 h" */
    durationClock(totalMinutes: number) {
      const { hours, minutes } = splitDuration(totalMinutes);
      const padded = new Intl.NumberFormat(locale, { minimumIntegerDigits: 2 }).format(minutes);
      return t('clock', { time: `${number.format(hours)}:${padded}` });
    },
  };
}
