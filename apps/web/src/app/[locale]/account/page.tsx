import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProfilePage } from '@/features/account/profile-page';
import { PageShell } from '@/features/shell/page-shell';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: `${t('profile.title')} · ${t('brand')}`, robots: { index: false } };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <PageShell>
      <ProfilePage />
    </PageShell>
  );
}
