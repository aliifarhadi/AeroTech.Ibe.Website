'use client';

import { useLocale, useTranslations } from 'next-intl';
import { LOCALES } from '@aerotech/domain';
import { Button, DialogTrigger, Icon, IconButton, Popover } from '@aerotech/ui';

/** The four markets, each named in its own language. */
export function LocaleLinks({ className }: { className?: string }) {
  const t = useTranslations('locales');
  const current = useLocale();
  return (
    <ul className={className}>
      {LOCALES.map((locale) => {
        const selected = locale === current;
        return (
          <li key={locale}>
            <a
              href={`/${locale}`}
              hrefLang={locale}
              lang={locale.split('-')[0]}
              aria-current={selected ? 'true' : undefined}
              className={[
                'flex min-h-11 items-center justify-between gap-4 rounded-control px-3 text-small transition-colors duration-(--duration-fast) hover:bg-surface-hover hover:text-strong',
                selected ? 'font-bold text-action' : 'text-soft',
              ].join(' ')}
            >
              {t(locale)}
              {selected ? <Icon name="check" size={16} /> : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** Language and region switcher. A globe in the header, a labelled button in the footer. */
export function LocaleMenu({ variant = 'header' }: { variant?: 'header' | 'footer' }) {
  const t = useTranslations();
  const current = useLocale();
  return (
    <DialogTrigger>
      {variant === 'header' ? (
        <IconButton variant="ghost" aria-label={t('nav.language')}>
          <Icon name="globe" size={18} />
        </IconButton>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          aria-label={`${t('nav.language')}: ${t(`locales.${current}`)}`}
        >
          <Icon name="globe" size={16} />
          {t(`locales.${current}`)}
        </Button>
      )}
      <Popover
        aria-label={t('nav.language')}
        placement={variant === 'header' ? 'bottom end' : 'top end'}
        className="w-64"
      >
        <LocaleLinks />
      </Popover>
    </DialogTrigger>
  );
}
