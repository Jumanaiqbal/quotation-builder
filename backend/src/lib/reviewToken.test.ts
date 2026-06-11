import { describe, it, expect } from 'vitest';
import { generateReviewToken } from './reviewToken';

describe('generateReviewToken', () => {
  it('returns a 64-character hex string (32 random bytes)', () => {
    const token = generateReviewToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it('generates unique tokens on every call', () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateReviewToken()));
    expect(tokens.size).toBe(100);
  });

  it('is URL-safe (no characters needing encoding)', () => {
    const token = generateReviewToken();
    expect(encodeURIComponent(token)).toBe(token);
  });
});
