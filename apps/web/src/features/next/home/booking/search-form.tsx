'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { NETWORK_ROUTES, toSearchQuery, validateTrip } from '@aerotech/domain';
import {
  Button,
  Icon,
  IconButton,
  SegmentedControl,
  TextField,
  ToggleChip,
  useToast,
} from '@aerotech/ui';
import { useHome } from '../home-context';
import { AirportField } from './airport-field';
import { DatesField } from './dates-field';
import { PassengersField } from './passengers-field';

export type OpenField = 'from' | 'to' | 'dates' | 'passengers' | null;

/** Rough height of each popover, used to scroll the form up before one opens below it. */
const ROOM_NEEDED = { from: 440, to: 440, dates: 500, passengers: 410 } as const;

/**
 * Popovers always open below the form. If the viewport is too short for that, move the page up
 * first, but never so far that the form itself slides under the header.
 */
function makeRoomBelow(form: HTMLElement | null, needed: number) {
  if (!form || !window.matchMedia('(min-width: 701px)').matches) return;
  const box = form.getBoundingClientRect();
  const short = needed - (window.innerHeight - box.bottom);
  const spare = box.top - 80;
  if (short > 0 && spare > 0) window.scrollBy({ top: Math.min(short, spare), behavior: 'instant' });
}

