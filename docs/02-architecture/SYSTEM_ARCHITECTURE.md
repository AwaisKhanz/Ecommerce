# 02 · SYSTEM ARCHITECTURE

## 1. High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       CLIENT (Browser)                          │
│   Public Shop (RSC)    │    Admin Panel (CSR + RSC hybrid)      │
│   /                    │    /admin/*                            │
└────────────┬───────────────────────────┬────────────────────────┘
             │                           │
             │ HTTPS                     │ HTTPS + Auth cookie
             ▼                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     VERCEL EDGE / NODE                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Next.js App Router                                       │  │
│  │   • Server Components (data fetching, SEO)                │  │
│  │   • Route Handlers /api/*  (REST endpoints)               │  │
│  │   • Server Actions (mutations)                            │  │
│  │   • Middleware (auth, i18n, rate limit)                   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────┬───────────────────────────────┬───────────────────┘
              │                               │
              │ supabase-js (SSR cookies)     │ admin client (service role)
              ▼                               ▼
┌─────────────────────────────────────┐    ┌─────────────────────────┐
│         SUPABASE                    │    │       RESEND            │
│   ┌──────────────────────────────┐  │    │   Transactional Email   │
│   │ Postgres (with RLS)          │  │    │   React Email templates │
│   │  • products, orders, ...     │  │    └─────────────────────────┘
│   └──────────────────────────────┘  │    ┌─────────────────────────┐
│   ┌──────────────────────────────┐  │    │       SENTRY            │
│   │ Auth (admin only)            │  │    │   Error tracking        │
│   └──────────────────────────────┘  │    └─────────────────────────┘
│   ┌──────────────────────────────┐  │    ┌─────────────────────────┐
│   │ Storage (product images)     │  │    │  VERCEL ANALYTICS       │
│   │  + CDN-served via getPublicUrl│ │    │   Web vitals + events   │
│   └──────────────────────────────┘  │    └─────────────────────────┘
└─────────────────────────────────────┘
```

## 2. Architectural Style

**Modular monolith** within a Next.js app:

- Feature-based modules (catalog, cart, checkout, orders, admin)
- Shared infrastructure (db, auth, email, logging)
- Single deploy target = Vercel
- Single database = Supabase Postgres

This is the right choice for the scale: simple to operate, easy to reason about, no premature distribution.

## 3. Rendering Strategy

| Route group                       | Rendering                 | Reason                            |
| --------------------------------- | ------------------------- | --------------------------------- |
| `/` (home)                        | RSC + ISR (revalidate 1h) | Mostly static, occasional updates |
| `/shop`                           | RSC + dynamic             | Needs fresh stock/price           |
| `/shop/[slug]` (product)          | RSC + ISR (revalidate 5m) | SEO-critical, near-static         |
| `/cart`                           | CSR                       | Per-user, no SEO value            |
| `/checkout`                       | CSR + Server Action       | Per-user, mutation-heavy          |
| `/admin/*`                        | CSR + RSC hybrid          | Auth-gated, no SEO                |
| `/contact`, `/about`, `/services` | RSC static                | Marketing pages                   |

## 4. Data Flow Patterns

### 4.1 Public read (e.g., product list)

```
Browser → Next.js RSC → Supabase (anon client w/ RLS)
                ↘ cached in React cache + ISR
```

### 4.2 Customer write (e.g., place order)

```
Browser form → Server Action → Validate (Zod) → Supabase RPC (transactional)
                                                      ↓
                                              Insert order + decrement stock
                                                      ↓
                                              Enqueue email → Resend
                                                      ↓
                                              Return order ID → Client redirect
```

### 4.3 Admin write (e.g., update product)

```
Admin UI → React Query mutation → Route Handler `/api/admin/...`
                                       ↓
                            Auth check (cookie → Supabase Auth)
                                       ↓
                            Role check (admin RLS / service role)
                                       ↓
                            Validate → DB write → Invalidate cache
```

## 5. Security Layers

1. **Network:** HTTPS-only (Vercel), HSTS, secure headers
2. **Edge:** Middleware enforces auth on `/admin/*`, rate limits on mutations
3. **Application:** Zod validation on every input; CSRF protection on Server Actions
4. **Database:** Postgres RLS policies; service-role key never reaches the browser
5. **Storage:** Signed URLs for uploads; public read-only on product images bucket
6. **Auth:** Supabase Auth with HTTP-only cookies; no JWT in localStorage

## 6. Caching Strategy

| Layer                    | What                  | TTL                |
| ------------------------ | --------------------- | ------------------ |
| Vercel CDN               | Static assets, images | 1 year (hashed)    |
| Next.js ISR              | Product pages         | 5 minutes          |
| Next.js full-route cache | Listing pages         | Revalidated on tag |
| React `cache()`          | Per-request dedup     | Per request        |
| TanStack Query           | Admin client cache    | 30s stale, 5m gc   |
| Supabase                 | None at app level     | —                  |

**Cache invalidation triggers:**

- `revalidateTag('products')` on product create/update/delete
- `revalidateTag('categories')` on category change
- `revalidateTag('orders')` on order status change (admin only views this anyway)

## 7. Error Handling Pattern

- All Server Actions return `{ ok: true, data } | { ok: false, error: AppError }`
- Route Handlers return typed JSON with proper HTTP status
- Client wraps mutations with toast notifications
- Unexpected errors flow through the shared logging path
- User-facing errors are localized

## 8. Asynchronous Work

The only true async work is email sending. Strategy:

- **Phase 1:** Fire-and-forget from Server Action with `try/catch` and log failures
- **Phase 2:** Move to Vercel Cron + Supabase queue table for reliability
- **Phase 3:** Inngest or Trigger.dev for multi-step workflows

A `email_outbox` table is created from day 1 to enable Phase 2 without schema migration.

## 9. Observability

- **Logs:** Pino (server) → stdout → Vercel logs → optionally drained to Logtail
- **Errors:** shared client logger + Pino server logs
- **Performance:** Vercel Speed Insights, Web Vitals API
- **Business events:** Custom event layer → Vercel Analytics + DB `events` table for audit

## 10. Internationalization Architecture

- `next-intl` middleware handles locale detection and routing
- All UI strings live in `/messages/{locale}.json`
- Database has translated columns OR a `translations` JSONB column per row
- URLs prefixed with locale: `/en/shop/...`, `/ar/shop/...`
- `dir="rtl"` is set on `<html>` for RTL locales
- Tailwind logical properties (`ps-4` not `pl-4`) used throughout

## 11. Folder Layout (one-line summary)

```
src/
├── app/             ← routes
├── features/        ← domain modules
├── components/ui    ← design system
├── lib/             ← infra (db, email, logger, validators)
├── hooks/           ← shared hooks
├── types/           ← shared types
├── messages/        ← i18n
└── styles/          ← globals
```

(Full layout in `FOLDER_STRUCTURE.md`.)

## 12. Scalability Plan

| Scale event    | Action                                                       |
| -------------- | ------------------------------------------------------------ |
| 10x traffic    | Already handled by Vercel + Supabase scaling                 |
| 100k products  | Add Postgres indexes (already planned); add Meilisearch      |
| 10k orders/day | Move email to queue; add read replicas                       |
| Multi-region   | Vercel multi-region + Supabase read replicas per region      |
| Mobile app     | Reuse Supabase backend + add REST endpoints under `/api/v1/` |

## 13. Architectural Decision Records (ADRs)

ADRs live in `docs/adr/` and follow Michael Nygard's template. Initial ADRs to write:

- ADR-001: Use Next.js App Router over Pages Router
- ADR-002: Supabase over self-hosted Postgres
- ADR-003: Server Actions for mutations vs. dedicated REST API
- ADR-004: COD-only at launch (no payment gateway)
- ADR-005: Feature-based folder structure
- ADR-006: i18n-from-day-1 even with single-language launch
