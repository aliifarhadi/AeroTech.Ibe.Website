/**
 * SAMPLE flight schedule for the V1 mocked build. It stands in for the availability API: the
 * same route and date always return the same flights. Replace with the API client when the
 * contract in 05_api_contracts.md is connected; the `Flight` shape is what the UI consumes.
 */
import { HUB_CODE, routeBetween, ticketedAirportCode } from './network';
import { seeded, textHash } from './random';

export type FlightStop = {
  code: string;
  /** Minutes on the ground. */
  layover: number;
  firstSegment: number;
  secondSegment: number;
};

export type Flight = {
  id: string;
  number: string;
  /** City codes. */
  origin: string;
  destination: string;
  /** Airport codes as ticketed (Tehran is THR or IKA). */
  from: string;
  to: string;
  /** Minutes after local midnight at the origin. */
  departure: number;
  /** Minutes after local midnight at the destination, counted from the departure day (may exceed 1440). */
  arrival: number;
  /** Total journey time in minutes, including any stop. */
  duration: number;
  distanceKm: number;
  international: boolean;
  /** Multiplier on the route's base fare for this departure. */
  priceFactor: number;
  /** Economy seats left when few remain, otherwise 0. */
  seatsLeft: number;
  businessSoldOut: boolean;
  stop: FlightStop | null;
};

const DEPARTURE_BANK = [375, 520, 680, 850, 1050, 1245];
/** Minutes relative to Tehran time. */
const TIME_OFFSET: Record<string, number> = { IST: -30 };
/** Sample one-stop services: the long southern routes out of Tehran call at Shiraz. */
const VIA_SHIRAZ: Record<string, number> = { KIH: 45, BND: 50 };

export function flightsFor(origin: string, destination: string, date: string): Flight[] {
  const route = routeBetween(origin, destination);
  if (!route) return [];
  const key = `${origin}${destination}${date}`;
  const random = seeded(textHash(key));
  const dropped = random() < 0.6 ? Math.floor(random() * DEPARTURE_BANK.length) : -1;
  const pair = [origin, destination].sort().join('');
  const firstNumber = 100 + (textHash(pair) % 40) * 20 + (origin < destination ? 0 : 1);
  const shift = (TIME_OFFSET[destination] ?? 0) - (TIME_OFFSET[origin] ?? 0);

  const flights: Flight[] = [];
  DEPARTURE_BANK.forEach((slot, i) => {
    const jitter = Math.round((random() * 40 - 20) / 5) * 5;
    const peak = i === 0 || i === 5 ? -0.06 : i === 3 ? 0.08 : 0;
    const priceFactor = Number((0.9 + random() * 0.45 + peak).toFixed(3));
    const seatsLeft = random() < 0.3 ? 2 + Math.floor(random() * 5) : 0;
    const businessSoldOut = random() < 0.18;
    if (i === dropped) return;
    const departure = slot + jitter;
    flights.push({
      id: `${key}-${i}`,
      number: `DA ${firstNumber + i * 2}`,
      origin,
      destination,
      from: ticketedAirportCode(origin, destination),
      to: ticketedAirportCode(destination, origin),
      departure,
      arrival: departure + route.minutes + shift,
      duration: route.minutes,
      distanceKm: route.distanceKm,
      international: route.international,
      priceFactor,
      seatsLeft,
      businessSoldOut,
      stop: null,
    });
  });

  const far = origin === HUB_CODE ? destination : destination === HUB_CODE ? origin : '';
  const shirazLeg = VIA_SHIRAZ[far];
  const third = flights[2];
  if (shirazLeg && flights.length > 3 && third) {
    const firstSegment = origin === HUB_CODE ? 80 : shirazLeg;
    const secondSegment = origin === HUB_CODE ? shirazLeg : 80;
    third.stop = { code: 'SYZ', layover: 45, firstSegment, secondSegment };
    third.duration = firstSegment + 45 + secondSegment;
    third.arrival = third.departure + third.duration;
    third.priceFactor = Number((third.priceFactor * 0.86).toFixed(3));
  }
  return flights;
}

/** The lowest price factor of the day, or null when nothing flies. */
export function lowestFactor(origin: string, destination: string, date: string): number | null {
  const flights = flightsFor(origin, destination, date);
  return flights.length ? Math.min(...flights.map((flight) => flight.priceFactor)) : null;
}

/** "HH:MM" for minutes after midnight; wraps past midnight. */
export function clockTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/** Whole days after the departure day on which a time falls. */
export function dayOffset(minutes: number): number {
  return Math.floor(minutes / 1440);
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';
const TIME_BANDS: Record<TimeOfDay, [number, number]> = {
  morning: [300, 720],
  afternoon: [720, 1080],
  evening: [1080, 1500],
};

export function inTimeOfDay(flight: Flight, band: TimeOfDay): boolean {
  const [from, to] = TIME_BANDS[band];
  return flight.departure >= from && flight.departure < to;
}

export function sortFlights(flights: readonly Flight[], by: 'departure' | 'price'): Flight[] {
  return [...flights].sort((a, b) =>
    by === 'price'
      ? a.priceFactor - b.priceFactor || a.departure - b.departure
      : a.departure - b.departure,
  );
}
