'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ButtonLink, Icon, IconButton } from '@aerotech/ui';
import { BookingLink, SectionLink } from './booking-link';
import { Brand } from './brand';
import { LocaleLinks, LocaleMenu } from './locale-menu';
import { useBookingAway } from './use-booking-away';

const MENU_ID = 'site-menu';

const navLink =
  'rounded-control px-3 py-2 text-small text-soft transition-colors duration-(--duration-fast) hover:bg-surface-hover hover:text-strong';
const menuLink =
  'flex min-h-14 items-center justify-between border-b border-hairline px-2 text-field text-default';

export function SiteHeader() {
  const t = useTranslations('Next');
  const locale = useLocale();
  const away = useBookingAway();
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [menuOpen]);

  const links = (className: string, onNavigate?: () => void) => (
    <>
      <BookingLink tab="book" className={className} onNavigate={onNavigate}>
        {onNavigate ? t('booking.tabs.book') : t('nav.book')}
      </BookingLink>
      <BookingLink tab="manage" className={className} onNavigate={onNavigate}>
        {t('nav.manage')}
      </BookingLink>
      <BookingLink tab="checkIn" className={className} onNavigate={onNavigate}>
        {t('nav.checkIn')}
      </BookingLink>
      <BookingLink tab="status" className={className} onNavigate={onNavigate}>
        {t('nav.status')}
      </BookingLink>
      <SectionLink section="routes" className={className} onNavigate={onNavigate}>
        {t('nav.destinations')}
      </SectionLink>
      <SectionLink section="guide" className={className} onNavigate={onNavigate}>
        {t('nav.guide')}
      </SectionLink>
      <SectionLink section="club" className={className} onNavigate={onNavigate}>
        {t('nav.club')}
      </SectionLink>
    </>
  );

  return (
    <>
      <header
        data-solid={solid || menuOpen || undefined}
        className="fixed inset-x-0 top-0 z-(--z-header) border-b border-transparent bg-canvas/55 backdrop-blur-lg backdrop-saturate-150 transition-colors duration-(--duration-base) data-solid:border-hairline data-solid:bg-canvas/90"
      >
        <div className="mx-auto flex h-(--header-height) max-w-page items-center gap-7 px-gutter">
          <Brand name={t('brand')} href={`/${locale}/next`} />
          <nav aria-label={t('nav.aria')} className="hidden gap-1 xl:flex">
            {links(navLink)}
          </nav>
          <div className="ms-auto flex items-center gap-2">
            <BookingLink
              tab="book"
              className={[
                'hidden h-10 items-center gap-2 rounded-control bg-action px-4 text-small font-bold whitespace-nowrap text-on-action transition duration-(--duration-base) ease-pop hover:bg-action-hover md:inline-flex',
                away ? 'visible opacity-100' : 'invisible -translate-y-1.5 scale-95 opacity-0',
              ].join(' ')}
            >
              <Icon name="search" size={16} />
              {t('nav.search')}
            </BookingLink>
            <span className="hidden md:inline-flex">
              <LocaleMenu />
            </span>
            <span className="hidden md:inline-flex">
              <ButtonLink href={`/${locale}/login`} variant="secondary" size="sm">
                <Icon name="user" size={16} />
                {t('nav.login')}
              </ButtonLink>
            </span>
            <IconButton
              variant="ghost"
              size="lg"
              aria-label={t('nav.menu')}
              aria-expanded={menuOpen}
              aria-controls={MENU_ID}
              onPress={() => setMenuOpen((open) => !open)}
              className="xl:hidden"
            >
              <Icon name={menuOpen ? 'close' : 'menu'} size={24} />
            </IconButton>
          </div>
        </div>
      </header>

      <div
        id={MENU_ID}
        hidden={!menuOpen}
        className="fixed inset-x-0 top-(--header-height) bottom-0 z-(--z-header) overflow-auto bg-canvas px-4 pt-3 pb-8 xl:hidden"
      >
        <nav aria-label={t('nav.aria')} className="flex flex-col">
          {links(menuLink, closeMenu)}
          <a href={`/${locale}/login`} className={menuLink}>
            {t('nav.login')}
          </a>
        </nav>
        <p className="mt-6 px-2 text-caption text-muted">{t('nav.language')}</p>
        <LocaleLinks className="mt-1" />
      </div>
    </>
  );
}
