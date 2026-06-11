import { describe, it, expect } from 'vitest';
import { createQuotationSchema, updateQuotationSchema } from './quotation.schema';

describe('createQuotationSchema', () => {
  it('accepts a valid quotation', () => {
    const result = createQuotationSchema.safeParse({
      clientId: 'clx123',
      title: 'Website Redesign',
      notes: 'Urgent project',
    });
    expect(result.success).toBe(true);
  });

  it('accepts a quotation without notes', () => {
    expect(createQuotationSchema.safeParse({ clientId: 'clx123', title: 'X' }).success).toBe(true);
  });

  it('rejects a missing clientId', () => {
    expect(createQuotationSchema.safeParse({ title: 'X' }).success).toBe(false);
  });

  it('rejects an empty clientId', () => {
    expect(createQuotationSchema.safeParse({ clientId: '', title: 'X' }).success).toBe(false);
  });

  it('rejects an empty title', () => {
    expect(createQuotationSchema.safeParse({ clientId: 'clx123', title: '' }).success).toBe(false);
  });
});

describe('updateQuotationSchema', () => {
  it('accepts each valid status', () => {
    for (const status of ['DRAFT', 'SENT', 'APPROVED', 'REJECTED']) {
      expect(updateQuotationSchema.safeParse({ status }).success).toBe(true);
    }
  });

  it('rejects an unknown status', () => {
    expect(updateQuotationSchema.safeParse({ status: 'PENDING' }).success).toBe(false);
    expect(updateQuotationSchema.safeParse({ status: 'draft' }).success).toBe(false);
  });

  it('allows an empty object', () => {
    expect(updateQuotationSchema.safeParse({}).success).toBe(true);
  });

  it('rejects an empty title when provided', () => {
    expect(updateQuotationSchema.safeParse({ title: '' }).success).toBe(false);
  });
});
