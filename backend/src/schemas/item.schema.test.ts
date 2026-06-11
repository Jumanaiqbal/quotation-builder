import { describe, it, expect } from 'vitest';
import { createItemSchema, updateItemSchema } from './item.schema';

describe('createItemSchema', () => {
  it('accepts a complete valid item', () => {
    const result = createItemSchema.safeParse({
      title: 'Website design',
      description: '8-page corporate site',
      quantity: 2,
      unitPrice: 500,
      estimatedHours: 40,
    });
    expect(result.success).toBe(true);
  });

  it('applies defaults for quantity and unitPrice', () => {
    const result = createItemSchema.parse({ title: 'SEO setup' });
    expect(result.quantity).toBe(1);
    expect(result.unitPrice).toBe(0);
  });

  it('rejects an empty title', () => {
    expect(createItemSchema.safeParse({ title: '' }).success).toBe(false);
  });

  it('rejects a missing title', () => {
    expect(createItemSchema.safeParse({ quantity: 1, unitPrice: 10 }).success).toBe(false);
  });

  it('rejects zero or negative quantity', () => {
    expect(createItemSchema.safeParse({ title: 'X', quantity: 0 }).success).toBe(false);
    expect(createItemSchema.safeParse({ title: 'X', quantity: -2 }).success).toBe(false);
  });

  it('rejects non-integer quantity', () => {
    expect(createItemSchema.safeParse({ title: 'X', quantity: 1.5 }).success).toBe(false);
  });

  it('rejects negative unit price', () => {
    expect(createItemSchema.safeParse({ title: 'X', unitPrice: -1 }).success).toBe(false);
  });

  it('allows unit price of zero (placeholder pricing)', () => {
    expect(createItemSchema.safeParse({ title: 'X', unitPrice: 0 }).success).toBe(true);
  });

  it('allows estimatedHours of zero but rejects negatives', () => {
    expect(createItemSchema.safeParse({ title: 'X', estimatedHours: 0 }).success).toBe(true);
    expect(createItemSchema.safeParse({ title: 'X', estimatedHours: -5 }).success).toBe(false);
  });

  it('allows omitting optional fields entirely', () => {
    const result = createItemSchema.safeParse({ title: 'Hosting' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
      expect(result.data.estimatedHours).toBeUndefined();
    }
  });
});

describe('updateItemSchema', () => {
  it('allows a partial update with a single field', () => {
    expect(updateItemSchema.safeParse({ quantity: 3 }).success).toBe(true);
  });

  it('allows an empty object (no changes)', () => {
    expect(updateItemSchema.safeParse({}).success).toBe(true);
  });

  it('still validates provided fields', () => {
    expect(updateItemSchema.safeParse({ quantity: -1 }).success).toBe(false);
    expect(updateItemSchema.safeParse({ title: '' }).success).toBe(false);
  });
});
