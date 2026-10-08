'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@aerotech/ui/cn';
import {
  gregorianToJalali,
  JALALI_MONTH_NAMES,
  JALALI_WEEKDAY_NAMES,
  jalaliMonthLength,
  jalaliToGregorian,
} from '@aerotech/domain';
import { CalendarIcon } from '@/components/icons';
import { fieldLabelClass, FieldValue } from '@/components/ui/field';

type DateRangePickerProps = {
  departure: string;
  returnDate: string;
  returnDisabled?: boolean;
  onChange: (departure: string, returnDate: string) => void;
};

function toIsoDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function fromIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function calendarMonthStart(date: Date, persian: boolean): Date {
  if (!persian) return monthStart(date);
  const jalali = gregorianToJalali(date);
  return jalaliToGregorian({ year: jalali.year, month: jalali.month, day: 1 });
}

function nextCalendarMonth(date: Date, persian: boolean): Date {
  if (!persian) return new Date(date.getFullYear(), date.getMonth() + 1, 1);
  const jalali = gregorianToJalali(date);
  const nextMonth =
    jalali.month === 12
      ? { year: jalali.year + 1, month: 1 }
      : { year: jalali.year, month: jalali.month + 1 };
  return jalaliToGregorian({ year: nextMonth.year, month: nextMonth.month, day: 1 });
}

function previousCalendarMonth(date: Date, persian: boolean): Date {
  if (!persian) return new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const jalali = gregorianToJalali(date);
  const previousMonth =
    jalali.month === 1
      ? { year: jalali.year - 1, month: 12 }
      : { year: jalali.year, month: jalali.month - 1 };
  return jalaliToGregorian({ year: previousMonth.year, month: previousMonth.month, day: 1 });
}

function formatPersianNumber(value: number): string {
  return new Intl.NumberFormat('fa-IR').format(value);
}

function calendarMonthKey(date: Date, persian: boolean): string {
  if (!persian) return monthKey(date);
  const jalali = gregorianToJalali(date);
  return `${jalali.year}-${jalali.month}`;
}

