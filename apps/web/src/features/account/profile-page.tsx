'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { isEmail, isNationalId, isPhone, normalizePhone, toLatinDigits } from '@aerotech/domain';
import { Badge, Button, Card, Icon, Switch, TextField, useToast } from '@aerotech/ui';
import { Link } from '@/i18n/navigation';
import { useFormatters } from '../shared/use-duration';
import { Avatar } from './account-button';
import { initials, useAccount, type User } from './account-context';

function Row({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-hairline py-3 first:border-t-0">
      <span className="flex min-w-0 flex-col">
        <span className="font-bold text-default">{title}</span>
        <span className="text-small text-muted">{sub}</span>
      </span>
      {children}
    </div>
  );
}

function Panel({ title, children, wide }: { title: string; children: ReactNode; wide?: boolean }) {
  return (
    <Card as="section" padding="lg" className={wide ? 'lg:col-span-2' : ''}>
      <h2 className="text-title font-bold text-strong">{title}</h2>
      <div className="mt-3">{children}</div>
    </Card>
  );
}

export function ProfilePage() {
  const t = useTranslations();
  const locale = useLocale();
  const { user, openAuth } = useAccount();

  if (!user) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-gutter py-section text-center">
        <span className="flex size-14 items-center justify-center rounded-chip bg-action-soft text-action">
          <Icon name="user" size={26} />
        </span>
        <h1 className="text-heading font-bold text-strong">{t('profile.signedOutTitle')}</h1>
        <p className="text-muted">{t('profile.signedOutBody')}</p>
        <Button onPress={() => openAuth()}>{t('account.loginOrSignup')}</Button>
      </div>
    );
  }
  return <SignedIn key={user.key} user={user} showNationalId={locale.startsWith('fa')} />;
}

