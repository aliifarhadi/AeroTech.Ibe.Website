'use client';

import { useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Button,
  Calendar,
  DateFormatter,
  FieldButton,
  getLocalTimeZone,
  parseDate,
  RangeCalendar,
  ResponsiveOverlay,
  SegmentedControl,
  toBcp47,
  today,
  useIsDesktop,
} from '@aerotech/ui';
import { useHome } from '../home-context';

type DatesFieldProps = {
  isOpen: boolean;
  isInvalid?: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Long enough to see the range land before the popover closes. */
const CLOSE_AFTER_PICK_MS = 260;

/** Departure and return: two fields that share one calendar, in the calendar of the locale. */
export function DatesField({ isOpen, isInvalid, onOpenChange }: DatesFieldProps) {
  const t = useTranslations('Next.booking');
  const locale = toBcp47(useLocale());
  const { draft, dispatch } = useHome();
  const desktop = useIsDesktop();
  const anchor = useRef<HTMLDivElement>(null);
  const zone = getLocalTimeZone();

  const dayMonth = new DateFormatter(locale, { day: 'numeric', month: 'short' });
  const weekday = new DateFormatter(locale, { weekday: 'short' });
  const depart = draft ? parseDate(draft.depart) : null;
  const back = draft?.trip === 'round' && draft.return ? parseDate(draft.return) : null;
  const round = draft?.trip !== 'one';

  const label = (text: string, date: typeof depart) =>
    date ? `${text} · ${weekday.format(date.toDate(zone))}` : text;
  const closeSoon = () => {
    if (desktop) window.setTimeout(() => onOpenChange(false), CLOSE_AFTER_PICK_MS);
  };

  return (
    <>
      <div ref={anchor} className="flex min-w-0 flex-1">
        <FieldButton
          label={label(t('depart'), depart)}
          placeholder={t('chooseDate')}
          value={depart ? dayMonth.format(depart.toDate(zone)) : undefined}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onPress={() => onOpenChange(!isOpen)}
        />
        <div className="relative flex min-w-0 flex-1 before:absolute before:inset-y-3.5 before:start-0 before:w-px before:bg-hairline">
          <FieldButton
            label={label(t('return'), back)}
            placeholder={round ? t('chooseDate') : t('addReturn')}
            value={back ? dayMonth.format(back.toDate(zone)) : undefined}
            isInvalid={isInvalid}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            onPress={() => {
              if (!round) dispatch({ type: 'setTrip', trip: 'round' });
              onOpenChange(!isOpen);
            }}
          />
        </div>
      </div>
      <ResponsiveOverlay
        title={t('dates')}
        closeLabel={t('close')}
        triggerRef={anchor}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        shouldFlip={false}
      >
        <div className="flex flex-col items-center gap-4">
          <SegmentedControl
            aria-label={t('tripAria')}
            size="sm"
            value={round ? 'round' : 'one'}
            onChange={(trip) => dispatch({ type: 'setTrip', trip })}
            options={[
              { id: 'round', label: t('round') },
              { id: 'one', label: t('oneWay') },
            ]}
          />
          {round ? (
            <RangeCalendar
              aria-label={t('dates')}
              months={desktop ? 2 : 1}
              minValue={today(zone)}
              value={depart ? { start: depart, end: back ?? depart } : null}
              onChange={(range) => {
                dispatch({
                  type: 'setDates',
                  depart: range.start.toString(),
                  return: range.end.toString(),
                });
                closeSoon();
              }}
              previousLabel={t('previousMonth')}
              nextLabel={t('nextMonth')}
            />
          ) : (
            <Calendar
              aria-label={t('dates')}
              months={desktop ? 2 : 1}
              minValue={today(zone)}
              value={depart}
              onChange={(date) => {
                dispatch({ type: 'setDepart', date: date.toString() });
                closeSoon();
              }}
              previousLabel={t('previousMonth')}
              nextLabel={t('nextMonth')}
            />
          )}
          <div className="flex w-full items-center justify-between gap-3 border-t border-hairline pt-3">
            <span className="text-small text-muted">
              {round ? t('hintRange') : t('hintDepart')}
            </span>
            <Button size="sm" onPress={() => onOpenChange(false)}>
              {t('done')}
            </Button>
          </div>
        </div>
      </ResponsiveOverlay>
    </>
  );
}
