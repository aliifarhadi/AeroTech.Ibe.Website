import { getTranslations } from 'next-intl/server';

export default async function FlightStatusPage() {
  const nav = await getTranslations('Nav');
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">{nav('flightStatus')}</h1>
      <p className="mt-2 text-neutral-600">
        Flight status placeholder. Flight-number and route search land in Phase 5.
      </p>
    </main>
  );
}
