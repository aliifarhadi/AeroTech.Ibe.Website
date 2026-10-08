import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Icon, type IconName } from '@aerotech/ui';
import { Reveal } from '../shared/reveal';
import { BookingLink } from '../shell/booking-link';

const card =
  'group flex h-full items-start gap-3.5 rounded-group border border-hairline bg-surface-2 p-4 transition duration-(--duration-base) ease-out-soft hover:-translate-y-0.5 hover:border-action-line hover:bg-surface-3 md:p-5';

type Item = {
  key: 'baggage' | 'changes' | 'checkIn' | 'special' | 'documents' | 'support';
  icon: IconName;
  /** Page path, or null for the check-in tab of the booking card. */
  path: string | null;
};

const ITEMS: readonly Item[] = [
  { key: 'baggage', icon: 'bag', path: '/baggage' },
  { key: 'changes', icon: 'refund', path: '/help' },
  { key: 'checkIn', icon: 'check-in', path: null },
  { key: 'special', icon: 'heart', path: '/help' },
  { key: 'documents', icon: 'document', path: '/help' },
  { key: 'support', icon: 'chat', path: '/contact' },
];

/** Six entry points to the things people look up before a flight. */
export async function GuideSection() {
  const t = await getTranslations('guide');

  return (
    <section id="guide" className="relative py-section">
      <div className="mx-auto max-w-page px-gutter">
        <Reveal>
          <p className="flex items-center gap-2 text-small font-bold text-action">
            <span className="size-2 rounded-chip bg-action" />
            {t('kicker')}
          </p>
          <h2 className="mt-2 text-heading font-bold text-balance text-strong">{t('title')}</h2>
        </Reveal>
        <ul className="mt-9 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ key, icon, path }, index) => {
            const content = (
              <>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-control bg-action-soft text-action">
                  <Icon name={icon} size={22} />
                </span>
                <span className="min-w-0">
                  <span className="block text-field font-bold text-strong">{t(key)}</span>
                  <span className="block text-small text-muted">{t(`${key}Body`)}</span>
                </span>
                <Icon
                  name="arrow"
                  size={18}
                  className="ms-auto mt-3 text-faint transition-colors duration-(--duration-fast) group-hover:text-action"
                />
              </>
            );
            return (
              <li key={key}>
                <Reveal delay={(index % 3) * 40} className="h-full">
                  {path ? (
                    <Link href={path} className={card}>
                      {content}
                    </Link>
                  ) : (
                    <BookingLink tab="checkIn" className={card}>
                      {content}
                    </BookingLink>
                  )}
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
