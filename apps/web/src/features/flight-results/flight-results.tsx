'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { BrandLogo } from '@/components/brand-logo';
import {
  BriefcaseIcon,
  CalendarIcon,
  LuggageIcon,
  PlaneIcon,
  RefreshIcon,
  SeatIcon,
  SparklesIcon,
  SwapIcon,
  TagIcon,
  UserIcon,
  UtensilsIcon,
} from '@/components/icons';
import { Heading } from '@/components/ui/typography';
import { AIRPORTS } from '@/features/booking-widget/airports';
import { useRouter } from '@/i18n/navigation';
import {
  cabinPrice,
  type CabinKey,
  type Flight,
  generateFlights,
  stopCityLabel,
  type TimeBucket,
  timeBucket,
} from './flight-data';

type TripType = 'ROUND_TRIP' | 'ONE_WAY';

type Passengers = {
  adults: number;
  children: number;
  infants: number;
  cabin: CabinKey;
};

type SortKey = 'recommended' | 'lowestPrice' | 'shortest' | 'earliest';
type StopsFilter = 'all' | 'nonstop' | 'oneStop';
type TimeFilter = 'all' | TimeBucket;

// Cabin columns shown on each flight card (the on-card upsell ladder).
const FARE_COLUMNS: CabinKey[] = ['economy', 'business', 'first'];

// Fare families offered within a cabin, cheapest → most flexible.
const FARE_FAMILIES = [
  { key: 'light', add: 0 },
  { key: 'classic', add: 65 },
  { key: 'plus', add: 115, recommended: true },
  { key: 'flex', add: 160 },
] as const;

const FARE_ROWS = [
  { key: 'rebooking', Icon: RefreshIcon },
  { key: 'refund', Icon: TagIcon },
  { key: 'cabinBag', Icon: BriefcaseIcon },
  { key: 'checkedBag', Icon: LuggageIcon },
  { key: 'seat', Icon: SeatIcon },
  { key: 'catering', Icon: UtensilsIcon },
  { key: 'miles', Icon: SparklesIcon },
] as const;

// Index-aligned with FARE_ROWS. Status tokens resolve to localized labels; other values are literal.
const FARE_VALUES: Record<string, string[]> = {
  light: ['forFee', 'notAllowed', '1 × 8kg', 'notAllowed', 'forFee', 'included', '1,200'],
  classic: ['forFee', 'forFee', '1 × 8kg', '1 × 23kg', 'forFee', 'included', '1,500'],
  plus: ['included', 'forFee', '1 × 8kg', '1 × 23kg', 'included', 'included', '1,800'],
  flex: ['included', 'included', '1 × 8kg', '2 × 23kg', 'included', 'included', '2,100'],
};

const FARE_STATUS = new Set(['included', 'forFee', 'notAllowed', 'atCheckIn']);

const UPSELL_NEXT: Partial<Record<CabinKey, CabinKey>> = {
  economy: 'business',
  premiumEconomy: 'business',
  business: 'first',
};

const BUSINESS_PERKS = [
  { key: 'perkSeat', Icon: SeatIcon },
  { key: 'perkBoarding', Icon: TagIcon },
  { key: 'perkLounge', Icon: SparklesIcon },
  { key: 'perkMeal', Icon: UtensilsIcon },
] as const;

function fareValueTone(value: string): string {
  if (value === 'included') return 'text-emerald-600';
  if (value === 'notAllowed') return 'text-neutral-400';
  if (value === 'forFee' || value === 'atCheckIn') return 'text-neutral-600';
  return 'text-neutral-900';
}

/* ------------------------------ formatting ------------------------------- */

function intlLocale(locale: string) {
  return locale.startsWith('fa') ? 'fa-IR' : locale.startsWith('en') ? 'en-GB' : locale;
}

function nf(value: number, locale: string) {
  return new Intl.NumberFormat(intlLocale(locale)).format(value);
}

