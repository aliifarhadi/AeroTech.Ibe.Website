import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Icon } from '@aerotech/ui';
import { PageShell } from '@/features/shell/page-shell';
import { Link } from '@/i18n/navigation';

/** Pages the site links to that are not built yet. Anything else is a 404. */
const PLANNED = [
  'help',
  'baggage',
  'contact',
  'about',
  'loyalty',
  'offers',
  'manage',
  'check-in',
  'flight-status',
];

type Props = { params: Promise<{ locale: string; rest: string[] }> };

export const metadata = { robots: { index: false } };

export default async function Page({ params }: Props) {
  const { locale, rest } = await params;
  if (rest.length !== 1 || !PLANNED.includes(rest[0] ?? '')) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('placeholder');

  return (
    <PageShell>
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-gutter py-section text-center">
        <span className="flex size-14 items-center justify-center rounded-chip bg-action-soft text-action">
          <Icon name="clock" size={26} />
        </span>
        <h1 className="text-heading font-bold text-strong">{t('title')}</h1>
        <p className="text-muted">{t('body')}</p>
        <Link
          href="/"
          className="inline-flex h-12 items-center gap-2 rounded-control bg-action px-5 font-bold text-on-action transition-colors duration-(--duration-fast) hover:bg-action-hover"
        >
          {t('home')}
          <Icon name="arrow" size={16} />
        </Link>
      </div>
    </PageShell>
  );
}
