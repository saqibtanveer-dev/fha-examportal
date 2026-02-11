import pino from 'pino';

const isServer = typeof window === 'undefined';

export const logger = isServer
  ? pino({
      level: process.env.LOG_LEVEL ?? 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    })
  : {
      info: (...args: unknown[]) => console.log('[INFO]', ...args),
      warn: (...args: unknown[]) => console.warn('[WARN]', ...args),
      error: (...args: unknown[]) => console.error('[ERROR]', ...args),
      debug: (...args: unknown[]) => console.debug('[DEBUG]', ...args),
      fatal: (...args: unknown[]) => console.error('[FATAL]', ...args),
      trace: (...args: unknown[]) => console.trace('[TRACE]', ...args),
    };

export type Logger = typeof logger;
