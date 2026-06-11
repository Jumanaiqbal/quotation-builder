import { describe, it, expect } from 'vitest';
import { aiResponseSchema } from './ai.schema';

const validResponse = {
  project_type: 'website development',
  suggested_items: [
    {
      title: 'Website design',
      description: '8-page corporate site',
      quantity: 1,
      unit_price: null,
      estimated_hours: 60,
    },
  ],
  questions_to_ask_client: ['Do you need Arabic support?'],
  summary: 'Corporate website with basic SEO.',
};

describe('aiResponseSchema', () => {
  it('accepts a valid AI response', () => {
    expect(aiResponseSchema.safeParse(validResponse).success).toBe(true);
  });

  it('allows null unit_price when the AI does not know the price (spec rule)', () => {
    const result = aiResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.suggested_items[0].unit_price).toBeNull();
    }
  });

  it('accepts a numeric unit_price when the AI does know it', () => {
    const result = aiResponseSchema.safeParse({
      ...validResponse,
      suggested_items: [{ ...validResponse.suggested_items[0], unit_price: 500 }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects unit_price as a string (e.g. "TBD" — AI must not invent values)', () => {
    const result = aiResponseSchema.safeParse({
      ...validResponse,
      suggested_items: [{ ...validResponse.suggested_items[0], unit_price: 'TBD' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing required top-level fields', () => {
    expect(aiResponseSchema.safeParse({ project_type: 'test' }).success).toBe(false);
    const { summary: _summary, ...noSummary } = validResponse;
    expect(aiResponseSchema.safeParse(noSummary).success).toBe(false);
  });

  it('rejects items with zero or negative quantity', () => {
    for (const quantity of [0, -1]) {
      const result = aiResponseSchema.safeParse({
        ...validResponse,
        suggested_items: [{ ...validResponse.suggested_items[0], quantity }],
      });
      expect(result.success).toBe(false);
    }
  });

  it('rejects items missing a title', () => {
    const { title: _title, ...itemWithoutTitle } = validResponse.suggested_items[0];
    const result = aiResponseSchema.safeParse({
      ...validResponse,
      suggested_items: [itemWithoutTitle],
    });
    expect(result.success).toBe(false);
  });

  it('accepts an empty suggested_items array', () => {
    expect(aiResponseSchema.safeParse({ ...validResponse, suggested_items: [] }).success).toBe(true);
  });

  it('accepts an empty questions list', () => {
    expect(
      aiResponseSchema.safeParse({ ...validResponse, questions_to_ask_client: [] }).success,
    ).toBe(true);
  });

  it('rejects non-string questions', () => {
    const result = aiResponseSchema.safeParse({
      ...validResponse,
      questions_to_ask_client: [123],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a completely malformed payload (e.g. AI returned prose)', () => {
    expect(aiResponseSchema.safeParse('Sure! Here are some items...').success).toBe(false);
    expect(aiResponseSchema.safeParse(null).success).toBe(false);
  });
});
