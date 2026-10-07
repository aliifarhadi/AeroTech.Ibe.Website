import { describe, expect, it } from 'vitest';
import { addMoney, CurrencyMismatchError, formatMoney, money } from './money';

describe('addMoney', () => {
  it('adds same-currency amounts without floating-point drift', () => {
    expect(addMoney(money('0.10', 'EUR'), money('0.20', 'EUR'))).toEqual(money('0.30', 'EUR'));
    expect(addMoney(money('425.30', 'EUR'), money('75.00', 'EUR'))).toEqual(money('500.30', 'EUR'));
  });

  it('rejects mismatched currencies', () => {
    expect(() => addMoney(money('1.00', 'EUR'), money('1.00', 'USD'))).toThrow(
      CurrencyMismatchError,
    );
  });
});

describe('formatMoney', () => {
  it('formats by locale and currency', () => {
    expect(formatMoney(money('500.30', 'EUR'), 'en-DE')).toContain('500.30');
  });
});
