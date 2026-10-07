import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { formatMoney, resolveMarketContext } from '@aerotech/domain';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { ArrowRightIcon, HeadsetIcon, RefreshIcon, ShieldIcon, TagIcon } from '@/components/icons';
import { Eyebrow, Heading } from '@/components/ui/typography';
import { WordReveal } from '@/components/ui/word-reveal';
import { Link } from '@/i18n/navigation';
import { BookingWidget } from '@/features/booking-widget/booking-widget';

export async function Hero() {
  const t = await getTranslations('Home');

  return (
    <section className="relative overflow-visible bg-white">
      <div className="relative isolate min-h-[520px] overflow-hidden bg-neutral-950 sm:min-h-[540px] lg:min-h-[500px]">
        <Image
          src="/images/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10"
        />
        <div
          aria-hidden="true"
          className="animate-glow pointer-events-none absolute -end-24 top-16 size-80 rounded-full bg-brand-400/20 blur-3xl sm:size-[28rem]"
        />

        <div className="relative mx-auto flex min-h-[520px] max-w-6xl items-end px-4 pb-24 pt-20 sm:min-h-[540px] sm:pb-28 sm:pt-24 lg:min-h-[500px] lg:pb-24 lg:pt-20">
          <div className="max-w-xl text-start text-white animate-fade-up">
            <span className="inline-flex rounded-full bg-brand-400 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-black">
              {t('heroBadge')}
            </span>
            <Heading variant="display" className="mt-4 max-w-xl text-white">
              <WordReveal text={t.raw('title')} highlightClassName="text-shimmer" />
            </Heading>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/85">
              {t('subtitle')}
            </p>
            <Link
              href="/offers"
              className="mt-7 inline-flex items-center rounded-full bg-white px-7 py-3.5 text-sm font-bold text-black shadow-lg transition hover:bg-brand-100"
            >
              {t('heroCta')}
              <ArrowRightIcon className="ms-2 size-4 rtl:-scale-x-100" />
            </Link>
          </div>
        </div>
      </div>

      <div
        className="relative z-10 mx-auto -mt-[32rem] max-w-6xl px-4 pb-1 animate-fade-up sm:-mt-16 lg:-mt-12"
        style={{ animationDelay: '120ms' }}
      >
        <BookingWidget />
      </div>
    </section>
  );
}

const TRUST = [
  { key: 'a', Icon: TagIcon },
  { key: 'b', Icon: ShieldIcon },
  { key: 'c', Icon: HeadsetIcon },
  { key: 'd', Icon: RefreshIcon },
] as const;

