export type JalaliDate = {
  year: number;
  month: number;
  day: number;
};

export const JALALI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

export const JALALI_WEEKDAY_NAMES = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
] as const;

const GREGORIAN_MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isGregorianLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function gregorianToJalali(date: Date): JalaliDate {
  let gy = date.getFullYear() - 1600;
  const gm = date.getMonth();
  const gd = date.getDate() - 1;

  let gDayNumber =
    365 * gy +
    Math.floor((gy + 3) / 4) -
    Math.floor((gy + 99) / 100) +
    Math.floor((gy + 399) / 400);
  for (let index = 0; index < gm; index += 1) gDayNumber += GREGORIAN_MONTH_DAYS[index] ?? 0;
  if (gm > 1 && isGregorianLeapYear(gy + 1600)) gDayNumber += 1;
  gDayNumber += gd;

  let jDayNumber = gDayNumber - 79;
  let jy = 979 + 33 * Math.floor(jDayNumber / 12053);
  jDayNumber %= 12053;
  jy += 4 * Math.floor(jDayNumber / 1461);
  jDayNumber %= 1461;

  if (jDayNumber >= 366) {
    jy += Math.floor((jDayNumber - 1) / 365);
    jDayNumber = (jDayNumber - 1) % 365;
  }

  const jm =
    jDayNumber < 186 ? 1 + Math.floor(jDayNumber / 31) : 7 + Math.floor((jDayNumber - 186) / 30);
  const jd = 1 + (jDayNumber < 186 ? jDayNumber % 31 : (jDayNumber - 186) % 30);
  return { year: jy, month: jm, day: jd };
}

export function jalaliToGregorian(value: JalaliDate): Date {
  const { year: inputYear, month, day } = value;
  let jy = inputYear - 979;
  const jm = month - 1;
  const jd = day - 1;

  let jDayNumber = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4);
  for (let index = 0; index < jm; index += 1) jDayNumber += index < 6 ? 31 : 30;
  jDayNumber += jd;

  let gDayNumber = jDayNumber + 79;
  let gy = 1600 + 400 * Math.floor(gDayNumber / 146097);
  gDayNumber %= 146097;

  let leap = true;
  if (gDayNumber >= 36525) {
    gDayNumber -= 1;
    gy += 100 * Math.floor(gDayNumber / 36524);
    gDayNumber %= 36524;
    if (gDayNumber >= 365) gDayNumber += 1;
    else leap = false;
  }

  gy += 4 * Math.floor(gDayNumber / 1461);
  gDayNumber %= 1461;
  if (gDayNumber >= 366) {
    leap = false;
    gDayNumber -= 1;
    gy += Math.floor(gDayNumber / 365);
    gDayNumber %= 365;
  }

  let gm = 0;
  while (gDayNumber >= (gm === 1 ? (leap ? 29 : 28) : (GREGORIAN_MONTH_DAYS[gm] ?? 0))) {
    gDayNumber -= gm === 1 ? (leap ? 29 : 28) : (GREGORIAN_MONTH_DAYS[gm] ?? 0);
    gm += 1;
  }

  return new Date(gy, gm, gDayNumber + 1);
}

export function jalaliMonthLength(year: number, month: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  const start = jalaliToGregorian({ year, month: 12, day: 1 });
  const next = jalaliToGregorian({ year: year + 1, month: 1, day: 1 });
  return Math.round((next.getTime() - start.getTime()) / 86400000);
}
