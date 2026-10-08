import {
  adultFare,
  findFamily,
  priceLeg,
  type CabinCode,
  type ChosenSeat,
  type Currency,
  type FareFamilyId,
  type Flight,
  type LegPrice,
  type TripDraft,
} from '@aerotech/domain';

/** One direction of the trip being searched. */
export type Leg = { origin: string; destination: string; date: string };

/** A flight with the fare and seats chosen for it. `seats` has one slot per adult and child. */
export type Selection = {
  flight: Flight;
  cabin: CabinCode;
  family: FareFamilyId;
  seats: Array<ChosenSeat | null>;
};

export type Party = Pick<TripDraft, 'adults' | 'children' | 'infants'>;

export function fareOf(
  flight: Flight,
  cabin: CabinCode,
  family: FareFamilyId | null,
  currency: Currency,
) {
  const uplift = family ? findFamily(family).uplift : 0;
  return adultFare(flight.distanceKm, flight.priceFactor, cabin, uplift, currency);
}

export function priceOf(selection: Selection | null, party: Party, currency: Currency): LegPrice {
  if (!selection) return { fares: 0, seats: 0, total: 0 };
  const adult = fareOf(selection.flight, selection.cabin, selection.family, currency);
  return priceLeg(adult, selection.family, selection.seats, party, currency);
}

type RowCopy = readonly [key: string, values?: Record<string, number>];

/** What each fare family says on each row of the comparison (message keys under flights.rows). */
export const FARE_COPY: Record<FareFamilyId, readonly RowCopy[]> = {
  light: [
    ['cabinBag'],
    ['noChecked'],
    ['seatFee'],
    ['changeFee'],
    ['refundNo'],
    ['points', { percent: 25 }],
  ],
  classic: [
    ['cabinBag'],
    ['checked', { kg: 20 }],
    ['seatStandard'],
    ['changeLowFee'],
    ['refundFee'],
    ['points', { percent: 100 }],
  ],
  flex: [
    ['cabinBag'],
    ['checked', { kg: 30 }],
    ['seatAny'],
    ['changeFree'],
    ['refundFree'],
    ['points', { percent: 150 }],
  ],
  business: [
    ['cabinBags'],
    ['checked', { kg: 40 }],
    ['seatAny'],
    ['changeFee'],
    ['refundFee'],
    ['points', { percent: 200 }],
  ],
  businessFlex: [
    ['cabinBags'],
    ['checked', { kg: 40 }],
    ['seatAny'],
    ['changeFree'],
    ['refundFree'],
    ['points', { percent: 250 }],
  ],
};
