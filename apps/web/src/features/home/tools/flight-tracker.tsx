'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useReducedMotion } from '../../shared/use-media';

const STEPS = ['checkIn', 'gate', 'boarding', 'enRoute'] as const;

/** A sample flight moving through its day: check-in, gate, boarding, en route. */
export function FlightTracker() {
  const t = useTranslations('tools');
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const line = useRef<HTMLDivElement>(null);
  const current = reduced ? STEPS.length - 1 : step;

  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => setStep((value) => (value + 1) % STEPS.length), 2400);
    return () => window.clearInterval(timer);
  }, [reduced]);

  useEffect(() => {
    const el = line.current;
    if (!el) return;
    if (reduced) {
      el.style.setProperty('--progress', '62%');
      return;
    }
    let frame = 0;
    const fly = (now: number) => {
      const phase = (now / 14000) % 1;
      const eased = 0.5 - Math.cos(phase * Math.PI * 2) / 2;
      el.style.setProperty('--progress', `${6 + eased * 88}%`);
      frame = requestAnimationFrame(fly);
    };
    frame = requestAnimationFrame(fly);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  return (
    <div aria-hidden="true" className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between text-small text-muted">
        <span>
          <span dir="ltr" className="font-mono text-caption tracking-wide">
            DA 142
          </span>{' '}
          · {t('sample')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-1.5 animate-beat rounded-chip bg-success" />
          {t(`steps.${STEPS[current] ?? 'checkIn'}`)}
        </span>
      </div>
      <div
        dir="ltr"
        className="flex items-end justify-between font-mono text-subheading leading-tight"
      >
        <span className="flex flex-col">
          14:10<span className="text-caption tracking-wide text-muted">THR</span>
        </span>
        <span className="flex flex-col items-end">
          15:30<span className="text-caption tracking-wide text-muted">SYZ</span>
        </span>
      </div>
      <div ref={line} dir="ltr" className="home-flight-line">
        <span />
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {STEPS.map((name, i) => (
          <div
            key={name}
            data-current={i === current || undefined}
            data-done={i < current || undefined}
            className="flex flex-col gap-0.5 rounded-control border border-hairline px-3 py-2.5 text-caption text-faint transition-colors duration-(--duration-slow) data-current:border-action-line data-current:bg-action-soft data-current:text-action data-done:border-strong-line data-done:text-muted"
          >
            <span className={i === current ? 'text-small font-bold text-strong' : 'text-small'}>
              {t(`steps.${name}`)}
            </span>
            <span>{t(`steps.${name}State`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
