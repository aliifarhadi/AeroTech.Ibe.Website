'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@aerotech/ui';
import { PlaneIcon } from '@/components/icons';
import { airportLabel, AIRPORTS, type AirportOption } from './airports';

type AirportAutocompleteProps = {
  id: string;
  name: string;
  value: string;
  label: string;
  placeholder: string;
  onChange: (code: string) => void;
  /** Korean Air-style display: big airport code with the city name beneath. */
  prominent?: boolean;
};

export function AirportAutocomplete({
  id,
  name,
  value,
  label,
  placeholder,
  onChange,
  prominent = false,
}: AirportAutocompleteProps) {
  const t = useTranslations('Widget');
  const locale = useLocale();
  const persian = locale.startsWith('fa');
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(() => {
    const initial = AIRPORTS.find((airport) => airport.code === value);
    return initial ? (prominent ? initial.code : airportLabel(initial, persian)) : '';
  });
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const isEditing = useRef(false);
  const selected = AIRPORTS.find((airport) => airport.code === value);

  useEffect(() => {
    if (isEditing.current) {
      isEditing.current = false;
      return;
    }
    setQuery(selected ? (prominent ? selected.code : airportLabel(selected, persian)) : '');
  }, [persian, prominent, selected, value]);

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

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return AIRPORTS.slice(0, 6);
    return AIRPORTS.filter((airport) => {
      const searchable = [
        airport.city,
        airport.country,
        airport.cityFa,
        airport.countryFa,
        airport.code,
      ]
        .join(' ')
        .toLocaleLowerCase();
      return searchable.includes(normalized);
    }).slice(0, 6);
  }, [query]);

  function selectAirport(airport: AirportOption) {
    onChange(airport.code);
    setQuery(prominent ? airport.code : airportLabel(airport, persian));
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setHighlighted((current) => Math.min(current + 1, Math.max(results.length - 1, 0)));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((current) => Math.max(current - 1, 0));
    }
    if (event.key === 'Enter' && open && results[highlighted]) {
      event.preventDefault();
      selectAirport(results[highlighted]);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        id={id}
        type="text"
        value={query}
        name={`${name}Display`}
        placeholder={placeholder}
        autoComplete="off"
        required
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && results[highlighted] ? `${listboxId}-${results[highlighted].code}` : undefined
        }
        dir={persian ? 'rtl' : 'ltr'}
        lang={persian ? 'fa' : undefined}
        className={cn(
          'w-full min-w-0 bg-transparent text-black placeholder:font-normal placeholder:text-neutral-400 focus:outline-none',
          prominent
            ? 'text-[1.7rem] font-semibold leading-none tracking-tight'
            : 'text-sm font-semibold sm:text-[15px]',
        )}
        onFocus={() => {
          setOpen(true);
          setHighlighted(0);
        }}
        onChange={(event) => {
          isEditing.current = true;
          setQuery(event.target.value);
          onChange('');
          setOpen(true);
          setHighlighted(0);
        }}
        onKeyDown={handleKeyDown}
      />
      <input type="hidden" name={name} value={value} />

      {prominent && selected && (
        <span className="mt-1 block truncate text-xs text-neutral-500">
          {persian ? selected.cityFa : selected.city}
        </span>
      )}

      {open && (
        <div
          dir={persian ? 'rtl' : 'ltr'}
          className="animate-popover absolute start-0 top-full z-50 mt-2 w-[min(31rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-neutral-200/70 bg-white/95 text-start shadow-[0_10px_24px_-8px_rgba(0,0,0,0.35)] backdrop-blur-md"
        >
          <ul id={listboxId} role="listbox" aria-label={label} className="max-h-64 overflow-y-auto">
            {results.length > 0 ? (
              results.map((airport, index) => (
                <li
                  key={airport.code}
                  id={`${listboxId}-${airport.code}`}
                  role="option"
                  aria-selected={airport.code === value}
                >
                  <button
                    type="button"
                    className={`flex min-h-[4.25rem] w-full items-center gap-3 px-4 py-2.5 text-start transition-colors ${
                      index === highlighted ? 'bg-brand-50' : 'hover:bg-brand-50'
                    }`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectAirport(airport)}
                  >
                    <PlaneIcon className="size-5 shrink-0 text-neutral-600" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold text-neutral-800">
                        {persian
                          ? `${airport.cityFa}, ${airport.countryFa}`
                          : `${airport.city}, ${airport.country}`}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-neutral-600">
                        {persian
                          ? (airport.airportNameFa ?? `${airport.cityFa} فرودگاه`)
                          : (airport.airportName ?? `${airport.city} Airport`)}
                      </span>
                    </span>
                    <span className="shrink-0 px-1 text-sm font-bold text-neutral-800">
                      {airport.code}
                    </span>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-4 text-sm text-neutral-500">{t('noAirportsFound')}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
