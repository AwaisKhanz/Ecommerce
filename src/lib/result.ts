import type { ErrorCode } from '@/lib/errors';

export type ActionSuccess<T> = {
  ok: true;
  data: T;
};

export type ActionFailure = {
  ok: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
};

export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

export const ok = <T>(data: T): ActionSuccess<T> => ({ ok: true, data });
export const fail = (code: ErrorCode, message: string, details?: unknown): ActionFailure => ({
  ok: false,
  error: { code, message, details },
});
