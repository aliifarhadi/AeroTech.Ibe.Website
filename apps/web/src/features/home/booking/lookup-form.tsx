'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button, TextField } from '@aerotech/ui';

type Kind = 'manage' | 'checkIn' | 'status';

/**
 * Booking retrieval, check-in and flight status entry points. The services behind them are not
 * connected in this build, so a valid submission says so instead of pretending to work.
 */
export function LookupForm({ kind }: { kind: Kind }) {
  const t = useTranslations('booking.lookup');
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const firstLabel =
    kind === 'manage'
      ? t('referenceOrTicket')
      : kind === 'checkIn'
        ? t('reference')
        : t('flightNumber');
  const secondLabel = kind === 'status' ? t('route') : t('lastName');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!first.trim()) {
      setMessage({ text: t('required', { field: firstLabel }), error: true });
      return;
    }
    if (kind !== 'status' && !second.trim()) {
      setMessage({ text: t('required', { field: secondLabel }), error: true });
      return;
    }
    setMessage({ text: t('notConnected'), error: false });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-wrap items-end gap-2.5">
      <TextField
        label={firstLabel}
        value={first}
        onChange={setFirst}
        placeholder={kind === 'status' ? 'DA 142' : 'ABC123'}
        autoComplete="off"
        code
        className="min-w-56 flex-1"
      />
      <TextField
        label={secondLabel}
        value={second}
        onChange={setSecond}
        placeholder={kind === 'status' ? t('routePlaceholder') : undefined}
        autoComplete={kind === 'status' ? 'off' : 'family-name'}
        className="min-w-56 flex-1"
      />
      <Button type="submit" size="lg" className="w-full md:w-auto">
        {t(`${kind}Submit`)}
      </Button>
      <p
        role="status"
        className={[
          'basis-full text-small empty:hidden',
          message?.error ? 'text-danger-soft' : 'text-action',
        ].join(' ')}
      >
        {message?.text}
      </p>
    </form>
  );
}
