import type { ReactNode } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Icon, toBcp47, type IconName } from '@aerotech/ui';
import { BookingLink, SectionLink } from './booking-link';
import { Brand } from './brand';
import { LocaleMenu } from './locale-menu';
import { TehranClock } from './tehran-clock';

const link =
  'self-start py-1.5 text-small text-muted transition-colors duration-(--duration-fast) hover:text-strong';

/** Placeholder profile URLs: replace with the airline's real accounts before launch. */
const SOCIAL: ReadonlyArray<{ key: IconName & string; href: string }> = [
  { key: 'instagram', href: 'https://www.instagram.com/' },
  { key: 'telegram', href: 'https://telegram.org/' },
  { key: 'x', href: 'https://x.com/' },
  { key: 'linkedin', href: 'https://www.linkedin.com/' },
  { key: 'youtube', href: 'https://www.youtube.com/' },
  { key: 'aparat', href: 'https://www.aparat.com/' },
];

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h2 className="mb-2 text-small font-bold text-default">{title}</h2>
      {children}
    </div>
  );
}

export async function SiteFooter() {
  const t = await getTranslations();
  const locale = await getLocale();
  const year = new Intl.DateTimeFormat(toBcp47(locale), { year: 'numeric' }).format(new Date());

  return (
    <footer className="home-footer border-t border-hairline bg-canvas-deep pt-14">
      <div className="mx-auto max-w-page px-gutter">
        <div className="home-footer-grid grid gap-x-7 gap-y-10">
          <div className="flex flex-col gap-4">
            <Brand name={t('brand')} className="self-start" />
            <p className="max-w-xs text-small text-muted">{t('footer.tagline')}</p>
            <ul aria-label={t('footer.socialAria')} className="flex flex-wrap gap-1.5">
              {SOCIAL.map(({ key, href }) => (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t(`footer.social.${key}` as 'footer.social.instagram')}
                    className="flex size-11 items-center justify-center rounded-chip border border-strong-line text-soft transition duration-(--duration-base) ease-pop hover:-translate-y-0.5 hover:border-action hover:bg-action hover:text-on-action"
                  >
                    <Icon name={key} size={18} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <Column title={t('footer.fly')}>
            <BookingLink tab="book" className={link}>
              {t('booking.tabs.book')}
            </BookingLink>
            <BookingLink tab="manage" className={link}>
              {t('nav.manage')}
            </BookingLink>
            <BookingLink tab="checkIn" className={link}>
              {t('nav.checkIn')}
            </BookingLink>
            <BookingLink tab="status" className={link}>
              {t('nav.status')}
            </BookingLink>
            <SectionLink section="routes" className={link}>
              {t('footer.network')}
            </SectionLink>
          </Column>
          <Column title={t('footer.destinations')}>
            {(['MHD', 'SYZ', 'IFN', 'KIH', 'IST'] as const).map((code) => (
              <SectionLink key={code} section="routes" route={code} className={link}>
                {t(`cities.${code}.name`)}
              </SectionLink>
            ))}
          </Column>
          <Column title={t('footer.help')}>
            <Link href="/baggage" className={link}>
              {t('footer.baggage')}
            </Link>
            <Link href="/help" className={link}>
              {t('footer.faq')}
            </Link>
            <Link href="/contact" className={link}>
              {t('footer.contact')}
            </Link>
          </Column>
          <Column title={t('footer.company')}>
            <Link href="/about" className={link}>
              {t('footer.about')}
            </Link>
            <Link href="/loyalty" className={link}>
              {t('footer.loyalty')}
            </Link>
            <Link href="/offers" className={link}>
              {t('footer.offers')}
            </Link>
          </Column>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-hairline pt-4 text-small text-faint">
          <span>{t('footer.rights', { year })}</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span dir="ltr" className="font-mono text-caption tracking-wide">
              {t('footer.tehran')} <TehranClock />
            </span>
            <LocaleMenu variant="footer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
