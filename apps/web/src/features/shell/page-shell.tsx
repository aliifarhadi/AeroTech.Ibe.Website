import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { MobileNav } from './mobile-nav';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { SkipLink } from './skip-link';

/** Header, main landmark, footer and phone navigation around a page's content. */
export async function PageShell({
  children,
  mobileNav = true,
}: {
  children: ReactNode;
  /** Pages with their own bottom bar (search results) leave the phone navigation out. */
  mobileNav?: boolean;
}) {
  const t = await getTranslations();
  return (
    <>
      <SkipLink label={t('skip')} />
      <SiteHeader />
      <main id="main" className="pt-(--header-height)">
        {children}
      </main>
      <SiteFooter />
      {mobileNav ? <MobileNav /> : null}
    </>
  );
}
