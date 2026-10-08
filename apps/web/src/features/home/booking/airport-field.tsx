'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { destinationsFrom, HUB_CODE, NETWORK_CODES, ticketedAirportCode } from '@aerotech/domain';
import { FieldButton, Icon, ResponsiveOverlay, SearchList, useIsDesktop } from '@aerotech/ui';
import { useHome } from '../home-context';

type AirportFieldProps = {
  kind: 'from' | 'to';
  isOpen: boolean;
  isInvalid?: boolean;
  onOpenChange: (open: boolean) => void;
  onPicked?: (code: string) => void;
  className?: string;
};

/** Origin or destination: a field that opens a searchable list of the cities we fly to. */
export function AirportField({
  kind,
  isOpen,
  isInvalid,
  onOpenChange,
  onPicked,
  className,
}: AirportFieldProps) {
  const t = useTranslations();
  const { draft, dispatch } = useHome();
  const desktop = useIsDesktop();
  const trigger = useRef<HTMLButtonElement>(null);

  const origin = draft?.from ?? HUB_CODE;
  const selected = kind === 'from' ? origin : (draft?.to ?? null);
  const otherEnd = kind === 'from' ? (draft?.to ?? null) : origin;
  const codes = kind === 'from' ? NETWORK_CODES : destinationsFrom(origin);
  const title = kind === 'from' ? t('booking.chooseOrigin') : t('booking.chooseDestination');

  return (
    <>
      <FieldButton
        ref={trigger}
        label={kind === 'from' ? t('booking.from') : t('booking.to')}
        placeholder={t('booking.toPlaceholder')}
        isInvalid={isInvalid}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onPress={() => onOpenChange(!isOpen)}
        className={className}
        value={
          selected ? (
            <>
              <span className="truncate">{t(`cities.${selected}.name`)}</span>
              <span dir="ltr" className="font-mono text-caption font-normal text-muted">
                {ticketedAirportCode(selected, otherEnd)}
              </span>
            </>
          ) : undefined
        }
      />
      <ResponsiveOverlay
        title={title}
        closeLabel={t('booking.close')}
        triggerRef={trigger}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        shouldFlip={false}
        className="w-95"
      >
        <SearchList
          aria-label={t('booking.citySearch')}
          placeholder={t('booking.cityPlaceholder')}
          emptyMessage={t('booking.noCity')}
          autoFocus={desktop}
          selectedId={selected}
          onSelect={(code) => {
            dispatch({ type: kind === 'from' ? 'setOrigin' : 'setDestination', code });
            onOpenChange(false);
            onPicked?.(code);
          }}
          items={codes.map((code) => ({
            id: code,
            title: t(`cities.${code}.name`),
            description: t(`cities.${code}.airport`),
            // Tehran has two airports; either code should find it.
            code: code === HUB_CODE ? 'THR · IKA' : code,
            keywords: code === HUB_CODE ? 'THR IKA' : code,
            icon: <Icon name="pin" size={18} />,
          }))}
        />
      </ResponsiveOverlay>
    </>
  );
}
