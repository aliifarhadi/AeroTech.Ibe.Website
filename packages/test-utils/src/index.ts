import type { SearchCriteria } from '@aerotech/domain';

/** Data factories and render helpers for tests. Expanded alongside features. */

export function makeSearchCriteria(overrides: Partial<SearchCriteria> = {}): SearchCriteria {
  return {
    tripType: 'ROUND_TRIP',
    origin: 'IKA',
    destination: 'DXB',
    departureDate: '2026-09-12',
    returnDate: '2026-09-20',
    passengers: [{ type: 'ADT', count: 1 }],
    cabin: 'ECONOMY',
    promoCode: null,
    awardSearch: false,
    ...overrides,
  };
}