function SignedIn({ user, showNationalId }: { user: User; showNationalId: boolean }) {
  const t = useTranslations();
  const toast = useToast();
  const { number, locale } = useFormatters();
  const list = new Intl.ListFormat(locale, { type: 'conjunction' });
  const { openAuth, signOut, updateUser } = useAccount();
  const [form, setForm] = useState({
    first: user.first,
    last: user.last,
    nationalId: user.nationalId,
    email: user.email,
    phone: user.phone,
  });
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const set = (field: keyof typeof form) => (value: string) => setForm({ ...form, [field]: value });

  const checklist = [
    { done: Boolean(user.first && user.last), label: t('profile.items.name') },
    { done: Boolean(user.phone), label: t('profile.items.mobile') },
    { done: Boolean(user.email), label: t('profile.items.email') },
    ...(showNationalId
      ? [{ done: Boolean(user.nationalId), label: t('profile.items.nationalId') }]
      : []),
    { done: Boolean(user.password), label: t('profile.items.password') },
  ];
  const done = checklist.filter((item) => item.done).length;
  const missing = checklist.filter((item) => !item.done).map((item) => item.label);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fail = (text: string) => setMessage({ text, error: true });
    if (!form.first.trim()) return fail(t('account.errors.firstName'));
    if (!form.last.trim()) return fail(t('account.errors.lastName'));
    if (showNationalId && form.nationalId.trim() && !isNationalId(form.nationalId)) {
      return fail(t('account.errors.nationalId'));
    }
    if (form.email.trim() && !isEmail(form.email)) return fail(t('account.errors.email'));
    if (form.phone.trim() && !isPhone(form.phone)) return fail(t('account.errors.phone'));
    if (!form.email.trim() && !form.phone.trim()) return fail(t('account.errors.contact'));
    updateUser({
      first: form.first.trim(),
      last: form.last.trim(),
      nationalId: toLatinDigits(form.nationalId).trim(),
      email: form.email.trim(),
      phone: form.phone.trim() ? normalizePhone(form.phone) : '',
    });
    setMessage({ text: t('profile.saved'), error: false });
  }

  return (
    <div className="mx-auto max-w-page px-gutter pt-8 pb-section">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar text={initials(user)} large />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-heading font-bold text-strong">
            {user.first} {user.last}
          </h1>
          <p className="text-small text-muted">
            <bdi dir="ltr">{user.phone || user.email}</bdi> · {t('profile.member')}
          </p>
        </div>
        <Button variant="secondary" size="sm" onPress={signOut}>
          <Icon name="logout" size={18} />
          {t('account.menu.logout')}
        </Button>
      </div>

      <Card surface={1} className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-bold">{t('profile.completion')}</span>
          <span className="text-small text-muted">
            {t('profile.completeCount', { done: number(done), total: number(checklist.length) })}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={t('profile.completion')}
          aria-valuemin={0}
          aria-valuemax={checklist.length}
          aria-valuenow={done}
          className="mt-3 h-2 overflow-hidden rounded-chip bg-surface-3"
        >
          <div
            style={{ width: `${(done / checklist.length) * 100}%` }}
            className="h-full rounded-chip bg-action transition-all duration-(--duration-slow) ease-out-soft"
          />
        </div>
        <p className="mt-2 text-small text-muted">
          {missing.length
            ? t('profile.missing', { items: list.format(missing) })
            : t('profile.complete')}
        </p>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title={t('profile.personal')} wide>
          <p className="text-small text-muted">{t('profile.personalSub')}</p>
          <form onSubmit={save} noValidate className="mt-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <TextField
                label={t('account.firstName')}
                value={form.first}
                onChange={set('first')}
                autoComplete="given-name"
              />
              <TextField
                label={t('account.lastName')}
                value={form.last}
                onChange={set('last')}
                autoComplete="family-name"
              />
              {showNationalId ? (
                <TextField
                  label={t('profile.nationalId')}
                  value={form.nationalId}
                  onChange={set('nationalId')}
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="off"
                  code
                />
              ) : null}
              <TextField
                label={t('profile.email')}
                value={form.email}
                onChange={set('email')}
                inputMode="email"
                autoComplete="email"
                code
              />
              <TextField
                label={t('profile.mobile')}
                value={form.phone}
                onChange={set('phone')}
                inputMode="tel"
                autoComplete="tel"
                code
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Button type="submit">{t('profile.save')}</Button>
              <p
                role="status"
                className={`text-small empty:hidden ${message?.error ? 'text-danger-soft' : 'text-success'}`}
              >
                {message?.text}
              </p>
            </div>
          </form>
        </Panel>

        <Panel title={t('profile.security')}>
          <Row title={t('profile.otpTitle')} sub={t('profile.otpSub')}>
            <Badge tone="success">{t('profile.on')}</Badge>
          </Row>
          <Row
            title={t('account.password')}
            sub={user.password ? t('profile.passwordSet') : t('profile.passwordNotSet')}
          >
            <Button
              variant="secondary"
              size="sm"
              onPress={() => openAuth({ step: 'newPassword', purpose: 'set' })}
            >
              {user.password ? t('profile.changePassword') : t('profile.setPassword')}
            </Button>
          </Row>
        </Panel>

        <Panel title={t('profile.notifications')}>
          <Row title={t('profile.sms')} sub={t('profile.smsSub')}>
            <Switch
              aria-label={t('profile.sms')}
              isSelected={user.sms}
              onChange={(sms) => updateUser({ sms })}
            />
          </Row>
          <Row title={t('profile.email')} sub={t('profile.emailSub')}>
            <Switch
              aria-label={t('profile.email')}
              isSelected={user.mail}
              onChange={(mail) => updateUser({ mail })}
            />
          </Row>
          <Row title={t('profile.push')} sub={t('profile.pushSub')}>
            <Switch
              aria-label={t('profile.push')}
              isSelected={user.push}
              onChange={(push) => updateUser({ push })}
            />
          </Row>
        </Panel>

        <Panel title={t('profile.travellers')}>
          <p className="text-small text-muted">{t('profile.travellersEmpty')}</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onPress={() => toast.show(t('profile.soon'))}
          >
            {t('profile.addTraveller')}
          </Button>
        </Panel>

        <Panel title={t('profile.trips')}>
          <p className="text-small text-muted">{t('profile.tripsEmpty')}</p>
          <Link
            href="/#book"
            className="mt-4 inline-flex h-10 items-center rounded-control border border-strong-line px-4 text-small font-bold transition-colors duration-(--duration-fast) hover:border-hover-line hover:bg-surface-hover"
          >
            {t('profile.searchFlights')}
          </Link>
        </Panel>
      </div>
    </div>
  );
}
