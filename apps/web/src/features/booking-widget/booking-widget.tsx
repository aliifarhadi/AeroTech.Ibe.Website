'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@aerotech/ui/cn';
import { CalendarIcon, PinIcon, PlaneIcon, SearchIcon, SeatIcon, SwapIcon } from '@/components/icons';
import { FieldCell, fieldInput } from '@/components/ui/field';
import { useRouter } from '@/i18n/navigation';
import { AirportAutocomplete } from './airport-autocomplete';
import { DateRangePicker } from './date-range-picker';
import { PassengerPicker } from './passenger-picker';

type TabKey = 'book' | 'stopover' | 'manage' | 'flightStatus';
type TripType = 'ROUND_TRIP' | 'ONE_WAY' | 'MULTI_CITY';

const TABS: { key: TabKey; Icon: typeof PlaneIcon }[] = [
  { key: 'book', Icon: PlaneIcon },
  { key: 'stopover', Icon: PlaneIcon },
  { key: 'manage', Icon: CalendarIcon },
  { key: 'flightStatus', Icon: PinIcon },
];

export function BookingWidget() {
  const t = useTranslations('Widget');
  const [active, setActive] = useState<TabKey>('book');
  const tablistId = useId();

  return (
    <div className="w-full overflow-visible rounded-2xl border border-neutral-200 bg-white shadow-[0_18px_36px_-18px_rgba(0,0,0,0.28)]">
      {/* Icon tabs */}
      <div
        role="tablist"
        aria-label={t('ariaTabs')}
        id={tablistId}
        className="grid grid-cols-2 overflow-x-auto rounded-t-xl bg-neutral-100 sm:grid-cols-4"
      >
        {TABS.map(({ key, Icon }) => {
          const selected = key === active;
          return (
            <button
              key={key}
              role="tab"
              type="button"
              id={`${tablistId}-${key}`}
              aria-selected={selected}
              aria-controls={`${tablistId}-${key}-panel`}
              onClick={() => setActive(key)}
              className={cn(
                'flex min-w-0 items-center justify-center gap-2 px-2 py-4 text-xs font-semibold transition-all sm:py-5 sm:text-sm',
                selected
                  ? 'bg-white text-black shadow-sm'
                  : 'text-neutral-600 hover:bg-white/60 hover:text-neutral-900',
              )}
            >
              <Icon
                className={cn('size-5 shrink-0', selected ? 'text-accent-500' : 'text-neutral-500')}
              />
              {t(`tabs.${key}`)}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${tablistId}-${active}-panel`}
        aria-labelledby={`${tablistId}-${active}`}
        className="p-4 pt-5 sm:p-5"
      >
        {active === 'book' && <BookPanel />}
        {active === 'stopover' && <BookPanel defaultTripType="MULTI_CITY" />}
        {active === 'manage' && <RetrievePanel ns="manage" />}
        {active === 'flightStatus' && <FlightStatusPanel />}
      </div>
    </div>
  );
}

function SearchButton({ label, disabled = false }: { label: string; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-400 px-8 text-base font-bold text-black shadow-lg shadow-brand-400/40 transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
    >
      <SearchIcon className="size-5" />
      {label}
    </button>
  );
}

type FieldError = 'from' | 'to' | 'sameAirport' | 'depart' | 'returnDate';

function BookPanel({ defaultTripType = 'ROUND_TRIP' }: { defaultTripType?: TripType }) {
  const t = useTranslations('Widget');
  const router = useRouter();
  const [tripType, setTripType] = useState<TripType>(defaultTripType);
  const [showPromo, setShowPromo] = useState(false);
  const [miles, setMiles] = useState(false);
  const [from, setFrom] = useState('DOH');
  const [to, setTo] = useState('LHR');
  const [depart, setDepart] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [errors, setErrors] = useState<FieldError[]>([]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function validate(): FieldError[] {
    const next: FieldError[] = [];
    if (!from) next.push('from');
    if (!to) next.push('to');
    if (from && to && from === to) next.push('sameAirport');
    if (!depart) next.push('depart');
    if (tripType === 'ROUND_TRIP' && !returnDate) next.push('returnDate');
    return next;
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (found.length > 0) return;

    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    params.set('tripType', tripType);
    params.set('from', from);
    params.set('to', to);
    params.set('depart', depart);
    if (tripType !== 'ONE_WAY' && returnDate) params.set('return', returnDate);
    for (const key of ['adults', 'children', 'infants', 'cabin', 'promo']) {
      const value = data.get(key);
      if (value) params.set(key, String(value));
    }
    if (data.get('miles')) params.set('miles', '1');
    router.push(`/book/search?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:gap-4">
      {/* Options bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-1">
        <div className="inline-flex rounded-full bg-neutral-100 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setMiles(false)}
            aria-pressed={!miles}
            className={cn(
              'rounded-full px-4 py-1.5 transition',
              !miles ? 'bg-black text-white' : 'text-neutral-600 hover:text-black',
            )}
          >
            {t('bookCash')}
          </button>
          <button
            type="button"
            onClick={() => setMiles(true)}
            aria-pressed={miles}
            className={cn(
              'rounded-full px-4 py-1.5 transition',
              miles ? 'bg-black text-white' : 'text-neutral-600 hover:text-black',
            )}
          >
            {t('bookMiles')}
          </button>
        </div>
        <input type="hidden" name="miles" value={miles ? '1' : ''} />

        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="sr-only">{t('tripType.legend')}</legend>
          {(['ROUND_TRIP', 'ONE_WAY', 'MULTI_CITY'] as TripType[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTripType(value)}
              aria-pressed={tripType === value}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-semibold transition',
                tripType === value
                  ? 'bg-brand-100 text-brand-900'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
              )}
            >
              {t(`tripType.${tripKey(value)}`)}
            </button>
          ))}
        </fieldset>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-800 sm:ms-auto">
          <input type="checkbox" name="flexible" className="size-4 accent-black" />
          {t('flexibleDates')}
        </label>
      </div>

      {/* Field row — borderless open fields with hairline separators */}
      <div className="flex flex-col divide-y divide-neutral-100 sm:flex-row sm:items-stretch sm:divide-x sm:divide-y-0">
        {/* From / To with inline swap */}
        <div className="relative flex items-center gap-3 px-4 py-3 lg:flex-[2.2]">
          <div className="min-w-0 flex-1">
            <AirportAutocomplete
              id="booking-origin"
              name="from"
              label={t('from')}
              placeholder={t('fromPlaceholder')}
              value={from}
              prominent
              onChange={(code) => {
                setFrom(code);
                if (errors.length) setErrors([]);
              }}
            />
          </div>
          <button
            type="button"
            onClick={swap}
            aria-label={t('swap')}
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-600 shadow-sm transition hover:text-black"
          >
            <SwapIcon className="size-4" />
          </button>
          <div className="min-w-0 flex-1">
            <AirportAutocomplete
              id="booking-destination"
              name="to"
              label={t('to')}
              placeholder={t('toPlaceholder')}
              value={to}
              prominent
              onChange={(code) => {
                setTo(code);
                if (errors.length) setErrors([]);
              }}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="relative flex min-w-0 items-center px-3 sm:flex-1 lg:flex-[1.6]">
          <DateRangePicker
            departure={depart}
            returnDate={tripType === 'ONE_WAY' ? '' : returnDate}
            returnDisabled={tripType === 'ONE_WAY'}
            onChange={(nextDepart, nextReturn) => {
              setDepart(nextDepart);
              setReturnDate(nextReturn);
              if (errors.length) setErrors([]);
            }}
          />
        </div>

        {/* Passengers */}
        <FieldCell label={t('passengers')} className="relative lg:flex-1">
          <PassengerPicker label={t('passengers')} />
        </FieldCell>

        {/* Cabin class */}
        <FieldCell label={t('cabin')} className="relative lg:flex-1">
          <div className="flex items-center gap-2">
            <SeatIcon className="size-4 shrink-0 text-neutral-400" />
            <div className="relative flex-1">
              <select
                name="cabin"
                defaultValue="ECONOMY"
                aria-label={t('cabin')}
                className={cn(fieldInput, 'cursor-pointer appearance-none pe-5')}
              >
                <option value="ECONOMY">{t('cabins.economy')}</option>
                <option value="PREMIUM_ECONOMY">{t('cabins.premiumEconomy')}</option>
                <option value="BUSINESS">{t('cabins.business')}</option>
                <option value="FIRST">{t('cabins.first')}</option>
              </select>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="pointer-events-none absolute end-0 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </FieldCell>

        {/* Search */}
        <div className="flex items-center justify-center px-3 py-2">
          <SearchButton label={t('search')} />
        </div>
      </div>

      {errors.length > 0 && (
        <ul
          role="alert"
          className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700"
        >
          {errors.map((error) => (
            <li key={error} className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="text-sm leading-none">
                !
              </span>
              {t(`errors.${error}`)}
            </li>
          ))}
        </ul>
      )}

      {/* Promo */}
      <div className="px-1">
        {showPromo ? (
          <input
            className="h-10 w-44 rounded-lg border border-neutral-300 px-3 text-sm font-semibold text-black focus:border-brand-400 focus:outline-none"
            name="promo"
            placeholder={t('promo')}
            aria-label={t('promo')}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowPromo(true)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-800 hover:text-black"
          >
            <span className="text-lg leading-none">+</span>
            {t('addPromo')}
          </button>
        )}
      </div>
    </form>
  );
}

function RetrievePanel({ ns }: { ns: 'manage' | 'checkIn' }) {
  const t = useTranslations('Widget');
  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col divide-y divide-neutral-200 rounded-2xl border border-neutral-200 sm:flex-row sm:divide-x sm:divide-y-0">
        <FieldCell label={t(`${ns}.reference`)} className="flex-1">
          <input className={fieldInput} name="reference" placeholder="ABC123" required />
        </FieldCell>
        <FieldCell label={t(`${ns}.surname`)} className="flex-1">
          <input className={fieldInput} name="surname" placeholder={t(`${ns}.surname`)} required />
        </FieldCell>
      </div>
      <div className="flex justify-end">
        <SearchButton label={t(`${ns}.cta`)} />
      </div>
    </form>
  );
}

function FlightStatusPanel() {
  const t = useTranslations('Widget');
  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col divide-y divide-neutral-200 rounded-2xl border border-neutral-200 sm:flex-row sm:divide-x sm:divide-y-0">
        <FieldCell label={t('status.flightNumber')} className="flex-1">
          <input className={fieldInput} name="flightNumber" placeholder="XX123" required />
        </FieldCell>
        <FieldCell label={t('status.date')} className="flex-1">
          <input className={fieldInput} name="date" type="date" required />
        </FieldCell>
      </div>
      <div className="flex justify-end">
        <SearchButton label={t('status.cta')} />
      </div>
    </form>
  );
}

function tripKey(v: TripType): string {
  return v === 'ROUND_TRIP' ? 'roundTrip' : v === 'ONE_WAY' ? 'oneWay' : 'multiCity';
}
