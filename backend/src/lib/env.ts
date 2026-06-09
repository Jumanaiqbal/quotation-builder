const required = ['DATABASE_URL', 'JWT_SECRET', 'ANTHROPIC_API_KEY'] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  PORT: parseInt(process.env.PORT ?? '4000', 10),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  DATABASE_URL: process.env.DATABASE_URL as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY as string,
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001',
  N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL ?? '',
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com',
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD ?? 'password123',
};
