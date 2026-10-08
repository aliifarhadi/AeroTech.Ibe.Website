'use client';

import { Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { seatRows, WING_FROM_ROW, type CabinCode, type Seat } from '@aerotech/domain';
import type { Selection } from './model';

type SeatMapProps = {
  selection: Selection;
  onPick: (seat: Seat) => void;
  /** Called when a seat is pointed at or focused, to show its features. */
  onInspect: (seatId: string) => void;
};

function Doors() {
  return (
    <>
      <i className="fl-door" data-side="left" />
      <i className="fl-door" data-side="right" />
    </>
  );
}

/** The whole aircraft from nose to tail: both cabins, galleys, doors, exit rows and wings. */
export function SeatMap({ selection, onPick, onInspect }: SeatMapProps) {
  const t = useTranslations('flights');
  const rows = seatRows(selection.flight.id);
  const cabinName = (cabin: CabinCode) => (cabin === 'BUSINESS' ? t('business') : t('economy'));
  const box = 'rounded-small bg-surface-hover px-2 py-1 text-center text-caption text-muted';

  const service = (rear: boolean) => (
    <div className={`fl-service ${rear ? 'mt-2.5' : ''}`}>
      <Doors />
      <span className={box}>{t('seats.lavatory')}</span>
      <span className={box}>{t('seats.galley')}</span>
      {rear ? <span className={box}>{t('seats.lavatory')}</span> : null}
    </div>
  );

  return (
    <div role="group" aria-label={t('seats.mapAria')} className="fl-cabin">
      <div className="fl-plane">
        <div className="fl-nose text-caption text-faint">{t('seats.front')}</div>
        <div className="fl-fuselage">
          {service(false)}
          {rows.map((row, index) => {
            const firstOfCabin = rows[index - 1]?.cabin !== row.cabin;
            const otherCabin = row.cabin !== selection.cabin;
            const half = row.seats.length / 2;
            return (
              <Fragment key={row.number}>
                {firstOfCabin ? (
                  <div className="mt-2.5 mb-0.5 flex items-center gap-2 text-caption text-muted before:h-px before:flex-1 before:bg-hairline after:h-px after:flex-1 after:bg-hairline">
                    {cabinName(row.cabin)}
                  </div>
                ) : null}
                {firstOfCabin && row.cabin === 'ECONOMY' ? (
                  <div
                    aria-hidden="true"
                    data-letters
                    className="fl-seat-row font-mono text-caption text-faint"
                  >
                    {['A', 'B', 'C', '', 'D', 'E', 'F'].map((letter, i) => (
                      <span key={i} className="text-center">
                        {letter}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div
                  className="fl-seat-row"
                  data-cabin={row.cabin}
                  data-exit-label={row.number === 11 ? t('seats.exit') : undefined}
                >
                  {row.number === WING_FROM_ROW ? (
                    <>
                      <i className="fl-wing" data-side="left" />
                      <i className="fl-wing" data-side="right" />
                    </>
                  ) : null}
                  {row.exit ? <Doors /> : null}
                  {row.seats.map((seat, i) => {
                    const mine = otherCabin
                      ? -1
                      : selection.seats.findIndex((s) => s?.id === seat.id);
                    const open = !seat.taken && !otherCabin;
                    const label = otherCabin
                      ? t('seats.seatOther', { seat: seat.id })
                      : seat.taken
                        ? t('seats.seatTaken', { seat: seat.id })
                        : row.exit
                          ? t('seats.seatExit', { seat: seat.id })
                          : seat.extraLegroom
                            ? t('seats.seatExtra', { seat: seat.id })
                            : t('seats.seat', { seat: seat.id });
                    return (
                      <Fragment key={seat.id}>
                        {i === half ? (
                          <span
                            aria-hidden="true"
                            className="text-center font-mono text-caption text-faint"
                          >
                            {row.number}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          disabled={!open}
                          aria-label={label}
                          aria-pressed={open ? mine >= 0 : undefined}
                          data-seat={seat.id}
                          data-extra={(open && seat.extraLegroom) || undefined}
                          onClick={() => onPick(seat)}
                          onFocus={() => onInspect(seat.id)}
                          onPointerEnter={(event) => {
                            if (event.pointerType === 'mouse' && open) onInspect(seat.id);
                          }}
                          className="fl-seat cursor-pointer font-mono text-caption font-bold text-on-action inset-ring-2 inset-ring-hover-line transition duration-(--duration-fast) ease-pop hover:scale-110 hover:inset-ring-action disabled:cursor-default disabled:bg-surface-hover disabled:inset-ring-0 disabled:hover:scale-100 aria-pressed:bg-action aria-pressed:inset-ring-0 data-extra:inset-ring-info"
                        >
                          {mine >= 0 ? mine + 1 : ''}
                        </button>
                      </Fragment>
                    );
                  })}
                </div>
              </Fragment>
            );
          })}
          {service(true)}
        </div>
        <div className="fl-tail" />
      </div>
    </div>
  );
}
