/**
 * Money is always represented as a decimal string plus an ISO 4217 currency code.
 * Never use floating-point arithmetic for money. See AGENTS.md.
 */

export type Money = {
  amount: string; // decimal string, e.g. "425.30"
  currency: string; // ISO 4217, e.g. "EUR"
};

export function money(amount: string, currency: string): Money {
  return { amount, currency };
}

export class CurrencyMismatchError extends Error {
  constructor(a: string, b: string) {
    super(`Cannot operate on different currencies: ${a} vs ${b}`);
    this.name = 'CurrencyMismatchError';
  }
}

/**
 * Decimal-safe addition of two Money values in the same currency. Works in integer
 * minor units to avoid floating-point drift, then re-formats to a decimal string.
 */
export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) throw new CurrencyMismatchError(a.currency, b.currency);
  const decimals = Math.max(decimalPlaces(a.amount), decimalPlaces(b.amount));
  const scale = 10 ** decimals;
  const total = Math.round(Number(a.amount) * scale) + Math.round(Number(b.amount) * scale);
  return { amount: (total / scale).toFixed(decimals), currency: a.currency };
}

function decimalPlaces(value: string): number {
  const dot = value.indexOf('.');
  return dot === -1 ? 0 : value.length - dot - 1;
}

/** Locale-aware display formatting. Display only — never feeds back into arithmetic. */
export function formatMoney(value: Money, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currency,
  }).format(Number(value.amount));
}
