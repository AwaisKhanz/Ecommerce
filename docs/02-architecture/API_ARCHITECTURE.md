# 02 · API ARCHITECTURE

## 1. Overview

The system uses **three** complementary mechanisms for data access and mutation:

| Mechanism | Used for | Why |
|---|---|---|
| **React Server Components** | Public read paths (catalog, product detail) | SEO, streaming, no client JS |
| **Server Actions** | Public mutations (place order, contact form) | Type-safe, progressive enhancement |
| **Route Handlers (`/api/*`)** | Admin panel CRUD, webhooks, external clients | REST surface for the admin SPA-like flow and future mobile clients |

All three call into the **same data access layer (`/lib/db/`)** — no business logic ever lives directly in a route file.

## 2. API Layer Diagram

```
Public Pages (RSC) ──┐
                     │
Admin Panel (CSR) ──┼──► Route Handlers / Server Actions
                     │           │
Future Mobile ──────┘           ▼
                       Application Services (/features/*/server)
                                 │
                                 ▼
                     Data Access Layer (/lib/db)
                                 │
                                 ▼
                       Supabase Client (typed)
                                 │
                                 ▼
                            PostgreSQL
```

## 3. Conventions

### 3.1 URL Conventions
- All routes are kebab-case
- Versioned: `/api/v1/...` for endpoints we expect external clients to consume
- Internal admin endpoints: `/api/admin/...` (auth-gated, never versioned)
- Plural resource names: `/api/v1/products`, `/api/v1/orders`
- Nested resources allowed up to 2 levels: `/api/v1/orders/:id/items`

### 3.2 HTTP Verbs
| Verb | Use |
|---|---|
| `GET` | Read |
| `POST` | Create |
| `PATCH` | Partial update |
| `PUT` | Full replace (rare) |
| `DELETE` | Soft delete |

### 3.3 Response Shape

All API responses use a consistent envelope:

```ts
// Success
{
  "ok": true,
  "data": T,
  "meta"?: { "page": 1, "perPage": 20, "total": 142 }
}

// Error
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User-facing message",
    "details"?: { ... },
    "requestId": "req_abc123"
  }
}
```

### 3.4 Status Codes
| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | No content (after DELETE) |
| 400 | Bad request (validation) |
| 401 | Unauthenticated |
| 403 | Forbidden (no permission) |
| 404 | Not found |
| 409 | Conflict (e.g., stock unavailable) |
| 422 | Unprocessable (semantic validation) |
| 429 | Rate limited |
| 500 | Server error |

### 3.5 Pagination
- Cursor-based for large lists (`?cursor=xxx&limit=20`)
- Offset-based for admin (`?page=1&perPage=20`)
- Always return `meta` block with paging info

### 3.6 Filtering & Sorting
- Filters as query params: `?category=generators&inStock=true`
- Sort: `?sort=price` or `?sort=-price` (descending with `-` prefix)
- Multi-sort: `?sort=-createdAt,name`

### 3.7 Idempotency
- Mutation endpoints accept `Idempotency-Key` header
- Server stores key → response mapping for 24h
- Required on `POST /api/v1/orders` to prevent duplicate submissions

## 4. Server Actions Pattern

```ts
// src/features/checkout/server/place-order.action.ts
'use server';

import { z } from 'zod';
import { placeOrderSchema } from '@/features/checkout/schemas';
import { orderService } from '@/features/orders/server/order.service';
import { actionResult, ActionResult } from '@/lib/result';
import { logger } from '@/lib/logger';

export async function placeOrderAction(
  input: unknown
): Promise<ActionResult<{ orderId: string }>> {
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return actionResult.error('VALIDATION_ERROR', parsed.error.flatten());
  }

  try {
    const order = await orderService.create(parsed.data);
    return actionResult.success({ orderId: order.id });
  } catch (err) {
    logger.error({ err }, 'place_order_failed');
    return actionResult.error('ORDER_FAILED', 'Could not place order');
  }
}
```

## 5. Route Handler Pattern

```ts
// src/app/api/admin/products/route.ts
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/guards';
import { productService } from '@/features/products/server/product.service';
import { createProductSchema } from '@/features/products/schemas';
import { apiResponse } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const result = await productService.list({
    page: Number(searchParams.get('page') ?? 1),
    perPage: Number(searchParams.get('perPage') ?? 20),
    search: searchParams.get('q') ?? undefined,
  });
  return apiResponse.ok(result.items, { page: result.page, perPage: result.perPage, total: result.total });
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  const body = await req.json();
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) return apiResponse.validationError(parsed.error);
  const product = await productService.create(parsed.data);
  return apiResponse.created(product);
}
```

## 6. Service Layer Rules

- Services are **pure business logic**. They never touch `req`/`res` or Next-specific objects.
- Services accept already-validated DTOs.
- Services depend on the **data access layer** (`/lib/db/`), not on Supabase directly.
- Services are unit-testable.

## 7. Rate Limiting

- Public mutations (place order, contact form): 5/min per IP
- Admin login: 5 attempts per 15 min per IP
- Implemented with Upstash Redis (free tier) or in-memory fallback in dev
- Returns 429 with `Retry-After` header

## 8. CORS Policy

- Same-origin only by default
- `/api/v1/*` allows configured origins (future mobile app whitelist)
- No wildcard CORS ever

## 9. Versioning Policy

- Breaking changes → new version (`/api/v2/...`)
- Deprecation notice via `Deprecation` and `Sunset` headers
- Old versions supported for ≥ 90 days after deprecation

## 10. Webhooks (Future Hooks)

Architecturally reserved endpoints (not built in Phase 1 but documented):
- `POST /api/webhooks/resend` — email delivery events
- `POST /api/webhooks/payments` — Phase 3
- `POST /api/webhooks/shipping` — future
