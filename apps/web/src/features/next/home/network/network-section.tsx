'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { NETWORK_ROUTES, ticketedAirportCode } from '@aerotech/domain';
import { Button, Icon } from '@aerotech/ui';
import { Reveal } from '../../shared/reveal';
import { useFormatters } from '../../shared/use-duration';
import { useReducedMotion } from '../../shared/use-media';
import { useHome } from '../home-context';
import { NetworkMap } from './network-map';

/** How long each route stays on stage while the section plays by itself. */
const CYCLE_MS = 4200;

/** Counts towards `target`, easing out. Jumps straight there when motion is reduced. */
function useCountTo(target: number, reduced: boolean): number {
  const [shown, setShown] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (reduced) {
      from.current = target;
      setShown(target);
      return;
    }
    const start = from.current;
    const began = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - began) / 700);
      const value = Math.round(start + (target - start) * (1 - Math.pow(1 - k, 3)));
      from.current = value;
      setShown(value);
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, reduced]);
  return shown;
}

/** Turns the needle the short way round, so it never spins through 300 degrees to move 60. */
function useNeedle(bearing: number): number {
  const rotation = useRef(bearing);
  let delta = bearing - (((rotation.current % 360) + 360) % 360);
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  rotation.current += delta;
  return rotation.current;
}

