'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toBcp47 } from '@aerotech/ui';
import { useReducedMotion } from '../../shared/use-media';

/** Fixed starting heights so server and client render the same thing. */
const INITIAL = [62, 48, 81, 36, 70, 92, 55];
/** Any Monday; used only to name the weekdays in the current locale. */
const A_MONDAY = Date.UTC(2024, 0, 1);

/** Relative fares across a week, with the cheapest day in yellow. Heights only, no amounts. */
export function FareBars() {
  const t = useTranslations('Next.tools');
  const locale = toBcp47(useLocale());
  const reduced = useReducedMotion();
  const [heights, setHeights] = useState(INITIAL);

  const weekdays = useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { weekday: 'narrow', timeZone: 'UTC' });
    // Weeks start on Saturday in Iran and the Arab world, on Monday in Europe.
    const offset = /^(fa|ar)/.test(locale) ? 5 : 0;
    return INITIAL.map((_, i) => format.format(new Date(A_MONDAY + (i + offset) * 864e5)));
  }, [locale]);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(
      () => setHeights(INITIAL.map(() => 30 + Math.random() * 65)),
      3000,
    );
    return () => window.clearInterval(timer);
  }, [reduced]);

  const lowest = heights.indexOf(Math.min(...heights));
  return (
    <div aria-hidden="true">
      <div className="flex items-center justify-between text-caption text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-1.5 animate-beat rounded-chip bg-success" />
          {t('liveUpdates')}
        </span>
        {t('cheapest')}
      </div>
      <div className="mt-4 grid h-36 grid-cols-7 items-end gap-2.5 text-center text-caption text-muted">
        {heights.map((height, i) => (
          <div key={i} className="flex h-full flex-col justify-end gap-2">
            <span
              style={{ height: `${height}%` }}
              className={[
                'block rounded-small transition-all duration-900 ease-out-soft',
                i === lowest ? 'bg-action' : 'bg-hairline',
              ].join(' ')}
            />
            <span className={i === lowest ? 'font-bold text-strong' : ''}>{weekdays[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
