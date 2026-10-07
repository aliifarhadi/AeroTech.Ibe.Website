import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import {
  AccessibilityIcon,
  AlertIcon,
  BabyIcon,
  BriefcaseIcon,
  DumbbellIcon,
  LuggageIcon,
  MusicIcon,
  PackageIcon,
} from '@/components/icons';
import { Eyebrow, Heading, Lead } from '@/components/ui/typography';
import { WordReveal } from '@/components/ui/word-reveal';
import { Link } from '@/i18n/navigation';

const CABINS = ['economy', 'premiumEconomy', 'business', 'first'] as const;
const NAV = ['cabin', 'checked', 'extra', 'special', 'restricted', 'help'] as const;
const EXTRA = ['a', 'b'] as const;
const SPECIAL = [
  { key: 'sports', Icon: DumbbellIcon },
  { key: 'music', Icon: MusicIcon },
  { key: 'medical', Icon: AccessibilityIcon },
  { key: 'infant', Icon: BabyIcon },
] as const;

export async function BaggagePage() {
  const t = await getTranslations('Baggage');
  const tw = await getTranslations('Widget');

  return (
    <main className="bg-white pb-4">
      {/* Hero */}
      <section className="border-b border-neutral-200 bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 text-start sm:py-16">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <Heading variant="display" className="mt-4 max-w-2xl text-black">
            <WordReveal text={t.raw('title')} />
          </Heading>
          <Lead className="mt-4 max-w-2xl">{t('subtitle')}</Lead>
          <nav aria-label={t('eyebrow')} className="mt-7 flex flex-wrap gap-2">
            {NAV.map((key) => (
              <a
                key={key}
                href={`#${key}`}
                className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-800 transition hover:border-brand-400 hover:text-brand-700"
              >
                {t(`nav.${key}`)}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* Cabin baggage */}
      <Section id="cabin" icon={<BriefcaseIcon className="size-6" />} title={t('cabin.title')}>
        <p className="max-w-3xl text-neutral-600">{t('cabin.intro')}</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-sm font-bold text-black">{t('cabin.personalItem')}</p>
            <p className="mt-1 text-sm text-neutral-600">{t('cabin.personalItemNote')}</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-neutral-200">
            <table className="w-full min-w-[26rem] text-start text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-4 py-3 text-start font-semibold">{t('cabin.carryOn')}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t('cabin.colWeight')}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t('cabin.colDimensions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {CABINS.map((cabin) => (
                  <tr key={cabin}>
                    <td className="px-4 py-3 font-semibold text-black">{tw(`cabins.${cabin}`)}</td>
                    <td className="px-4 py-3 text-neutral-700">{t(`cabin.rows.${cabin}.weight`)}</td>
                    <td className="px-4 py-3 text-neutral-700" dir="ltr">
                      {t(`cabin.rows.${cabin}.dimensions`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Checked baggage */}
      <Section id="checked" icon={<LuggageIcon className="size-6" />} title={t('checked.title')}>
        <p className="max-w-3xl text-neutral-600">{t('checked.intro')}</p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200">
          <table className="w-full min-w-[26rem] text-start text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3 text-start font-semibold">{t('checked.colCabin')}</th>
                <th className="px-4 py-3 text-start font-semibold">{t('checked.colAllowance')}</th>
                <th className="px-4 py-3 text-start font-semibold">{t('checked.colPiece')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {CABINS.map((cabin) => (
                <tr key={cabin}>
                  <td className="px-4 py-3 font-semibold text-black">{tw(`cabins.${cabin}`)}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    {t(`checked.rows.${cabin}.allowance`)}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{t(`checked.rows.${cabin}.piece`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 p-4 text-sm text-neutral-700">
          <AlertIcon className="mt-0.5 size-5 shrink-0 text-brand-700" />
          {t('checked.note')}
        </p>
      </Section>

      {/* Extra baggage */}
      <Section id="extra" icon={<PackageIcon className="size-6" />} title={t('extra.title')}>
        <p className="max-w-3xl text-neutral-600">{t('extra.body')}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {EXTRA.map((key) => (
            <div key={key} className="rounded-2xl border border-neutral-200 bg-white p-6">
              <Heading variant="card" className="text-black">
                {t(`extra.items.${key}.title`)}
              </Heading>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {t(`extra.items.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Special baggage */}
      <Section id="special" icon={<DumbbellIcon className="size-6" />} title={t('special.title')}>
        <p className="max-w-3xl text-neutral-600">{t('special.body')}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SPECIAL.map(({ key, Icon }) => (
            <div
              key={key}
              className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <Icon className="size-6" />
              </span>
              <p className="mt-4 font-bold text-black">{t(`special.items.${key}.title`)}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                {t(`special.items.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Restricted items */}
      <Section id="restricted" icon={<AlertIcon className="size-6" />} title={t('restricted.title')}>
        <p className="max-w-3xl text-neutral-600">{t('restricted.body')}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { head: 'cabinOnly', body: 'cabinOnlyItems', tone: 'bg-emerald-50 text-emerald-700' },
            { head: 'checkedOnly', body: 'checkedOnlyItems', tone: 'bg-amber-50 text-amber-700' },
            { head: 'prohibited', body: 'prohibitedItems', tone: 'bg-red-50 text-red-700' },
          ].map((group) => (
            <div key={group.head} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${group.tone}`}
              >
                {t(`restricted.${group.head}`)}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                {t(`restricted.${group.body}`)}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-neutral-500">{t('restricted.note')}</p>
      </Section>

      {/* Delayed / damaged */}
      <Section id="help" icon={<AlertIcon className="size-6" />} title={t('help.title')}>
        <p className="max-w-3xl text-neutral-600">{t('help.body')}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/help">
            <Button variant="primary">{t('help.cta')}</Button>
          </Link>
          <Link href="/manage">
            <Button variant="secondary">{t('help.track')}</Button>
          </Link>
        </div>
      </Section>

      {/* CTA */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:mt-20">
        <Reveal className="flex flex-col items-start gap-5 rounded-3xl bg-brand-400 p-8 text-start sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <Heading variant="section" className="text-black">
              {t('ctaTitle')}
            </Heading>
            <p className="mt-2 text-black/75">{t('ctaBody')}</p>
          </div>
          <Link href="/manage">
            <Button variant="primary" size="lg">
              {t('ctaButton')}
            </Button>
          </Link>
        </Reveal>
      </section>
    </main>
  );
}

function Section({
  id,
  icon,
  title,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-neutral-100 last:border-0">
      <Reveal className="mx-auto max-w-6xl px-4 py-12 text-start sm:py-14">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            {icon}
          </span>
          <Heading variant="section" className="text-black">
            {title}
          </Heading>
        </div>
        <div className="mt-5">{children}</div>
      </Reveal>
    </section>
  );
}
