'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Icon, toBcp47 } from '@aerotech/ui';
import { useAccount } from '../account/account-context';
import { useHome } from './home-context';
import { greetingForHour, tehranClock, tehranHour } from './scene-mood';

/** "Good evening. Where shall we go?" and the chip that shows, and changes, the sky. */
export function Greeting() {
  const t = useTranslations('hero');
  const locale = toBcp47(useLocale());
  const { mood, moodPinned, cycleMood } = useHome();
  const { user } = useAccount();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const ready = now !== null && mood !== null;
  return (
    <div className="flex min-h-10 w-full items-center justify-between gap-3">
      <p className="flex min-w-0 items-center gap-2 text-small font-bold text-on-scene text-shadow-scene md:text-body">
        {ready ? (
          <>
            <span className="size-2 shrink-0 rounded-chip bg-action" />
            <span className="truncate">
              {t(user ? 'greetingNamed' : 'greetingLine', {
                greeting: t(`greeting.${greetingForHour(tehranHour(now))}`),
                name: user?.first ?? '',
              })}
            </span>
          </>
        ) : null}
      </p>
      {ready ? (
        <button
          type="button"
          onClick={cycleMood}
          aria-label={t('moodAria', { mood: t(`mood.${mood}`) })}
          className="group inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-chip border border-strong-line bg-canvas/60 ps-2.5 pe-3 text-small text-on-scene backdrop-blur-md transition-colors duration-(--duration-fast) hover:border-action hover:bg-canvas/80 md:min-h-8"
        >
          <Icon
            name="sun"
            size={16}
            className="text-action transition-transform duration-(--duration-slow) ease-out-soft group-hover:rotate-60"
          />
          <span>{t(`mood.${mood}`)}</span>
          {moodPinned ? null : (
            <span className="hidden md:inline">
              · {t('tehranTime', { time: tehranClock(locale, now) })}
            </span>
          )}
        </button>
      ) : null}
    </div>
  );
}
