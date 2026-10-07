'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BrandLogo } from '@/components/brand-logo';
import { CalendarIcon, PlaneIcon, UserIcon } from '@/components/icons';
import { useRouter } from '@/i18n/navigation';

const INPUT =
  'mt-1.5 h-12 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-black outline-none transition placeholder:text-neutral-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/10';

export function PassengerPage({
  origin,
  destination,
  departureDate,
  fare,
  price,
}: {
  origin: string;
  destination: string;
  departureDate: string;
  fare: string;
  price: string;
}) {
  const t = useTranslations('Passengers');
  const router = useRouter();
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push('/book/seats');
  }

  return (
    <main className="min-h-screen bg-neutral-50 pb-24 text-black">
      <header className="relative z-[60] -mt-[4.5rem] flex h-16 items-center border-b border-neutral-200 bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={t('back')}
            className="text-xl text-neutral-600 transition hover:text-black"
          >
            ←
          </button>
          <BrandLogo name="DotAir" textClassName="text-lg" />
          <div className="ms-auto hidden items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-xs text-neutral-700 sm:flex">
            <span>{origin}</span>
            <span className="text-neutral-400">→</span>
            <span>{destination}</span>
            <span className="mx-1 h-4 w-px bg-neutral-200" />
            <CalendarIcon className="size-4" />
            <span>{departureDate}</span>
          </div>
        </div>
      </header>

      <nav aria-label={t('progress')} className="border-b border-neutral-200 bg-white">
        <ol className="mx-auto grid max-w-5xl grid-cols-4 px-4">
          {[t('stepFlights'), t('stepPassengers'), t('stepSeats'), t('stepPayment')].map(
            (step, index) => (
              <li
                key={step}
                className={`border-b-2 px-1 py-3 text-center text-[10px] font-semibold sm:text-xs ${index === 1 ? 'border-brand-400 text-black' : index < 1 ? 'border-brand-400 text-neutral-700' : 'border-transparent text-neutral-400'}`}
              >
                <span className="me-1 hidden sm:inline">{index + 1}.</span>
                {step}
              </li>
            ),
          )}
        </ol>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black">
            {t('eyebrow')}
          </p>
          <h1 className="mt-2 text-3xl font-normal tracking-[-0.025em] text-black sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">{t('subtitle')}</p>
        </div>

        <form
          onSubmit={submit}
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start"
        >
          <div className="space-y-5">
            <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-neutral-700">
              {t('documentNotice')}
            </div>

            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-brand-50 text-black">
                  <UserIcon className="size-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold">{t('adultOne')}</h2>
                  <p className="mt-0.5 text-xs text-neutral-500">{t('requiredFields')}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-[9rem_1fr_1fr]">
                <Field label={t('titleLabel')}>
                  <select name="title" required className={INPUT} defaultValue="">
                    <option value="" disabled>
                      {t('select')}
                    </option>
                    <option value="MR">{t('mr')}</option>
                    <option value="MS">{t('ms')}</option>
                    <option value="MRS">{t('mrs')}</option>
                  </select>
                </Field>
                <Field label={t('givenName')}>
                  <input name="givenName" required autoComplete="given-name" className={INPUT} />
                </Field>
                <Field label={t('familyName')}>
                  <input name="familyName" required autoComplete="family-name" className={INPUT} />
                </Field>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label={t('dateOfBirth')} hint={t('dateHint')}>
                  <input
                    name="dateOfBirth"
                    required
                    inputMode="numeric"
                    placeholder="YYYY-MM-DD"
                    pattern="\d{4}-\d{2}-\d{2}"
                    className={INPUT}
                  />
                </Field>
                <Field label={t('gender')}>
                  <select name="gender" className={INPUT} defaultValue="">
                    <option value="">{t('preferNot')}</option>
                    <option value="F">{t('female')}</option>
                    <option value="M">{t('male')}</option>
                  </select>
                </Field>
              </div>

              <button
                type="button"
                onClick={() => setLoyaltyOpen((open) => !open)}
                aria-expanded={loyaltyOpen}
                className="mt-5 text-sm font-semibold text-black hover:underline"
              >
                {loyaltyOpen ? '−' : '+'} {t('loyalty')}
              </button>
              {loyaltyOpen && (
                <div className="mt-4 grid gap-4 border-t border-neutral-200 pt-4 sm:grid-cols-2">
                  <Field label={t('loyaltyProgram')}>
                    <select name="loyaltyProgram" className={INPUT} defaultValue="DOT">
                      <option value="DOT">DotAir Club</option>
                    </select>
                  </Field>
                  <Field label={t('loyaltyNumber')}>
                    <input name="loyaltyNumber" inputMode="numeric" className={INPUT} />
                  </Field>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-semibold">{t('contactTitle')}</h2>
              <p className="mt-1 text-xs text-neutral-500">{t('contactHint')}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label={t('email')}>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className={INPUT}
                  />
                </Field>
                <div className="grid grid-cols-[7rem_1fr] gap-2">
                  <Field label={t('countryCode')}>
                    <select name="phoneCountryCode" required className={INPUT} defaultValue="+98">
                      <option value="+98">+98</option>
                      <option value="+971">+971</option>
                      <option value="+974">+974</option>
                      <option value="+49">+49</option>
                    </select>
                  </Field>
                  <Field label={t('phone')}>
                    <input
                      name="phoneNumber"
                      required
                      inputMode="tel"
                      autoComplete="tel"
                      className={INPUT}
                    />
                  </Field>
                </div>
              </div>
            </section>
          </div>

          <aside className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:sticky lg:top-20">
            <h2 className="text-base font-semibold">{t('tripSummary')}</h2>
            <div className="mt-5 flex items-center gap-3">
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-brand-50 text-black">
                <PlaneIcon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {origin} → {destination}
                </p>
                <p className="mt-1 text-xs text-neutral-500">{departureDate}</p>
              </div>
            </div>
            <dl className="mt-5 space-y-3 border-t border-neutral-200 pt-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">{t('passengers')}</dt>
                <dd className="font-medium">{t('oneAdult')}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">{t('fare')}</dt>
                <dd className="max-w-36 break-all text-end font-medium">{fare}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-neutral-200 pt-3">
                <dt className="font-semibold">{t('total')}</dt>
                <dd className="text-lg font-semibold text-black">{price}</dd>
              </div>
            </dl>
            <button
              type="submit"
              className="mt-6 h-12 w-full rounded-full bg-brand-400 px-5 text-sm font-bold text-black transition hover:bg-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/30"
            >
              {t('continue')}
            </button>
            <p className="mt-3 text-center text-[11px] leading-4 text-neutral-500">{t('secure')}</p>
          </aside>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-medium text-neutral-700">
      {label}
      {children}
      {hint && <span className="mt-1 block text-[11px] font-normal text-neutral-500">{hint}</span>}
    </label>
  );
}
