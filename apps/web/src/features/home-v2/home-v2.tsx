import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import {
  ArrowRightIcon,
  CarIcon,
  GiftIcon,
  HotelIcon,
  PlaneIcon,
  ShopIcon,
} from '@/components/icons';
import { Heading } from '@/components/ui/typography';
import { Link } from '@/i18n/navigation';
import { BookingWidget } from '@/features/booking-widget/booking-widget';

const PROMOS = [
  { key: 'app', img: 'cabin' },
  { key: 'assistant', img: 'istanbul' },
  { key: 'guide', img: 'dubai' },
] as const;

const NOTICES = [
  { key: 'a', date: 'Jul 10, 2026' },
  { key: 'b', date: 'Jul 10, 2026' },
  { key: 'c', date: 'Jul 09, 2026' },
  { key: 'd', date: 'Jul 08, 2026' },
] as const;

const TRAVEL = [
  { key: 'gift', Icon: GiftIcon },
  { key: 'hotels', Icon: HotelIcon },
  { key: 'cars', Icon: CarIcon },
  { key: 'dutyFree', Icon: ShopIcon },
] as const;

export async function HomeV2() {
  const t = await getTranslations('HomeV2');

  return (
    <main className="bg-white text-neutral-900">
      {/* ============================ HERO (widget-first) ============================ */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-brand-50 via-brand-50/50 to-white"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -start-24 -top-24 size-[26rem] rounded-full bg-brand-200/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-16 top-0 size-80 rounded-full bg-accent-300/25 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-10 sm:pt-14">
          <div className="mb-6 text-center">
            <Heading as="h1" variant="section" className="text-black">
              {t('heroTitle')}
            </Heading>
            <p className="mt-1.5 text-sm text-neutral-600">{t('heroSubtitle')}</p>
          </div>
          <BookingWidget />
        </div>
      </section>

      {/* ============================ ANNOUNCEMENT BANNER ============================ */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-brand-50 px-6 py-6 text-center sm:flex-row sm:justify-center sm:gap-5">
          <p className="text-sm font-medium text-neutral-800 sm:text-base">{t('bannerText')}</p>
          <Link
            href="/about"
            className="inline-flex h-9 shrink-0 items-center rounded-full border border-neutral-300 bg-white px-5 text-sm font-semibold text-black transition hover:border-brand-400"
          >
            {t('bannerCta')}
          </Link>
        </div>
      </section>

      {/* ============================ PROMO TILES ============================ */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {PROMOS.map((p) => (
            <Link key={p.key} href="/offers" className="group block text-start">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                <Image
                  src={`/images/${p.img}.jpg`}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-black group-hover:text-brand-700">
                {t(`promos.${p.key}.title`)}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                {t(`promos.${p.key}.desc`)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================ NOTICE + APP ============================ */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
          <div>
            <div className="flex items-end justify-between">
              <Heading variant="section" className="text-black">
                {t('noticesTitle')}
              </Heading>
              <Link href="/help" className="text-sm font-semibold text-brand-700 hover:underline">
                {t('noticesViewAll')}
              </Link>
            </div>
            <ul className="mt-5 divide-y divide-neutral-100 border-t border-neutral-200">
              {NOTICES.map((n) => (
                <li key={n.key}>
                  <Link
                    href="/help"
                    className="flex items-center justify-between gap-4 py-4 transition hover:text-brand-700"
                  >
                    <span className="text-[15px] font-medium text-neutral-800">
                      {t(`notices.${n.key}`)}
                    </span>
                    <span className="shrink-0 text-xs text-neutral-400" dir="ltr">
                      {n.date}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <aside className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-neutral-950 p-6 text-white">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-10 -top-10 size-40 rounded-full bg-brand-400/20 blur-2xl"
            />
            <div className="relative">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-400 text-black">
                <PlaneIcon className="size-6" />
              </span>
              <p className="mt-4 text-lg font-semibold">{t('appTitle')}</p>
              <p className="mt-1 text-sm text-white/70">{t('appDesc')}</p>
            </div>
            <Link
              href="/about"
              className="relative mt-6 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-brand-400 px-5 text-sm font-bold text-black transition hover:bg-brand-500"
            >
              {t('appCta')}
              <ArrowRightIcon className="size-4 rtl:-scale-x-100" />
            </Link>
          </aside>
        </div>
      </section>

      {/* ============================ COMPLETE YOUR TRAVEL ============================ */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:pb-28">
        <div className="rounded-3xl bg-brand-50 px-6 py-10 sm:px-10 sm:py-12">
          <Heading variant="section" className="text-center text-black">
            {t('travelTitle')}
          </Heading>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {TRAVEL.map(({ key, Icon }) => (
              <Link
                key={key}
                href="/offers"
                className="group flex flex-col items-center gap-3 rounded-2xl bg-white px-4 py-7 text-center shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="grid size-12 place-items-center rounded-full bg-brand-100 text-brand-700 transition group-hover:bg-brand-400 group-hover:text-black">
                  <Icon className="size-6" />
                </span>
                <span className="text-sm font-semibold text-black">{t(`travel.${key}`)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
