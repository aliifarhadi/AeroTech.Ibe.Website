import { describe, expect, it } from 'vitest';
import {
  checkPassword,
  identifierKey,
  isEmail,
  isNationalId,
  isPhone,
  maskIdentifier,
  toLatinDigits,
} from './identity';

describe('identity', () => {
  it('reads Persian and Arabic digits', () => {
    expect(toLatinDigits('۰۹۱۲٣٤٥')).toBe('0912345');
  });

  it('accepts national and international mobile numbers', () => {
    expect(isPhone('0912 345 6789')).toBe(true);
    expect(isPhone('۰۹۱۲۳۴۵۶۷۸۹')).toBe(true);
    expect(isPhone('+491701234567')).toBe(true);
    expect(isPhone('912345')).toBe(false);
  });

  it('accepts ordinary emails only', () => {
    expect(isEmail(' sara@example.com ')).toBe(true);
    expect(isEmail('sara@example')).toBe(false);
  });

  it('gives one key per account', () => {
    expect(identifierKey('Sara@Example.com')).toBe('sara@example.com');
    expect(identifierKey('0912-345 6789')).toBe('09123456789');
  });

  it('masks identifiers', () => {
    expect(maskIdentifier('sara@example.com')).toBe('s•••@example.com');
    expect(maskIdentifier('09123456789')).toBe('0912 ••• 89');
  });

  it('checks national IDs and passwords', () => {
    expect(isNationalId('۰۰۱۲۳۴۵۶۷۸')).toBe(true);
    expect(isNationalId('12345')).toBe(false);
    expect(checkPassword('abcdefg1', 'abcdefg1')).toEqual({
      length: true,
      digit: true,
      match: true,
    });
    expect(checkPassword('short', 'other')).toEqual({ length: false, digit: false, match: false });
  });
});
