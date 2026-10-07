import { AIRPORTS } from '@/features/booking-widget/airports';

/* --------------------------------------------------------------------------
 * Deterministic mock flight-search layer.
 *
 * Real BFF integration will replace `generateFlights`, but the shape it returns
 * is the contract the results UI depends on. Everything is seeded off the
 * (origin, destination, date) tuple so the same search always yields the same
 * flights — no hydration drift, no Math.random, stable across re-renders.
 * -------------------------------------------------------------------------- */

export type CabinKey = 'economy' | 'premiumEconomy' | 'business' | 'first';

export type Flight = {
  id: string;
  flightNumber: string;
  aircraft: string;
  /** minutes past local midnight at origin */
  departMinutes: number;
  /** minutes past local midnight; may exceed 1440 when the flight lands next day */
  arriveMinutes: number;
  durationMinutes: number;
  stops: 0 | 1;
  stopCode?: string;
  basePrice: number; // economy price per adult, in USD
  emissionsKg: number;
  seatsLeft?: number;
};

export type TimeBucket = 'morning' | 'afternoon' | 'evening';

/** Price multiplier applied to `basePrice` for each cabin. */
export const CABIN_MULTIPLIER: Record<CabinKey, number> = {
  economy: 1,
  premiumEconomy: 1.65,
  business: 2.8,
  first: 4.4,
};

const AIRCRAFT = [
  'Airbus A320neo',
  'Airbus A321neo',
  'Airbus A350-900',
  'Boeing 787-9',
  'Boeing 737 MAX 8',
];

// Hubs a connecting itinerary can route through.
const STOP_HUBS = ['IST', 'DXB', 'DOH', 'FRA', 'CDG', 'SIN'];

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Small, fast, seedable PRNG (mulberry32). Returns a function yielding [0, 1). */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)] as T;
}

export function timeBucket(minutes: number): TimeBucket {
  const local = minutes % 1440;
  if (local < 12 * 60) return 'morning';
  if (local < 18 * 60) return 'afternoon';
  return 'evening';
}

export function generateFlights(
  originCode: string,
  destinationCode: string,
  dateIso: string,
): Flight[] {
  const rng = mulberry32(hashSeed(`${originCode}>${destinationCode}@${dateIso}`));

  // Base non-stop duration for this city pair (90–690 min), stable per route.
  const routeSeed = mulberry32(hashSeed(`${originCode}>${destinationCode}`));
  const baseDuration = 95 + Math.floor(routeSeed() * 560);
  const basePriceAnchor = Math.round(baseDuration * 0.5 + 55 + routeSeed() * 90);

  const count = 5 + Math.floor(rng() * 4); // 5–8 options
  const hubs = STOP_HUBS.filter((code) => code !== originCode && code !== destinationCode);

  const flights: Flight[] = [];
  for (let i = 0; i < count; i += 1) {
    // Guarantee a mix: first is non-stop, second is a connection, rest random.
    const stops: 0 | 1 = i === 0 ? 0 : i === 1 ? 1 : rng() < 0.62 ? 0 : 1;
    const departMinutes = Math.round((300 + rng() * 1020) / 5) * 5; // 05:00–22:00, 5-min grid
    const layover = stops === 1 ? 55 + Math.floor(rng() * 130) : 0;
    const detour = stops === 1 ? 40 + Math.floor(rng() * 110) : 0;
    const durationMinutes = baseDuration + Math.round((rng() - 0.5) * 50) + layover + detour;
    const priceJitter = 0.82 + rng() * 0.5;
    const stopDiscount = stops === 1 ? 0.8 : 1;
    const basePrice = Math.max(69, Math.round((basePriceAnchor * priceJitter * stopDiscount) / 1));

    flights.push({
      id: `da-${originCode}${destinationCode}-${i}`,
      flightNumber: `DA ${100 + Math.floor(rng() * 850)}`,
      aircraft: pick(rng, AIRCRAFT),
      departMinutes,
      arriveMinutes: departMinutes + durationMinutes,
      durationMinutes,
      stops,
      stopCode: stops === 1 && hubs.length ? pick(rng, hubs) : undefined,
      basePrice,
      emissionsKg: Math.round((durationMinutes / 60) * 88),
      seatsLeft: rng() < 0.28 ? 1 + Math.floor(rng() * 6) : undefined,
    });
  }

  return flights;
}

export function cabinPrice(flight: Flight, cabin: CabinKey): number {
  return Math.round(flight.basePrice * CABIN_MULTIPLIER[cabin]);
}

/** City label for a stop code, respecting locale. Falls back to the raw code. */
export function stopCityLabel(code: string | undefined, persian: boolean): string {
  if (!code) return '';
  const airport = AIRPORTS.find((option) => option.code === code);
  if (!airport) return code;
  return persian ? airport.cityFa : airport.city;
}
