'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { clockTime, dayOffset, type CabinCode, type Flight } from '@aerotech/domain';
import { Icon } from '@aerotech/ui';
import { useFormatters } from '../shared/use-duration';
import { fareOf, type Selection } from './model';
import { useMoney } from './use-money';

type FlightCardProps = {
  flight: Flight;
  /** The cabin whose fares are open on this card, if any. */
  openCabin: CabinCode | null;
  /** Set when this flight is the confirmed choice for the leg. */
  chosen: Selection | null;
  detailsOpen: boolean;
  onToggleDetails: () => void;
  onToggleCabin: (cabin: CabinCode) => void;
  details: ReactNode;
  children: ReactNode;
};

function Clock({ minutes, code, label }: { minutes: number; code: string; label: string }) {
  const days = dayOffset(minutes);
  return (
    <span className="flex flex-col">
      <span className="font-mono text-subheading leading-tight font-bold text-strong">
        {clockTime(minutes)}
        {days > 0 ? (
          <sup className="text-caption font-normal text-action" title={label}>
            +{days}
          </sup>
        ) : null}
      </span>
      <span className="font-mono text-caption tracking-wide text-muted">{code}</span>
    </span>
  );
}

/** One flight: times and stops, then a price button per cabin that opens fares and seats. */
export function FlightCard({
  flight,
  openCabin,
  chosen,
  detailsOpen,
  onToggleDetails,
  onToggleCabin,
  details,
  children,
}: FlightCardProps) {
  const t = useTranslations();
  const money = useMoney();
  const { duration } = useFormatters();

  const cabinButton = (cabin: CabinCode) => {
    const soldOut = cabin === 'BUSINESS' && flight.businessSoldOut;
    const name = cabin === 'BUSINESS' ? t('flights.business') : t('flights.economy');
    return (
      <button
        type="button"
        disabled={soldOut}
        aria-expanded={openCabin === cabin}
        onClick={() => onToggleCabin(cabin)}
        className="flex min-h-18 cursor-pointer flex-col justify-center rounded-group border border-hairline bg-surface-1 px-3.5 py-2 text-start transition-colors duration-(--duration-fast) hover:border-action-line disabled:cursor-default disabled:hover:border-hairline aria-expanded:border-action aria-expanded:bg-action-softer"
      >
        <span className="text-caption text-muted">
          {soldOut ? name : t('flights.cabinFrom', { cabin: name })}
        </span>
        <span
          className={`text-field font-bold whitespace-nowrap ${soldOut ? 'text-faint' : 'text-strong'}`}
        >
          {soldOut
            ? t('flights.soldOut')
            : money.format(fareOf(flight, cabin, null, money.currency))}
        </span>
        {cabin === 'ECONOMY' && flight.seatsLeft ? (
          <span className="text-caption text-danger-soft">
            {t('flights.seatsLeft', { count: flight.seatsLeft })}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <article
      data-flight={flight.id}
      data-open={openCabin !== null || undefined}
      data-chosen={chosen !== null || undefined}
      className="overflow-hidden rounded-card border border-hairline bg-surface-2 transition-colors duration-(--duration-base) data-chosen:border-action-line data-open:border-strong-line"
    >
      <div className="fl-row p-3 md:p-4">
        <div className="flex min-w-0 flex-col justify-between gap-3 px-1">
          <div dir="ltr" className="flex items-center gap-3">
            <Clock minutes={flight.departure} code={flight.from} label={t('flights.nextDay')} />
            <span
              dir="auto"
              className="flex min-w-0 flex-1 flex-col items-center text-caption text-muted"
            >
              <span>{duration(flight.duration)}</span>
              <span className="relative my-1 h-px w-full bg-hover-line">
                {flight.stop ? (
                  <span className="absolute top-1/2 start-1/2 size-2 -translate-1/2 rounded-chip border border-action bg-surface-2" />
                ) : null}
              </span>
              <span className={flight.stop ? 'text-action' : ''}>
                {flight.stop
                  ? t('flights.oneStop', { city: t(`cities.${flight.stop.code}.name`) })
                  : t('flights.nonstop')}
              </span>
            </span>
            <span className="text-end">
              <Clock minutes={flight.arrival} code={flight.to} label={t('flights.nextDay')} />
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-muted">
            <span dir="ltr" className="font-mono tracking-wide">
              {flight.number}
            </span>
            <span>Airbus A320</span>
            <button
              type="button"
              aria-expanded={detailsOpen}
              onClick={onToggleDetails}
              className="group -my-2 inline-flex min-h-10 cursor-pointer items-center gap-1 text-small text-soft underline underline-offset-4 hover:text-strong"
            >
              {t('flights.details')}
              <Icon
                name="chevron-down"
                size={14}
                className="transition-transform duration-(--duration-base) group-aria-expanded:rotate-180"
              />
            </button>
            {chosen ? (
              <span className="inline-flex items-center gap-1 font-bold text-action">
                <Icon name="check" size={14} />
                {t('flights.yourChoice', { fare: t(`flights.families.${chosen.family}`) })}
              </span>
            ) : null}
          </div>
        </div>
        {cabinButton('ECONOMY')}
        {cabinButton('BUSINESS')}
      </div>
      {detailsOpen ? details : null}
      {children}
    </article>
  );
}
