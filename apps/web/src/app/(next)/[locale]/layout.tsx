import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { getDirection } from '@aerotech/domain';
import { UiProvider } from '@aerotech/ui';
import { routing } from '@/i18n/routing';
import '../../next.css';

/**
 * Root layout of the redesigned routes. It is a second root layout on purpose: the redesign
 * uses a different stylesheet (design tokens, no default Tailwind palette), and a separate
 * root layout is how the App Router keeps two global stylesheets from ever meeting.
 * Moving between the current site and these routes is a full page load.
 */
export const metadata: Metadata = {
  title: 'dot air',
  // Not indexed until these routes replace the current site.
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function NextRootLayout({
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

  const messages = await getMessages();

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
    <html lang={locale} dir={getDirection(locale)}>
      <body className="min-h-dvh overflow-x-clip bg-canvas text-default antialiased">
        {/* Only the redesign's own messages go to the browser. */}
        <NextIntlClientProvider messages={{ Next: messages.Next }}>
          <UiProvider locale={locale}>{children}</UiProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
