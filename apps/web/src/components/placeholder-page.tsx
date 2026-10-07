import { getTranslations } from 'next-intl/server';

/** Lightweight stub used by routes that are part of the design preview but not yet built. */
export async function PlaceholderPage({ title }: { title: string }) {
  const common = await getTranslations('Common');
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-start">
      <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
      <p className="mt-3 text-neutral-600">{common('comingSoon')}</p>
    </main>
  );
}
