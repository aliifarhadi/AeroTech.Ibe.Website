/**
 * Fare families, sample pricing and seat fees for the V1 mocked build. The structure (what a
 * family includes, how a trip total is built) is the product model; the amounts are samples
 * until the pricing service is connected.
 */
import type { TripDraft } from './trip-draft';

export type Currency = 'IRT' | 'EUR';
export type CabinCode = 'ECONOMY' | 'BUSINESS';
export type FareFamilyId = 'light' | 'classic' | 'flex' | 'business' | 'businessFlex';
/** included, not included, or available for a fee */
export type Inclusion = 'yes' | 'no' | 'fee';

export type FareFamily = {
  id: FareFamilyId;
  cabin: CabinCode;
  /** Price uplift over the cabin's base fare. */
  uplift: number;
  recommended: boolean;
  /** One entry per row of the comparison: cabin bag, checked bag, seat, changes, refund, points. */
  rows: readonly Inclusion[];
};

export const FARE_ROWS = ['cabinBag', 'checkedBag', 'seat', 'change', 'refund', 'points'] as const;

export const FARE_FAMILIES: readonly FareFamily[] = [
  {
    id: 'light',
    cabin: 'ECONOMY',
    uplift: 0,
    recommended: false,
    rows: ['yes', 'no', 'fee', 'fee', 'no', 'yes'],
  },
  {
    id: 'classic',
    cabin: 'ECONOMY',
    uplift: 0.18,
    recommended: true,
    rows: ['yes', 'yes', 'yes', 'fee', 'fee', 'yes'],
  },
  {
    id: 'flex',
    cabin: 'ECONOMY',
    uplift: 0.42,
    recommended: false,
    rows: ['yes', 'yes', 'yes', 'yes', 'yes', 'yes'],
  },
  {
    id: 'business',
    cabin: 'BUSINESS',
    uplift: 0,
    recommended: false,
    rows: ['yes', 'yes', 'yes', 'fee', 'fee', 'yes'],
  },
  {
    id: 'businessFlex',
    cabin: 'BUSINESS',
    uplift: 0.25,
    recommended: true,
    rows: ['yes', 'yes', 'yes', 'yes', 'yes', 'yes'],
  },
];

export function familiesOf(cabin: CabinCode): FareFamily[] {
  return FARE_FAMILIES.filter((family) => family.cabin === cabin);
}

export function findFamily(id: FareFamilyId): FareFamily {
  const family = FARE_FAMILIES.find((item) => item.id === id);
  if (!family) throw new Error(`Unknown fare family: ${id}`);
  return family;
}

export function defaultFamily(cabin: CabinCode): FareFamilyId {
  return cabin === 'BUSINESS' ? 'businessFlex' : 'classic';
}

const BUSINESS_MULTIPLE = 2.3;

/** Sample adult fare, taxes included, in whole units of the currency. */
export function adultFare(
  distanceKm: number,
  priceFactor: number,
  cabin: CabinCode,
  uplift: number,
  currency: Currency,
): number {
  const multiple = (cabin === 'BUSINESS' ? BUSINESS_MULTIPLE : 1) * (1 + uplift) * priceFactor;
  if (currency === 'EUR') return Math.round((42 + distanceKm * 0.058) * multiple);
  // Toman fares are quoted to the nearest 10,000.
  return Math.round(((1_650_000 + distanceKm * 1400) * multiple) / 10_000) * 10_000;
}

/** Infants on a lap pay a tenth of the adult fare. */
export function infantFare(adult: number): number {
  return Math.round(adult * 0.1);
}

export function seatFee(family: FareFamilyId, extraLegroom: boolean, currency: Currency): number {
  const standard = currency === 'EUR' ? 6 : 180_000;
  const roomy = currency === 'EUR' ? 14 : 420_000;
  if (family === 'flex' || family === 'business' || family === 'businessFlex') return 0;
  if (family === 'classic') return extraLegroom ? roomy : 0;
  return extraLegroom ? roomy : standard;
}

export type ChosenSeat = { id: string; extraLegroom: boolean };

export type LegPrice = { fares: number; seats: number; total: number };

/** Price of one direction for the whole party. Adults and children pay the same sample fare. */
export function priceLeg(
  adult: number,
  family: FareFamilyId,
  seats: ReadonlyArray<ChosenSeat | null>,
  party: Pick<TripDraft, 'adults' | 'children' | 'infants'>,
  currency: Currency,
): LegPrice {
  const fares = adult * (party.adults + party.children) + infantFare(adult) * party.infants;
  const seatTotal = seats.reduce(
    (sum, seat) => sum + (seat ? seatFee(family, seat.extraLegroom, currency) : 0),
    0,
  );
  return { fares, seats: seatTotal, total: fares + seatTotal };
}
