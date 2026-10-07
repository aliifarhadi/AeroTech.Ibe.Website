'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { SelectField, TextField } from '@/components/ui/field';

const SUBJECTS = ['booking', 'baggage', 'refund', 'other'] as const;

export function ContactForm() {
  const t = useTranslations('Contact');
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="mt-6 rounded-2xl bg-brand-50 p-6 text-start">
        <p className="font-semibold text-black">{t('successTitle')}</p>
        <p className="mt-1 text-sm text-neutral-600">{t('successBody')}</p>
      </div>
    );
  }

  return (
    <form
      className="mt-6 flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label={t('form.name')} name="name" autoComplete="name" required />
        <TextField label={t('form.email')} name="email" type="email" autoComplete="email" required />
      </div>
      <SelectField label={t('form.subject')} name="subject" defaultValue="booking">
        {SUBJECTS.map((s) => (
          <option key={s} value={s}>
            {t(`form.subjects.${s}`)}
          </option>
        ))}
      </SelectField>
      <div className="min-w-0 text-start">
        <label
          htmlFor="contact-message"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
        >
          {t('form.message')}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[15px] text-neutral-900 transition placeholder:text-neutral-400 hover:border-neutral-300 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-200 focus:outline-none"
        />
      </div>
      <Button type="submit" variant="accent" size="lg" className="sm:self-start">
        {t('form.send')}
      </Button>
    </form>
  );
}
