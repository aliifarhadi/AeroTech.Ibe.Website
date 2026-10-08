import { cityOfAirport, HUB_CODE, isNetworkCode, ticketedAirportCode } from './network';

/**
 * The search a traveller is composing in the booking widget, before it becomes a
 * `SearchCriteria`. Dates are ISO calendar dates (YYYY-MM-DD) with no time zone.
 */
export type TripDraft = {
  trip: 'round' | 'one';
  from: string;
  to: string | null;
  depart: string;
  return: string | null;
  adults: number;
  children: number;
  infants: number;
  cabin: 'ECONOMY' | 'BUSINESS';
  promoCode: string;
  awardSearch: boolean;
};

export type PassengerKind = 'adults' | 'children' | 'infants';

export const MAX_PASSENGERS = 9;
const DEFAULT_LEAD_DAYS = 7;
const DEFAULT_STAY_DAYS = 3;

/** Adds days to an ISO calendar date. */
export function addDaysIso(iso: string, days: number): string {
  const [year = 1970, month = 1, day = 1] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function createTripDraft(todayIso: string): TripDraft {
  const depart = addDaysIso(todayIso, DEFAULT_LEAD_DAYS);
  return {
    trip: 'round',
    from: HUB_CODE,
    to: null,
    depart,
    return: addDaysIso(depart, DEFAULT_STAY_DAYS),
    adults: 1,
    children: 0,
    infants: 0,
    cabin: 'ECONOMY',
    promoCode: '',
    awardSearch: false,
  };
}

export type TripAction =
  | { type: 'setTrip'; trip: TripDraft['trip'] }
  | { type: 'setOrigin'; code: string }
  | { type: 'setDestination'; code: string }
  | { type: 'swap' }
  | { type: 'setDepart'; date: string }
  | { type: 'setDates'; depart: string; return: string }
  | { type: 'setPassengers'; kind: PassengerKind; count: number }
  | { type: 'setCabin'; cabin: TripDraft['cabin'] }
  | { type: 'setPromoCode'; code: string }
  | { type: 'setAwardSearch'; on: boolean };

export type Bounds = { min: number; max: number };

/** How far each passenger count may move without breaking a rule. */
export function passengerBounds(draft: TripDraft): Record<PassengerKind, Bounds> {
  const room = MAX_PASSENGERS - (draft.adults + draft.children + draft.infants);
  return {
    // Every infant travels on an adult's lap, so adults cannot drop below infants.
    adults: { min: Math.max(1, draft.infants), max: draft.adults + room },
    children: { min: 0, max: draft.children + room },
    infants: { min: 0, max: Math.min(draft.adults, draft.infants + room) },
  };
}

export function passengerTotal(draft: TripDraft): number {
  return draft.adults + draft.children + draft.infants;
}

const clamp = (value: number, { min, max }: Bounds) => Math.min(max, Math.max(min, value));

export function tripReducer(draft: TripDraft, action: TripAction): TripDraft {
  switch (action.type) {
    case 'setTrip': {
      if (action.trip === 'one') return { ...draft, trip: 'one' };
      const keeps = draft.return !== null && draft.return >= draft.depart;
      return {
        ...draft,
        trip: 'round',
        return: keeps ? draft.return : addDaysIso(draft.depart, DEFAULT_STAY_DAYS),
      };
    }
    case 'setOrigin': {
      if (!isNetworkCode(action.code) || action.code === draft.from) return draft;
      // Picking the current destination as the origin turns the trip around.
      const to = draft.to === action.code ? draft.from : draft.to;
      return { ...draft, from: action.code, to };
    }
    case 'setDestination': {
      if (!isNetworkCode(action.code) || action.code === draft.to) return draft;
      if (action.code !== draft.from) return { ...draft, to: action.code };
      return draft.to === null ? draft : { ...draft, from: draft.to, to: action.code };
    }
    case 'swap':
      return draft.to === null ? draft : { ...draft, from: draft.to, to: draft.from };
    case 'setDepart': {
      const stale = draft.return !== null && draft.return < action.date;
      return { ...draft, depart: action.date, return: stale ? null : draft.return };
    }
    case 'setDates': {
      const [depart, back] =
        action.depart <= action.return
          ? [action.depart, action.return]
          : [action.return, action.depart];
      return { ...draft, trip: 'round', depart, return: back };
    }
    case 'setPassengers': {
      const count = clamp(Math.trunc(action.count), passengerBounds(draft)[action.kind]);
      return { ...draft, [action.kind]: count };
    }
    case 'setCabin':
      return { ...draft, cabin: action.cabin };
    case 'setPromoCode':
      return { ...draft, promoCode: action.code.trim().toUpperCase().slice(0, 32) };
    case 'setAwardSearch':
      return { ...draft, awardSearch: action.on };
  }
}

export type TripProblem = 'destination' | 'returnDate';

/** The first thing the traveller still has to fix before searching, or null. */
export function validateTrip(draft: TripDraft): TripProblem | null {
  if (draft.to === null) return 'destination';
  if (draft.trip === 'round' && draft.return === null) return 'returnDate';
  return null;
}

/**
 * Query string understood by the search results route (`/book/search`). Call only for a draft
 * that passes `validateTrip`.
 */
export function toSearchQuery(draft: TripDraft): string {
  const params = new URLSearchParams();
  params.set('tripType', draft.trip === 'round' ? 'ROUND_TRIP' : 'ONE_WAY');
  params.set('from', ticketedAirportCode(draft.from, draft.to));
  params.set('to', draft.to ? ticketedAirportCode(draft.to, draft.from) : '');
  params.set('depart', draft.depart);
  if (draft.trip === 'round' && draft.return) params.set('return', draft.return);
  params.set('adults', String(draft.adults));
  if (draft.children) params.set('children', String(draft.children));
  if (draft.infants) params.set('infants', String(draft.infants));
  params.set('cabin', draft.cabin);
  if (draft.promoCode) params.set('promo', draft.promoCode);
  if (draft.awardSearch) params.set('miles', '1');
  return params.toString();
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const count = (value: string | null, fallback: number) => {
  const n = Number(value ?? fallback);
  return Number.isInteger(n) && n >= 0 && n <= MAX_PASSENGERS ? n : fallback;
};

/**
 * Reads a search query back into a draft: the inverse of `toSearchQuery`. Returns null when the
 * query does not describe a bookable search, so pages can show an error instead of guessing.
 */
export function draftFromQuery(params: URLSearchParams): TripDraft | null {
  const from = cityOfAirport(params.get('from') ?? '');
  const to = cityOfAirport(params.get('to') ?? '');
  const depart = params.get('depart') ?? '';
  const back = params.get('return');
  const trip = params.get('tripType') === 'ONE_WAY' ? 'one' : 'round';
  if (!isNetworkCode(from) || !isNetworkCode(to) || from === to) return null;
  if (!ISO_DATE.test(depart)) return null;
  if (trip === 'round' && (!back || !ISO_DATE.test(back) || back < depart)) return null;

  const adults = Math.max(1, count(params.get('adults'), 1));
  const children = count(params.get('children'), 0);
  const infants = Math.min(adults, count(params.get('infants'), 0));
  if (adults + children + infants > MAX_PASSENGERS) return null;

  return {
    trip,
    from,
    to,
    depart,
    return: trip === 'round' ? back : null,
    adults,
    children,
    infants,
    cabin: params.get('cabin') === 'BUSINESS' ? 'BUSINESS' : 'ECONOMY',
    promoCode: (params.get('promo') ?? '').trim().toUpperCase().slice(0, 32),
    awardSearch: params.get('miles') === '1',
  };
}
