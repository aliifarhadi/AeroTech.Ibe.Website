import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { getDirection } from '@aerotech/domain';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { routing } from '@/i18n/routing';
import '../../globals.css';

export const metadata: Metadata = {
  title: 'DotAir',
  description: 'DotAir — book flights, manage bookings, and check in.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Direction is derived from the locale and applied to the document root so the whole
  // tree inherits it and CSS logical properties mirror correctly for RTL markets.
  const direction = getDirection(locale);
  const messages = await getMessages();
  const common = await getTranslations('Common');

  // Preload the fonts actually used so text paints in Alibaba immediately (no swap flash).
  ReactDOM.preload('/fonts/alibaba/Alibaba-Regular.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  });
  ReactDOM.preload('/fonts/alibaba/Alibaba-Bold.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  });

  return (
    <html lang={locale} dir={direction}>
      <body className="overflow-x-clip bg-white text-neutral-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-white"
          >
            {common('skipToContent')}
          </a>
          <SiteHeader />
          <div id="content">{children}</div>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
