import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HomePage } from '@/features/next/home/home-page';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Next' });
  return { title: `${t('brand')} · ${t('hero.title')}`, description: t('hero.subtitle') };
}

/** The redesigned home page. It replaces `/[locale]` in the last phase of the redesign. */
export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomePage />;
}
