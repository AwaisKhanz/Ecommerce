# 03 · ERROR HANDLING

## 1. Goals

- Never crash the user-facing experience silently
- Always log enough detail to debug, never enough to leak secrets
- Localize every customer-facing message
- Map every internal error to a stable, typed code

## 2. Error Layers

```
                ┌──────────────────────────┐
       throw    │   Domain layer           │
   AppError ◄── │   services, repos        │
                └──────────┬───────────────┘
                           │
                ┌──────────▼───────────────┐
                │   Boundary handlers      │
  catch + map   │   Server Actions /       │
                │   Route Handlers /       │
                │   error.tsx              │
                └──────────┬───────────────┘
                           │
                ┌──────────▼───────────────┐
                │   UI feedback            │
                │   toasts, inline errors, │
                │   error pages            │
                └──────────────────────────┘
```

## 3. The `AppError` Class

See `CODING_STANDARDS.md §5` for the full type. Key properties:
- `code`: stable enum value (`VALIDATION_ERROR`, `STOCK_INSUFFICIENT`, etc.)
- `message`: developer-facing message
- `details`: optional structured info (for validation: field errors)
- `httpStatus`: maps cleanly to a response

## 4. Server Action Pattern

```ts
'use server';
import { ActionResult, ok, fail } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger/server';
import { orderService } from '@/features/orders/server/order.service';
import { placeOrderSchema } from '@/features/checkout/schemas';

export async function placeOrderAction(input: unknown): Promise<ActionResult<{ orderId: string }>> {
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return fail('VALIDATION_ERROR', 'Please check the form.', parsed.error.flatten());
  }

  try {
    const order = await orderService.create(parsed.data);
    return ok({ orderId: order.id });
  } catch (err) {
    if (err instanceof AppError) {
      logger.warn({ code: err.code }, 'place_order_handled');
      return fail(err.code, err.message, err.details);
    }
    logger.error({ err }, 'place_order_unhandled');
    return fail('INTERNAL', 'Something went wrong. Please try again.');
  }
}
```

## 5. Route Handler Pattern

```ts
import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger/server';
import { apiResponse } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  try {
    // ... auth, validate, call service
  } catch (err) {
    if (err instanceof AppError) {
      return apiResponse.error(err);
    }
    logger.error({ err }, 'route_unhandled');
    return apiResponse.error(new AppError('INTERNAL', 'Internal Server Error', undefined, 500));
  }
}
```

## 6. `apiResponse` Helpers

```ts
// src/lib/api/response.ts
import { NextResponse } from 'next/server';
import type { AppError } from '@/lib/errors';

export const apiResponse = {
  ok<T>(data: T, meta?: unknown, init?: ResponseInit) {
    return NextResponse.json({ ok: true, data, ...(meta ? { meta } : {}) }, init);
  },
  created<T>(data: T) {
    return NextResponse.json({ ok: true, data }, { status: 201 });
  },
  noContent() {
    return new NextResponse(null, { status: 204 });
  },
  validationError(zodError: unknown) {
    return NextResponse.json(
      { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: zodError } },
      { status: 400 },
    );
  },
  error(err: AppError) {
    return NextResponse.json(
      { ok: false, error: { code: err.code, message: err.message, details: err.details, requestId: getRequestId() } },
      { status: err.httpStatus },
    );
  },
};
```

## 7. Client-Side Handling

```tsx
'use client';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function useActionWithFeedback() {
  const t = useTranslations('errors');
  return async <T>(
    action: () => Promise<{ ok: true; data: T } | { ok: false; error: { code: string; details?: unknown } }>,
    onSuccess: (data: T) => void,
  ) => {
    const result = await action();
    if (result.ok) {
      onSuccess(result.data);
    } else {
      toast.error(t(result.error.code, { fallback: 'Something went wrong' }));
    }
  };
}
```

## 8. Error Boundaries (React)

- `error.tsx` per route group — renders a friendly fallback with retry button
- `global-error.tsx` for app-shell-level crashes
- All errors caught here are forwarded to Sentry via `captureException`

```tsx
// src/app/(shop)/error.tsx
'use client';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function ShopError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return (
    <ErrorState
      title="Something broke on our end"
      description="Please try again. If it keeps happening, contact us."
      action={<Button onClick={reset}>Retry</Button>}
    />
  );
}
```

## 9. Localized Error Messages

All user-facing error codes have entries in `messages/<locale>.json`:

```json
{
  "errors": {
    "VALIDATION_ERROR": "Please check the form and try again.",
    "STOCK_INSUFFICIENT": "Some items are out of stock.",
    "RATE_LIMITED": "Too many requests. Please wait a moment.",
    "INTERNAL": "Something went wrong. Please try again.",
    "UNAUTHORIZED": "Please sign in to continue.",
    "FORBIDDEN": "You don't have permission to do that.",
    "NOT_FOUND": "We couldn't find that.",
    "CONFLICT": "There was a conflict. Please reload and try again."
  }
}
```

## 10. Logging Rules

- **Warn:** expected business errors (`STOCK_INSUFFICIENT`, validation failures)
- **Error:** unhandled exceptions, infra failures
- **Info:** business events (order placed, order delivered)
- Never log: passwords, tokens, full credit card numbers, full PII without redaction
- Always include: `requestId`, `userId` (if auth'd), `path`, relevant entity IDs

## 11. Sentry Integration

- Browser SDK + server SDK
- Source maps uploaded in CI
- PII filters configured (`beforeSend` strips emails)
- Sample rate: 100% errors, 10% performance traces in prod, 100% in staging
- Release tagging via `SENTRY_RELEASE` env var (set from git SHA)

## 12. Form Validation UX

- Display field errors inline below the input
- Display top-level form errors in an alert above the submit button
- Don't auto-scroll on every keystroke; scroll once on submit attempt
- Maintain field focus on the first invalid field

## 13. Edge Cases Catalog

| Case | Strategy |
|---|---|
| Stock changes between cart and checkout | Re-validate in `place_order` RPC; return `STOCK_INSUFFICIENT` with affected items |
| Network drop mid-submit | Idempotency-Key prevents duplicate orders |
| Image upload partial fail | Continue product save; allow user to retry image |
| Email send fails | Order still saved; outbox row marked failed; retry job picks up |
| Admin double-clicks delete | Disable button after click; confirmation dialog |
| Invalid signed URL | Show generic "link expired" page |

## 14. Public vs Internal Errors

| Where | Detail level |
|---|---|
| Server logs (Pino + Sentry) | Full stack + context |
| Client toasts / UI | Localized, short, action-oriented |
| API responses | Code + message; details only when safe (validation) |

Never expose internal exceptions, SQL strings, or stack traces to the client.
