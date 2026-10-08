'use client';

import type { ReactNode } from 'react';
import { NETWORK_ROUTES } from '@aerotech/domain';
import { Link } from '@/i18n/navigation';
import { scrollToId, useOptionalHome, type BookingTab } from '../home/home-context';

type LinkProps = { className?: string; children: ReactNode; onNavigate?: () => void };

/**
 * Link to the booking card on a given tab. On the home page it switches the tab and scrolls;
 * anywhere else it is an ordinary link to the home page.
 */
export function BookingLink({
  tab,
  className,
  children,
  onNavigate,
}: LinkProps & { tab: BookingTab }) {
  const home = useOptionalHome();
  return (
    <Link
      href={`/?tab=${tab}#book`}
      className={className}
      aria-current={home?.tab === tab ? 'true' : undefined}
      onClick={(event) => {
        onNavigate?.();
        if (!home) return;
        event.preventDefault();
        home.focusBooking(tab);
      }}
    >
      {children}
    </Link>
  );
}

/** Link to a section of the home page; `route` also selects that city on the network map. */
export function SectionLink({
  section,
  route,
  className,
  children,
  onNavigate,
}: LinkProps & { section: string; route?: string }) {
  const home = useOptionalHome();
  return (
    <Link
      href={`/#${section}`}
      className={className}
      onClick={(event) => {
        onNavigate?.();
        if (!home) return;
        event.preventDefault();
        const index = route ? NETWORK_ROUTES.findIndex((item) => item.code === route) : -1;
        if (index >= 0) home.setActiveRoute(index, true);
        scrollToId(section);
      }}
    >
      {children}
    </Link>
  );
}