function formatPrice(price: number, locale: string) {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

function minutesToTime(minutes: number, locale: string) {
  const date = new Date(2024, 0, 1, 0, 0, 0);
  date.setMinutes(((minutes % 1440) + 1440) % 1440);
  return new Intl.DateTimeFormat(intlLocale(locale), {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
}

function formatDuration(minutes: number, hShort: string, mShort: string, locale: string) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${nf(hours, locale)}${hShort} ${nf(mins, locale)}${mShort}`;
}

function resolveCity(code: string, persian: boolean) {
  const airport = AIRPORTS.find((option) => option.code === code);
  if (!airport) return code;
  return persian ? airport.cityFa : airport.city;
}

/* -------------------------------- screen --------------------------------- */

export function FlightResults({
  originCode,
  destinationCode,
  tripType,
  departureDate,
  returnDate,
  passengers,
}: {
  originCode: string;
  destinationCode: string;
  tripType: TripType;
  departureDate: string;
  returnDate?: string;
  passengers: Passengers;
}) {
  const t = useTranslations('SearchResults');
  const tw = useTranslations('Widget');
  const locale = useLocale();
  const router = useRouter();
  const persian = locale.startsWith('fa');

  const hShort = t('hoursShort');
  const mShort = t('minutesShort');
  const originCity = resolveCity(originCode, persian);
  const destinationCity = resolveCity(destinationCode, persian);

  const payingPassengers = passengers.adults + passengers.children;
  const totalTravelers = payingPassengers + passengers.infants;
  const cabinLabel = tw(`cabins.${passengers.cabin}`);
  const passengerSummary = `${tw('passengersCount', { count: totalTravelers })} · ${cabinLabel}`;

  const [activeDate, setActiveDate] = useState(departureDate);
  const [sort, setSort] = useState<SortKey>('recommended');
  const [stops, setStops] = useState<StopsFilter>('all');
  const [time, setTime] = useState<TimeFilter>('all');
  const [priceCap, setPriceCap] = useState<number | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [selectedFare, setSelectedFare] = useState<string | null>(null);
  const [expandedFlight, setExpandedFlight] = useState<string | null>(null);
  const [pendingFare, setPendingFare] = useState<{ id: string; total: number } | null>(null);
  const [detailsFlight, setDetailsFlight] = useState<Flight | null>(null);

  const allFlights = useMemo(
    () => generateFlights(originCode, destinationCode, activeDate),
    [originCode, destinationCode, activeDate],
  );

  const priceBounds = useMemo(() => {
    const prices = allFlights.map((flight) => cabinPrice(flight, passengers.cabin));
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [allFlights, passengers.cabin]);

  // Reset the price cap whenever the underlying result set changes.
  useEffect(() => {
    setPriceCap(null);
  }, [activeDate, passengers.cabin]);

  const flights = useMemo(() => {
    const cap = priceCap ?? Number.POSITIVE_INFINITY;
    const filtered = allFlights.filter((flight) => {
      const stopsOk =
        stops === 'all' || (stops === 'nonstop' ? flight.stops === 0 : flight.stops === 1);
      const timeOk = time === 'all' || timeBucket(flight.departMinutes) === time;
      const priceOk = cabinPrice(flight, passengers.cabin) <= cap;
      return stopsOk && timeOk && priceOk;
    });
    return [...filtered].sort((a, b) => {
      if (sort === 'lowestPrice')
        return cabinPrice(a, passengers.cabin) - cabinPrice(b, passengers.cabin);
      if (sort === 'shortest') return a.durationMinutes - b.durationMinutes;
      if (sort === 'earliest') return a.departMinutes - b.departMinutes;
      // recommended: cheap + short + non-stop bias
      const score = (flight: Flight) =>
        cabinPrice(flight, passengers.cabin) + flight.durationMinutes * 1.4 + flight.stops * 120;
      return score(a) - score(b);
    });
  }, [allFlights, passengers.cabin, priceCap, sort, stops, time]);

  const activeFilterCount =
    (stops !== 'all' ? 1 : 0) + (time !== 'all' ? 1 : 0) + (priceCap !== null ? 1 : 0);

  function resetFilters() {
    setStops('all');
    setTime('all');
    setPriceCap(null);
  }

  const dateOptions = useMemo(() => {
    const start = new Date(`${departureDate}T12:00:00`);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index - 3);
      const iso = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-');
      const dayFlights = generateFlights(originCode, destinationCode, iso);
      const lowest = Math.min(...dayFlights.map((flight) => cabinPrice(flight, passengers.cabin)));
      return {
        iso,
        label: new Intl.DateTimeFormat(intlLocale(locale), {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }).format(date),
        price: lowest,
      };
    });
  }, [departureDate, originCode, destinationCode, passengers.cabin, locale]);

  useEffect(() => {
    if (!pendingFare && !detailsFlight && !mobileFiltersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPendingFare(null);
        setDetailsFlight(null);
        setMobileFiltersOpen(false);
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [detailsFlight, pendingFare, mobileFiltersOpen]);

  const filterControls = (
    <FilterControls
      t={t}
      stops={stops}
      time={time}
      priceCap={priceCap ?? priceBounds.max}
      priceBounds={priceBounds}
      locale={locale}
      onStops={setStops}
      onTime={setTime}
      onPrice={setPriceCap}
    />
  );

  return (
    <main className="min-h-screen bg-neutral-50 pb-24 text-black">
      {/* Top bar */}
      <header className="relative z-[60] -mt-[4.5rem] flex h-16 items-center border-b border-neutral-200 bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4">
          <button
            type="button"
            aria-label={t('back')}
            onClick={() => router.push('/')}
            className="text-xl text-neutral-600 transition hover:text-black rtl:-scale-x-100"
          >
            ←
          </button>
          <BrandLogo name="DotAir" textClassName="text-lg" />
          <div className="ms-auto hidden items-center gap-3 rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-700 md:flex">
            <span className="font-bold text-black">{originCode}</span>
            <span className="text-neutral-400 rtl:-scale-x-100">→</span>
            <span className="font-bold text-black">{destinationCode}</span>
            <span className="h-4 w-px bg-neutral-200" />
            <CalendarIcon className="size-4" />
            <span>{activeDate}</span>
            <span className="h-4 w-px bg-neutral-200" />
            <span>{tw('passengersCount', { count: totalTravelers })}</span>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="ms-1 border-s border-neutral-200 ps-3 font-bold text-black hover:text-brand-700"
            >
              {t('editSearch')}
            </button>
          </div>
          <button
            type="button"
            className="ms-auto inline-flex h-9 items-center gap-1.5 rounded-full border border-brand-400 px-3 text-xs font-bold text-black transition hover:bg-brand-50 md:ms-0"
          >
            <UserIcon className="size-4" />
            <span className="hidden sm:inline">{t('login')}</span>
          </button>
        </div>
      </header>

      {/* Progress */}
      <nav aria-label={t('selectFlights')} className="border-b border-neutral-200 bg-white">
        <ol className="mx-auto grid max-w-7xl grid-cols-4 px-4 sm:px-6 lg:px-8">
          {[t('selectFlights'), t('passengerServices'), t('paymentDetails'), t('tripSummary')].map(
            (step, index) => (
              <li
                key={step}
                aria-current={index === 0 ? 'step' : undefined}
                className={`flex items-center justify-center gap-1.5 border-b-2 px-1 py-3.5 text-center text-[11px] font-bold sm:text-sm ${index === 0 ? 'border-brand-400 text-black' : 'border-transparent text-neutral-400'}`}
              >
                <span
                  className={`inline-flex size-5 items-center justify-center rounded-full border text-[11px] ${index === 0 ? 'border-brand-400 bg-brand-400 text-black' : 'border-neutral-300'}`}
                >
                  {index + 1}
                </span>
                <span className="hidden sm:inline">{step}</span>
              </li>
            ),
          )}
        </ol>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Title */}
        <div className="mb-6">
          <Heading
            as="h1"
            variant="section"
            className="flex flex-wrap items-center gap-x-2 gap-y-1 font-normal"
          >
            <span>{originCity}</span>
            <SwapIcon className="size-5 text-brand-700 sm:size-6" />
            <span>{destinationCity}</span>
          </Heading>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 ring-1 ring-neutral-200">
              {tripType === 'ROUND_TRIP' ? t('roundTrip') : t('oneWay')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="size-4" />
              {departureDate}
              {returnDate ? ` – ${returnDate}` : ''}
            </span>
            <span>·</span>
            <span>{passengerSummary}</span>
          </div>
        </div>

        {/* Date strip */}
        <div className="mb-5 overflow-x-auto rounded-xl bg-white px-1 shadow-sm ring-1 ring-neutral-200/70">
          <div className="flex min-w-[40rem] items-stretch justify-between">
            {dateOptions.map((date) => {
              const isActive = activeDate === date.iso;
              return (
                <button
                  key={date.iso}
                  type="button"
                  onClick={() => setActiveDate(date.iso)}
                  aria-pressed={isActive}
                  className={`min-w-28 flex-1 border-b-2 px-3 py-3 text-center transition ${isActive ? 'border-brand-400 bg-brand-50/50 text-black' : 'border-transparent text-neutral-600 hover:bg-neutral-50'}`}
                >
                  <span className="block text-[11px] font-medium">{date.label}</span>
                  <span className="mt-1 block text-sm font-semibold">
                    {formatPrice(date.price, locale)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-neutral-900" aria-live="polite">
              {flights.length} {t('resultsFound')}
            </p>
            <p className="mt-0.5 hidden text-[11px] text-neutral-500 sm:block">{t('advisory')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-semibold text-neutral-800 shadow-sm ring-1 ring-neutral-200 lg:hidden"
            >
              {t('filters')}
              {activeFilterCount > 0 && (
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-brand-400 text-[11px] font-bold text-black">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <label className="sr-only" htmlFor="result-sort">
              {t('sortBy')}
            </label>
            <select
              id="result-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="h-10 rounded-full border-0 bg-white px-4 text-xs font-medium text-neutral-800 shadow-sm ring-1 ring-neutral-200 outline-none focus:ring-2 focus:ring-brand-400/40"
            >
              <option value="recommended">{t('recommended')}</option>
              <option value="lowestPrice">{t('lowestPrice')}</option>
              <option value="shortest">{t('shortest')}</option>
              <option value="earliest">{t('earliest')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
          {/* Desktop sidebar */}
          <aside className="hidden h-fit rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:block">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">{t('filters')}</h2>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-brand-700 hover:underline"
                >
                  {t('resetFilters')}
                </button>
              )}
            </div>
            {filterControls}
          </aside>

          {/* Results */}
          <section aria-live="polite" className="space-y-3">
            {flights.length > 0 ? (
              flights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  originCode={originCode}
                  destinationCode={destinationCode}
                  cabin={passengers.cabin}
                  payingPassengers={payingPassengers}
                  locale={locale}
                  persian={persian}
                  hShort={hShort}
                  mShort={mShort}
                  t={t}
                  tw={tw}
                  selectedFare={selectedFare}
                  expanded={expandedFlight === flight.id}
                  onCardClick={() =>
                    setExpandedFlight((current) => (current === flight.id ? null : flight.id))
                  }
                  onSelect={(fareId) => {
                    setSelectedFare(fareId);
                    setExpandedFlight(flight.id);
                  }}
                  onConfirmFare={(fareId, total) => setPendingFare({ id: fareId, total })}
                  onShowDetails={() => setDetailsFlight(flight)}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
                <h2 className="text-lg font-bold">{t('noResults')}</h2>
                <p className="mt-1 text-sm text-neutral-500">{t('noResultsHint')}</p>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 inline-flex h-10 items-center rounded-full bg-brand-400 px-5 text-sm font-bold text-black transition hover:bg-brand-500"
                  >
                    {t('resetFilters')}
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end bg-neutral-950/55 backdrop-blur-[1px] lg:hidden"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setMobileFiltersOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('filters')}
            className="animate-drawer-in max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pb-6 pt-4"
          >
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-neutral-300" />
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold">{t('filters')}</h2>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-brand-700"
              >
                {t('resetFilters')}
              </button>
            </div>
            {filterControls}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 h-12 w-full rounded-full bg-brand-400 text-sm font-bold text-black transition hover:bg-brand-500"
            >
              {t('showResults', { count: flights.length })}
            </button>
          </div>
        </div>
      )}

      {detailsFlight && (
        <DetailsDrawer
          flight={detailsFlight}
          originCode={originCode}
          destinationCode={destinationCode}
          originCity={originCity}
          destinationCity={destinationCity}
          activeDate={activeDate}
          locale={locale}
          persian={persian}
          hShort={hShort}
          mShort={mShort}
          t={t}
          onClose={() => setDetailsFlight(null)}
        />
      )}

      {pendingFare && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-neutral-950/60 p-4 pb-6 backdrop-blur-[1px] sm:pb-8"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setPendingFare(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="fare-confirmation-title"
            className="animate-popover flex w-full max-w-[38rem] flex-col gap-4 rounded-2xl bg-white p-5 shadow-2xl sm:flex-row sm:items-center sm:justify-between sm:px-7"
          >
            <div>
              <p id="fare-confirmation-title" className="text-xs text-neutral-600">
                {t('departureSelected')}
              </p>
              <p className="mt-1 text-lg font-semibold text-black">
                {formatPrice(pendingFare.total, locale)}
              </p>
              <p className="text-[11px] text-neutral-500">
                {t('totalAllPassengers')} · {tw('passengersCount', { count: totalTravelers })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams({
                  from: `${originCity} (${originCode})`,
                  to: `${destinationCity} (${destinationCode})`,
                  depart: activeDate,
                  fare: pendingFare.id,
                  price: formatPrice(pendingFare.total, locale),
                });
                setSelectedFare(pendingFare.id);
                setPendingFare(null);
                router.push(`/book/passengers?${params.toString()}`);
              }}
              className="h-12 w-full rounded-full bg-brand-400 px-10 text-sm font-bold text-black transition hover:bg-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40 sm:w-52"
            >
              {t('confirm')}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/* ----------------------------- filter controls --------------------------- */

function FilterControls({
  t,
  stops,
  time,
  priceCap,
  priceBounds,
  locale,
  onStops,
  onTime,
  onPrice,
}: {
  t: ReturnType<typeof useTranslations<'SearchResults'>>;
  stops: StopsFilter;
  time: TimeFilter;
  priceCap: number;
  priceBounds: { min: number; max: number };
  locale: string;
  onStops: (value: StopsFilter) => void;
  onTime: (value: TimeFilter) => void;
  onPrice: (value: number | null) => void;
}) {
  const stopsOptions: [StopsFilter, string][] = [
    ['all', t('anyStops')],
    ['nonstop', t('nonstop')],
    ['oneStop', t('oneStop')],
  ];
  const timeOptions: [TimeFilter, string][] = [
    ['all', t('flexible')],
    ['morning', t('morning')],
    ['afternoon', t('afternoon')],
    ['evening', t('evening')],
  ];

  return (
    <>
      <fieldset className="mt-5">
        <legend className="text-sm font-bold">{t('stops')}</legend>
        <div className="mt-3 space-y-2.5">
          {stopsOptions.map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700"
            >
              <input
                type="radio"
                name="filter-stops"
                checked={stops === value}
                onChange={() => onStops(value)}
                className="size-4 accent-black"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6 border-t border-neutral-200 pt-5">
        <legend className="text-sm font-bold">{t('departureTime')}</legend>
        <div className="mt-3 space-y-2.5">
          {timeOptions.map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700"
            >
              <input
                type="radio"
                name="filter-time"
                checked={time === value}
                onChange={() => onTime(value)}
                className="size-4 accent-black"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6 border-t border-neutral-200 pt-5">
        <div className="flex items-center justify-between">
          <legend className="text-sm font-bold">{t('maxPrice')}</legend>
          <span className="text-sm font-semibold text-brand-700">
            {formatPrice(priceCap, locale)}
          </span>
        </div>
        <input
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          step={5}
          value={priceCap}
          onChange={(event) => {
            const next = Number(event.target.value);
            onPrice(next >= priceBounds.max ? null : next);
          }}
          aria-label={t('maxPrice')}
          className="mt-3 w-full accent-black"
        />
        <div className="mt-1 flex justify-between text-[11px] text-neutral-500">
          <span>{formatPrice(priceBounds.min, locale)}</span>
          <span>{formatPrice(priceBounds.max, locale)}</span>
        </div>
      </fieldset>
    </>
  );
}

/* ------------------------------- flight card ----------------------------- */

function FlightCard({
  flight,
  originCode,
  destinationCode,
  cabin,
  payingPassengers,
  locale,
  persian,
  hShort,
  mShort,
  t,
  tw,
  selectedFare,
  expanded,
  onCardClick,
  onSelect,
  onConfirmFare,
  onShowDetails,
}: {
  flight: Flight;
  originCode: string;
  destinationCode: string;
  cabin: CabinKey;
  payingPassengers: number;
  locale: string;
  persian: boolean;
  hShort: string;
  mShort: string;
  t: ReturnType<typeof useTranslations<'SearchResults'>>;
  tw: ReturnType<typeof useTranslations<'Widget'>>;
  selectedFare: string | null;
  expanded: boolean;
  onCardClick: () => void;
  onSelect: (fareId: string) => void;
  onConfirmFare: (fareId: string, total: number) => void;
  onShowDetails: () => void;
}) {
  const nextDay = flight.arriveMinutes >= 1440;
  return (
    <article
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onClick={onCardClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onCardClick();
        }
      }}
      className="overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:border-neutral-300 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/30"
    >
      <div className="p-4 sm:px-[18px] sm:py-4">
        <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
          <div className="flex min-w-0 flex-col justify-between py-1 lg:pe-3">
            <div className="flex items-center justify-between gap-2 text-[11px] text-neutral-600">
              <span>
                <span className="font-semibold text-black">{flight.flightNumber}</span>
                <span> · {flight.aircraft}</span>
              </span>
              {flight.seatsLeft != null && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                  {t('seatsLeft', { count: flight.seatsLeft })}
                </span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-[1fr_minmax(7rem,1.35fr)_1fr] items-center gap-3">
              <div>
                <p className="text-2xl font-normal tracking-[-0.025em] text-black sm:text-[1.75rem]">
                  {minutesToTime(flight.departMinutes, locale)}
                </p>
                <p className="mt-1 text-xs font-medium text-neutral-600">{originCode}</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] text-neutral-500">
                  {formatDuration(flight.durationMinutes, hShort, mShort, locale)}
                </p>
                <div className="my-1.5 flex items-center gap-1.5">
                  <span className="h-px flex-1 bg-neutral-300" />
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-200">
                    <Image
                      src="/brand/logo.png"
                      alt="DotAir"
                      width={22}
                      height={22}
                      className="size-[1.375rem] object-contain"
                    />
                  </span>
                  <span className="h-px flex-1 bg-neutral-300" />
                </div>
                <p className="text-[11px] font-medium text-neutral-600">
                  {flight.stops === 0
                    ? t('direct')
                    : `1 ${t('stop')} · ${stopCityLabel(flight.stopCode, persian)}`}
                </p>
              </div>
              <div className="text-end">
                <p className="text-2xl font-normal tracking-[-0.025em] text-black sm:text-[1.75rem]">
                  {minutesToTime(flight.arriveMinutes, locale)}
                  {nextDay && (
                    <sup className="ms-0.5 text-[11px] font-semibold text-brand-700">
                      {t('nextDay')}
                    </sup>
                  )}
                </p>
                <p className="mt-1 text-xs font-medium text-neutral-600">{destinationCode}</p>
              </div>
            </div>
            <button
              type="button"
              className="mt-5 w-fit text-[11px] font-semibold text-neutral-900 underline underline-offset-2"
              onClick={(event) => {
                event.stopPropagation();
                onShowDetails();
              }}
            >
              {t('details')}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {FARE_COLUMNS.map((fareCabin) => {
              const fareId = `${flight.id}-${fareCabin}`;
              const isSelected = selectedFare?.startsWith(fareId) ?? false;
              const perPassenger = cabinPrice(flight, fareCabin);
              return (
                <button
                  key={fareCabin}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect(fareId);
                  }}
                  className={`min-h-[8.25rem] rounded-lg border p-3 text-start transition ${isSelected ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-400' : 'border-neutral-300 hover:border-brand-400 hover:bg-brand-50'}`}
                >
                  <span className="block text-xs font-medium text-neutral-500">
                    {tw(`cabins.${fareCabin}`)}
                  </span>
                  <span className="mt-3 block text-[1.35rem] font-normal tracking-[-0.025em] text-black">
                    {formatPrice(perPassenger, locale)}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-neutral-500">
                    {t('perPassenger')}
                  </span>
                  <span className="mt-1 block text-[11px] font-semibold text-brand-700">
                    {isSelected ? t('selected') : t('select')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {expanded && selectedFare?.startsWith(flight.id) && (
          <FareSelectionPanel
            flight={flight}
            cabin={cabin}
            payingPassengers={payingPassengers}
            locale={locale}
            t={t}
            tw={tw}
            selectedFare={selectedFare}
            onSelect={onSelect}
            onConfirmFare={onConfirmFare}
          />
        )}
      </div>
    </article>
  );
}

/* --------------------------- fare selection panel ------------------------ */

function FareSelectionPanel({
  flight,
  cabin,
  payingPassengers,
  locale,
  t,
  tw,
  selectedFare,
  onSelect,
  onConfirmFare,
}: {
  flight: Flight;
  cabin: CabinKey;
  payingPassengers: number;
  locale: string;
  t: ReturnType<typeof useTranslations<'SearchResults'>>;
  tw: ReturnType<typeof useTranslations<'Widget'>>;
  selectedFare: string;
  onSelect: (fareId: string) => void;
  onConfirmFare: (fareId: string, total: number) => void;
}) {
  const selectedCabin =
    FARE_COLUMNS.find((fareCabin) => selectedFare.startsWith(`${flight.id}-${fareCabin}`)) ?? cabin;
  const cabinLabel = tw(`cabins.${selectedCabin}`);
  const basePrice = cabinPrice(flight, selectedCabin);
  const upsellCabin = UPSELL_NEXT[selectedCabin];
  const perPax = Math.max(1, payingPassengers);

  return (
    <div className="mt-5 border-t border-neutral-200 pt-5">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-medium text-black">{t('selectFare')}</h3>
        <p className="mt-0.5 text-xs text-neutral-500">{t('compareFares')}</p>
      </div>

      {/* Horizontally scrollable fare-family row (Lufthansa-style comparison). */}
      <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
        {FARE_FAMILIES.map((family) => {
          const fareId = `${flight.id}-${selectedCabin}-${family.key}`;
          const price = basePrice + family.add;
          const isSelected = selectedFare === fareId;
          const values = FARE_VALUES[family.key] ?? [];
          const recommended = 'recommended' in family && family.recommended;
          return (
            <div
              key={family.key}
              className={`flex w-[16.5rem] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border bg-white transition ${isSelected || recommended ? 'border-brand-400 ring-1 ring-brand-400' : 'border-neutral-200'}`}
            >
              <div
                className={`relative px-4 pb-4 pt-5 text-center ${recommended ? 'bg-brand-400 text-black' : 'bg-neutral-800 text-white'}`}
              >
                {recommended && (
                  <span className="absolute inset-x-0 top-0 bg-black/85 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {t('recommended')}
                  </span>
                )}
                <p className={`text-[11px] ${recommended ? 'mt-3 text-black/70' : 'opacity-80'}`}>
                  {t('from')}
                </p>
                <p className="mt-0.5 text-[1.6rem] font-semibold leading-none tracking-tight">
                  {formatPrice(price, locale)}
                </p>
                <p className="mt-2 text-sm font-medium">
                  {cabinLabel} {t(`fareFamilies.${family.key}`)}
                </p>
              </div>

              <ul className="flex-1 divide-y divide-neutral-100 px-4">
                {FARE_ROWS.map((row, index) => {
                  const raw = values[index] ?? '';
                  const value = FARE_STATUS.has(raw) ? t(`fareValues.${raw}`) : raw;
                  return (
                    <li key={row.key} className="flex items-start gap-2.5 py-2.5">
                      <row.Icon className="mt-0.5 size-4 shrink-0 text-neutral-400" />
                      <div className="min-w-0 text-start">
                        <p className="text-[11px] font-medium text-neutral-500">
                          {t(`fareRows.${row.key}`)}
                        </p>
                        <p className={`text-xs font-semibold ${fareValueTone(raw)}`}>{value}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="p-3">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onConfirmFare(fareId, price * perPax);
                  }}
                  className={`h-11 w-full rounded-full text-sm font-bold transition ${isSelected ? 'bg-brand-400 text-black' : 'border border-neutral-300 text-black hover:border-brand-400 hover:bg-brand-50'}`}
                >
                  {isSelected ? t('selected') : t('selectFare')}
                </button>
              </div>
            </div>
          );
        })}

        {/* Next-cabin upsell card */}
        {upsellCabin && (
          <div className="flex w-[15rem] shrink-0 snap-start flex-col rounded-2xl bg-neutral-900 p-5 text-white">
            <p className="text-[11px] opacity-70">{t('from')}</p>
            <p className="mt-0.5 text-[1.6rem] font-semibold leading-none tracking-tight">
              {formatPrice(cabinPrice(flight, upsellCabin), locale)}
            </p>
            <p className="mt-1 text-sm font-medium">{tw(`cabins.${upsellCabin}`)}</p>
            <ul className="mt-4 flex-1 space-y-3">
              {BUSINESS_PERKS.map((perk) => (
                <li key={perk.key} className="flex items-center gap-2.5 text-xs">
                  <perk.Icon className="size-4 shrink-0 text-brand-400" />
                  {t(`businessPerks.${perk.key}`)}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSelect(`${flight.id}-${upsellCabin}`);
              }}
              className="mt-5 h-11 w-full rounded-full bg-brand-400 text-sm font-bold text-black transition hover:bg-brand-500"
            >
              {t('view')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ details drawer --------------------------- */

function DetailsDrawer({
  flight,
  originCode,
  destinationCode,
  originCity,
  destinationCity,
  activeDate,
  locale,
  persian,
  hShort,
  mShort,
  t,
  onClose,
}: {
  flight: Flight;
  originCode: string;
  destinationCode: string;
  originCity: string;
  destinationCity: string;
  activeDate: string;
  locale: string;
  persian: boolean;
  hShort: string;
  mShort: string;
  t: ReturnType<typeof useTranslations<'SearchResults'>>;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-neutral-950/55 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="flight-details-title"
        className="animate-drawer-in absolute inset-y-0 end-0 w-full max-w-[29rem] overflow-y-auto bg-white px-6 py-5 text-black shadow-2xl sm:px-7"
      >
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <h2 id="flight-details-title" className="text-sm font-medium">
            {t('details')}
          </h2>
          <button
            type="button"
            autoFocus
            aria-label={t('close')}
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-full text-2xl font-light text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="pt-5">
          <h3 className="text-sm font-semibold">
            {originCity} → {destinationCity}
          </h3>
          <p className="mt-2 text-xs text-neutral-600">
            {new Intl.DateTimeFormat(persian ? 'fa-IR' : intlLocale(locale), {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }).format(new Date(`${activeDate}T12:00:00`))}
          </p>

          <div className="mt-5 grid grid-cols-[3.5rem_1.5rem_minmax(0,1fr)] grid-rows-[auto_5rem_auto] text-xs">
            <span className="pt-0.5 font-semibold">{minutesToTime(flight.departMinutes, locale)}</span>
            <span className="relative flex justify-center">
              <span className="absolute top-2 h-[calc(100%+5rem)] w-px bg-neutral-400" />
              <span className="relative z-10 mt-0.5 size-3 rounded-full border border-neutral-600 bg-white" />
            </span>
            <div>
              <p className="font-semibold">{originCity}</p>
              <p className="mt-1 text-[11px] text-neutral-500">{originCode}</p>
            </div>

            <span className="self-center text-[11px] text-neutral-700">
              {formatDuration(flight.durationMinutes, hShort, mShort, locale)}
            </span>
            <span className="relative z-10 flex items-center justify-center">
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-white text-black">
                <PlaneIcon className="size-5 rtl:-scale-x-100" />
              </span>
            </span>
            <div className="self-center">
              <p className="font-medium">
                {flight.flightNumber} · {flight.aircraft}
              </p>
              <p className="mt-1 text-[11px] text-neutral-500">{t('operatedBy')}</p>
            </div>

            <span className="pt-0.5 font-semibold">
              {minutesToTime(flight.arriveMinutes, locale)}
            </span>
            <span className="relative flex justify-center">
              <span className="relative z-10 mt-0.5 size-3 rounded-full border border-neutral-600 bg-white" />
            </span>
            <div>
              <p className="font-semibold">{destinationCity}</p>
              <p className="mt-1 text-[11px] text-neutral-500">{destinationCode}</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
