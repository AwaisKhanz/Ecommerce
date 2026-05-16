# 04 · ANALYTICS ARCHITECTURE

## 1. Goals

- Understand customer behavior: where do they drop off, what sells
- Measure product success: conversion rate, AOV, repeat customers
- Detect operational issues (failed orders, slow pages) early
- Respect privacy: consent-gated, no third-party tracking by default

## 2. Tooling

| Layer | Tool | Use |
|---|---|---|
| Web vitals + RUM | **Vercel Analytics + Speed Insights** | LCP/CLS/INP, page views |
| Product analytics | **PostHog (self-hosted or cloud, Phase 2)** OR **custom DB events** | funnels, retention |
| Server-side events | Custom in `audit_logs` + `events` table | always-on, no consent needed |
| Marketing pixels | **Google Analytics 4 / Meta** (consent-gated) | Phase 2+ |

## 3. Event Taxonomy

Naming: `noun.action` in past tense, snake_case.

| Event | Properties |
|---|---|
| `page.viewed` | `path`, `locale`, `referrer` |
| `product.viewed` | `productId`, `slug`, `categoryId`, `price` |
| `product.added_to_cart` | `productId`, `qty`, `price` |
| `cart.viewed` | `lineCount`, `subtotal` |
| `checkout.started` | `lineCount`, `subtotal` |
| `checkout.submitted` | `lineCount`, `total` |
| `order.placed` | `orderId`, `total`, `itemCount` |
| `order.status_changed` | `orderId`, `from`, `to` |
| `search.performed` | `query`, `resultCount` |
| `filter.applied` | `filterKey`, `value` |
| `contact.submitted` | `subject` |
| `admin.action.*` | varies |

## 4. Event Layer Abstraction

```ts
// src/lib/analytics/index.ts
import { isBrowser } from '@/lib/utils/env';
import { va } from '@vercel/analytics';

type EventMap = {
  'product.viewed':       { productId: string; slug: string; price: number };
  'product.added_to_cart':{ productId: string; qty: number; price: number };
  'checkout.submitted':   { lineCount: number; total: number };
  'order.placed':         { orderId: string; total: number; itemCount: number };
  // ...
};

export function track<K extends keyof EventMap>(name: K, props: EventMap[K]) {
  if (!isBrowser()) return;
  va.track(name, props as Record<string, unknown>);
  // Optional: send to /api/events for our own pipeline
}
```

Server-side events use `serverTrack(...)` which writes to `audit_logs`/`events`.

## 5. Server vs Client Events

| Concern | Where to fire |
|---|---|
| Page views | Client (Vercel Analytics built-in) |
| Product viewed | Client |
| Add to cart | Client |
| Checkout started | Client |
| **Order placed** | **Server** (single source of truth) |
| Status changed | Server |
| Admin actions | Server (audit log) |
| Errors | Server (Sentry) |

Rule: anything that must be 100% reliable lives server-side.

## 6. Consent & Privacy

- **Vercel Analytics** is privacy-friendly, cookieless. Always-on.
- **Marketing pixels** (GA4, Meta) load only after consent.
- **PostHog** uses anonymized cookies; consent recommended.
- Cookie consent banner (Phase 2) implements:
  - "Necessary only" (default)
  - "Allow analytics" (enables PostHog / GA4)
- Consent state stored in `consent-v1` cookie + Zustand

## 7. Dashboards

### 7.1 Built-in Vercel
- Page views per route
- Top referrers
- Web Vitals trends

### 7.2 Admin Business Dashboard
Built in the admin panel using DB queries:
- Orders today / week / month
- Revenue (delivered orders)
- Top products by qty / revenue
- Status funnel: placed → confirmed → delivered
- Cancellation rate
- Average order value
- Top categories
- Sales chart (30 days)

### 7.3 Operational Dashboard (Phase 2)
- Error rate
- p75 page latency
- Email send success rate
- Cart abandonment rate

## 8. Funnels

Primary conversion funnel:
```
page.viewed (home/shop) → product.viewed → product.added_to_cart →
checkout.started → checkout.submitted → order.placed
```

Each step's drop-off is tracked. SQL views power the funnel in admin dashboard.

## 9. Sample SQL (Top Products)

```sql
select p.id, p.name, sum(oi.quantity) as units, sum(oi.line_total) as revenue
from order_items oi
join products p on p.id = oi.product_id
join orders o on o.id = oi.order_id
where o.created_at >= now() - interval '30 days'
  and o.status = 'delivered'
group by p.id, p.name
order by revenue desc
limit 10;
```

## 10. UTM Handling

Capture UTM params on first page visit, persist in cookie `utm-v1` (30-day TTL). Attach to `order.placed` event so we know which campaigns drive orders.

## 11. A/B Testing (Future)

Architecturally ready via Feature Flags. Bucket users via deterministic hash of session ID + flag key. Track outcomes per variant.

## 12. Data Retention

| Source | Retention |
|---|---|
| Vercel Analytics | Per plan (90 days default) |
| PostHog | Configurable; 1 year recommended |
| `audit_logs` | 1 year, then archive |
| `events` | 6 months hot, archive cold |

## 13. Exporting Data

`/admin/orders/export` exports CSV for the date range. Phase 2 adds:
- Scheduled email of weekly summary to admin
- Webhook into Google Sheets

## 14. Performance Impact

- Analytics layer is non-blocking (uses `requestIdleCallback`)
- No third-party scripts on the critical path
- Vercel Analytics is hosted on `va.vercel-scripts.com` with HTTP/3
- All marketing pixels lazy-loaded after first interaction

## 15. Testing

- Unit-test the event layer: assert `track()` was called with right shape
- Playwright assertion: after "Add to cart", a `product.added_to_cart` event is queued
- Periodic manual QA: walk a real funnel and verify events appear

## 16. Documentation Discipline

- Every new event added to `src/lib/analytics/events.ts` (typed union) and documented in this file
- PRs that add events without docs are blocked
