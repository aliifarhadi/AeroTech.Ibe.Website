'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BabyIcon, ChildIcon, UserIcon } from '@/components/icons';

export function PassengerPicker({ label }: { label: string }) {
  const t = useTranslations('Widget');
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const total = adults + children + infants;

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function updateAdults(next: number) {
    const nextAdults = Math.max(1, Math.min(9, next));
    setAdults(nextAdults);
    setInfants((current) => Math.min(current, nextAdults));
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 text-start text-sm font-semibold text-black transition-colors focus:outline-none sm:text-[15px]"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex items-center gap-2.5 text-[15px] font-semibold text-black">
          <span className="inline-flex items-center gap-1">
            <UserIcon className="size-4 text-neutral-500" />
            {adults}
          </span>
          <span className="inline-flex items-center gap-1">
            <ChildIcon className="size-4 text-neutral-500" />
            {children}
          </span>
          <span className="inline-flex items-center gap-1">
            <BabyIcon className="size-4 text-neutral-500" />
            {infants}
          </span>
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`size-4 shrink-0 text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <input type="hidden" name="adults" value={adults} />
      <input type="hidden" name="children" value={children} />
      <input type="hidden" name="infants" value={infants} />

      {open && (
        <div
          role="dialog"
          aria-label={t('passengerPicker.title')}
          className="animate-popover absolute end-0 top-full z-40 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-neutral-200 bg-white p-4 text-start shadow-2xl shadow-black/15"
        >
          <div className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-3">
            <p className="text-sm font-bold text-black">{t('passengerPicker.title')}</p>
            <span className="text-xs font-semibold text-neutral-500">{total}</span>
          </div>
          <div className="divide-y divide-neutral-100">
            <Counter
              label={t('passengerPicker.adults')}
              count={adults}
              min={1}
              max={9}
              onChange={updateAdults}
              t={t}
            />
            <Counter
              label={t('passengerPicker.children')}
              count={children}
              min={0}
              max={9}
              onChange={setChildren}
              t={t}
            />
            <Counter
              label={t('passengerPicker.infants')}
              count={infants}
              min={0}
              max={adults}
              onChange={setInfants}
              t={t}
            />
          </div>
          <button
            type="button"
            className="mt-4 h-11 w-full rounded-full bg-black text-sm font-bold text-white transition-colors hover:bg-neutral-800"
            onClick={() => setOpen(false)}
          >
            {t('passengerPicker.done')}
          </button>
        </div>
      )}
    </div>
  );
}

function Counter({
  label,
  count,
  min,
  max,
  onChange,
  t,
}: {
  label: string;
  count: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  t: ReturnType<typeof useTranslations<'Widget'>>;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <span className="text-sm font-semibold text-black">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={t('passengerPicker.decrease', { label })}
          disabled={count <= min}
          className="flex size-8 items-center justify-center rounded-full border border-neutral-200 text-lg text-neutral-700 transition-colors hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-35"
          onClick={() => onChange(count - 1)}
        >
          −
        </button>
        <span className="w-4 text-center text-sm font-bold text-black" aria-live="polite">
          {count}
        </span>
        <button
          type="button"
          aria-label={t('passengerPicker.increase', { label })}
          disabled={count >= max}
          className="flex size-8 items-center justify-center rounded-full border border-neutral-200 text-lg text-neutral-700 transition-colors hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-35"
          onClick={() => onChange(count + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

