import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ResultsPage } from '@/features/flights/results-page';
import { ResultsSkeleton } from '@/features/flights/results-skeleton';
import { PageShell } from '@/features/shell/page-shell';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  // Every search is a different URL; none of them should be indexed.
  return { title: `${t('flights.title')} · ${t('brand')}`, robots: { index: false } };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PageShell mobileNav={false}>
      {/* The search lives in the query string, which is only known in the browser on a static page. */}
      <Suspense fallback={<ResultsSkeleton />}>
        <ResultsPage />
      </Suspense>
    </PageShell>
  );
}
