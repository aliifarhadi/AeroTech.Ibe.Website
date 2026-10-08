'use client';

import {
  createCalendar,
  DateFormatter,
  toCalendar,
  toCalendarDate,
  type CalendarIdentifier,
} from '@internationalized/date';
import { useContext, useMemo } from 'react';
import {
  Calendar as AriaCalendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarStateContext,
  RangeCalendar as AriaRangeCalendar,
  RangeCalendarStateContext,
  type CalendarProps as AriaCalendarProps,
  type DateValue,
  type RangeCalendarProps as AriaRangeCalendarProps,
  useLocale,
} from 'react-aria-components';
import { IconButton } from './button';
import { Icon } from './icon';

/**
 * Calendars follow the locale of the nearest I18nProvider: Persian (Jalali) for fa-IR, Gregorian
 * for en and de, with the first day of the week and the digits that belong to that locale.
 */

type Labels = { previousLabel: string; nextLabel: string };

const cell = [
  'flex size-10 cursor-pointer items-center justify-center rounded-control text-body text-default outline-none',
  'transition-colors duration-(--duration-fast)',
  'data-hovered:bg-surface-hover data-focus-visible:outline-2 data-focus-visible:outline-focus',
  'data-today:font-bold data-today:text-action',
  'data-selected:bg-action-soft data-selected:text-default data-selected:rounded-none',
  'data-selection-start:rounded-s-control data-selection-start:bg-action data-selection-start:font-bold data-selection-start:text-on-action',
  'data-selection-end:rounded-e-control data-selection-end:bg-action data-selection-end:font-bold data-selection-end:text-on-action',
  'data-disabled:cursor-default data-disabled:text-disabled data-unavailable:text-disabled data-unavailable:line-through',
  'data-outside-month:hidden',
].join(' ');

const single = [
  'flex size-10 cursor-pointer items-center justify-center rounded-control text-body text-default outline-none',
  'transition-colors duration-(--duration-fast)',
  'data-hovered:bg-surface-hover data-focus-visible:outline-2 data-focus-visible:outline-focus',
  'data-today:font-bold data-today:text-action',
  'data-selected:bg-action data-selected:font-bold data-selected:text-on-action',
  'data-disabled:cursor-default data-disabled:text-disabled data-outside-month:hidden',
].join(' ');

/**
 * Bounds converted to the locale's calendar system. React Aria focuses the bound itself when
 * today equals it, so a Gregorian `minValue` would otherwise turn a Persian calendar Gregorian.
 */
function useLocalBounds(minValue?: DateValue | null, maxValue?: DateValue | null) {
  const { locale } = useLocale();
  return useMemo(() => {
    const calendar = createCalendar(
      new DateFormatter(locale).resolvedOptions().calendar as CalendarIdentifier,
    );
    const convert = (value?: DateValue | null) =>
      value ? toCalendar(toCalendarDate(value), calendar) : undefined;
    return { minValue: convert(minValue), maxValue: convert(maxValue) };
  }, [locale, minValue, maxValue]);
}

function Header({ previousLabel, nextLabel }: Labels) {
  return (
    <>
      <IconButton
        slot="previous"
        aria-label={previousLabel}
        size="sm"
        className="absolute start-0 top-0"
      >
        <Icon name="chevron-back" size={18} />
      </IconButton>
      <IconButton slot="next" aria-label={nextLabel} size="sm" className="absolute end-0 top-0">
        <Icon name="chevron-forward" size={18} />
      </IconButton>
    </>
  );
}

/** Month and year above one grid. Decorative: React Aria already announces the visible range. */
function MonthTitle({ offset }: { offset: number }) {
  const single = useContext(CalendarStateContext);
  const range = useContext(RangeCalendarStateContext);
  const state = single ?? range;
  const { locale } = useLocale();
  if (!state) return null;
  const first = state.visibleRange.start.add({ months: offset });
  const title = new DateFormatter(locale, {
    month: 'long',
    year: 'numeric',
    calendar: first.calendar.identifier,
    timeZone: state.timeZone,
  }).format(first.toDate(state.timeZone));
  return (
    <div
      aria-hidden
      className="flex h-9 items-center justify-center text-body font-bold text-strong"
    >
      {title}
    </div>
  );
}

function Grids({ months, cellClass }: { months: number; cellClass: string }) {
  return (
    <div className="flex items-start gap-8">
      {Array.from({ length: months }, (_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <MonthTitle offset={i} />
          <CalendarGrid
            offset={{ months: i }}
            weekdayStyle="narrow"
            className="border-separate border-spacing-y-0.5"
          >
            <CalendarGridHeader>
              {(day) => (
                <CalendarHeaderCell className="pb-1 text-caption font-normal text-faint">
                  {day}
                </CalendarHeaderCell>
              )}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(date) => <CalendarCell date={date} className={cellClass} />}
            </CalendarGridBody>
          </CalendarGrid>
        </div>
      ))}
    </div>
  );
}

export type CalendarProps<T extends DateValue> = Omit<
  AriaCalendarProps<T>,
  'className' | 'visibleDuration'
> &
  Labels & { months?: 1 | 2 };

export function Calendar<T extends DateValue>({
  previousLabel,
  nextLabel,
  months = 1,
  ...props
}: CalendarProps<T>) {
  const bounds = useLocalBounds(props.minValue, props.maxValue);
  return (
    <AriaCalendar {...props} {...bounds} visibleDuration={{ months }} className="relative w-fit">
      <Header previousLabel={previousLabel} nextLabel={nextLabel} />
      <Grids months={months} cellClass={single} />
    </AriaCalendar>
  );
}

export type RangeCalendarProps<T extends DateValue> = Omit<
  AriaRangeCalendarProps<T>,
  'className' | 'visibleDuration'
> &
  Labels & { months?: 1 | 2 };

export function RangeCalendar<T extends DateValue>({
  previousLabel,
  nextLabel,
  months = 1,
  ...props
}: RangeCalendarProps<T>) {
  const bounds = useLocalBounds(props.minValue, props.maxValue);
  return (
    <AriaRangeCalendar
      {...props}
      {...bounds}
      visibleDuration={{ months }}
      className="relative w-fit"
    >
      <Header previousLabel={previousLabel} nextLabel={nextLabel} />
      <Grids months={months} cellClass={cell} />
    </AriaRangeCalendar>
  );
}
