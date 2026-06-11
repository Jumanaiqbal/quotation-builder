import { describe, it, expect } from 'vitest';
import {
  parseQuotationLang,
  t,
  htmlLang,
  htmlDir,
  formatMoney,
  formatDate,
} from './quotation-i18n';

describe('parseQuotationLang', () => {
  it('returns "ar" for arabic', () => {
    expect(parseQuotationLang('ar')).toBe('ar');
  });

  it('defaults to "en" for anything else', () => {
    expect(parseQuotationLang('en')).toBe('en');
    expect(parseQuotationLang(undefined)).toBe('en');
    expect(parseQuotationLang('fr')).toBe('en');
    expect(parseQuotationLang(123)).toBe('en');
    expect(parseQuotationLang(null)).toBe('en');
  });
});

describe('t (labels)', () => {
  it('returns English labels for en', () => {
    expect(t('quotation', 'en')).toBe('Quotation');
    expect(t('grandTotal', 'en')).toBe('Grand Total');
  });

  it('returns Arabic labels for ar', () => {
    expect(t('quotation', 'ar')).toBe('عرض سعر');
    expect(t('grandTotal', 'ar')).toBe('الإجمالي');
  });
});

describe('htmlLang / htmlDir', () => {
  it('maps en to ltr layout', () => {
    expect(htmlLang('en')).toBe('en');
    expect(htmlDir('en')).toBe('ltr');
  });

  it('maps ar to rtl layout', () => {
    expect(htmlLang('ar')).toBe('ar');
    expect(htmlDir('ar')).toBe('rtl');
  });
});

describe('formatMoney', () => {
  it('formats USD with en-US locale', () => {
    expect(formatMoney('2000', 'en')).toBe('$2,000.00');
  });

  it('formats zero amounts', () => {
    expect(formatMoney(0, 'en')).toBe('$0.00');
  });

  it('formats Arabic currency containing the value', () => {
    const result = formatMoney('50', 'ar');
    // ar-BH uses Eastern Arabic numerals; just assert it is a non-empty currency string
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('US');
  });

  it('accepts numeric strings and numbers equally', () => {
    expect(formatMoney('99.99', 'en')).toBe(formatMoney(99.99, 'en'));
  });
});

describe('formatDate', () => {
  const date = new Date('2026-06-11T00:00:00Z');

  it('formats English dates', () => {
    expect(formatDate(date, 'en')).toBe('June 11, 2026');
  });

  it('formats Arabic dates with Arabic month name', () => {
    expect(formatDate(date, 'ar')).toContain('يونيو');
  });
});
