'use client';

import { useTranslations } from 'next-intl';
import { Button, Icon } from '@aerotech/ui';
import { useRouter } from '@/i18n/navigation';
import { useAccount } from '../account/account-context';

/** Join and log in for visitors; a way to their profile for members. */
export function ClubActions() {
  const t = useTranslations();
  const router = useRouter();
  const { user, openAuth } = useAccount();

  return (
    <div className="mt-auto flex flex-wrap items-center gap-2.5">
      {user ? (
        <Button onPress={() => router.push('/account')}>
          {t('account.menu.profile')}
          <Icon name="arrow" size={16} />
        </Button>
      ) : (
        <>
          <Button onPress={() => openAuth()}>{t('club.join')}</Button>
          <Button variant="secondary" onPress={() => openAuth()}>
            {t('club.login')}
          </Button>
        </>
      )}
    </div>
  );
}
