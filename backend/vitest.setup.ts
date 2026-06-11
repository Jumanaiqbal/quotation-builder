// Dummy env vars so modules that import lib/env don't throw during unit tests.
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET ??= 'test-secret';
process.env.ANTHROPIC_API_KEY ??= 'test-key';
process.env.NODE_ENV = 'test';
