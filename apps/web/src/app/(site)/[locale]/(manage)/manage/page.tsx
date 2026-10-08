import { getTranslations } from 'next-intl/server';

export default async function ManagePage() {
  const nav = await getTranslations('Nav');
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">{nav('manage')}</h1>
      <p className="mt-2 text-neutral-600">
        Manage booking placeholder. Retrieval by reference + surname lands in Phase 5.
      </p>
    </main>
  );
}
