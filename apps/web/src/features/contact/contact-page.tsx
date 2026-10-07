import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/reveal';
import { ChatIcon, ClockIcon, MailIcon, PhoneIcon, PinIcon } from '@/components/icons';
import { Eyebrow, Heading, Lead } from '@/components/ui/typography';
import { WordReveal } from '@/components/ui/word-reveal';
import { ContactForm } from './contact-form';

const METHODS = [
  { key: 'phone', Icon: PhoneIcon },
  { key: 'email', Icon: MailIcon },
  { key: 'chat', Icon: ChatIcon },
  { key: 'offices', Icon: PinIcon },
] as const;

export async function ContactPage() {
  const t = await getTranslations('Contact');

  return (
    <main className="bg-white pb-20">
      {/* Hero */}
      <section className="border-b border-neutral-200 bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 text-start sm:py-20">
          <Eyebrow>{t('eyebrow')}</Eyebrow>
          <Heading variant="display" className="mt-4 max-w-2xl text-black">
            <WordReveal text={t.raw('title')} />
          </Heading>
          <Lead className="mt-4 max-w-xl">{t('subtitle')}</Lead>
        </div>
      </section>

      {/* Methods + form */}
      <section className="mx-auto mt-12 max-w-6xl px-4 sm:mt-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          {/* Methods */}
          <div className="flex flex-col gap-4">
            {METHODS.map(({ key, Icon }, i) => (
              <Reveal
                key={key}
                delay={i * 70}
                className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="size-6" />
                </span>
                <div className="text-start">
                  <p className="font-semibold text-black">{t(`methods.${key}.title`)}</p>
                  <p className="mt-0.5 text-sm font-medium text-black" dir="ltr">
                    {t(`methods.${key}.detail`)}
                  </p>
                  <p className="mt-0.5 text-sm text-neutral-500">{t(`methods.${key}.note`)}</p>
                </div>
              </Reveal>
            ))}

            <div className="flex items-start gap-4 rounded-2xl bg-neutral-950 p-5 text-white">
              <ClockIcon className="size-6 shrink-0 text-brand-400" />
              <div className="text-start">
                <p className="font-semibold">{t('hoursTitle')}</p>
                <p className="mt-0.5 text-sm text-neutral-300">{t('hours')}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <Reveal className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl shadow-black/5 sm:p-8">
            <Heading variant="section" className="text-black">
              {t('formTitle')}
            </Heading>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
