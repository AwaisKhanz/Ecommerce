import { NextResponse } from 'next/server';

import { type AppError } from '@/lib/errors';

export const apiResponse = {
  ok<T>(data: T, meta?: unknown, init?: ResponseInit): NextResponse {
    return NextResponse.json({ ok: true, data, ...(meta ? { meta } : {}) }, init);
  },
  created<T>(data: T): NextResponse {
    return NextResponse.json({ ok: true, data }, { status: 201 });
  },
  noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  },
  validationError(details: unknown): NextResponse {
    return NextResponse.json(
      { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details } },
      { status: 400 },
    );
  },
  error(error: AppError, requestId?: string): NextResponse {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          ...(requestId ? { requestId } : {}),
        },
      },
      { status: error.httpStatus },
    );
  },
};
