import { describe, expect, it } from 'vitest';
import { gregorianToJalali, jalaliToGregorian, jalaliMonthLength } from './jalali';

describe('Jalali calendar conversion', () => {
  it('converts the Persian new year accurately', () => {
    expect(gregorianToJalali(new Date(2026, 2, 21))).toEqual({ year: 1405, month: 1, day: 1 });
  });

  it('round-trips a Jalali date', () => {
    const jalali = { year: 1405, month: 4, day: 20 };
    expect(gregorianToJalali(jalaliToGregorian(jalali))).toEqual(jalali);
  });

  it('uses the correct month lengths', () => {
    expect(jalaliMonthLength(1405, 1)).toBe(31);
    expect(jalaliMonthLength(1405, 7)).toBe(30);
    expect(jalaliMonthLength(1404, 12)).toBe(29);
  });
});
