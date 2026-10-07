'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { BrandLogo } from '@/components/brand-logo';
import { PinIcon } from '@/components/icons';

export function FlightSearchLoading() {
  const t = useTranslations('SearchResults');

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t('loadingResults')}
      className="fixed inset-0 z-[200] grid min-h-dvh overflow-hidden bg-neutral-50 lg:grid-cols-[49%_51%]"
    >
      <section className="relative min-h-[47dvh] overflow-hidden lg:m-4 lg:min-h-0 lg:rounded-2xl">
        <Image
          src="/images/cabin.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 49vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/30" />

        <div className="absolute inset-x-5 top-5 sm:inset-x-7 sm:top-7">
          <div className="h-[3px] overflow-hidden rounded-full bg-white/35">
            <span className="animate-loading-progress block h-full rounded-full bg-white" />
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white drop-shadow">
            <PinIcon className="size-5" />
            {t('loadingWelcome')}
          </p>
        </div>

        <div className="absolute bottom-5 start-5 flex gap-2 sm:bottom-7 sm:start-7">
          {[2023, 2024, 2025].map((year) => (
            <span
              key={year}
              className="inline-flex size-16 flex-col items-center justify-center rounded-full border-2 border-brand-300 bg-[radial-gradient(circle_at_35%_30%,var(--color-brand-200),var(--color-brand-600))] text-center text-[8px] font-black uppercase leading-tight text-brand-900 shadow-lg sm:size-[4.5rem]"
            >
              <span>{t('loadingAward')}</span>
              <span className="mt-1 text-[10px]">{year}</span>
            </span>
          ))}
        </div>
      </section>

      <section className="flex items-center px-6 py-10 sm:px-12 lg:px-12 xl:px-16">
        <div className="max-w-3xl">
          <BrandLogo name="DotAir" textClassName="text-xl" />
          <h1 className="mt-6 text-3xl font-normal leading-[1.18] tracking-[-0.025em] text-black sm:text-4xl xl:text-[2.7rem]">
            {t('loadingTitle')}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">{t('loadingResults')}</p>
          <span className="sr-only">{t('loadingResults')}</span>
        </div>
      </section>
    </div>
  );
}