export async function TrustStrip() {
  const t = await getTranslations('Trust');
  return (
    <section className="mx-auto mt-24 max-w-6xl px-4 sm:mt-28">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST.map(({ key, Icon }, i) => (
          <Reveal
            key={key}
            delay={i * 80}
            className="flex items-start gap-3 bg-white p-5 text-start transition-colors duration-300 hover:bg-brand-50 sm:p-6"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <Icon className="size-6" />
            </span>
            <div>
              <p className="font-bold text-black">{t(`items.${key}.title`)}</p>
              <p className="mt-0.5 text-sm text-neutral-600">{t(`items.${key}.desc`)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const DESTINATIONS = [
  { code: 'DXB', amount: '199', img: 'dubai' },
  { code: 'IST', amount: '149', img: 'istanbul' },
  { code: 'LHR', amount: '179', img: 'london' },
  { code: 'BER', amount: '159', img: 'berlin' },
] as const;

export async function Destinations() {
  const t = await getTranslations('Destinations');
  const locale = await getLocale();
  const { currency } = resolveMarketContext(locale);

  return (
    <section className="mx-auto mt-28 max-w-6xl px-4 sm:mt-40">
      <Reveal className="text-start">
        <Eyebrow>{t('eyebrow')}</Eyebrow>
        <Heading variant="section" className="mt-3 text-black">
          <WordReveal text={t.raw('title')} />
        </Heading>
        <p className="mt-2 text-neutral-600">{t('subtitle')}</p>
      </Reveal>

      <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {DESTINATIONS.map((d, i) => (
          <Reveal as="li" key={d.code} delay={i * 80}>
            <Link
              href="/destinations"
              className="group relative flex h-72 flex-col justify-end overflow-hidden rounded-3xl shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:h-80"
            >
              <Image
                src={`/images/${d.img}.jpg`}
                alt={t(`cities.${d.code}`)}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
              />
              <div className="relative flex items-end justify-between gap-2 p-5 text-white">
                <div>
                  <p className="text-lg font-semibold">{t(`cities.${d.code}`)}</p>
                  <p className="mt-0.5 text-sm text-white/80">{t('from')}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-black">
                  {formatMoney({ amount: d.amount, currency }, locale)}
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

export async function Offers() {
  const t = await getTranslations('Offers');
  const cards = ['a', 'b', 'c'] as const;

  const images = ['cabin', 'istanbul', 'dubai'] as const;

  return (
    <section className="mx-auto mt-28 max-w-6xl px-4 sm:mt-40">
      <Reveal className="text-start">
        <Eyebrow>{t('eyebrow')}</Eyebrow>
        <Heading variant="section" className="mt-3 text-black">
          <WordReveal text={t.raw('title')} />
        </Heading>
        <p className="mt-2 text-neutral-600">{t('subtitle')}</p>
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal
            as="article"
            key={c}
            delay={i * 80}
            className="group relative flex h-96 flex-col justify-end overflow-hidden rounded-3xl shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Image
              src={`/images/${images[i]}.jpg`}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
            />
            <div className="relative p-5 text-white">
              <span className="inline-block w-fit rounded-full bg-brand-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
                {t(`cards.${c}.badge`)}
              </span>
              <Heading variant="card" className="mt-3">{t(`cards.${c}.title`)}</Heading>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{t(`cards.${c}.desc`)}</p>
              <Link
                href="/offers"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-300 transition-all group-hover:gap-2"
              >
                {t('cta')}
                <ArrowRightIcon className="size-4 rtl:-scale-x-100" />
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export async function Loyalty() {
  const t = await getTranslations('Loyalty');
  return (
    <section className="mx-auto mt-28 max-w-6xl px-4 sm:mt-40">
      <Reveal className="grid overflow-hidden rounded-3xl bg-neutral-950 md:grid-cols-2">
        <div className="order-2 p-8 text-start sm:p-12 md:order-1">
          <Eyebrow onDark>{t('eyebrow')}</Eyebrow>
          <Heading variant="section" className="mt-3 text-white">
            <WordReveal text={t.raw('title')} />
          </Heading>
          <p className="mt-3 max-w-md text-neutral-300">{t('body')}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/signup">
              <Button variant="accent" size="lg">
                {t('join')}
              </Button>
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-[var(--radius-control)] border border-white/25 px-6 font-semibold text-white transition hover:bg-white/10"
            >
              {t('login')}
            </Link>
          </div>
        </div>
        <div className="relative order-1 min-h-56 md:order-2 md:min-h-full">
          <Image
            src="/images/cabin.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </Reveal>
    </section>
  );
}

export async function AppPromo() {
  const t = await getTranslations('AppPromo');
  return (
    <section className="mx-auto mt-28 max-w-6xl px-4 sm:mt-40">
      <Reveal className="relative isolate flex flex-col items-start gap-5 overflow-hidden rounded-3xl bg-brand-400 p-8 text-start shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-16 -top-24 z-0 size-72 rounded-full border-[40px] border-black/5"
        />
        <div className="relative z-10">
          <Heading variant="section" className="text-black">
            <WordReveal text={t.raw('title')} />
          </Heading>
          <p className="mt-2 text-black/75">{t('body')}</p>
        </div>
        <Button variant="primary" size="lg" className="relative z-10">
          {t('cta')}
        </Button>
      </Reveal>
    </section>
  );
}
