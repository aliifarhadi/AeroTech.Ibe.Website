/**
 * Sample single-aisle cabin (Airbus A320 layout): business rows 1-2 in 2-2, economy rows 3-24 in
 * 3-3. Rows 3, 11 and 12 have extra legroom; 11 and 12 are the over-wing emergency exits.
 * Occupancy is generated from the flight id, so a flight always shows the same seats as taken.
 */
import type { CabinCode } from './fares';
import { seeded, textHash } from './random';

export const EXIT_ROWS: readonly number[] = [11, 12];
/** The row the wing's leading edge meets the fuselage; the wing spans the six rows from here. */
export const WING_FROM_ROW = 9;
const EXTRA_LEGROOM_ROWS = [3, ...EXIT_ROWS];
const BUSINESS_ROWS = [1, 2];
const LAST_ROW = 24;

export type Seat = { id: string; letter: string; extraLegroom: boolean; taken: boolean };
export type SeatRow = { number: number; cabin: CabinCode; exit: boolean; seats: Seat[] };

export function seatRows(flightId: string): SeatRow[] {
  const rows: SeatRow[] = [];
  for (const cabin of ['BUSINESS', 'ECONOMY'] as const) {
    const random = seeded(textHash(flightId + cabin));
    const business = cabin === 'BUSINESS';
    const first = business ? 1 : BUSINESS_ROWS.length + 1;
    const last = business ? BUSINESS_ROWS.length : LAST_ROW;
    const letters = business ? ['A', 'C', 'D', 'F'] : ['A', 'B', 'C', 'D', 'E', 'F'];
    for (let number = first; number <= last; number++) {
      const extraLegroom = !business && EXTRA_LEGROOM_ROWS.includes(number);
      rows.push({
        number,
        cabin,
        exit: EXIT_ROWS.includes(number),
        seats: letters.map((letter) => ({
          id: `${number}${letter}`,
          letter,
          extraLegroom,
          taken: random() < (business ? 0.35 : extraLegroom ? 0.3 : 0.5),
        })),
      });
    }
  }
  return rows;
}

export type SeatPosition = 'window' | 'aisle' | 'middle';
export type SeatFeature =
  | 'pitchBusiness'
  | 'widerSeat'
  | 'fullMeal'
  | 'pitchExtra'
  | 'pitchStandard'
  | 'exitRow'
  | 'bulkhead'
  | 'noRecline'
  | 'overWing'
  | 'nearLavatory'
  | 'quickExit'
  | 'usbPower';
/** good to know, a plus, or a drawback */
export type FeatureTone = 'info' | 'plus' | 'minus';

export type SeatFacts = {
  row: number;
  cabin: CabinCode;
  position: SeatPosition;
  extraLegroom: boolean;
  features: Array<{ feature: SeatFeature; tone: FeatureTone }>;
};

export function seatFacts(seatId: string): SeatFacts {
  const row = parseInt(seatId, 10);
  const letter = seatId.slice(-1);
  const business = BUSINESS_ROWS.includes(row);
  const extraLegroom = !business && EXTRA_LEGROOM_ROWS.includes(row);
  const position = 'AF'.includes(letter) ? 'window' : 'CD'.includes(letter) ? 'aisle' : 'middle';
  const features: SeatFacts['features'] = [];
  const add = (feature: SeatFeature, tone: FeatureTone) => features.push({ feature, tone });

  if (business) {
    add('pitchBusiness', 'plus');
    add('widerSeat', 'plus');
    add('fullMeal', 'plus');
  } else {
    add(extraLegroom ? 'pitchExtra' : 'pitchStandard', 'plus');
    if (EXIT_ROWS.includes(row)) add('exitRow', 'info');
    if (row === 3) add('bulkhead', 'info');
    if (row === 10 || row === 11 || row === LAST_ROW) add('noRecline', 'minus');
    if (row >= WING_FROM_ROW && row <= 14 && position === 'window') add('overWing', 'info');
    if (row >= LAST_ROW - 1) add('nearLavatory', 'info');
    if (row <= 6) add('quickExit', 'plus');
  }
  add('usbPower', 'plus');
  return { row, cabin: business ? 'BUSINESS' : 'ECONOMY', position, extraLegroom, features };
}

/** Safety rule: only adults may sit in an emergency exit row. */
export function mayOccupy(seatId: string, traveller: 'adult' | 'child'): boolean {
  return traveller === 'adult' || !EXIT_ROWS.includes(parseInt(seatId, 10));
}
