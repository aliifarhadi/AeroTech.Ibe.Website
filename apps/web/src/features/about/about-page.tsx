import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { LeafIcon, ShieldIcon, UsersIcon } from '@/components/icons';
import { Eyebrow, Heading, Lead } from '@/components/ui/typography';
import { WordReveal } from '@/components/ui/word-reveal';
import { Link } from '@/i18n/navigation';

const STATS = ['destinations', 'onTime', 'guests', 'fleet'] as const;
const VALUES = [
  { key: 'safety', Icon: ShieldIcon },
  { key: 'guests', Icon: UsersIcon },
  { key: 'planet', Icon: LeafIcon },
] as const;

export async function AboutPage() {
  const t = await getTranslations('About');

  return (
    <main className="bg-white pb-4">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-neutral-950 text-white">
        <Image
          src="/images/cabin.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-55"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-neutral-950/40"
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:pb-24 sm:pt-24">
          <Eyebrow onDark>{t('eyebrow')}</Eyebrow>
          <Heading variant="display" className="mt-4 max-w-3xl">
            <WordReveal text={t.raw('title')} highlightClassName="text-shimmer" />
          </Heading>
          <Lead className="mt-5 max-w-xl text-neutral-300">{t('subtitle')}</Lead>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="-mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-200 shadow-xl shadow-black/5 sm:-mt-16 lg:grid-cols-4">
          {STATS.map((key, i) => (
            <Reveal key={key} delay={i * 80} className="bg-white p-6 text-start sm:p-8">
              <div className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                {t(`stats.${key}.value`)}
              </div>
              <div className="mt-1 text-sm text-neutral-600">{t(`stats.${key}.label`)}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto mt-20 max-w-6xl px-4 sm:mt-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="text-start">
            <Eyebrow>{t('storyEyebrow')}</Eyebrow>
            <Heading variant="section" className="mt-3 text-black">
              {t('storyTitle')}
            </Heading>
            <p className="mt-4 leading-relaxed text-neutral-600">{t('storyP1')}</p>
            <p className="mt-4 leading-relaxed text-neutral-600">{t('storyP2')}</p>
          </Reveal>
          <Reveal
            delay={100}
            className="relative h-72 overflow-hidden rounded-3xl ring-1 ring-black/5 sm:h-96"
          >
            <Image
              src="/images/istanbul.jpg"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto mt-20 max-w-6xl px-4 sm:mt-28">
        <Reveal className="text-start">
          <Eyebrow>{t('valuesEyebrow')}</Eyebrow>
          <Heading variant="section" className="mt-3 text-black">
            {t('valuesTitle')}
          </Heading>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {VALUES.map(({ key, Icon }, i) => (
            <Reveal
              as="article"
              key={key}
              delay={i * 90}
              className="rounded-3xl border border-neutral-200 bg-white p-6 text-start transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <Icon className="size-6" />
              </span>
              <Heading variant="card" className="mt-4 text-black">
                {t(`values.${key}.title`)}
              </Heading>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {t(`values.${key}.desc`)}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-20 max-w-6xl px-4 sm:mt-28">
        <Reveal className="flex flex-col items-start gap-5 rounded-3xl bg-brand-400 p-8 text-start sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <Heading variant="section" className="text-black">
              {t('ctaTitle')}
            </Heading>
            <p className="mt-2 text-black/75">{t('ctaBody')}</p>
          </div>
          <Link href="/book/search">
            <Button variant="primary" size="lg">
              {t('ctaButton')}
            </Button>
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
