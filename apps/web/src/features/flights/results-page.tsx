'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  addDaysIso,
  defaultFamily,
  draftFromQuery,
  flightsFor,
  inTimeOfDay,
  lowestFactor,
  adultFare,
  mayOccupy,
  passengerTotal,
  routeBetween,
  sortFlights,
  toSearchQuery,
  type CabinCode,
  type Flight,
  type Seat,
  type TimeOfDay,
  type TripDraft,
} from '@aerotech/domain';
import {
  Button,
  DateFormatter,
  getLocalTimeZone,
  Icon,
  parseDate,
  SegmentedControl,
  toBcp47,
  today,
  ToggleChip,
  useToast,
} from '@aerotech/ui';
import { Link } from '@/i18n/navigation';
import { FareFamilies } from './fare-families';
import { FlightCard } from './flight-card';
import { FlightDetails } from './flight-details';
import { priceOf, type Leg, type Selection } from './model';
import { ResultsSkeleton } from './results-skeleton';
import { SeatMap } from './seat-map';
import { SeatPanel } from './seat-panel';
import { SummaryBar, TripSummary, type SummaryProps } from './trip-summary';
import { useMoney } from './use-money';

const STEPS = ['select', 'passengers', 'extras', 'payment'] as const;
const TIMES: readonly TimeOfDay[] = ['morning', 'afternoon', 'evening'];

/** Reads the search from the address bar. The page itself is static, so this runs in the browser. */
export function ResultsPage() {
  const t = useTranslations('flights.invalid');
  const params = useSearchParams();
  const [draft, setDraft] = useState<TripDraft | null | undefined>(undefined);

  useEffect(() => setDraft(draftFromQuery(new URLSearchParams(params.toString()))), [params]);

  if (draft === undefined) return <ResultsSkeleton />;
  if (draft === null) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-gutter py-section text-center">
        <span className="flex size-14 items-center justify-center rounded-chip bg-action-soft text-action">
          <Icon name="search" size={26} />
        </span>
        <h1 className="text-heading font-bold text-strong">{t('title')}</h1>
        <p className="text-muted">{t('body')}</p>
        <Link
          href="/#book"
          className="inline-flex h-12 items-center gap-2 rounded-control bg-action px-5 font-bold text-on-action transition-colors duration-(--duration-fast) hover:bg-action-hover"
        >
          {t('cta')}
          <Icon name="arrow" size={16} />
        </Link>
      </div>
    );
  }
  return <Results key={toSearchQuery(draft)} initial={draft} />;
}