export function NetworkSection() {
  const t = useTranslations('Next');
  const { number, grouped, duration, durationClock } = useFormatters();
  const { activeRoute, routePicked, setActiveRoute, chooseDestination } = useHome();
  const reduced = useReducedMotion();
  const [onScreen, setOnScreen] = useState(false);
  const list = useRef<HTMLDivElement>(null);

  const route = NETWORK_ROUTES[activeRoute] ?? NETWORK_ROUTES[0]!;
  const km = useCountTo(route.distanceKm, reduced);
  const needle = useNeedle(route.bearing);
  const playing = onScreen && !routePicked && !reduced;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActiveRoute(activeRoute + 1);
    }, CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [playing, activeRoute, setActiveRoute]);

  // On narrow screens the list is a horizontal rail: keep the active chip in view without
  // scrolling the page (scrollIntoView would).
  useEffect(() => {
    const box = list.current;
    const item = box?.children[activeRoute];
    if (!box || !(item instanceof HTMLElement) || box.scrollWidth <= box.clientWidth) return;
    const a = box.getBoundingClientRect();
    const b = item.getBoundingClientRect();
    box.scrollBy({
      left: b.left + b.width / 2 - (a.left + a.width / 2),
      behavior: reduced ? 'auto' : 'smooth',
    });
  }, [activeRoute, reduced]);

  return (
    <section id="routes" className="relative border-y border-hairline bg-surface-1 py-section">
      <div className="mx-auto max-w-page px-gutter">
        <Reveal>
          <p className="flex items-center gap-2 text-small font-bold text-action">
            <span className="size-2 rounded-chip bg-action" />
            {t('network.kicker')}
          </p>
          <h2 className="mt-2 text-heading font-bold text-balance text-strong">
            {t('network.title')}
          </h2>
          <p className="mt-2 max-w-prose text-muted">{t('network.lead')}</p>
        </Reveal>

        <div className="home-network-grid mt-9 grid items-start gap-4 lg:gap-8">
          <Reveal>
            <div
              ref={list}
              role="group"
              aria-label={t('network.listAria')}
              style={{ '--cycle': `${CYCLE_MS}ms` } as CSSProperties}
              className="home-rail -mx-gutter flex snap-x snap-proximity gap-2 overflow-x-auto px-gutter pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0"
            >
              {NETWORK_ROUTES.map((item, index) => {
                const selected = index === activeRoute;
                return (
                  <button
                    key={item.code}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setActiveRoute(index, true)}
                    className="group relative flex min-h-11 shrink-0 cursor-pointer snap-center items-center gap-2 rounded-chip border border-strong-line px-4 text-start transition-colors duration-(--duration-base) hover:bg-surface-hover aria-pressed:border-default aria-pressed:bg-default lg:min-h-14 lg:w-full lg:gap-3 lg:rounded-control lg:border-transparent lg:py-2 lg:aria-pressed:border-strong-line lg:aria-pressed:bg-surface-3"
                  >
                    <span className="size-2 scale-0 rounded-chip bg-on-action transition-transform duration-(--duration-slow) ease-pop group-aria-pressed:scale-100 lg:bg-action" />
                    <span className="text-body whitespace-nowrap text-muted transition-colors duration-(--duration-base) group-hover:text-default group-aria-pressed:font-bold group-aria-pressed:text-on-action lg:text-title lg:group-aria-pressed:text-strong">
                      {t(`cities.${item.code}.name`)}
                    </span>
                    {item.international ? (
                      <span className="hidden rounded-chip border border-action-line px-2 text-caption text-action lg:inline">
                        {t('network.international')}
                      </span>
                    ) : null}
                    <span className="ms-auto hidden items-center gap-3 text-small whitespace-nowrap text-faint group-aria-pressed:text-muted lg:flex">
                      <span>{durationClock(item.minutes)}</span>
                      <span dir="ltr" className="font-mono text-caption">
                        {item.code}
                      </span>
                    </span>
                    {selected && playing ? (
                      <span
                        key={activeRoute}
                        className="absolute inset-x-4 bottom-1 hidden h-0.5 origin-left animate-progress rounded-chip bg-action lg:block rtl:origin-right"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="relative overflow-hidden rounded-card border border-strong-line bg-canvas lg:sticky lg:top-20">
              <NetworkMap
                label={t('network.mapAria')}
                active={activeRoute}
                onPick={(index) => setActiveRoute(index, true)}
                onVisibilityChange={setOnScreen}
              />
              <div className="pointer-events-none absolute inset-x-4 top-3.5 flex items-center justify-between text-small text-muted">
                <span dir="ltr" className="font-mono text-caption tracking-wide">
                  {ticketedAirportCode('THR', route.code)} → {route.code}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 animate-beat rounded-chip bg-success" />
                  {t('network.nonstop')}
                </span>
              </div>
              <div className="home-instrument grid items-center gap-x-4 gap-y-2 border-t border-hairline bg-surface-1 px-4 py-3.5 md:gap-x-6 md:px-5 md:py-4">
                <svg
                  viewBox="0 0 100 100"
                  fill="none"
                  aria-hidden="true"
                  className="size-16 text-strong"
                >
                  <circle cx="50" cy="50" r="46" stroke="currentColor" strokeOpacity=".2" />
                  <g stroke="currentColor" strokeOpacity=".4">
                    {Array.from({ length: 12 }, (_, i) => (
                      <path
                        key={i}
                        d={i % 3 ? 'M50 8v4' : 'M50 6v7'}
                        transform={`rotate(${i * 30} 50 50)`}
                      />
                    ))}
                  </g>
                  <text
                    x="50"
                    y="23"
                    fontSize="10"
                    textAnchor="middle"
                    className="fill-muted font-mono"
                  >
                    N
                  </text>
                  <g
                    style={{ transform: `rotate(${needle}deg)` }}
                    className="origin-center transition-transform duration-1000 ease-pop"
                  >
                    <path
                      d="M50 50V14"
                      stroke="currentColor"
                      strokeOpacity=".5"
                      strokeWidth="1.5"
                    />
                    <circle cx="50" cy="10" r="6" className="fill-action" />
                  </g>
                  <circle cx="50" cy="50" r="3" className="fill-default" />
                </svg>
                <dl className="contents">
                  <div>
                    <dt className="text-caption text-muted">{t('network.destination')}</dt>
                    <dd className="text-title font-bold whitespace-nowrap">
                      {t(`cities.${route.code}.name`)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-caption text-muted">{t('network.distance')}</dt>
                    <dd className="text-title font-bold whitespace-nowrap">
                      {km >= 1000 ? grouped(km) : number(km)}
                      <span className="ms-1.5 text-small font-normal text-muted">
                        {t('network.km')}
                      </span>
                    </dd>
                  </div>
                  <div data-cell="time">
                    <dt className="text-caption text-muted">{t('network.flightTime')}</dt>
                    <dd className="text-title font-bold whitespace-nowrap">
                      {duration(route.minutes)}
                    </dd>
                  </div>
                </dl>
                <Button data-cell="cta" onPress={() => chooseDestination(route.code)}>
                  {t('network.flyTo', { city: t(`cities.${route.code}.name`) })}
                  <Icon name="arrow" size={16} />
                </Button>
              </div>
            </div>
            <p className="mx-1 mt-3 text-small text-faint">{t('network.note')}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