export function DateRangePicker({
  departure,
  returnDate,
  returnDisabled = false,
  onChange,
}: DateRangePickerProps) {
  const t = useTranslations('Widget');
  const locale = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogId = useId();
  const minimum = toIsoDate(today());
  const persian = locale.startsWith('fa');
  const minimumMonth = calendarMonthStart(today(), persian);
  const [open, setOpen] = useState(false);
  const [activeField, setActiveField] = useState<'departure' | 'return'>('departure');
  const [flexible, setFlexible] = useState(false);
  const [month, setMonth] = useState(() =>
    calendarMonthStart(fromIsoDate(departure) ?? today(), persian),
  );
  const displayLocale = locale.startsWith('en') ? 'en-GB' : locale;

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const formatDate = (value: string) => {
    const date = fromIsoDate(value);
    if (date && persian) {
      const jalali = gregorianToJalali(date);
      return `${formatPersianNumber(jalali.day)} ${JALALI_MONTH_NAMES[jalali.month - 1]} ${formatPersianNumber(jalali.year)}`;
    }
    return date
      ? new Intl.DateTimeFormat(displayLocale, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(date)
      : t('selectDate');
  };

  function openField(field: 'departure' | 'return') {
    if (field === 'return' && returnDisabled) return;
    const current = field === 'departure' ? departure : returnDate;
    setActiveField(field);
    setMonth(
      calendarMonthStart(fromIsoDate(current) ?? fromIsoDate(departure) ?? today(), persian),
    );
    setOpen(true);
  }

  function selectDate(date: Date) {
    const value = toIsoDate(date);
    if (value < minimum) return;

    if (activeField === 'departure' || !departure || returnDisabled) {
      onChange(value, returnDate && returnDate > value ? returnDate : '');
      if (!returnDisabled) setActiveField('return');
      return;
    }

    if (value <= departure) {
      onChange(value, '');
      setActiveField('return');
      return;
    }

    onChange(departure, value);
  }

  function clearAll() {
    onChange('', '');
    setActiveField('departure');
    setMonth(minimumMonth);
  }

  const months = [month, nextCalendarMonth(month, persian)];
  const canMovePrevious = month.getTime() > minimumMonth.getTime();

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={() => openField('departure')}
        aria-label={returnDisabled ? t('depart') : `${t('depart')} ~ ${t('return')}`}
        aria-expanded={open}
        aria-controls={dialogId}
        className={cn(
          'flex w-full min-w-0 items-center gap-2.5 px-4 py-2 text-start transition-colors',
          open && 'rounded-xl ring-2 ring-brand-400/40',
        )}
      >
        <CalendarIcon className="size-4 shrink-0 text-neutral-400" />
        <span className="min-w-0 flex-1">
          <span className={cn(fieldLabelClass, 'block')}>{t('depart')}</span>
          <FieldValue placeholder={!departure}>
            {departure
              ? returnDisabled
                ? formatDate(departure)
                : `${formatDate(departure)} ~ ${returnDate ? formatDate(returnDate) : t('return')}`
              : t('selectDate')}
          </FieldValue>
        </span>
      </button>
      <input type="hidden" name="depart" value={departure} />
      <input type="hidden" name="return" value={returnDate} />

      {open && (
        <div
          id={dialogId}
          role="dialog"
          aria-label={`${t('depart')} and ${t('return')}`}
          className="animate-popover absolute start-0 top-full z-50 mt-3 w-[min(52rem,calc(100vw-2rem))] rounded-xl border border-neutral-300 bg-white p-4 text-start shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)] sm:p-6 lg:start-1/2 lg:-translate-x-1/2 lg:rtl:translate-x-1/2"
        >
          <button
            type="button"
            aria-label={t('previousMonth')}
            disabled={!canMovePrevious}
            className="absolute start-2 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full text-2xl text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-30 md:flex"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setMonth((current) => previousCalendarMonth(current, persian));
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="m12.5 4-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={t('nextMonth')}
            className="absolute end-2 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full text-2xl text-neutral-700 transition-colors hover:bg-neutral-100 md:flex"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setMonth((current) => nextCalendarMonth(current, persian));
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="m7.5 4 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 md:px-5">
            {months.map((currentMonth) => (
              <CalendarMonth
                key={calendarMonthKey(currentMonth, persian)}
                month={currentMonth}
                departure={departure}
                returnDate={returnDate}
                minimum={minimum}
                locale={displayLocale}
                persian={persian}
                onSelect={selectDate}
              />
            ))}
          </div>
          <div className="mt-5 flex flex-col items-stretch justify-between gap-4 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center">
            <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={flexible}
                onChange={(event) => setFlexible(event.target.checked)}
                className="size-5 accent-black"
              />
              {t('dateRange.flexibleDates')}
            </label>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="h-11 rounded-full border border-neutral-300 px-5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
                onClick={clearAll}
              >
                {t('dateRange.clearAll')}
              </button>
              <button
                type="button"
                className="h-11 rounded-full bg-brand-400 px-6 text-sm font-bold text-black transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!departure}
                onClick={() => setOpen(false)}
              >
                {t('dateRange.continue')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarMonth({
  month,
  departure,
  returnDate,
  minimum,
  locale,
  persian,
  onSelect,
}: {
  month: Date;
  departure: string;
  returnDate: string;
  minimum: string;
  locale: string;
  persian: boolean;
  onSelect: (date: Date) => void;
}) {
  const jalaliMonth = persian ? gregorianToJalali(month) : null;
  const monthLabel = jalaliMonth
    ? `${JALALI_MONTH_NAMES[jalaliMonth.month - 1]} ${formatPersianNumber(jalaliMonth.year)}`
    : new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(month);
  const weekdays = persian
    ? JALALI_WEEKDAY_NAMES
    : Array.from({ length: 7 }, (_, index) =>
        new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2023, 0, 2 + index)),
      );
  const firstDate = jalaliMonth
    ? jalaliToGregorian({ year: jalaliMonth.year, month: jalaliMonth.month, day: 1 })
    : new Date(month.getFullYear(), month.getMonth(), 1);
  const firstWeekday = persian ? (firstDate.getDay() + 1) % 7 : (firstDate.getDay() + 6) % 7;
  const daysInMonth = jalaliMonth
    ? jalaliMonthLength(jalaliMonth.year, jalaliMonth.month)
    : new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: firstWeekday + daysInMonth }, (_, index) =>
    index < firstWeekday
      ? null
      : jalaliMonth
        ? jalaliToGregorian({
            year: jalaliMonth.year,
            month: jalaliMonth.month,
            day: index - firstWeekday + 1,
          })
        : new Date(month.getFullYear(), month.getMonth(), index - firstWeekday + 1),
  );

  return (
    <section aria-label={monthLabel}>
      <h3 className="text-center text-base font-semibold text-neutral-800">{monthLabel}</h3>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-neutral-500">
        {weekdays.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-y-1 text-sm">
        {cells.map((date, index) => {
          if (!date) return <span key={`empty-${index}`} className="h-10" aria-hidden="true" />;
          const value = toIsoDate(date);
          const isDeparture = value === departure;
          const isReturn = value === returnDate;
          const inRange = Boolean(
            departure && returnDate && value > departure && value < returnDate,
          );
          const unavailable = value < minimum;
          return (
            <button
              key={value}
              type="button"
              disabled={unavailable}
              aria-pressed={isDeparture || isReturn}
              aria-label={new Intl.DateTimeFormat(persian ? 'fa-IR-u-ca-persian' : locale, {
                dateStyle: 'full',
              }).format(date)}
              className={`relative h-10 w-full transition-colors ${inRange ? 'bg-brand-100 text-brand-900' : 'text-neutral-800 hover:bg-brand-50'} ${isDeparture ? 'rounded-s-full bg-black font-bold text-white hover:bg-black' : ''} ${isReturn ? 'rounded-e-full bg-black font-bold text-white hover:bg-black' : ''} disabled:cursor-not-allowed disabled:text-neutral-300`}
              onClick={() => onSelect(date)}
            >
              {persian ? formatPersianNumber(gregorianToJalali(date).day) : date.getDate()}
            </button>
          );
        })}
      </div>
    </section>
  );
}
