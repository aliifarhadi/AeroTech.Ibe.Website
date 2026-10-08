'use client';

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  checkPassword,
  identifierKey,
  isEmail,
  isIdentifier,
  isNationalId,
  isPhone,
  maskIdentifier,
  normalizePhone,
  OTP_LENGTH,
  toLatinDigits,
} from '@aerotech/domain';
import {
  Button,
  Checkbox,
  Icon,
  IconButton,
  Modal,
  SegmentedControl,
  TextField,
  toBcp47,
} from '@aerotech/ui';
import type { AuthRequest, AuthStep, User } from './account-context';

type AuthDialogProps = {
  request: AuthRequest;
  user: User | null;
  findAccount: (key: string) => User | undefined;
  onClose: () => void;
  onSignIn: (account: User, created: boolean) => void;
  onPasswordReset: (key: string, password: string) => void;
  onPasswordSet: (password: string) => void;
};

const RESEND_SECONDS = 60;
/** In this mocked build any code is accepted except this one, which demonstrates the error. */
const REJECTED_CODE = '0'.repeat(OTP_LENGTH);

export function AuthDialog({
  request,
  findAccount,
  onClose,
  onSignIn,
  onPasswordReset,
  onPasswordSet,
}: AuthDialogProps) {
  const t = useTranslations('account');
  const locale = useLocale();
  const [step, setStep] = useState<AuthStep>(request.step ?? 'entry');
  const [purpose, setPurpose] = useState(request.purpose ?? 'login');
  const [mode, setMode] = useState<'otp' | 'password'>('otp');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [other, setOther] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const byEmail = isEmail(identifier);
  const showNationalId = locale.startsWith('fa');

  const go = (next: AuthStep) => {
    setError('');
    setPassword('');
    setRepeat('');
    setStep(next);
  };

  function sendCode() {
    if (!isIdentifier(identifier)) return setError(t('errors.identifier'));
    go('verify');
  }

  function logIn() {
    if (!isIdentifier(identifier)) return setError(t('errors.identifier'));
    const account = findAccount(identifierKey(identifier));
    if (!account || !account.password || account.password !== password) {
      return setError(t('errors.credentials'));
    }
    onSignIn(account, false);
  }

  function verify(code: string) {
    if (code.length < OTP_LENGTH) return setError(t('errors.code'));
    if (code === REJECTED_CODE) {
      // Remount the boxes so the next attempt starts clean.
      setAttempt((value) => value + 1);
      return setError(t('errors.codeWrong'));
    }
    if (purpose === 'reset') return go('newPassword');
    const known = findAccount(identifierKey(identifier));
    if (known) return onSignIn(known, false);
    go('profile');
  }

  function createAccount() {
    if (!first.trim()) return setError(t('errors.firstName'));
    if (!last.trim()) return setError(t('errors.lastName'));
    if (showNationalId && nationalId.trim() && !isNationalId(nationalId)) {
      return setError(t('errors.nationalId'));
    }
    if (other.trim() && (byEmail ? !isPhone(other) : !isEmail(other))) {
      return setError(t(byEmail ? 'errors.phone' : 'errors.email'));
    }
    if (!accepted) return setError(t('errors.terms'));
    onSignIn(
      {
        key: identifierKey(identifier),
        first: first.trim(),
        last: last.trim(),
        nationalId: toLatinDigits(nationalId).trim(),
        phone: byEmail ? (other.trim() ? normalizePhone(other) : '') : normalizePhone(identifier),
        email: byEmail ? identifier.trim() : other.trim(),
        password: '',
        sms: true,
        mail: byEmail || other.trim() !== '',
        push: false,
      },
      true,
    );
  }

  function savePassword() {
    const checks = checkPassword(password, repeat);
    if (!checks.length || !checks.digit) return setError(t('errors.password'));
    if (!checks.match) return setError(t('errors.mismatch'));
    if (purpose === 'set') return onPasswordSet(password);
    onPasswordReset(identifierKey(identifier), password);
    setPurpose('login');
    setMode('password');
    go('entry');
  }

  const back = () => {
    if (step === 'verify' && purpose === 'reset') return go('forgot');
    setPurpose('login');
    go('entry');
  };

  const titles: Record<AuthStep, string> = {
    entry: t('loginOrSignup'),
    forgot: t('forgotTitle'),
    verify: t('verifyTitle'),
    profile: t('profileTitle'),
    newPassword: purpose === 'set' ? t('setPwTitle') : t('newPwTitle'),
  };
  const canGoBack = step === 'forgot' || step === 'verify';
  const identifierField = (
    <TextField
      label={t('identifier')}
      placeholder={t('identifierPlaceholder')}
      value={identifier}
      onChange={(value) => {
        setIdentifier(value);
        setError('');
      }}
      autoComplete="username"
      inputMode="email"
      code
      autoFocus
    />
  );
  const submitOnEnter = (action: () => void) => (event: KeyboardEvent) => {
    if (event.key === 'Enter' && (event.target as HTMLElement).tagName === 'INPUT') action();
  };

  return (
    <Modal
      title={titles[step]}
      closeLabel={t('close')}
      isOpen
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {canGoBack ? (
        <Button variant="ghost" size="sm" onPress={back} className="-mt-2 self-start">
          <Icon name="chevron-back" size={16} />
          {t('back')}
        </Button>
      ) : null}

      {step === 'entry' ? (
        <div
          className="flex flex-col gap-4"
          onKeyDown={submitOnEnter(mode === 'otp' ? sendCode : logIn)}
        >
          <p className="text-small text-muted">{t('entrySub')}</p>
          <SegmentedControl
            aria-label={t('methodAria')}
            fill
            value={mode}
            onChange={(next) => {
              setMode(next);
              setError('');
            }}
            options={[
              { id: 'otp', label: t('otp') },
              { id: 'password', label: t('password') },
            ]}
          />
          {identifierField}
          {mode === 'password' ? (
            <>
              <PasswordField
                label={t('password')}
                showLabel={t('showPassword')}
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => {
                  setPurpose('reset');
                  go('forgot');
                }}
                className="cursor-pointer self-start text-small text-action underline underline-offset-4"
              >
                {t('forgot')}
              </button>
            </>
          ) : null}
          <ErrorLine text={error} />
          <Button fullWidth size="lg" onPress={mode === 'otp' ? sendCode : logIn}>
            {mode === 'otp' ? t('sendCode') : t('login')}
          </Button>
          <p className="text-caption text-muted">{t('terms')}</p>
        </div>
      ) : null}

      {step === 'forgot' ? (
        <div className="flex flex-col gap-4" onKeyDown={submitOnEnter(sendCode)}>
          <p className="text-small text-muted">{t('forgotSub')}</p>
          {identifierField}
          <ErrorLine text={error} />
          <Button fullWidth size="lg" onPress={sendCode}>
            {t('sendCode')}
          </Button>
        </div>
      ) : null}

      {step === 'verify' ? (
        <div className="flex flex-col gap-4">
          <p className="text-small text-muted">
            {/* Isolated as left-to-right so the masked number reads correctly inside Persian text. */}
            {t('verifySub', { id: `\u2066${maskIdentifier(identifier)}\u2069` })}
          </p>
          <OtpInput
            key={attempt}
            groupLabel={t('codeAria')}
            digitLabel={(n) => t('digit', { n })}
            invalid={error !== ''}
            onChange={() => setError('')}
            onComplete={verify}
          />
          <ErrorLine text={error} />
          <ResendTimer
            locale={toBcp47(locale)}
            waiting={(time) => t('resendIn', { time })}
            action={t('resend')}
          />
          <p className="text-caption text-muted">{t('previewNote')}</p>
        </div>
      ) : null}

      {step === 'profile' ? (
        <div className="flex flex-col gap-4" onKeyDown={submitOnEnter(createAccount)}>
          <p className="text-small text-muted">{t('profileSub')}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <TextField
              label={t('firstName')}
              value={first}
              onChange={setFirst}
              autoComplete="given-name"
              autoFocus
            />
            <TextField
              label={t('lastName')}
              value={last}
              onChange={setLast}
              autoComplete="family-name"
            />
          </div>
          {showNationalId ? (
            <TextField
              label={t('nationalIdOptional')}
              value={nationalId}
              onChange={setNationalId}
              inputMode="numeric"
              maxLength={10}
              autoComplete="off"
              code
            />
          ) : null}
          <TextField
            label={byEmail ? t('mobileOptional') : t('emailOptional')}
            value={other}
            onChange={setOther}
            inputMode={byEmail ? 'tel' : 'email'}
            autoComplete={byEmail ? 'tel' : 'email'}
            code
          />
          <Checkbox isSelected={accepted} onChange={setAccepted}>
            {t('acceptTerms')}
          </Checkbox>
          <ErrorLine text={error} />
          <Button fullWidth size="lg" onPress={createAccount}>
            {t('create')}
          </Button>
        </div>
      ) : null}

      {step === 'newPassword' ? (
        <div className="flex flex-col gap-4" onKeyDown={submitOnEnter(savePassword)}>
          <p className="text-small text-muted">{t('newPwSub')}</p>
          <PasswordField
            label={t('newPassword')}
            showLabel={t('showPassword')}
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            autoFocus
          />
          <PasswordField
            label={t('repeatPassword')}
            showLabel={t('showPassword')}
            value={repeat}
            onChange={setRepeat}
            autoComplete="new-password"
          />
          <ul aria-live="polite" className="flex flex-col gap-1 text-small">
            {(
              [
                ['length', t('ruleLength')],
                ['digit', t('ruleDigit')],
                ['match', t('ruleMatch')],
              ] as const
            ).map(([rule, label]) => {
              const met = checkPassword(password, repeat)[rule];
              return (
                <li
                  key={rule}
                  className={`flex items-center gap-2 ${met ? 'text-success' : 'text-muted'}`}
                >
                  <Icon name={met ? 'check' : 'minus'} size={14} />
                  {label}
                </li>
              );
            })}
          </ul>
          <ErrorLine text={error} />
          <Button fullWidth size="lg" onPress={savePassword}>
            {t('savePassword')}
          </Button>
        </div>
      ) : null}
    </Modal>
  );
}

