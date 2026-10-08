'use client';

import { useTranslations } from 'next-intl';
import { seatFacts, seatFee, type FeatureTone } from '@aerotech/domain';
import { Icon, type IconName } from '@aerotech/ui';
import { useFormatters } from '../shared/use-duration';
import type { Party, Selection } from './model';
import { useMoney } from './use-money';

const TONE: Record<FeatureTone, { icon: IconName; className: string }> = {
  plus: { icon: 'check', className: 'text-success' },
  info: { icon: 'info', className: 'text-info' },
  minus: { icon: 'close', className: 'text-danger-soft' },
};

type SeatPanelProps = {
  selection: Selection;
  party: Party;
  activeTraveller: number;
  onTravellerChange: (index: number) => void;
  inspected: string | null;
  message: string;
};

/** Beside the map: who is being seated, what the inspected seat offers, and the legend. */
export function SeatPanel({
  selection,
  party,
  activeTraveller,
  onTravellerChange,
  inspected,
  message,
}: SeatPanelProps) {
  const t = useTranslations('flights');
  const money = useMoney();
  const { number } = useFormatters();
  const fee = (extra: boolean) => {
    const amount = seatFee(selection.family, extra, money.currency);
    return amount ? money.format(amount) : t('seats.included');
  };
  const facts = inspected ? seatFacts(inspected) : null;
  const swatch = 'size-4 shrink-0 rounded-small';

  return (
    <div className="flex flex-col gap-4 p-4 md:p-5">
      <div>
        <h4 className="flex flex-wrap items-baseline justify-between gap-2 text-title font-bold text-strong">
          {t('seats.title')}
          <span className="text-caption font-normal text-muted">
            Airbus A320 · {t('seats.sample')}
          </span>
        </h4>
        <div role="group" aria-label={t('seats.paxAria')} className="mt-3 flex flex-wrap gap-2">
          {selection.seats.map((seat, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={i === activeTraveller}
              onClick={() => onTravellerChange(i)}
              className="flex min-h-12 min-w-24 cursor-pointer flex-col rounded-control border border-hairline px-3 py-1.5 text-start transition-colors duration-(--duration-fast) hover:border-hover-line aria-pressed:border-action aria-pressed:bg-action-softer"
            >
              <span className="text-caption text-muted">
                {i < party.adults
                  ? t('seats.adult', { n: number(i + 1) })
                  : t('seats.child', { n: number(i - party.adults + 1) })}
              </span>
              <span dir="ltr" className="font-mono text-small font-bold rtl:text-end">
                {seat ? seat.id : '—'}
                {seat ? null : <span className="sr-only">{t('seats.none')}</span>}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Fixed height while the map sits below this box, so inspecting a seat never moves the map under the finger. */}
      <div
        aria-live="polite"
        className="h-52 overflow-y-auto rounded-control border border-hairline bg-surface-1 p-3 lg:h-auto lg:min-h-52"
      >
        {message ? (
          <p role="alert" className="mb-2 text-small text-danger-soft">
            {message}
          </p>
        ) : null}
        {facts && inspected ? (
          <>
            <div className="flex items-baseline gap-3">
              <span dir="ltr" className="font-mono text-title font-bold text-action">
                {inspected}
              </span>
              <span className="text-small text-muted">
                {t(`seats.position.${facts.position}`)} ·{' '}
                {facts.cabin === 'BUSINESS' ? t('business') : t('economy')}
              </span>
              <span className="ms-auto text-small font-bold whitespace-nowrap">
                {fee(facts.extraLegroom)}
              </span>
            </div>
            <ul className="mt-2 flex flex-col gap-1 text-small">
              {facts.features.map(({ feature, tone }) => (
                <li key={feature} className="flex items-start gap-2">
                  <Icon
                    name={TONE[tone].icon}
                    size={14}
                    className={`mt-1.5 ${TONE[tone].className}`}
                  />
                  {t(`seats.features.${feature}`)}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-small text-muted">{t('seats.hint')}</p>
        )}
      </div>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-caption text-muted">
        <li className="flex items-center gap-2">
          <i className={`${swatch} inset-ring-2 inset-ring-hover-line`} />
          {t('seats.legendStandard', { fee: fee(false) })}
        </li>
        {selection.cabin === 'ECONOMY' ? (
          <li className="flex items-center gap-2">
            <i className={`${swatch} inset-ring-2 inset-ring-info`} />
            {t('seats.legendExtra', { fee: fee(true) })}
          </li>
        ) : null}
        <li className="flex items-center gap-2">
          <i className={`${swatch} bg-surface-hover`} />
          {t('seats.legendTaken')}
        </li>
        <li className="flex items-center gap-2">
          <i className={`${swatch} bg-action`} />
          {t('seats.legendYours')}
        </li>
        <li className="flex items-center gap-2">
          <i className="h-4 w-1.5 shrink-0 rounded-chip bg-success" />
          {t('seats.legendDoors')}
        </li>
        <li className="flex items-center gap-2">
          <i className={`${swatch} bg-hairline`} />
          {t('seats.legendWing')}
        </li>
      </ul>
      <p className="text-caption text-muted">{t('seats.optional')}</p>
    </div>
  );
}
