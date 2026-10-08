/** Sign-in identifiers (mobile number or email) and password rules. Pure, so both ends can share them. */

const PERSIAN = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC = '٠١٢٣٤٥٦٧٨٩';

/** Persian and Arabic-Indic digits to Latin, so people can type numbers on any keyboard. */
export function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC.indexOf(digit)));
}

const compact = (value: string) => toLatinDigits(value).trim().replace(/[\s-]/g, '');

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** An Iranian mobile number in national form (09…) or any number with a country code. */
export function isPhone(value: string): boolean {
  return /^(\+\d{10,15}|0\d{10})$/.test(compact(value));
}

export function isIdentifier(value: string): boolean {
  return isEmail(value) || isPhone(value);
}

export function normalizePhone(value: string): string {
  return compact(value);
}

/** One canonical form per account, however the identifier was typed. */
export function identifierKey(value: string): string {
  return isEmail(value) ? value.trim().toLowerCase() : compact(value);
}

/** For "we sent a code to …": enough to recognise, not enough to read over a shoulder. */
export function maskIdentifier(value: string): string {
  if (isEmail(value)) return value.trim().replace(/^(.).*(@.*)$/, '$1•••$2');
  const digits = compact(value);
  return `${digits.slice(0, 4)} ••• ${digits.slice(-2)}`;
}

export function isNationalId(value: string): boolean {
  return /^\d{10}$/.test(compact(value));
}

export type PasswordChecks = { length: boolean; digit: boolean; match: boolean };

export function checkPassword(password: string, repeat: string): PasswordChecks {
  return {
    length: password.length >= 8,
    digit: /\d/.test(toLatinDigits(password)),
    match: password.length > 0 && password === repeat,
  };
}

export const OTP_LENGTH = 5;
