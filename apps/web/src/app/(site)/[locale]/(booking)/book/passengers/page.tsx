import { PassengerPage } from '@/features/passengers/passenger-page';

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined, fallback: string) {
  return typeof value === 'string' && value ? value : fallback;
}

export default async function PassengersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <PassengerPage
      origin={first(params.from, 'Doha (DOH)')}
      destination={first(params.to, 'London (LHR)')}
      departureDate={first(params.depart, '2026-07-12')}
      fare={first(params.fare, 'Economy Convenience')}
      price={first(params.price, 'US$389')}
    />
  );
}