function ErrorLine({ text }: { text: string }) {
  return (
    <p role="alert" className="text-small text-danger-soft empty:hidden">
      {text}
    </p>
  );
}

function PasswordField({
  label,
  showLabel,
  value,
  onChange,
  autoComplete,
  autoFocus,
}: {
  label: string;
  showLabel: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  autoFocus?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      label={label}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      code
      suffix={
        <IconButton
          variant="ghost"
          aria-label={showLabel}
          aria-pressed={visible}
          onPress={() => setVisible((on) => !on)}
        >
          <Icon name="eye" size={20} />
        </IconButton>
      }
    />
  );
}

/** One box per digit. Accepts paste and SMS autofill, and any script's digits. */
function OtpInput({
  groupLabel,
  digitLabel,
  invalid,
  onChange,
  onComplete,
}: {
  groupLabel: string;
  digitLabel: (n: number) => string;
  invalid: boolean;
  onChange: () => void;
  onComplete: (code: string) => void;
}) {
  const [digits, setDigits] = useState<string[]>(() => Array<string>(OTP_LENGTH).fill(''));
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => inputs.current[0]?.focus(), []);
  const fill = (from: number, text: string) => {
    const clean = toLatinDigits(text).replace(/\D/g, '');
    const next = [...digits];
    if (!clean) next[from] = '';
    [...clean].slice(0, OTP_LENGTH - from).forEach((digit, i) => {
      next[from + i] = digit;
    });
    setDigits(next);
    onChange();
    inputs.current[Math.min(OTP_LENGTH - 1, from + clean.length)]?.focus();
    if (next.every(Boolean)) onComplete(next.join(''));
  };

  const onKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      inputs.current[index - 1]?.focus();
    }
    if (event.key === 'Enter') onComplete(digits.join(''));
  };
  const onPaste = (index: number) => (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    fill(index, event.clipboardData.getData('text'));
  };

  return (
    <div dir="ltr" role="group" aria-label={groupLabel} className="flex justify-center gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          value={digit}
          onChange={(event) => fill(index, event.target.value.slice(-1 * OTP_LENGTH))}
          onKeyDown={onKeyDown(index)}
          onPaste={onPaste(index)}
          onFocus={(event) => event.target.select()}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={digitLabel(index + 1)}
          aria-invalid={invalid || undefined}
          className="h-14 w-12 rounded-control border border-strong-line bg-surface-1 text-center font-mono text-title text-default outline-none focus:border-action aria-invalid:border-danger"
        />
      ))}
    </div>
  );
}

function ResendTimer({
  locale,
  waiting,
  action,
}: {
  locale: string;
  waiting: (time: string) => string;
  action: string;
}) {
  const [left, setLeft] = useState(RESEND_SECONDS);
  useEffect(() => {
    if (left <= 0) return;
    const timer = window.setTimeout(() => setLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [left]);

  if (left <= 0) {
    return (
      <button
        type="button"
        onClick={() => setLeft(RESEND_SECONDS)}
        className="cursor-pointer self-start text-small text-action underline underline-offset-4"
      >
        {action}
      </button>
    );
  }
  const two = new Intl.NumberFormat(locale, { minimumIntegerDigits: 2 });
  const one = new Intl.NumberFormat(locale);
  return (
    <p className="text-small text-muted">
      {waiting(`${one.format(Math.floor(left / 60))}:${two.format(left % 60)}`)}
    </p>
  );
}
