'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@aerotech/ui';
import { useReducedMotion } from '../../shared/use-media';

const NOTES = ['gate', 'checkIn', 'bag', 'early'] as const;
const ROW_PX = 62;

/** Sample notifications that shuffle like a real lock screen. */
export function AlertStack() {
  const t = useTranslations('tools.notes');
  const reduced = useReducedMotion();
  const [top, setTop] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(
      () => setTop((value) => (value + NOTES.length - 1) % NOTES.length),
      3000,
    );
    return () => window.clearInterval(timer);
  }, [reduced]);

  return (
    <div aria-hidden="true" className="relative h-46">
      {NOTES.map((name, i) => {
        const depth = (i - top + NOTES.length) % NOTES.length;
        const gone = depth === NOTES.length - 1;
        return (
          <div
            key={name}
            style={{
              transform: gone
                ? 'translateY(-36px)'
                : `translateY(${depth * ROW_PX}px) scale(${1 - depth * 0.035})`,
              opacity: gone ? 0 : 1 - depth * 0.3,
              zIndex: 10 - depth,
            }}
            className="absolute inset-x-0 top-0 flex h-15 items-center gap-3 rounded-control border border-hairline bg-surface-1 px-3.5 text-small transition duration-700 ease-out-soft"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-action-soft text-action">
              <Icon name="plane" size={18} />
            </span>
            <span className="min-w-0 leading-snug">
              <span className="block truncate font-bold">{t(name)}</span>
              <span className="block truncate text-caption text-muted">{t(`${name}Sub`)}</span>
            </span>
            <span className="ms-auto text-caption whitespace-nowrap text-muted">
              {t(`${name}Time`)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
