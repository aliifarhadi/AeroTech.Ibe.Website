'use client';

import { useTranslations } from 'next-intl';
import { clockTime } from '@aerotech/domain';
import { Button, Icon } from '@aerotech/ui';
import { priceOf, type Leg, type Party, type Selection } from './model';
import { useMoney } from './use-money';

export type SummaryProps = {
  legs: Leg[];
  /** Confirmed choice per leg. */
  selections: Array<Selection | null>;
  activeLeg: number;
  /** The flight being configured on the active leg, not yet confirmed. */
  pending: Selection | null;
  party: Party;
  passengersLabel: string;
  dateLabel: (iso: string) => string;
  onConfirm: () => void;
  onChangeLeg: (index: number) => void;
  onContinue: () => void;
};

function useSummary({ legs, selections, activeLeg, pending, party }: SummaryProps) {
  const money = useMoney();
  const effective = legs.map((_, i) =>
    i === activeLeg && pending ? pending : (selections[i] ?? null),
  );
  const prices = effective.map((selection) => priceOf(selection, party, money.currency));
  return {
    money,
    effective,
    fares: prices.reduce((sum, price) => sum + price.fares, 0),
    seats: prices.reduce((sum, price) => sum + price.seats, 0),
    total: prices.reduce((sum, price) => sum + price.total, 0),
    nextLeg: selections.findIndex((selection) => !selection),
  };
}

/** The one primary action: confirm the open flight, move to the next leg, or continue. */
function Action({
  props,
  nextLeg,
  short,
}: {
  props: SummaryProps;
  nextLeg: number;
  short?: boolean;
}) {
  const t = useTranslations('flights');
  const { pending, activeLeg, onConfirm, onChangeLeg, onContinue } = props;
  if (pending) {
    return (
      <Button fullWidth={!short} onPress={onConfirm}>
        {t('selectFlight')}
        <Icon name="arrow" size={16} />
      </Button>
    );
  }
  if (nextLeg === -1) {
    return (
      <Button fullWidth={!short} onPress={onContinue}>
        {short ? t('summary.continueShort') : t('summary.continue')}
        <Icon name="arrow" size={16} />
      </Button>
    );
  }
  if (nextLeg === activeLeg) {
    return (
      <Button fullWidth={!short} isDisabled>
        {nextLeg === 0 ? t('summary.selectOutbound') : t('summary.selectReturn')}
      </Button>
    );
  }
  return (
    <Button fullWidth={!short} onPress={() => onChangeLeg(nextLeg)}>
      {nextLeg === 0 ? t('summary.chooseOutbound') : t('summary.chooseReturn')}
      <Icon name="arrow" size={16} />
    </Button>
  );
}

/** Sticky summary beside the results: each leg, the price so far and the next step. */
export function TripSummary(props: SummaryProps) {
  const t = useTranslations();
  const { legs, selections, activeLeg, pending, passengersLabel, dateLabel, onChangeLeg } = props;
  const { money, effective, fares, seats, total, nextLeg } = useSummary(props);

  return (
    <aside
      aria-label={t('flights.summary.title')}
      className="hidden flex-col gap-4 rounded-card border border-hairline bg-surface-2 p-5 xl:sticky xl:top-20 xl:flex"
    >
      <h2 className="text-title font-bold text-strong">{t('flights.summary.title')}</h2>
      {legs.map((leg, i) => {
        const selection = effective[i];
        const unconfirmed = i === activeLeg && pending !== null;
        const seatIds = selection?.seats.flatMap((seat) => (seat ? [seat.id] : [])) ?? [];
        return (
          <div key={i} className="flex flex-col gap-0.5 border-t border-hairline pt-3 text-small">
            <div className="flex items-center justify-between gap-2 text-caption text-muted">
              <span>
                {i === 0 ? t('flights.outbound') : t('flights.return')} · {dateLabel(leg.date)}
              </span>
              {unconfirmed ? (
                <span>{t('flights.summary.notConfirmed')}</span>
              ) : selections[i] ? (
                <button
                  type="button"
                  onClick={() => onChangeLeg(i)}
                  className="-my-2 min-h-10 cursor-pointer text-action underline underline-offset-4"
                >
                  {t('flights.summary.change')}
                </button>
              ) : null}
            </div>
            <span className="flex items-center gap-1.5 font-bold text-default">
              {t(`cities.${leg.origin}.name`)}
              <Icon name="arrow" size={14} className="text-muted" />
              {t(`cities.${leg.destination}.name`)}
            </span>
            {selection ? (
              <>
                <span dir="ltr" className="font-mono text-caption text-muted rtl:text-end">
                  {clockTime(selection.flight.departure)} – {clockTime(selection.flight.arrival)} ·{' '}
                  {selection.flight.number}
                </span>
                <span className="text-muted">
                  {t(`flights.families.${selection.family}`)}
                  {seatIds.length ? (
                    <>
                      {' · '}
                      {t('flights.seatList', { seats: `⁦${seatIds.join(', ')}⁩` })}
                    </>
                  ) : null}
                </span>
              </>
            ) : (
              <span className="text-faint">{t('flights.summary.notSelected')}</span>
            )}
          </div>
        );
      })}
      <dl className="flex flex-col gap-1.5 border-t border-hairline pt-3 text-small">
        {total > 0 ? (
          <div className="flex justify-between gap-3 text-muted">
            <dt>{t('flights.summary.fares', { passengers: passengersLabel })}</dt>
            <dd className="whitespace-nowrap">{money.format(fares)}</dd>
          </div>
        ) : null}
        {seats > 0 ? (
          <div className="flex justify-between gap-3 text-muted">
            <dt>{t('flights.summary.seats')}</dt>
            <dd className="whitespace-nowrap">{money.format(seats)}</dd>
          </div>
        ) : null}
        <div className="flex items-baseline justify-between gap-3">
          <dt className="font-bold">{t('flights.summary.total')}</dt>
          <dd
            data-testid="trip-total"
            className="text-title font-bold whitespace-nowrap text-strong"
          >
            {money.format(total)}
          </dd>
        </div>
      </dl>
      <Action props={props} nextLeg={nextLeg} />
      <p className="text-caption text-muted">{t('flights.summary.fine')}</p>
    </aside>
  );
}

/** The same total and action, pinned to the bottom of the screen below the xl breakpoint. */
export function SummaryBar(props: SummaryProps) {
  const t = useTranslations('flights');
  const { money, total, nextLeg } = useSummary(props);
  return (
    <div className="home-safe-bottom fixed inset-x-0 bottom-0 z-(--z-header) flex items-center justify-between gap-3 border-t border-hairline bg-canvas/95 px-gutter pt-2.5 backdrop-blur-lg xl:hidden">
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-caption text-muted">
          {props.pending ? t('summary.withFlight') : t('summary.total')} · {props.passengersLabel}
        </span>
        <span className="text-title font-bold whitespace-nowrap text-strong">
          {money.format(total)}
        </span>
      </div>
      <Action props={props} nextLeg={nextLeg} short />
    </div>
  );
}
