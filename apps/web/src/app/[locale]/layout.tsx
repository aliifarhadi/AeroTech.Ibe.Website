import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { getDirection } from '@aerotech/domain';
import { UiProvider } from '@aerotech/ui';
import { AccountProvider } from '@/features/account/account-context';
import { routing } from '@/i18n/routing';
import '../globals.css';

export const metadata: Metadata = { title: 'dot air' };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
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
        <NextIntlClientProvider messages={messages}>
          <UiProvider locale={locale}>
            <AccountProvider>{children}</AccountProvider>
          </UiProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
