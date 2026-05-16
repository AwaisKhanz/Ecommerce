'use client';

export const clientLogger = {
  info(message: string, data?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'production') console.warn(message, data);
  },
  warn(message: string, data?: Record<string, unknown>): void {
    console.warn(message, data);
  },
  error(error: unknown, context?: Record<string, unknown>): void {
    console.error(error, context);
  },
};