function Results({ initial }: { initial: TripDraft }) {
  const t = useTranslations();
  const locale = toBcp47(useLocale());
  const money = useMoney();
  const toast = useToast();
  const zone = getLocalTimeZone();
  const todayIso = useMemo(() => today(zone).toString(), [zone]);

  const [dates, setDates] = useState<[string, string | null]>([initial.depart, initial.return]);
  const [selections, setSelections] = useState<Array<Selection | null>>(
    initial.trip === 'round' ? [null, null] : [null],
  );
  const [activeLeg, setActiveLeg] = useState(0);
  const [pending, setPending] = useState<Selection | null>(null);
  const [detailsOf, setDetailsOf] = useState<string | null>(null);
  const [sort, setSort] = useState<'departure' | 'price'>('departure');
  const [time, setTime] = useState<TimeOfDay | null>(null);
  const [traveller, setTraveller] = useState(0);
  const [inspected, setInspected] = useState<string | null>(null);
  const [seatMessage, setSeatMessage] = useState('');
  const list = useRef<HTMLDivElement>(null);
  const ribbon = useRef<HTMLDivElement>(null);

  const destination = initial.to ?? '';
  const legs: Leg[] = [
    { origin: initial.from, destination, date: dates[0] },
    ...(initial.trip === 'round' && dates[1]
      ? [{ origin: destination, destination: initial.from, date: dates[1] }]
      : []),
  ];
  const leg = legs[activeLeg] ?? legs[0]!;
  const party = { adults: initial.adults, children: initial.children, infants: initial.infants };
  const seated = initial.adults + initial.children;
  const passengersLabel = t('booking.passengersCount', { count: passengerTotal(initial) });

  const dayMonth = new DateFormatter(locale, { day: 'numeric', month: 'short' });
  const weekday = new DateFormatter(locale, { weekday: 'short' });
  const asDate = (iso: string) => parseDate(iso).toDate(zone);
  const dateLabel = (iso: string) =>
    `${weekday.format(asDate(iso))} ${dayMonth.format(asDate(iso))}`;

  // Keep the address bar in step with the dates, so a reload or a shared link shows the same search.
  useEffect(() => {
    const query = toSearchQuery({ ...initial, depart: dates[0], return: dates[1] });
    window.history.replaceState(null, '', `${window.location.pathname}?${query}`);
  }, [dates, initial]);

  // Seven days around the chosen one, never before today or, on the return, before the outbound.
  const earliest = activeLeg === 1 ? dates[0] : todayIso;
  const ribbonStart = addDaysIso(leg.date, -3) < earliest ? earliest : addDaysIso(leg.date, -3);
  const route = routeBetween(leg.origin, leg.destination);
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDaysIso(ribbonStart, i);
    const factor = lowestFactor(leg.origin, leg.destination, date);
    return {
      date,
      price:
        factor && route ? adultFare(route.distanceKm, factor, 'ECONOMY', 0, money.currency) : null,
    };
  });
  const cheapest = Math.min(...days.flatMap((day) => (day.price ? [day.price] : [])));

  useEffect(() => {
    const box = ribbon.current;
    const current = box?.querySelector('[aria-pressed="true"]');
    if (!box || !(current instanceof HTMLElement) || box.scrollWidth <= box.clientWidth) return;
    const a = box.getBoundingClientRect();
    const b = current.getBoundingClientRect();
    box.scrollBy({ left: b.left + b.width / 2 - (a.left + a.width / 2) });
  }, [leg.date, activeLeg]);

  const all = flightsFor(leg.origin, leg.destination, leg.date);
  const flights = sortFlights(time ? all.filter((flight) => inTimeOfDay(flight, time)) : all, sort);

  const reset = () => {
    setPending(null);
    setDetailsOf(null);
    setInspected(null);
    setSeatMessage('');
  };
  const goToLeg = (index: number) => {
    reset();
    setTime(null);
    setActiveLeg(index);
    window.scrollTo({ top: 0 });
  };

  function chooseDay(date: string) {
    if (date === leg.date) return;
    reset();
    const next = [...selections];
    next[activeLeg] = null;
    if (activeLeg === 0) {
      // A return before the new outbound makes no sense: move it to the same day and reselect.
      const back = dates[1] !== null && dates[1] < date ? date : dates[1];
      if (back !== dates[1]) next[1] = null;
      setDates([date, back]);
    } else {
      setDates([dates[0], date]);
    }
    setSelections(next);
  }

  function toggleCabin(flight: Flight, cabin: CabinCode) {
    if (pending?.flight.id === flight.id && pending.cabin === cabin) return reset();
    const confirmed = selections[activeLeg];
    const same = confirmed?.flight.id === flight.id && confirmed.cabin === cabin ? confirmed : null;
    const seats = same ? [...same.seats] : Array<null>(seated).fill(null);
    setPending({ flight, cabin, family: same?.family ?? defaultFamily(cabin), seats });
    setTraveller(
      Math.max(
        0,
        seats.findIndex((seat) => !seat),
      ),
    );
    setInspected(null);
    setSeatMessage('');
    requestAnimationFrame(() => {
      const card = list.current?.querySelector(`[data-flight="${flight.id}"]`);
      if (!card) return;
      const top = card.getBoundingClientRect().top + window.scrollY - 84;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
      // Bring the chosen cabin into view inside the aircraft.
      const first = card.querySelector('.fl-seat:not(:disabled)');
      const cabinBox = card.querySelector('.fl-cabin');
      if (first instanceof HTMLElement && cabinBox instanceof HTMLElement) {
        cabinBox.scrollTop = Math.max(0, first.offsetTop - cabinBox.offsetTop - 90);
      }
    });
  }

  function pickSeat(seat: Seat) {
    if (!pending) return;
    setInspected(seat.id);
    setSeatMessage('');
    const seats = [...pending.seats];
    const mine = seats.findIndex((chosen) => chosen?.id === seat.id);
    if (mine >= 0) {
      seats[mine] = null;
      setTraveller(mine);
    } else if (!mayOccupy(seat.id, traveller < initial.adults ? 'adult' : 'child')) {
      setSeatMessage(t('flights.seats.childExit'));
      return;
    } else {
      seats[traveller] = { id: seat.id, extraLegroom: seat.extraLegroom };
      const next = seats.findIndex((chosen) => !chosen);
      if (next >= 0) setTraveller(next);
    }
    setPending({ ...pending, seats });
  }

  function confirm() {
    if (!pending) return;
    const next = [...selections];
    next[activeLeg] = pending;
    setSelections(next);
    reset();
    const open = next.findIndex((selection) => !selection);
    if (open >= 0) {
      setTime(null);
      setActiveLeg(open);
      toast.show(t('flights.summary.outboundDone'));
      window.scrollTo({ top: 0 });
    }
  }

  const summary: SummaryProps = {
    legs,
    selections,
    activeLeg,
    pending,
    party,
    passengersLabel,
    dateLabel,
    onConfirm: confirm,
    onChangeLeg: goToLeg,
    onContinue: () => toast.show(t('flights.summary.nextStep'), 4600),
  };
  const pendingPrice = priceOf(pending, party, money.currency);
  const editQuery = toSearchQuery({ ...initial, depart: dates[0], return: dates[1] });

  return (
    <>
      <div className="sticky top-(--header-height) z-10 border-b border-hairline bg-canvas/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-page items-center gap-3 px-gutter py-2.5">
          <Link
            href="/"
            aria-label={t('flights.back')}
            className="flex size-10 shrink-0 items-center justify-center rounded-chip border border-strong-line text-default transition-colors duration-(--duration-fast) hover:border-action hover:text-action"
          >
            <Icon name="chevron-back" size={18} />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <h1 className="flex items-center gap-2 truncate text-field font-bold text-strong">
              {t(`cities.${initial.from}.name`)}
              <Icon name={legs.length > 1 ? 'swap' : 'arrow'} size={16} className="text-muted" />
              {t(`cities.${destination}.name`)}
            </h1>
            <p className="truncate text-caption text-muted">
              {dayMonth.format(asDate(dates[0]))}
              {dates[1] ? ` – ${dayMonth.format(asDate(dates[1]))}` : ''} · {passengersLabel} ·{' '}
              {initial.cabin === 'BUSINESS' ? t('flights.business') : t('flights.economy')}
            </p>
          </div>
          <Link
            href={`/?${editQuery}#book`}
            className="inline-flex h-10 shrink-0 items-center rounded-control border border-strong-line px-4 text-small font-bold whitespace-nowrap transition-colors duration-(--duration-fast) hover:border-hover-line hover:bg-surface-hover"
          >
            {t('flights.editSearch')}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-page px-gutter pt-4 pb-28 xl:pb-section">
        <ol aria-label={t('flights.stepsAria')} className="flex gap-2 text-small">
          {STEPS.map((step, i) => (
            <li
              key={step}
              aria-current={i === 0 ? 'step' : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-chip px-3 py-1.5 whitespace-nowrap ${i === 0 ? 'bg-surface-3 font-bold text-strong' : 'text-faint'}`}
            >
              <span
                className={`flex size-5 items-center justify-center rounded-chip text-caption ${i === 0 ? 'bg-action text-on-action' : 'border border-strong-line'}`}
              >
                {new Intl.NumberFormat(locale).format(i + 1)}
              </span>
              <span className={i === 0 ? '' : 'max-md:sr-only'}>{t(`flights.steps.${step}`)}</span>
            </li>
          ))}
        </ol>

        <div className="fl-layout mt-4">
          <div className="flex min-w-0 flex-col gap-3">
            {legs.length > 1 ? (
              <div
                role="group"
                aria-label={t('flights.legsAria')}
                className="grid grid-cols-2 gap-2"
              >
                {legs.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={i === activeLeg}
                    onClick={() => goToLeg(i)}
                    className="flex min-w-0 cursor-pointer flex-col rounded-group border border-hairline px-4 py-2.5 text-start transition-colors duration-(--duration-fast) hover:border-hover-line aria-pressed:border-strong-line aria-pressed:bg-surface-3"
                  >
                    <span className="flex items-center gap-1.5 truncate text-caption text-muted">
                      {i === 0 ? t('flights.outbound') : t('flights.return')} ·{' '}
                      {dateLabel(item.date)}
                      {selections[i] ? (
                        <Icon name="check" size={14} className="text-success" />
                      ) : null}
                    </span>
                    <span className="flex items-center gap-1.5 truncate font-bold">
                      {t(`cities.${item.origin}.name`)}
                      <Icon name="arrow" size={14} className="text-muted" />
                      {t(`cities.${item.destination}.name`)}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            <div
              ref={ribbon}
              role="group"
              aria-label={t('flights.datesAria')}
              className="home-rail -mx-gutter flex gap-2 overflow-x-auto px-gutter md:mx-0 md:grid md:grid-cols-7 md:px-0"
            >
              {days.map((day) => (
                <button
                  key={day.date}
                  type="button"
                  aria-pressed={day.date === leg.date}
                  onClick={() => chooseDay(day.date)}
                  className="flex min-w-24 shrink-0 cursor-pointer flex-col items-center rounded-group border border-hairline px-2 py-2 transition-colors duration-(--duration-fast) hover:border-hover-line aria-pressed:border-action aria-pressed:bg-action-softer md:min-w-0"
                >
                  <span className="text-caption text-muted">
                    {weekday.format(asDate(day.date))}
                  </span>
                  <span className="text-small font-bold whitespace-nowrap">
                    {dayMonth.format(asDate(day.date))}
                  </span>
                  <span
                    className={`text-caption whitespace-nowrap ${day.price === cheapest ? 'font-bold text-action' : 'text-muted'}`}
                  >
                    {day.price
                      ? t('flights.fromPrice', { price: money.short(day.price) })
                      : t('flights.noService')}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <h2 className="text-title font-bold text-strong">
                {t(activeLeg === 0 ? 'flights.countOutbound' : 'flights.countReturn', {
                  count: flights.length,
                })}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <SegmentedControl
                  aria-label={t('flights.sortAria')}
                  size="sm"
                  className="bg-surface-1"
                  value={sort}
                  onChange={setSort}
                  options={[
                    { id: 'departure', label: t('flights.earliest') },
                    { id: 'price', label: t('flights.cheapest') },
                  ]}
                />
                <div role="group" aria-label={t('flights.timeAria')} className="flex gap-2">
                  {TIMES.map((band) => (
                    <ToggleChip
                      key={band}
                      isSelected={time === band}
                      onChange={(on) => {
                        reset();
                        setTime(on ? band : null);
                      }}
                    >
                      {t(`flights.${band}`)}
                    </ToggleChip>
                  ))}
                </div>
              </div>
            </div>

            <div ref={list} className="flex flex-col gap-3">
              {flights.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-card border border-hairline bg-surface-1 px-6 py-10 text-center">
                  <p className="text-title font-bold text-strong">{t('flights.emptyTitle')}</p>
                  <p className="text-small text-muted">
                    {t('flights.emptyBody', { count: all.length })}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onPress={() => setTime(null)}
                  >
                    {t('flights.clearFilter')}
                  </Button>
                </div>
              ) : null}
              {flights.map((flight) => {
                const open = pending?.flight.id === flight.id ? pending : null;
                const confirmed = selections[activeLeg];
                return (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    openCabin={open?.cabin ?? null}
                    chosen={confirmed?.flight.id === flight.id ? confirmed : null}
                    detailsOpen={detailsOf === flight.id}
                    onToggleDetails={() => setDetailsOf(detailsOf === flight.id ? null : flight.id)}
                    onToggleCabin={(cabin) => toggleCabin(flight, cabin)}
                    details={<FlightDetails flight={flight} dateLabel={dateLabel(leg.date)} />}
                  >
                    {open ? (
                      <div className="border-t border-hairline p-3 md:p-4">
                        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4">
                          <h3 className="text-title font-bold text-strong">
                            {t('flights.chooseFare')}
                          </h3>
                          <span className="text-caption text-muted">{t('flights.perAdult')}</span>
                        </div>
                        <FareFamilies
                          selection={open}
                          onChoose={(family) => setPending({ ...open, family })}
                        />
                        <div className="fl-seatbox mt-4 overflow-hidden rounded-group border border-hairline bg-canvas">
                          <SeatPanel
                            selection={open}
                            party={party}
                            activeTraveller={traveller}
                            onTravellerChange={(index) => {
                              setSeatMessage('');
                              setTraveller(index);
                            }}
                            inspected={inspected}
                            message={seatMessage}
                          />
                          <div className="border-t border-hairline lg:border-s lg:border-t-0">
                            <SeatMap selection={open} onPick={pickSeat} onInspect={setInspected} />
                          </div>
                        </div>
                        <div className="mt-4 hidden items-center justify-between gap-4 xl:flex">
                          <div className="flex flex-col">
                            <span className="text-caption text-muted">
                              {t(`flights.families.${open.family}`)} · {passengersLabel}
                            </span>
                            <span className="text-title font-bold text-strong">
                              {money.format(pendingPrice.total)}
                            </span>
                          </div>
                          <Button onPress={confirm}>
                            {t('flights.selectFlight')}
                            <Icon name="arrow" size={16} />
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </FlightCard>
                );
              })}
            </div>
            <p className="mx-1 mt-1 text-caption text-faint">{t('flights.sampleNote')}</p>
          </div>
          <TripSummary {...summary} />
        </div>
      </div>
      <SummaryBar {...summary} />
    </>
  );
}
