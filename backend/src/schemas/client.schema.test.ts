import { describe, it, expect } from 'vitest';
import { createClientSchema, updateClientSchema } from './client.schema';

describe('createClientSchema', () => {
  const validClient = {
    name: 'Fathima VP',
    company: 'VP Technology',
    email: 'fathima@example.com',
    phone: '+973 66301909',
    notes: 'Key account',
  };

  it('accepts a complete valid client', () => {
    expect(createClientSchema.safeParse(validClient).success).toBe(true);
  });

  it('accepts the minimum required fields (name + email)', () => {
    expect(createClientSchema.safeParse({ name: 'A', email: 'a@b.com' }).success).toBe(true);
  });

  it('rejects a missing name', () => {
    expect(createClientSchema.safeParse({ email: 'a@b.com' }).success).toBe(false);
  });

  it('rejects an empty name', () => {
    expect(createClientSchema.safeParse({ name: '', email: 'a@b.com' }).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(createClientSchema.safeParse({ name: 'A', email: 'not-an-email' }).success).toBe(false);
    expect(createClientSchema.safeParse({ name: 'A', email: 'a@' }).success).toBe(false);
  });

  it('rejects a missing email', () => {
    expect(createClientSchema.safeParse({ name: 'A' }).success).toBe(false);
  });
});

describe('updateClientSchema', () => {
  it('allows partial updates', () => {
    expect(updateClientSchema.safeParse({ phone: '+973 12345678' }).success).toBe(true);
  });

  it('still validates email format when provided', () => {
    expect(updateClientSchema.safeParse({ email: 'bad' }).success).toBe(false);
  });
});
