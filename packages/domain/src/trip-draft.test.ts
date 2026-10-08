import { describe, expect, it } from 'vitest';
import { destinationsFrom, splitDuration, ticketedAirportCode } from './network';
import {
  addDaysIso,
  createTripDraft,
  passengerBounds,
  toSearchQuery,
  tripReducer,
  validateTrip,
  type TripAction,
  type TripDraft,
} from './trip-draft';

const start = createTripDraft('2026-10-08');
const run = (draft: TripDraft, ...actions: TripAction[]) => actions.reduce(tripReducer, draft);

describe('network', () => {
  it('reaches every city from Tehran and only Tehran from elsewhere', () => {
    expect(destinationsFrom('THR')).toContain('IST');
    expect(destinationsFrom('THR')).not.toContain('THR');
    expect(destinationsFrom('MHD')).toEqual(['THR']);
    expect(destinationsFrom('XXX')).toEqual([]);
  });

  it('sells Tehran as IKA on international routes only', () => {
    expect(ticketedAirportCode('THR', 'IST')).toBe('IKA');
    expect(ticketedAirportCode('THR', 'MHD')).toBe('THR');
    expect(ticketedAirportCode('THR', null)).toBe('THR');
    expect(ticketedAirportCode('IST', 'THR')).toBe('IST');
  });

  it('splits durations', () => {
    expect(splitDuration(195)).toEqual({ hours: 3, minutes: 15 });
    expect(splitDuration(60)).toEqual({ hours: 1, minutes: 0 });
  });
});

describe('addDaysIso', () => {
  it('crosses month and year ends', () => {
    expect(addDaysIso('2026-10-30', 3)).toBe('2026-11-02');
    expect(addDaysIso('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDaysIso('2028-03-01', -1)).toBe('2028-02-29');
  });
});

describe('createTripDraft', () => {
  it('starts a week out with a three-day round trip from Tehran', () => {
    expect(start).toMatchObject({
      trip: 'round',
      from: 'THR',
      to: null,
      depart: '2026-10-15',
      return: '2026-10-18',
      adults: 1,
    });
  });
});

describe('route selection', () => {
  it('fixes the destination to Tehran when the origin is another city', () => {
    expect(run(start, { type: 'setOrigin', code: 'SYZ' })).toMatchObject({
      from: 'SYZ',
      to: 'THR',
    });
  });

  it('clears an impossible destination when the origin returns to Tehran', () => {
    const draft = run(
      start,
      { type: 'setOrigin', code: 'SYZ' },
      { type: 'setOrigin', code: 'THR' },
    );
    expect(draft).toMatchObject({ from: 'THR', to: null });
  });

  it('keeps a valid destination when the origin is re-selected', () => {
    const draft = run(
      start,
      { type: 'setDestination', code: 'KIH' },
      { type: 'setOrigin', code: 'THR' },
    );
    expect(draft.to).toBe('KIH');
  });

  it('moves the origin back to Tehran when a non-hub destination is picked', () => {
    const draft = run(
      start,
      { type: 'setOrigin', code: 'SYZ' },
      { type: 'setDestination', code: 'MHD' },
    );
    expect(draft).toMatchObject({ from: 'THR', to: 'MHD' });
  });

  it('ignores unknown codes and a destination equal to the origin', () => {
    expect(run(start, { type: 'setOrigin', code: 'XXX' })).toBe(start);
    expect(run(start, { type: 'setDestination', code: 'THR' })).toBe(start);
    expect(run(start, { type: 'setDestination', code: 'XXX' })).toBe(start);
  });

  it('swaps only when there is a destination', () => {
    expect(run(start, { type: 'swap' })).toBe(start);
    const draft = run(start, { type: 'setDestination', code: 'IST' }, { type: 'swap' });
    expect(draft).toMatchObject({ from: 'IST', to: 'THR' });
  });
});

describe('dates', () => {
  it('drops a return that falls before a new departure', () => {
    const draft = run(start, { type: 'setDepart', date: '2026-10-20' });
    expect(draft).toMatchObject({ depart: '2026-10-20', return: null });
    expect(validateTrip({ ...draft, to: 'MHD' })).toBe('returnDate');
  });

  it('keeps a same-day return', () => {
    expect(run(start, { type: 'setDepart', date: '2026-10-18' }).return).toBe('2026-10-18');
  });

  it('orders a range and makes the trip a round trip', () => {
    const draft = run(
      start,
      { type: 'setTrip', trip: 'one' },
      { type: 'setDates', depart: '2026-11-09', return: '2026-11-02' },
    );
    expect(draft).toMatchObject({ trip: 'round', depart: '2026-11-02', return: '2026-11-09' });
  });

  it('gives a round trip a return date when it has none', () => {
    const draft = run(
      start,
      { type: 'setTrip', trip: 'one' },
      { type: 'setDepart', date: '2026-12-30' },
      { type: 'setTrip', trip: 'round' },
    );
    expect(draft.return).toBe('2027-01-02');
  });
});

describe('passengers', () => {
  it('caps the party at nine', () => {
    const draft = run(
      start,
      { type: 'setPassengers', kind: 'adults', count: 6 },
      { type: 'setPassengers', kind: 'children', count: 9 },
    );
    expect(draft).toMatchObject({ adults: 6, children: 3 });
    expect(passengerBounds(draft).adults.max).toBe(6);
  });

  it('never allows more infants than adults, or fewer adults than infants', () => {
    const draft = run(
      start,
      { type: 'setPassengers', kind: 'adults', count: 2 },
      { type: 'setPassengers', kind: 'infants', count: 5 },
    );
    expect(draft.infants).toBe(2);
    expect(run(draft, { type: 'setPassengers', kind: 'adults', count: 1 }).adults).toBe(2);
  });

  it('always keeps one adult', () => {
    expect(run(start, { type: 'setPassengers', kind: 'adults', count: 0 }).adults).toBe(1);
  });
});

describe('toSearchQuery', () => {
  it('builds the results query for a round trip', () => {
    const draft = run(
      start,
      { type: 'setDestination', code: 'IST' },
      { type: 'setPassengers', kind: 'children', count: 1 },
      { type: 'setPromoCode', code: ' dot10 ' },
    );
    expect(validateTrip(draft)).toBeNull();
    expect(toSearchQuery(draft)).toBe(
      'tripType=ROUND_TRIP&from=IKA&to=IST&depart=2026-10-15&return=2026-10-18&adults=1&children=1&cabin=ECONOMY&promo=DOT10',
    );
  });

  it('omits the return for a one-way trip and marks award searches', () => {
    const draft = run(
      start,
      { type: 'setDestination', code: 'MHD' },
      { type: 'setTrip', trip: 'one' },
      { type: 'setAwardSearch', on: true },
      { type: 'setCabin', cabin: 'BUSINESS' },
    );
    expect(toSearchQuery(draft)).toBe(
      'tripType=ONE_WAY&from=THR&to=MHD&depart=2026-10-15&adults=1&cabin=BUSINESS&miles=1',
    );
  });

  it('requires a destination', () => {
    expect(validateTrip(start)).toBe('destination');
  });
});
