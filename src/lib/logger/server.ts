import pino from 'pino';

export const logger = pino({
  level: process.env['LOG_LEVEL'] ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  base: {
    service: 'industrial-shop',
    env: process.env['VERCEL_ENV'] ?? 'local',
  },
  redact: {
    paths: [
      'password',
      'token',
      '*.password',
      '*.token',
      'authorization',
      'cookie',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
