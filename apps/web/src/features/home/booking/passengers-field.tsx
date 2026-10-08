'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { passengerBounds, passengerTotal, type PassengerKind } from '@aerotech/domain';
import { Button, FieldButton, ResponsiveOverlay, SegmentedControl, Stepper } from '@aerotech/ui';
import { useFormatters } from '../../shared/use-duration';
import { useHome } from '../home-context';

type PassengersFieldProps = { isOpen: boolean; onOpenChange: (open: boolean) => void };

const KINDS: readonly PassengerKind[] = ['adults', 'children', 'infants'];

export function PassengersField({ isOpen, onOpenChange }: PassengersFieldProps) {
  const t = useTranslations('booking');
  const { number } = useFormatters();
  const { draft, dispatch } = useHome();
  const trigger = useRef<HTMLButtonElement>(null);

  const cabin = draft?.cabin === 'BUSINESS' ? t('business') : t('economy');
  const total = draft ? passengerTotal(draft) : 1;
  const bounds = draft ? passengerBounds(draft) : null;

  return (
    <>
      <FieldButton
        ref={trigger}
        label={t('passengersClass')}
        value={`${t('passengersCount', { count: total })} · ${cabin}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onPress={() => onOpenChange(!isOpen)}
      />
      <ResponsiveOverlay
        title={t('paxTitle')}
        closeLabel={t('close')}
        triggerRef={trigger}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        shouldFlip={false}
        placement="bottom end"
        className="w-90"
      >
        {draft && bounds ? (
          <div className="flex flex-col">
            {KINDS.map((kind) => (
              <Stepper
                key={kind}
                label={t(kind)}
                description={t(`${kind}Hint`)}
                value={draft[kind]}
                min={bounds[kind].min}
                max={bounds[kind].max}
                onChange={(count) => dispatch({ type: 'setPassengers', kind, count })}
                decrementLabel={t('fewer', { label: t(kind) })}
                incrementLabel={t('more', { label: t(kind) })}
                format={number}
              />
            ))}
            <div className="flex items-center justify-between gap-3 border-t border-hairline py-3">
              <span className="text-body font-bold">{t('cabin')}</span>
              <SegmentedControl
                aria-label={t('cabin')}
                size="sm"
                value={draft.cabin}
                onChange={(next) => dispatch({ type: 'setCabin', cabin: next })}
                options={[
                  { id: 'ECONOMY', label: t('economy') },
                  { id: 'BUSINESS', label: t('business') },
                ]}
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-hairline pt-3">
              <span className="text-small text-muted">{t('maxPassengers')}</span>
              <Button size="sm" onPress={() => onOpenChange(false)}>
                {t('done')}
              </Button>
            </div>
          </div>
        ) : null}
      </ResponsiveOverlay>
    </>
  );
}