export function SearchForm() {
  const t = useTranslations('Next.booking');
  const locale = useLocale();
  const toast = useToast();
  const { draft, dispatch, askAssistant, setActiveRoute } = useHome();
  const [open, setOpen] = useState<OpenField>(null);
  const [invalid, setInvalid] = useState<'to' | 'dates' | null>(null);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [swapped, setSwapped] = useState(false);
  const [pending, setPending] = useState(false);
  const grid = useRef<HTMLDivElement>(null);

  const show = (field: OpenField) => {
    if (field) makeRoomBelow(grid.current, ROOM_NEEDED[field]);
    setOpen(field);
    if (field === 'to' || field === 'dates') setInvalid(null);
  };

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    dispatch({ type: 'setPromoCode', code });
    setPromoMessage(code ? t('promoSaved', { code }) : t('promoEmpty'));
  }

  function swap() {
    if (!draft?.to) {
      toast.show(t('swapFirst'));
      setInvalid('to');
      return;
    }
    dispatch({ type: 'swap' });
    setSwapped((value) => !value);
  }

  function search() {
    if (!draft) return;
    const problem = validateTrip(draft);
    if (problem === 'destination') {
      show('to');
      setInvalid('to');
      return;
    }
    if (problem === 'returnDate') {
      show('dates');
      setInvalid('dates');
      return;
    }
    setPending(true);
    // The results page belongs to the current site, which has its own document.
    window.location.assign(`/${locale}/book/search?${toSearchQuery(draft)}`);
  }

  function onAskKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    const text = event.currentTarget.value.trim();
    if (text) askAssistant(text);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2.5">
        <SegmentedControl
          aria-label={t('tripAria')}
          value={draft?.trip ?? 'round'}
          onChange={(trip) => dispatch({ type: 'setTrip', trip })}
          options={[
            { id: 'round', label: t('round') },
            { id: 'one', label: t('oneWay') },
          ]}
        />
        <div className="flex flex-wrap gap-2">
          <ToggleChip
            isSelected={promoOpen}
            onChange={setPromoOpen}
            aria-expanded={promoOpen}
            aria-controls="promo-panel"
            className="bg-canvas/50"
          >
            {t('promo')}
          </ToggleChip>
          <ToggleChip
            isSelected={draft?.awardSearch ?? false}
            onChange={(on) => {
              dispatch({ type: 'setAwardSearch', on });
              toast.show(on ? t('pointsOn') : t('pointsOff'));
            }}
            className="bg-canvas/50"
          >
            {t('points')}
          </ToggleChip>
        </div>
      </div>

      <div id="promo-panel" className="home-collapse" data-open={promoOpen || undefined}>
        <div inert={!promoOpen}>
          <div className="flex flex-wrap items-end gap-2 px-1 pb-3">
            <TextField
              label={t('promoLabel')}
              value={promoInput}
              onChange={setPromoInput}
              onKeyDown={(event) => {
                if (event.key === 'Enter') applyPromo();
              }}
              autoComplete="off"
              code
              className="max-w-sm min-w-44 flex-1"
            />
            <Button variant="secondary" size="lg" onPress={applyPromo}>
              {t('promoApply')}
            </Button>
            <p role="status" className="basis-full text-small text-action empty:hidden">
              {promoMessage}
            </p>
          </div>
        </div>
      </div>

      <div
        role="search"
        className="home-search-grid rounded-group border border-strong-line bg-surface-1"
      >
        <div data-cell="route" className="relative flex min-w-0">
          <AirportField
            kind="from"
            isOpen={open === 'from'}
            onOpenChange={(next) => show(next ? 'from' : null)}
            onPicked={(code) => {
              // Leaving Tehran fixes the destination; arriving back there asks for one.
              if (code === 'THR' && !draft?.to) show('to');
            }}
            className="pe-7"
          />
          <IconButton
            aria-label={t('swap')}
            onPress={swap}
            className="absolute start-1/2 top-1/2 z-10 -translate-y-1/2 bg-surface-2 ltr:-translate-x-1/2 rtl:translate-x-1/2"
          >
            <Icon
              name="swap"
              size={16}
              className={[
                'transition-transform duration-(--duration-slow) ease-out-soft',
                swapped ? 'rotate-180' : '',
              ].join(' ')}
            />
          </IconButton>
          <div className="relative flex min-w-0 flex-1 before:absolute before:inset-y-3.5 before:start-0 before:w-px before:bg-hairline">
            <AirportField
              kind="to"
              isOpen={open === 'to'}
              isInvalid={invalid === 'to'}
              onOpenChange={(next) => show(next ? 'to' : null)}
              onPicked={(code) => {
                const index = draft?.from === 'THR' ? routeIndex(code) : -1;
                if (index >= 0) setActiveRoute(index, true);
              }}
              className="ps-8"
            />
          </div>
        </div>
        <div data-cell="dates" className="flex min-w-0">
          <DatesField
            isOpen={open === 'dates'}
            isInvalid={invalid === 'dates'}
            onOpenChange={(next) => show(next ? 'dates' : null)}
          />
        </div>
        <div data-cell="passengers" className="flex min-w-0">
          <PassengersField
            isOpen={open === 'passengers'}
            onOpenChange={(next) => show(next ? 'passengers' : null)}
          />
        </div>
        <div data-cell="go" className="flex items-center p-2 md:p-2.5">
          <Button
            size="lg"
            onPress={search}
            isPending={pending}
            className="w-full md:w-auto md:min-w-44"
          >
            {t('search')}
            <Icon name="arrow" size={20} />
          </Button>
        </div>
      </div>

      <div className="mt-2.5 flex h-12 items-center gap-2.5 rounded-control border border-transparent bg-canvas ps-4 pe-2 transition-colors duration-(--duration-fast) focus-within:border-action-line">
        <span
          aria-hidden="true"
          className="flex shrink-0 items-center gap-2 text-small font-bold whitespace-nowrap"
        >
          <span className="size-2 rounded-chip bg-action" />
          {t('assistant')}
        </span>
        <input
          type="text"
          aria-label={`${t('assistant')}: ${t('assistantLabel')}`}
          placeholder={t('assistantPlaceholder')}
          autoComplete="off"
          enterKeyHint="search"
          onKeyDown={onAskKey}
          className="h-11 min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-faint"
        />
        <kbd className="hidden rounded-small border border-hairline px-2 py-0.5 font-mono text-caption text-muted md:inline">
          Enter ↵
        </kbd>
      </div>
    </div>
  );
}

function routeIndex(code: string): number {
  return NETWORK_ROUTES.findIndex((route) => route.code === code);
}
