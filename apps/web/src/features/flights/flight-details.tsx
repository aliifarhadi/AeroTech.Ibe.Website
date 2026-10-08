'use client';

import { useTranslations } from 'next-intl';
import { cityOfAirport, clockTime, dayOffset, type Flight } from '@aerotech/domain';
import { useFormatters } from '../shared/use-duration';

/** Sample check-in cut-offs, in minutes before departure. */
const CHECK_IN_CLOSES = { domestic: 45, international: 60 };

function Time({ minutes }: { minutes: number }) {
  const days = dayOffset(minutes);
  return (
    <time dir="ltr" className="font-mono text-small whitespace-nowrap">
      {clockTime(minutes)}
      {days > 0 ? <sup>+{days}</sup> : null}
    </time>
  );
}

/** Airports, terminals, times, any stop and the aircraft. Terminals and cut-offs are sample values. */
export function FlightDetails({ flight, dateLabel }: { flight: Flight; dateLabel: string }) {
  const t = useTranslations();
  const { duration, grouped } = useFormatters();

  const airport = (code: string) =>
    code === 'THR'
      ? t('flights.detail.mehrabad')
      : code === 'IKA'
        ? t('flights.detail.imamKhomeini')
        : t(`cities.${code}.airport`);
  const terminal = (code: string) =>
    code === 'THR'
      ? t('flights.detail.terminal4')
      : code === 'IKA'
        ? t('flights.detail.terminal1')
        : code === 'IST'
          ? t('flights.detail.terminalIntl')
          : t('flights.detail.terminalDomestic');
  const closes =
    flight.departure - CHECK_IN_CLOSES[flight.international ? 'international' : 'domestic'];

  const point = (minutes: number, code: string, note: string) => (
    <li>
      <Time minutes={minutes} />
      <div className="flex flex-col">
        <span className="text-small font-bold">
          {t(`cities.${cityOfAirport(code)}.name`)} · {airport(code)}{' '}
          <span dir="ltr" className="ms-1 font-mono text-caption font-normal text-muted">
            {code}
          </span>
        </span>
        <span className="text-caption text-muted">{note}</span>
      </div>
    </li>
  );
  const segment = (minutes: number) => (
    <li data-kind="segment">
      <span />
      <div className="text-caption text-muted">
        {t('flights.detail.flightTime', { duration: duration(minutes) })} ·{' '}
        <bdi dir="ltr" className="font-mono">
          {flight.number} · Airbus A320
        </bdi>{' '}
        · {t('flights.detail.operated')}
      </div>
    </li>
  );

  const facts = [
    [t('flights.detail.date'), dateLabel],
    [t('flights.detail.totalTime'), duration(flight.duration)],
    [
      t('flights.detail.distance'),
      t('flights.detail.km', { distance: grouped(flight.distanceKm) }),
    ],
    [t('flights.detail.onBoard'), t('flights.detail.refreshments')],
  ] as const;

  return (
    <div className="border-t border-hairline px-4 py-4 md:px-5">
      <ol className="fl-timeline">
        {point(
          flight.departure,
          flight.from,
          t('flights.detail.checkIn', {
            terminal: terminal(flight.from),
            time: `⁦${clockTime(closes)}⁩`,
          }),
        )}
        {flight.stop ? (
          <>
            {segment(flight.stop.firstSegment)}
            {point(
              flight.departure + flight.stop.firstSegment,
              flight.stop.code,
              terminal(flight.stop.code),
            )}
            <li data-kind="stop">
              <span />
              <div className="flex flex-col">
                <span className="text-small font-bold text-action">
                  {t('flights.detail.stopIn', {
                    city: t(`cities.${flight.stop.code}.name`),
                    duration: duration(flight.stop.layover),
                  })}
                </span>
                <span className="text-caption text-muted">{t('flights.detail.stopNote')}</span>
              </div>
            </li>
            {segment(flight.stop.secondSegment)}
          </>
        ) : (
          segment(flight.duration)
        )}
        {point(
          flight.arrival,
          flight.to,
          t('flights.detail.belt', { terminal: terminal(flight.to) }),
        )}
      </ol>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-hairline pt-4 md:grid-cols-4">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-caption text-muted">{label}</dt>
            <dd className="text-small font-bold">{value}</dd>
          </div>
        ))}
      </dl>
      {flight.international ? (
        <p className="mt-3 text-caption text-muted">{t('flights.detail.localTimes')}</p>
      ) : null}
    </div>
  );
}
