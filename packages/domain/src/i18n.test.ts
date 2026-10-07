import { describe, expect, it } from 'vitest';
import { getDirection, getLanguage, getMarket, resolveMarketContext } from './i18n';

describe('direction resolution', () => {
  it('treats English/German as LTR', () => {
    expect(getDirection('en-de')).toBe('ltr');
    expect(getDirection('de-de')).toBe('ltr');
  });

  it('treats Persian/Arabic/Hebrew as RTL', () => {
    expect(getDirection('fa-ir')).toBe('rtl');
    expect(getDirection('ar-ae')).toBe('rtl');
    expect(getDirection('he-il')).toBe('rtl');
  });

  it('defaults unknown languages to LTR', () => {
    expect(getDirection('xx-yy')).toBe('ltr');
  });
});

describe('locale parsing', () => {
  it('extracts language and market subtags', () => {
    expect(getLanguage('fa-ir')).toBe('fa');
    expect(getMarket('fa-ir')).toBe('IR');
  });
});

describe('resolveMarketContext', () => {
  it('derives direction and currency from locale', () => {
    expect(resolveMarketContext('fa-ir')).toMatchObject({
      market: 'IR',
      currency: 'IRR',
      direction: 'rtl',
      salesChannel: 'WEB',
    });
    expect(resolveMarketContext('en-de')).toMatchObject({
      market: 'DE',
      currency: 'EUR',
      direction: 'ltr',
    });
  });
});
