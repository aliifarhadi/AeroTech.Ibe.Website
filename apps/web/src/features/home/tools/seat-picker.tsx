'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

/** Six sample rows; 1 marks a taken seat, the gap is the aisle. */
const ROWS = ['110 011', '011 101', '101 011', '110 100', '001 011', '101 110'];
const FIRST_ROW = 12;
const LETTERS = 'ABCDEF';

const kindOf = (seat: string) => {
  const letter = seat.slice(-1);
  return 'AF'.includes(letter) ? 'window' : 'CD'.includes(letter) ? 'aisle' : 'middle';
};

/** A small, working taste of seat selection. The full aircraft map is on the results page. */
export function SeatPicker() {
  const t = useTranslations('tools');
  const [selected, setSelected] = useState('14A');

  return (
    <>
      <div
        dir="ltr"
        role="group"
        aria-label={t('seatsAria')}
        className="home-seat-grid mx-auto grid justify-center gap-1.5 md:gap-2"
      >
        {ROWS.flatMap((row, r) =>
          [...row].map((cell, c) => {
            const number = FIRST_ROW + r;
            if (cell === ' ') {
              return (
                <span
                  key={`${r}-aisle`}
                  aria-hidden="true"
                  className="flex items-center justify-center font-mono text-caption text-faint"
                >
                  {number}
                </span>
              );
            }
            const seat = `${number}${LETTERS[c < 3 ? c : c - 1]}`;
            const taken = cell === '1' && seat !== '14A';
            const isSelected = seat === selected;
            return (
              <button
                key={seat}
                type="button"
                disabled={taken}
                aria-pressed={taken ? undefined : isSelected}
                aria-label={taken ? t('seatTaken', { seat }) : t('seatAria', { seat })}
                onClick={() => setSelected(seat)}
                className="aspect-square w-full cursor-pointer rounded-small inset-ring-2 inset-ring-hover-line transition duration-(--duration-fast) ease-pop hover:scale-110 hover:inset-ring-action disabled:cursor-default disabled:bg-surface-hover disabled:inset-ring-0 disabled:hover:scale-100 aria-pressed:scale-105 aria-pressed:bg-action aria-pressed:inset-ring-0"
              />
            );
          }),
        )}
      </div>
      <p
        aria-live="polite"
        className="flex items-center justify-center gap-3 text-small text-muted"
      >
        {t('selectedSeat')}
        <span dir="ltr" className="font-mono text-title text-action">
          {selected}
        </span>
        <span>{t(kindOf(selected))}</span>
      </p>
    </>
  );
}
