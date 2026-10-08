'use client';

import { useTranslations } from 'next-intl';
import { Icon, type IconName } from '@aerotech/ui';
import { Link } from '@/i18n/navigation';
import { useAccount } from '../account/account-context';
import { useOptionalHome, type BookingTab } from '../home/home-context';
import { BookingLink } from './booking-link';
import { useBookingAway } from './use-booking-away';

const ITEMS: ReadonlyArray<{
  tab: BookingTab;
  icon: IconName;
  label: 'search' | 'trips' | 'checkIn' | 'status';
}> = [
  { tab: 'book', icon: 'search', label: 'search' },
  { tab: 'manage', icon: 'bag', label: 'trips' },
  { tab: 'checkIn', icon: 'check-in', label: 'checkIn' },
  { tab: 'status', icon: 'clock', label: 'status' },
];

const item =
  'flex min-h-13 flex-col items-center justify-center gap-0.5 rounded-control text-caption';

/** Bottom navigation on phones. Search turns yellow once the booking card is out of view. */
export function MobileNav() {
  const t = useTranslations('mobileNav');
  const { user, openAuth } = useAccount();
  const home = useOptionalHome();
  const away = useBookingAway();

  return (
    <nav
      aria-label={t('aria')}
      className="home-safe-bottom fixed inset-x-0 bottom-0 z-(--z-header) grid grid-cols-5 border-t border-hairline bg-canvas/95 px-1 pt-1.5 backdrop-blur-lg md:hidden"
    >
      {ITEMS.map(({ tab, icon, label }) => {
        const current = home?.tab === tab;
        const promoted = tab === 'book' && away;
        return (
          <BookingLink
            key={tab}
            tab={tab}
            className={[
              item,
              'transition-colors duration-(--duration-base)',
              promoted
                ? 'mx-0.5 bg-action font-bold text-on-action'
                : current
                  ? 'font-bold text-action'
                  : 'text-muted',
            ].join(' ')}
          >
            <Icon name={icon} size={22} />
            {t(label)}
          </BookingLink>
        );
      })}
      {user ? (
        <Link href="/account" className={`${item} text-muted`}>
          <Icon name="user" size={22} />
          {t('account')}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => openAuth({ thenProfile: true })}
          className={`${item} cursor-pointer text-muted`}
        >
          <Icon name="user" size={22} />
          {t('account')}
        </button>
      )}
    </nav>
  );
}
