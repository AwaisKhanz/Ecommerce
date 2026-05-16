# 05 · PERFORMANCE GUIDELINES

## 1. Performance Budget

| Metric | Target | Hard Limit |
|---|---|---|
| LCP (p75) | < 2.0s | 2.5s |
| INP (p75) | < 150ms | 200ms |
| CLS (p75) | < 0.05 | 0.1 |
| TTFB | < 400ms | 600ms |
| TTI | < 3.5s | 5s |
| Initial JS (gzipped) | < 120KB | 150KB |
| Initial CSS (gzipped) | < 30KB | 50KB |
| Total page weight (above the fold) | < 500KB | 1MB |
| Lighthouse Performance | ≥ 90 | 85 floor |
| Lighthouse Accessibility | ≥ 95 | 90 floor |

If a PR pushes any number outside the hard limit, the PR is blocked.

## 2. Rendering Strategy (recap)

| Page | Strategy |
|---|---|
| Home | RSC + ISR (60 min) |
| Shop list | RSC, dynamic |
| Product detail | RSC + ISR (5 min) |
| Cart | CSR |
| Checkout | CSR + Server Action |
| Admin | CSR + RSC hybrid (no SEO) |
| Marketing pages | RSC static |

## 3. Images

- Always `next/image`
- Set `priority` on the LCP image (hero, product main)
- Set explicit `width` and `height` (prevents CLS)
- Format: AVIF / WebP via Next defaults
- Quality: 75 default; 85 for product hero
- Use blur placeholders for product cards
- Lazy load all below-the-fold images
- Serve from Supabase Storage CDN through Next image optimization

## 4. Fonts

- `next/font` with `display: 'swap'`
- Preload primary font weight (400, 600, 700 only)
- Subset to Latin (+ Arabic when enabled)
- No font CDNs (Google Fonts, etc.) — eliminates a render-blocking origin

## 5. JavaScript

- Default to Server Components — they ship no JS
- Mark client components only where interaction needs them
- Code-split heavy libs (rich text editor, charts, PDF generator, image editor)
- Dynamic imports for admin-only features
- No "barrel files" in `lib/` (kills tree-shaking)
- Avoid moment.js, lodash full import — use date-fns and `lodash-es` subpath imports
- Avoid polyfilling modern browsers (target `last 2 versions`)

```ts
// dynamic import example
const RichTextEditor = dynamic(() => import('@/components/rte/editor'), {
  ssr: false,
  loading: () => <Skeleton className="h-64" />,
});
```

## 6. CSS

- Tailwind purges unused classes at build
- Avoid CSS-in-JS at runtime
- Inline critical CSS (Next.js does this by default for pages)
- Don't ship unused shadcn components (only copy what we use)

## 7. Data Fetching

- Use React `cache()` for per-request memoization
- Use `revalidate` (ISR) on listing/detail pages
- Use `revalidateTag()` when admin mutates
- Use cursor pagination, not large `offset` scans
- Always select only needed columns
- Use Postgres indexes (see `DATABASE_SCHEMA.md §7`)
- Batch related queries; avoid N+1 (use `select('*, images(*)')`)

```ts
// good
const { data } = await supabase
  .from('products')
  .select('id, slug, name, price, primary_image:product_images!is_primary(storage_path)')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .range(0, 19);
```

## 8. Caching Layers

| Layer | TTL |
|---|---|
| Vercel CDN (hashed assets) | 1 year, immutable |
| Image optimizer | 1 year |
| Page ISR | 5 min product detail / 60 min home |
| `revalidateTag` invalidation | on admin write |
| TanStack Query (admin) | 30s stale, 5min gc |
| Browser HTTP cache for `_next/static` | 1 year |

## 9. Network

- Preconnect to Supabase CDN + Resend domains
- HTTP/2 + HTTP/3 (Vercel default)
- Compression: Brotli (Vercel default)
- No render-blocking third-party scripts
- Above-the-fold content fits within initial server response

```html
<link rel="preconnect" href="https://xxx.supabase.co" crossOrigin="" />
```

## 10. Animation

- Framer Motion only when meaningful
- Always animate `transform` and `opacity`, never `width`/`height`/`top`
- Respect `prefers-reduced-motion`
- `will-change` sparingly and only during the animation

## 11. Avoid Layout Shift

- Always set image `width`/`height`
- Reserve space for late-loading content with skeletons
- Use `font-display: swap` + size-adjust if available
- Don't inject ads or banners that push layout

## 12. Client-Side Performance Patterns

- Memoize expensive selectors (Zustand `shallow`)
- `useMemo` for derived data only where measurably faster
- `useCallback` for handlers passed deep into memoed components
- Virtualize lists > 200 items (TanStack Virtual)
- Debounce search inputs (300ms)
- Throttle scroll handlers (16ms / RAF)

## 13. Database Performance

- Indexes on every `WHERE`/`ORDER BY`/`JOIN` column we use frequently
- `EXPLAIN ANALYZE` for slow queries
- Connection pooling via Supabase pgBouncer
- Avoid `select *` in production code paths
- Soft-delete patterns indexed: `where deleted_at is null` (partial indexes)

## 14. Server Action Performance

- Keep action work < 500ms typical
- Heavy work (image processing, bulk imports) → background job (cron)
- Don't `await` email send synchronously (fire-and-forget per `EMAIL_SYSTEM.md`)

## 15. Bundle Analysis

```bash
ANALYZE=true pnpm build
# opens treemap of client + server bundles
```

CI runs `next-bundle-analyzer` and posts a diff comment on each PR. PRs with > 5% growth on initial JS need justification or refactor.

## 16. Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
- uses: treosh/lighthouse-ci-action@v11
  with:
    urls: |
      https://${{ env.PREVIEW_URL }}
      https://${{ env.PREVIEW_URL }}/shop
      https://${{ env.PREVIEW_URL }}/shop/sample-product
    budgetPath: ./lighthouse-budget.json
```

Failing a budget blocks the merge.

## 17. Web Vitals Reporting

```tsx
// src/app/web-vitals.ts
'use client';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (window.va) window.va('event', { name: metric.name, value: metric.value });
  });
  return null;
}
```

Persist anonymized values to dashboard for trending.

## 18. Common Pitfalls

- Forgetting to memoize a non-stable prop passed into a memoized child
- Importing the entire icon library instead of named imports
- Using `<img>` instead of `<Image>`
- Forgetting `priority` on the LCP image
- Adding a heavy chart component to the public shop layout
- A `'use client'` ancestor that pulls the whole subtree client-side

## 19. Mobile Performance

- 4G as baseline, 3G as worst-case target
- LCP image ≤ 80KB on mobile (smaller `sizes` per breakpoint)
- Defer non-critical hydration with `<Suspense>`
- Reduce DOM size on shop list (max 24 products per page)

## 20. Continuous Performance Review

- Weekly: review Vercel Speed Insights dashboard
- Monthly: run a manual Lighthouse on top 5 pages
- Per release: bundle diff review
- Quarterly: WebPageTest filmstrip on key flows for visual regression
