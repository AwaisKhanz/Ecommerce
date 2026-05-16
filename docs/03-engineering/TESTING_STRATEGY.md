# 03 · TESTING STRATEGY

## 1. Testing Pyramid

```
                  ▲
                  │   E2E (Playwright)    ~10%
                  │   ────────────────
                  │   Integration         ~30%
                  │   ────────────────
                  │   Unit                ~60%
                  ▼
```

- **Unit** — pure functions, services, validators, hooks
- **Integration** — Server Actions + Route Handlers against a test Supabase
- **E2E** — full browser flows on a staging-like environment

## 2. Tooling

| Layer | Tool |
|---|---|
| Unit | **Vitest** |
| Component | **Vitest + Testing Library** |
| Integration | **Vitest + supabase-js (test schema)** |
| E2E | **Playwright** |
| Visual regression (Phase 2) | **Playwright snapshots** or Chromatic |
| Email rendering | **react-email preview + Vitest snapshots** |
| Lint/Type checks | TS + ESLint as CI gates |

## 3. Folder Layout

```
tests/
├── unit/          ← mirrors src/ structure
├── integration/   ← scenario folders
└── e2e/
    ├── customer/
    ├── admin/
    └── fixtures/
```

Co-located unit tests live next to source: `product.service.test.ts` next to `product.service.ts`.

## 4. Naming

- Test files: `*.test.ts` or `*.test.tsx`
- E2E specs: `*.spec.ts`
- Test names follow the pattern: `it('should <expected behavior> when <condition>')`

## 5. Coverage Targets

| Area | Target |
|---|---|
| `src/lib/*` | 80% |
| `src/features/*/server/` | 75% |
| `src/features/*/components/` | 50% (visual coverage via E2E) |
| Hooks | 70% |

CI enforces a floor; falling below blocks the merge.

## 6. Unit Test Examples

```ts
// src/lib/utils/money.test.ts
import { describe, it, expect } from 'vitest';
import { formatMoney } from './money';

describe('formatMoney', () => {
  it('formats USD with 2 decimals', () => {
    expect(formatMoney(1234.5, 'USD', 'en')).toBe('$1,234.50');
  });
  it('returns "—" for null/undefined', () => {
    expect(formatMoney(null as any, 'USD', 'en')).toBe('—');
  });
});
```

```ts
// src/features/checkout/server/order.service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { OrderService } from './order.service';

describe('OrderService.create', () => {
  it('throws STOCK_INSUFFICIENT when item stock < quantity', async () => {
    const repo = { getProductsForOrder: vi.fn().mockResolvedValue([{ id: 'p1', stock: 1 }]) };
    const svc = new OrderService(repo as any);
    await expect(svc.create({ items: [{ productId: 'p1', quantity: 2 }] /* ... */ }))
      .rejects.toThrow(/INSUFFICIENT/);
  });
});
```

## 7. Integration Tests

- Spin up a local Supabase via `supabase start`
- Run migrations + seed on each suite (`beforeAll`)
- Reset between tests with truncation helpers
- Hit Route Handlers / Server Actions directly using Node fetch and a signed admin session cookie

```ts
// tests/integration/orders/place-order.test.ts
it('decrements stock atomically', async () => {
  await seedProduct({ id: 'p1', stock: 5 });
  const res = await callAction(placeOrderAction, {
    items: [{ productId: 'p1', quantity: 3 }],
    /* customer + address */
  });
  expect(res.ok).toBe(true);
  const stock = await getStock('p1');
  expect(stock).toBe(2);
});
```

## 8. End-to-End Tests

Critical user journeys, headless on CI:

### Customer
1. Browse home → shop → product detail → add to cart → checkout → place order → see confirmation
2. Search for a product → filter by category → sort by price
3. Submit contact form
4. Switch language (when MULTILANG_AR enabled)

### Admin
1. Login → dashboard
2. Create product with images → publish → verify on shop
3. Receive order → change status to delivered → email is sent
4. Edit category → see updated breadcrumbs on shop
5. Failed login lockout after 5 attempts

```ts
// tests/e2e/customer/checkout.spec.ts
test('guest can place a COD order', async ({ page }) => {
  await page.goto('/shop');
  await page.getByRole('link', { name: /honda eu22i/i }).click();
  await page.getByRole('button', { name: /add to cart/i }).click();
  await page.goto('/checkout');
  await page.getByLabel(/full name/i).fill('Ahmed Khan');
  // ... fill rest
  await page.getByRole('button', { name: /place order/i }).click();
  await expect(page).toHaveURL(/\/orders\/.+\/confirmation/);
  await expect(page.getByText(/ORD-\d{4}-\d{6}/)).toBeVisible();
});
```

## 9. Mocking

- Email sending: replace `Resend` client with a fake that records calls
- Storage uploads: use a memory adapter
- Time: use `vi.useFakeTimers()` for date-sensitive logic
- Random: stub `crypto.randomUUID` only where determinism matters

## 10. Test Data

- `tests/fixtures/` holds factories: `makeProduct()`, `makeOrder()`, `makeAdmin()`
- Factories use Faker for realistic random data, seeded for reproducibility

## 11. Accessibility Testing

- `@axe-core/playwright` runs on key pages in CI
- Zero violations on home, shop, product detail, checkout, admin dashboard
- Manual keyboard-only walkthrough on every release

## 12. Performance Testing

- Lighthouse CI in GitHub Actions on PRs that touch UI files
- Budgets: LCP 2.5s, CLS 0.1, INP 200ms
- Bundle size diff comment via `next-bundle-analyzer`

## 13. Visual Regression (Phase 2)

- Playwright takes screenshots of key pages in light/dark, en/ar
- Diff threshold: 0.1% per page
- Snapshots committed; intentional updates require PR approval

## 14. CI Pipeline

```
On every PR:
  1. install (pnpm)
  2. lint
  3. typecheck
  4. unit + integration tests (with coverage)
  5. build
  6. e2e on preview deploy
  7. lighthouse-ci
  8. bundle-size diff comment
```

PR is blocked if any step fails.

## 15. Flaky Test Policy

- Flaky tests are quarantined (`@flaky`) and assigned to an owner
- Auto-retry once in CI for E2E, never for unit
- A test quarantined for > 14 days must be fixed or deleted

## 16. Test Performance

- Unit + integration suite target: < 60 seconds
- E2E suite target: < 6 minutes parallelized

## 17. What We Don't Test

- Third-party SDK internals (Supabase, Resend, Next.js)
- Generated types
- Trivial getters / pass-through wrappers
- Layout marginalia (use snapshots only for stable, semantic components)
