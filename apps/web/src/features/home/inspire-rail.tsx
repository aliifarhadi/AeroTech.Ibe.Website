'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { NETWORK_ROUTES } from '@aerotech/domain';
import { Icon, IconButton } from '@aerotech/ui';
import { useFormatters } from '../shared/use-duration';
import { DestinationArt } from './destination-art.art';
import { useHome } from './home-context';

/** "Where to this week?": a rail of destination tiles under the booking card. No prices. */
export function InspireRail() {
  const t = useTranslations();
  const { duration } = useFormatters();
  const { chooseDestination } = useHome();
  const rail = useRef<HTMLDivElement>(null);

  const scroll = (pages: number) => {
    const el = rail.current;
    if (!el) return;
    const forward = getComputedStyle(el).direction === 'rtl' ? -1 : 1;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({
      left: forward * pages * Math.max(240, el.clientWidth * 0.7),
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  return (
    <section aria-labelledby="inspire-title" className="relative pb-10 md:pb-14">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h2 id="inspire-title" className="text-title font-bold text-strong text-shadow-scene">
          {t('inspire.title')}
        </h2>
        <div className="flex gap-2">
          <IconButton
            aria-label={t('inspire.previous')}
            onPress={() => scroll(-1)}
            className="bg-canvas/60"
          >
            <Icon name="chevron-back" size={18} />
          </IconButton>
          <IconButton
            aria-label={t('inspire.next')}
            onPress={() => scroll(1)}
            className="bg-canvas/60"
          >
            <Icon name="chevron-forward" size={18} />
          </IconButton>
        </div>
      </div>
      <div
        ref={rail}
        role="group"
        aria-label={t('inspire.aria')}
        className="home-rail -mx-gutter flex snap-x snap-proximity gap-3 overflow-x-auto px-gutter pt-2 pb-2.5"
      >
        {NETWORK_ROUTES.map((route, index) => (
          <button
            key={route.code}
            type="button"
            onClick={() => chooseDestination(route.code)}
            style={{ animationDelay: `${index * 70 + 350}ms` }}
            className="group relative flex w-3/5 shrink-0 animate-fade-up cursor-pointer snap-start flex-col overflow-hidden rounded-card border border-hairline bg-surface-2 text-start transition duration-(--duration-slow) ease-out-soft hover:-translate-y-1.5 hover:border-action-line hover:shadow-overlay sm:w-52 lg:w-56"
          >
            <span className="relative block aspect-16/10 overflow-hidden">
              <DestinationArt
                code={route.code}
                className="block size-full transition-transform duration-900 ease-out-soft group-hover:scale-107"
              />
              <span
                dir="ltr"
                className="absolute start-3.5 bottom-2 text-subheading leading-none font-bold tracking-wide text-strong"
              >
                {route.code}
              </span>
            </span>
            <span className="flex flex-col px-3.5 pt-2.5 pb-3.5">
              <span className="text-field font-bold text-default">
                {t(`cities.${route.code}.name`)}
              </span>
              <span className="text-small text-muted">
                {route.international ? `${t('inspire.international')} · ` : ''}
                {t('inspire.nonstop')} · {duration(route.minutes)}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="absolute end-3 top-3 hidden size-9 scale-0 items-center justify-center rounded-chip bg-action text-on-action transition-transform duration-(--duration-base) ease-pop group-hover:scale-100 group-focus-visible:scale-100 pointer-fine:flex"
            >
              <Icon name="arrow" size={16} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
