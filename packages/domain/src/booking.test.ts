import { describe, expect, it } from 'vitest';
import { mayOccupy, seatFacts, seatRows } from './cabin-map';
import { adultFare, familiesOf, priceLeg, seatFee } from './fares';
import { clockTime, dayOffset, flightsFor, inTimeOfDay, sortFlights } from './sample-schedule';

describe('sample schedule', () => {
  it('is deterministic and covers any pair of cities', () => {
    const a = flightsFor('SYZ', 'MHD', '2026-10-15');
    expect(a.length).toBeGreaterThanOrEqual(5);
    expect(flightsFor('SYZ', 'MHD', '2026-10-15')).toEqual(a);
    expect(flightsFor('SYZ', 'SYZ', '2026-10-15')).toEqual([]);
    expect(new Set(a.map((flight) => flight.number)).size).toBe(a.length);
  });

  it('tickets Tehran as IKA to Istanbul and shifts arrival to local time', () => {
    const [first] = flightsFor('THR', 'IST', '2026-10-15');
    expect(first).toMatchObject({ from: 'IKA', to: 'IST', international: true });
    expect(first && first.arrival - first.departure).toBe(195 - 30);
  });

  it('has a one-stop sample via Shiraz on the long southern routes', () => {
    const stops = flightsFor('THR', 'KIH', '2026-10-16').filter((flight) => flight.stop);
    for (const flight of stops) {
      expect(flight.stop?.code).toBe('SYZ');
      expect(flight.duration).toBe(80 + 45 + 45);
    }
  });

  it('sorts and filters', () => {
    const flights = flightsFor('THR', 'MHD', '2026-10-15');
    const byPrice = sortFlights(flights, 'price').map((flight) => flight.priceFactor);
    expect(byPrice).toEqual([...byPrice].sort((x, y) => x - y));
    expect(
      flights.filter((flight) => inTimeOfDay(flight, 'morning')).every((f) => f.departure < 720),
    ).toBe(true);
  });

  it('formats times past midnight', () => {
    expect(clockTime(1445)).toBe('00:05');
    expect(dayOffset(1445)).toBe(1);
    expect(dayOffset(600)).toBe(0);
  });
});

describe('fares', () => {
  it('prices business above economy and flex above light', () => {
    const light = adultFare(752, 1, 'ECONOMY', 0, 'IRT');
    expect(light % 10_000).toBe(0);
    expect(adultFare(752, 1, 'ECONOMY', 0.42, 'IRT')).toBeGreaterThan(light);
    expect(adultFare(752, 1, 'BUSINESS', 0, 'EUR')).toBeGreaterThan(
      adultFare(752, 1, 'ECONOMY', 0.42, 'EUR'),
    );
    expect(familiesOf('ECONOMY').map((family) => family.id)).toEqual(['light', 'classic', 'flex']);
  });

  it('charges seat fees by family', () => {
    expect(seatFee('light', false, 'EUR')).toBe(6);
    expect(seatFee('classic', false, 'EUR')).toBe(0);
    expect(seatFee('classic', true, 'EUR')).toBe(14);
    expect(seatFee('flex', true, 'IRT')).toBe(0);
  });

  it('totals a leg for the whole party', () => {
    const price = priceLeg(
      100,
      'light',
      [{ id: '5A', extraLegroom: false }, { id: '11A', extraLegroom: true }, null],
      { adults: 2, children: 1, infants: 1 },
      'EUR',
    );
    expect(price).toEqual({ fares: 310, seats: 20, total: 330 });
  });
});

describe('cabin map', () => {
  it('lays out 2 business and 22 economy rows, the same every time', () => {
    const rows = seatRows('flight-1');
    expect(rows).toHaveLength(24);
    expect(rows[0]?.seats.map((seat) => seat.letter)).toEqual(['A', 'C', 'D', 'F']);
    expect(rows[2]?.seats).toHaveLength(6);
    expect(rows.filter((row) => row.exit).map((row) => row.number)).toEqual([11, 12]);
    expect(seatRows('flight-1')).toEqual(rows);
  });

  it('describes seats', () => {
    expect(seatFacts('1A')).toMatchObject({ cabin: 'BUSINESS', position: 'window' });
    const exit = seatFacts('11A');
    expect(exit.extraLegroom).toBe(true);
    expect(exit.features.map((item) => item.feature)).toEqual(
      expect.arrayContaining(['pitchExtra', 'exitRow', 'noRecline', 'overWing']),
    );
    expect(seatFacts('20B').position).toBe('middle');
  });

  it('keeps children out of exit rows', () => {
    expect(mayOccupy('11A', 'child')).toBe(false);
    expect(mayOccupy('12F', 'adult')).toBe(true);
    expect(mayOccupy('13A', 'child')).toBe(true);
  });
});
