import { describe, it, expect } from 'vitest';
import { Decimal } from '@prisma/client-runtime-utils';
import { calculateItemTotal, calculateQuotationTotal } from './calculations';

describe('calculateItemTotal', () => {
  it('multiplies quantity by unit price', () => {
    expect(calculateItemTotal(3, new Decimal('150')).toString()).toBe('450');
  });

  it('handles decimal unit prices without floating-point drift', () => {
    expect(calculateItemTotal(2, new Decimal('99.99')).toString()).toBe('199.98');
  });

  it('handles quantity of 1', () => {
    expect(calculateItemTotal(1, new Decimal('0.01')).toString()).toBe('0.01');
  });

  it('returns zero when unit price is zero (AI placeholder prices)', () => {
    expect(calculateItemTotal(5, new Decimal('0')).toString()).toBe('0');
  });

  it('handles large quantities and amounts', () => {
    expect(calculateItemTotal(1000, new Decimal('9999.99')).toString()).toBe('9999990');
  });

  it('keeps precision where plain JS floats would fail (0.1 * 3)', () => {
    // 0.1 * 3 === 0.30000000000000004 in JS floats; Decimal must give exactly 0.3
    expect(calculateItemTotal(3, new Decimal('0.1')).toString()).toBe('0.3');
  });
});

describe('calculateQuotationTotal', () => {
  it('sums all item totals', () => {
    const total = calculateQuotationTotal([
      { total: new Decimal('100') },
      { total: new Decimal('250.50') },
      { total: new Decimal('49.50') },
    ]);
    expect(total.toString()).toBe('400');
  });

  it('returns zero for empty items', () => {
    expect(calculateQuotationTotal([]).toString()).toBe('0');
  });

  it('handles a single item', () => {
    expect(calculateQuotationTotal([{ total: new Decimal('123.45') }]).toString()).toBe('123.45');
  });

  it('sums many decimal values exactly', () => {
    const items = Array.from({ length: 10 }, () => ({ total: new Decimal('0.1') }));
    expect(calculateQuotationTotal(items).toString()).toBe('1');
  });

  it('includes zero-priced items without affecting the sum', () => {
    const total = calculateQuotationTotal([
      { total: new Decimal('0') },
      { total: new Decimal('2000') },
      { total: new Decimal('0') },
    ]);
    expect(total.toString()).toBe('2000');
  });
});
