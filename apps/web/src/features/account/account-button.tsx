'use client';

import { useTranslations } from 'next-intl';
import { Button, DialogTrigger, Icon, Popover } from '@aerotech/ui';
import { Link } from '@/i18n/navigation';
import { initials, useAccount } from './account-context';

const row =
  'flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-control px-3 text-small text-soft transition-colors duration-(--duration-fast) hover:bg-surface-hover hover:text-strong';

export function Avatar({ text, large }: { text: string; large?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={[
        'flex shrink-0 items-center justify-center rounded-chip bg-action font-bold text-on-action',
        large ? 'size-16 text-title' : 'size-7 text-caption',
      ].join(' ')}
    >
      {text}
    </span>
  );
}

/** Header control: "Log in" when signed out, the traveller's name and a small menu when signed in. */
export function AccountButton() {
  const t = useTranslations('account');
  const { user, openAuth, signOut } = useAccount();

  if (!user) {
    return (
      <Button variant="secondary" size="sm" onPress={() => openAuth()}>
        <Icon name="user" size={16} />
        {t('login')}
      </Button>
    );
  }
  return (
    <DialogTrigger>
      <Button variant="secondary" size="sm" aria-label={t('accountAria', { name: user.first })}>
        <Avatar text={initials(user)} />
        <span className="max-w-24 truncate">{user.first}</span>
      </Button>
      <Popover
        aria-label={t('accountAria', { name: user.first })}
        placement="bottom end"
        className="w-64"
      >
        <div className="flex items-center gap-3 border-b border-hairline px-3 pb-3">
          <Avatar text={initials(user)} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-small font-bold text-strong">
              {user.first} {user.last}
            </span>
            <span dir="ltr" className="truncate text-caption text-muted rtl:text-end">
              {user.phone || user.email}
            </span>
          </span>
        </div>
        <div className="flex flex-col pt-2">
          <Link href="/account" className={row}>
            <Icon name="user" size={18} />
            {t('menu.profile')}
          </Link>
          <Link href="/?tab=manage#book" className={row}>
            <Icon name="bag" size={18} />
            {t('menu.trips')}
          </Link>
          <button type="button" onClick={signOut} className={row}>
            <Icon name="logout" size={18} />
            {t('menu.logout')}
          </button>
        </div>
      </Popover>
    </DialogTrigger>
  );
}
