import { FlightResults } from '@/features/flight-results/flight-results';
import type { CabinKey } from '@/features/flight-results/flight-data';

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined, fallback: string) {
  return typeof value === 'string' && value ? value : fallback;
}

function clampInt(value: string, min: number, max: number, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function toCabinKey(raw: string): CabinKey {
  switch (raw.toUpperCase()) {
    case 'PREMIUM_ECONOMY':
      return 'premiumEconomy';
    case 'BUSINESS':
      return 'business';
    case 'FIRST':
      return 'first';
    default:
      return 'economy';
  }
}

export default async function BookSearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Mock the search BFF latency so the route-level loading state remains testable.
  await new Promise((resolve) => setTimeout(resolve, 1100));
  const params = await searchParams;

  const originCode = first(params.from, 'DOH').toUpperCase();
  const destinationCode = first(params.to, 'LHR').toUpperCase();
  const departureDate = first(params.depart, '2026-07-16');
  const returnDate = params.return ? first(params.return, '') : undefined;
  const tripType = returnDate ? 'ROUND_TRIP' : 'ONE_WAY';

  return (
    <FlightResults
      originCode={originCode}
      destinationCode={destinationCode}
      tripType={tripType}
      departureDate={departureDate}
      returnDate={returnDate}
      passengers={{
        adults: clampInt(first(params.adults, '1'), 1, 9, 1),
        children: clampInt(first(params.children, '0'), 0, 9, 0),
        infants: clampInt(first(params.infants, '0'), 0, 9, 0),
        cabin: toCabinKey(first(params.cabin, 'ECONOMY')),
      }}
    />
  );
}
