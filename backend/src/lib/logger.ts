import { env } from './env';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const write = (level: LogLevel, message: string, meta?: unknown): void => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta !== undefined ? { meta } : {}),
  };
  const line = JSON.stringify(entry) + '\n';

  if (level === 'error') {
    process.stderr.write(line);
  } else if (env.NODE_ENV !== 'test') {
    process.stdout.write(line);
  }
};

export const logger = {
  info: (message: string, meta?: unknown) => write('info', message, meta),
  warn: (message: string, meta?: unknown) => write('warn', message, meta),
  error: (message: string, meta?: unknown) => write('error', message, meta),
  debug: (message: string, meta?: unknown) => write('debug', message, meta),
};
