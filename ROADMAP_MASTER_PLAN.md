# 06 · ROADMAP — MASTER DEVELOPMENT PLAN

> **This is the build order.** Every step is sized for one focused Claude Code / Codex session. Steps reference other docs by file name when more detail is needed. Follow phases in order. Do not skip ahead.

---

## Build-Order Principles (read these first)

1. **Infrastructure before features.** DB, auth, design tokens, error layer, i18n shell must exist before any feature is built.
2. **API-first for mutations, RSC-first for reads.** Server Actions and Route Handlers are wired before the UI that calls them.
3. **Vertical slices after foundation.** Once foundation is done, ship one full slice (e.g., "list products end-to-end") before starting another.
4. **Admin and public can build in parallel after foundation.** They share the same data layer.
5. **No premature optimization.** Add Redis rate-limiting, Sentry, etc. when the section calls for it — not earlier.
6. **Every step ends with a runnable, testable state.** Never leave the repo broken.

---

# PHASE 0 — PROJECT BOOTSTRAP (Day 1, ~half day)

Goal: empty repo → installable, lintable, deployable Next.js + Supabase + Tailwind app.

### Step 0.1 — Repository Initialization
- `pnpm create next-app@latest industrial-shop` with TypeScript + Tailwind + App Router + ESLint
- Initialize git, add `.gitignore`
- Create `develop` and `main` branches
- Push to GitHub
- Refs: `TECH_STACK.md`

### Step 0.2 — Tooling
- Configure `tsconfig.json` per `CODING_STANDARDS.md §1.1`
- Install + configure Prettier + ESLint with `eslint-plugin-boundaries`
- Install Husky + lint-staged with the pre-commit hook
- Add npm scripts: `dev`, `build`, `start`, `lint`, `format`, `typecheck`, `test`, `test:e2e`, `db:types`, `db:migrate`, `db:seed`, `email:dev`
- Refs: `CODING_STANDARDS.md`

### Step 0.3 — Folder Skeleton
- Create the directory tree from `FOLDER_STRUCTURE.md §1–§9`
- Empty `index.ts` barrels for each feature
- Add placeholder `README.md` per folder
- Configure `tsconfig.json` paths

### Step 0.4 — Tailwind & Design Tokens
- Configure `tailwind.config.ts` per `DESIGN_SYSTEM.md §4`
- Replace `globals.css` with the token-based stylesheet from `DESIGN_SYSTEM.md §3`
- Install `class-variance-authority`, `tailwindcss-animate`, `@tailwindcss/typography`, `lucide-react`
- Set up `next/font` for Inter + display font

### Step 0.5 — Env System
- Install Zod
- Create `src/lib/env.ts` per `ENVIRONMENT_VARIABLES.md §4`
- Create `.env.example` with every variable
- Add `.env.local` (gitignored) with local values

### Step 0.6 — Vercel Connection
- Create Vercel project
- Connect GitHub repo
- Set env vars in Vercel for Production / Preview / Development
- Trigger first deploy (a placeholder home page is fine)
- Verify preview URL works

---

# PHASE 1 — INFRASTRUCTURE LAYER

Goal: every later feature can be built on a solid foundation. No customer-facing UI yet.

### Step 1.1 — Supabase Projects
- Create two Supabase projects: `industrial-shop-staging`, `industrial-shop-prod`
- Capture URL, anon key, service role key, JWT secret for each
- Add to Vercel + `.env.local`
- Install Supabase CLI; `supabase init` and `supabase link --project-ref ...` (staging)
- Refs: `SUPABASE_SETUP.md`

### Step 1.2 — Database Migrations (Tables)
For each table in `DATABASE_SCHEMA.md §3`, in this order, one migration file each:
1. `profiles`
2. `categories`
3. `products`
4. `product_images`
5. `product_categories` (join)
6. `orders`
7. `order_items`
8. `order_status_events`
9. `email_outbox`
10. `contact_messages`
11. `settings`
12. `audit_logs`
13. `feature_flags`

Apply locally with `supabase db push --local` after each.

### Step 1.3 — Triggers, Sequences, RPC
- Add the `updated_at` trigger function
- Apply trigger to all tables with `updated_at`
- Create `orders_seq` and `gen_order_number` trigger
- Create `log_order_status_change` trigger
- Create `place_order` RPC stored procedure (`DATABASE_SCHEMA.md §5`)

### Step 1.4 — Row-Level Security Policies
- Enable RLS on every table
- Add policies per `DATABASE_SCHEMA.md §6`
- Add admin policies for `authenticated` role with profile-based check
- Verify by querying with anon key — only public read works

### Step 1.5 — Storage Buckets + Policies
- Create the 5 buckets per `SUPABASE_SETUP.md §7`
- Apply storage RLS policies from `STORAGE_ARCHITECTURE.md §9`

### Step 1.6 — Generate Types
- `pnpm db:types` → produces `src/types/db.generated.ts`
- Create `src/types/db.ts` with named aliases

### Step 1.7 — Supabase Clients
- Implement `src/lib/supabase/client.ts` (browser)
- Implement `src/lib/supabase/server.ts` (RSC + Route Handlers)
- Implement `src/lib/supabase/admin.ts` (service role; mark as server-only)

### Step 1.8 — Error & Result Layer
- Implement `AppError` + factories in `src/lib/errors.ts`
- Implement `ActionResult<T>` with `ok` / `fail` helpers in `src/lib/result.ts`
- Implement `apiResponse` helpers in `src/lib/api/response.ts`
- Refs: `ERROR_HANDLING.md`

### Step 1.9 — Logger
- Implement Pino server logger with redact rules (`LOGGING_MONITORING.md §3`)
- Implement client logger shim (will be wired to Sentry later)

### Step 1.10 — Validators
- Create shared Zod helpers in `src/lib/validators/common.ts` (email, phone, locale, slug, pagination)

### Step 1.11 — i18n Shell
- Install `next-intl`
- Create `src/config/i18n.ts` per `INTERNATIONALIZATION.md §3`
- Create `messages/en.json` with empty namespaces
- Configure middleware (next-intl + auth combined later)
- Wrap root layout with `<NextIntlClientProvider>`
- Set `lang` and `dir` on `<html>` based on locale

### Step 1.12 — Design System Primitives
Implement these in `src/components/ui/` (use shadcn CLI to generate, then customize):
- `Button`, `Input`, `Textarea`, `Label`, `Select`, `Checkbox`, `Radio`, `Switch`
- `Card`, `Badge`, `Alert`
- `Dialog`, `Drawer`, `Popover`, `Tooltip`, `DropdownMenu`
- `Tabs`, `Accordion`
- `Form` wrappers (RHF)
- `Skeleton`, `EmptyState`, `Loader`, `ErrorState`, `DataState`
- `Container`, `Section`, `Grid`, `Stack`
- `AppLink`
- Sonner `Toaster` mounted in root layout
- Refs: `DESIGN_SYSTEM.md §5`

### Step 1.13 — Layout Shells
- Public header (`PublicHeader`) — minimal nav + cart icon placeholder + locale switcher
- Public footer (`PublicFooter`)
- Admin sidebar + topbar (`AdminLayout`) — skeleton only
- Auth layout (centered card)
- Root layout with `<ThemeProvider>` + `<NextIntlClientProvider>` + `<Toaster>`

### Step 1.14 — Theme & Dark Mode
- `ThemeProvider` (next-themes)
- `ThemeToggle` in admin topbar + (optionally) public footer
- Verify CSS variables flip in dark mode

### Step 1.15 — Sentry
- Install `@sentry/nextjs`, run wizard
- Configure `beforeSend` PII scrubbing
- Verify a deliberate `throw` shows up in Sentry from staging

### Step 1.16 — Vercel Analytics & Speed Insights
- Install `@vercel/analytics` and `@vercel/speed-insights`
- Mount in root layout
- Implement `src/lib/analytics/index.ts` (`track` function)

### Step 1.17 — Rate Limiting Skeleton
- Create Upstash Redis account (free tier)
- Set env vars
- Implement `src/lib/rate-limit/upstash.ts` + in-memory fallback for dev
- Helper `withRateLimit(key, limit, window)` returning success/fail

### Step 1.18 — Feature Flags Skeleton
- Add `feature_flags` seed rows for every key from `FEATURE_FLAGS.md §3`
- Implement `src/lib/flags/index.ts` and provider
- Mount `<FlagsProvider>` in root layout

### Step 1.19 — Health Check
- `GET /api/health` returns `{ ok, ts, version }`
- Add Better Stack / UptimeRobot monitor (staging)

### Step 1.20 — Auth Bootstrap
- Create the bootstrap script `scripts/create-admin.ts`
- Run once to create your first super_admin on staging Supabase
- Implement `src/lib/auth/guards.ts` (`requireUser`, `requireAdmin`, `requireRole`)
- Implement middleware that protects `/admin/*` except `/admin/login`
- Refs: `AUTH_FLOW.md`

### Step 1.21 — Seed Data
- Write `supabase/seed.sql`: 5 categories + ~20 products + default settings + feature flag defaults
- Verify by running `supabase db reset` locally

✅ **Milestone:** Repo deploys, env validates, Supabase + Storage configured with RLS, types generated, error/logging/i18n/design system primitives ready, admin can log in to an empty shell.

---

# PHASE 2 — PUBLIC SHOP (READ PATH)

Goal: any visitor can browse the catalog and view product details. No cart, no checkout yet.

### Step 2.1 — Categories Repository + Service
- `categories.repository.ts` — list active categories, by slug, get tree
- `categories.service.ts` — wraps repo, applies translation fallback
- Unit tests

### Step 2.2 — Products Repository + Service
- `products.repository.ts` — list (with filters + pagination), by slug, related
- `products.service.ts` — translation fallback, computed flags (`isInStock`, `isOnSale`)
- Unit tests

### Step 2.3 — Home Page
- `app/[locale]/(marketing)/page.tsx`
- Hero section
- Featured categories grid (queries `categoryService`)
- Featured products grid (queries `productService` with a "featured" flag/tag)
- Trust strip
- Footer CTA
- All copy via `messages/en.json`
- JSON-LD Organization

### Step 2.4 — Shop Listing Page
- `app/[locale]/(shop)/shop/page.tsx`
- URL filter system via `useShopFilters` hook + RSC reading `searchParams`
- Product grid with skeletons
- Filter sidebar (category, price, in stock)
- Sort dropdown
- Pagination
- Empty / error states
- JSON-LD ItemList

### Step 2.5 — Category Page
- `app/[locale]/(shop)/shop/category/[slug]/page.tsx`
- Reuses the shop list with a pre-applied filter
- Category banner + description
- Breadcrumbs + BreadcrumbList JSON-LD

### Step 2.6 — Product Detail Page
- `app/[locale]/(shop)/shop/[slug]/page.tsx`
- Image gallery (thumbnails + main, zoom on click)
- Title, SKU, price, compare-at price
- Stock badge
- Quantity selector
- "Add to Cart" + "Buy Now" buttons (no-op for now; wired in Phase 3)
- Specifications table
- Long-form description
- Related products section
- Breadcrumbs
- JSON-LD Product + BreadcrumbList
- ISR with 5-min revalidate; revalidateTag('product:'+slug) called by admin mutations later

### Step 2.7 — Search
- Debounced search input in header → opens a search dialog
- Server endpoint `/api/v1/products?q=...` with full-text search via `tsvector`
- Result list inside dialog with "View all" link to `/shop?q=...`

### Step 2.8 — SEO
- `app/sitemap.ts` per `SEO_GUIDELINES.md §6`
- `app/robots.ts`
- Implement `generateMetadata` for each public page
- OG default image in `public/og/default.png`

### Step 2.9 — Marketing Pages
- About, Services, Contact (form not wired yet)
- Privacy, Terms, Return Policy (placeholder copy)

### Step 2.10 — Performance Pass
- Set `priority` on LCP images
- Verify Lighthouse ≥ 90 on home + product detail (mobile)
- Bundle analyzer baseline

✅ **Milestone:** Public shop is fully browsable and SEO-ready against seeded data.

---

# PHASE 3 — CART & CHECKOUT (WRITE PATH)

Goal: customer can place a COD order end to end.

### Step 3.1 — Cart Store
- Implement `useCart` Zustand store with `persist` per `STATE_MANAGEMENT.md §5`
- Cart line type matches snapshot fields (id, name, slug, image, price, qty)
- Add/remove/setQty/clear

### Step 3.2 — Add to Cart Hook + Buttons
- Wire "Add to Cart" on product detail and product card
- Toast feedback on add
- Header cart icon shows line count badge

### Step 3.3 — Cart Drawer + Page
- Cart drawer opens from header icon
- Line items with thumbnail, qty stepper, remove button
- Subtotal
- "View cart" → full `/cart` page
- Full cart page shows same data with edit affordances + "Proceed to checkout"

### Step 3.4 — Checkout Schema
- `checkout.schema.ts` with full Zod schema for customer, address, items, notes
- Shared between form + Server Action

### Step 3.5 — Checkout Form
- `/checkout` page with sticky order summary on the right
- Form fields: name, phone, email, address (street, city, region, postal), notes
- Validation + inline errors
- Disable submit while pending
- Idempotency key generated client-side (`crypto.randomUUID()`) on form mount

### Step 3.6 — Place Order Service
- `order.service.ts.create()` calls the `place_order` RPC
- Handles all error codes from RPC (`STOCK_INSUFFICIENT`, etc.) → `AppError`
- On success, returns `{ id, orderNumber, total, signedConfirmationToken }`
- Signed token via HMAC with `SUPABASE_JWT_SECRET`

### Step 3.7 — Place Order Server Action
- `placeOrderAction` per `ERROR_HANDLING.md §4`
- Validates input
- Calls `orderService.create`
- Fires `sendEmail({ template: 'order_placed', ... })` (no await blocking)
- Returns `ActionResult` with `orderId` and `confirmationUrl`

### Step 3.8 — Rate Limit Checkout
- Apply `withRateLimit('orders', 5, '60s')` keyed by IP

### Step 3.9 — Order Confirmation Page
- `/orders/[id]/confirmation?t=<token>`
- Validates token; 404 if invalid
- Renders order number, items, address, totals, status timeline, "what happens next"
- Clears cart on first view (via search param flag)
- Print to PDF (browser native)

### Step 3.10 — Email Templates: Order Placed
- Set up Resend account, verify domain
- Add env vars
- Install `resend` + `@react-email/components`
- Implement `src/lib/email/send.ts` per `EMAIL_SYSTEM.md §5`
- Build `OrderPlacedEmail` template
- Fire from `placeOrderAction`
- Test with real send to your inbox

### Step 3.11 — Contact Form
- Implement `/api/v1/contact` route handler
- Persists to `contact_messages`
- Sends `contact_submission` email to admin
- Hook up the `/contact` page form

### Step 3.12 — E2E Test
- Playwright: browse → add to cart → checkout → see confirmation page
- Verify email captured by stub
- Verify stock decremented in DB

✅ **Milestone:** Real customer can place a real order, and the admin receives email notification. Stock decrements atomically.

---

# PHASE 4 — ADMIN PANEL

Goal: client can self-serve all product, category, and order operations.

### Step 4.1 — Admin Auth UI
- `/admin/login` page with email + password form
- `/admin/forgot-password` + `/admin/reset-password`
- Brute-force rate limit
- Audit log entries on success/failure

### Step 4.2 — Admin Shell
- Sidebar + topbar layout
- Active route highlighting
- Sign-out action
- "Add product" quick action button in topbar

### Step 4.3 — Dashboard
- KPI cards: orders today, revenue today, pending orders, low-stock count
- Recent orders table (10)
- Low-stock alert banner
- Onboarding checklist if seeded empty
- Sales chart (30 days) — code-split Recharts

### Step 4.4 — DataTable Primitive
- Generic `<DataTable />` on TanStack Table
- Sortable, paginated, bulk-selectable, column-toggle
- Empty / loading / error states baked in
- CSV export utility

### Step 4.5 — Admin Products List
- `/admin/products` using DataTable
- Filters: category, status, stock range
- Search by name/SKU
- Bulk actions: activate, deactivate, delete, change category
- Row actions: edit, duplicate, delete

### Step 4.6 — Admin Product Form
- Tabs: General, Media, Inventory, SEO, Translations
- Rich text editor (lazy-loaded TipTap or similar)
- Image uploader: signed URL flow + drag-reorder + primary toggle + alt text
- Draft autosave every 30s
- Dirty-state guard on navigation away

### Step 4.7 — Admin Products API
- `POST/GET/PATCH/DELETE /api/admin/products[/...]`
- Bulk endpoint
- Duplicate endpoint
- Signed-upload endpoint
- All guarded with `requireAdmin()`
- All mutations write to `audit_logs`
- All mutations call `revalidateTag('products')` and per-product tag

### Step 4.8 — Admin Categories
- Tree view with drag-reorder (`@dnd-kit/sortable`)
- CRUD endpoints
- Prevent delete when products attached → force reassignment dialog

### Step 4.9 — Admin Orders List
- DataTable with status badges
- Filters: status, date range, locale, has internal notes
- Search by order #, name, email, phone
- Bulk: export to CSV
- Row actions: open, mark confirmed

### Step 4.10 — Admin Order Detail
- Header: order #, status pill, customer card
- Status stepper timeline (from `order_status_events`)
- Line items table with thumbnails
- Totals breakdown
- Internal notes textarea (autosave)
- Action menu: confirm, mark out-for-delivery, mark delivered, cancel
- Resend confirmation email button
- Print packing slip (PDF via jsPDF, lazy-loaded)

### Step 4.11 — Status Change Service
- `orderService.updateStatus(id, newStatus, note?, actor)`
- Validates transition (no jumping from pending → delivered)
- Updates DB → trigger logs event → service sends right email
- Restocks items on cancel
- Logs to `audit_logs`

### Step 4.12 — Order Status Emails
- `OrderConfirmedEmail`, `OrderOutForDeliveryEmail`, `OrderDeliveredEmail`, `OrderCancelledEmail`
- All localized
- Test each by triggering from admin

### Step 4.13 — Customers View
- `/admin/customers` aggregate by `customer_email`
- Detail page with order history
- Quick contact links (tel:, mailto:, WhatsApp deep link)

### Step 4.14 — Messages Inbox
- `/admin/messages` table from `contact_messages`
- Filters: status (new/read/archived/spam)
- Mark read / archive / spam actions
- Reply via mailto

### Step 4.15 — Settings
- Tabbed page: Business Info, Shipping, Tax, Email, Languages, Maintenance
- Each tab a separate form
- Save calls dedicated endpoint per tab
- All changes audited

### Step 4.16 — Audit Log Viewer
- `/admin/audit` filterable table
- Diff viewer per row (before/after JSONB)
- Read-only

### Step 4.17 — Feature Flags Admin
- `/admin/settings/feature-flags`
- Toggle + rollout slider per flag
- Audit each change

### Step 4.18 — Admin E2E Tests
- Login → create product → publish → see on shop
- Receive order → update status → email sent (via stub)
- Edit category → see change on shop (after revalidate)

✅ **Milestone:** Client can run the entire shop end-to-end without developer involvement.

---

# PHASE 5 — POLISH, HARDENING & LAUNCH

Goal: production-ready release.

### Step 5.1 — Full Accessibility Audit
- Run axe scan on every page
- Manual keyboard walkthrough
- Screen-reader test on key flows
- Fix every AA violation
- Refs: `ACCESSIBILITY_GUIDELINES.md`

### Step 5.2 — Performance Audit
- Lighthouse on top 5 pages — mobile + desktop
- Hit Performance ≥ 90, Accessibility ≥ 95
- Bundle diff zero regressions
- Verify ISR cache warm-up

### Step 5.3 — Security Audit
- Run through `SECURITY.md §25` checklist
- Verify CSP doesn't break anything (no console errors)
- Penetration smoke test (OWASP ZAP)
- `pnpm audit` clean
- Sec headers grade A on securityheaders.com

### Step 5.4 — Email Deliverability
- Domain verified in Resend
- SPF + DKIM + DMARC green
- Send tests to Gmail, Outlook, Yahoo, Apple Mail
- Inbox placement check via Mail-Tester (target 10/10)

### Step 5.5 — Domain + DNS
- Buy + configure production domain
- Add to Vercel
- HTTPS verified
- Apex + www redirects
- Email DNS records

### Step 5.6 — Production Supabase
- Create prod project (Pro for PITR)
- Apply all migrations
- Apply seed for `settings` only (no demo products)
- Create production admin via bootstrap script
- Rotate password after first login

### Step 5.7 — Production Env in Vercel
- All env vars set for Production
- Pro plan upgrade for cron + advanced features
- Cron registered for outbox flush + temp upload purge

### Step 5.8 — Monitoring & Alerts
- Sentry production project linked
- Better Stack uptime monitor pointed at production `/api/health`
- Slack #alerts channel routed
- Runbooks committed

### Step 5.9 — Content Upload
- Real product data loaded by client (or migrated from spreadsheet)
- Category images uploaded
- Hero image and OG image finalized
- Business info filled in settings

### Step 5.10 — Pre-Launch Checklist
Walk every box in:
- `DEPLOYMENT_GUIDE.md §15` (production readiness)
- `SECURITY.md §25`
- `SEO_GUIDELINES.md §18`
- `LOGGING_MONITORING.md §18`

### Step 5.11 — Go Live
- Tag `v1.0.0`
- Merge `develop` → `main`
- Watch Sentry + uptime for 1 hour
- Announce

### Step 5.12 — Post-Launch Watch (Week 1)
- Daily check: error rate, order rate, email rate
- Quick wins from real-user feedback
- Document any incident in `docs/postmortems/`

✅ **Milestone:** Production live, monitored, healthy.

---

# PHASE 6 — STABILIZATION (Weeks 2–4 post-launch)

Goal: address real-world friction; small, focused improvements.

- Address top 5 customer-reported issues
- Address top 5 client-reported admin pain points
- Tune cache TTLs based on real traffic
- Optimize slowest queries with `EXPLAIN ANALYZE`
- Polish empty / error states based on real data shapes

---

# PHASE 7 — ENHANCEMENTS

Pick from this menu based on business priorities. Each is its own roadmap.

### 7A — Multilingual Rollout
- Translate `messages/en.json` → `ar.json` (or other)
- Fill product/category translations via admin UI
- Enable RTL audit
- Add Arabic emails
- Enable in `settings.enabled_locales`
- hreflang + per-locale sitemap

### 7B — Async Email Outbox
- Implement `/api/cron/email-outbox-flush`
- Route every `sendEmail` through the outbox instead of direct send
- Webhook from Resend updates statuses
- Admin email log UI

### 7C — Customer Accounts
- Enable sign-up in Supabase Auth
- New `customers` table
- "My orders" page
- RLS policies for customer self-view
- Login + signup pages

### 7D — Coupons / Discounts
- `coupons` table + service
- Cart-side validation
- Admin coupon manager
- Analytics: coupon usage

### 7E — Online Payments
- Choose gateway (Stripe / local)
- Add `payments` table
- Replace COD-only checkout with payment selector
- Webhooks for payment events
- Refunds workflow

### 7F — Reviews & Ratings
- `reviews` table
- Review form (logged-in customers only)
- Admin moderation queue
- Aggregate rating on product cards + structured data update

### 7G — Wishlist
- `wishlists` table tied to customer
- Heart button on products
- "My wishlist" page

### 7H — B2B Tiered Pricing
- `customer_groups` + `tier_prices` tables
- Admin UI to assign customers to groups
- Display tier-appropriate price

### 7I — Mobile App
- React Native + Expo
- Reuse Supabase backend + REST endpoints under `/api/v1/`
- Authentication via Supabase Auth
- Push notifications

---

# PHASE 8 — SCALE

Reach for these only when metrics demand.

### 8A — Search at Scale
- Move full-text from Postgres to Meilisearch / Typesense
- Background indexer on product create/update/delete

### 8B — Read Replicas
- Add Supabase read replicas
- Route public reads to replicas

### 8C — Multi-Region
- Vercel multi-region deployment
- Supabase replicas per region
- Asset CDN strategy

### 8D — Observability Upgrade
- Logtail / Datadog drains from Vercel
- Sentry Performance traces at 100%
- Custom Grafana boards over Postgres

### 8E — Personalization
- pgvector for product embeddings
- "You might like" widget powered by similarity
- Server-side personalization based on past orders

---

# RECOMMENDED TASK ORDER FOR CLAUDE CODE / CODEX

When feeding tasks to Claude Code, use this template per step:

```
Task: <Step ID + title>
Context files to read first:
  - docs/...
Acceptance criteria:
  - [bullet list]
Definition of done:
  - Lint passes
  - Typecheck passes
  - Tests pass (unit + integration if applicable)
  - Manual smoke test described
Dependencies (must be done first):
  - <earlier step IDs>
```

Always run after each step:
```bash
pnpm typecheck && pnpm lint && pnpm test
```

Commit per step; tag every milestone (`v0.1-phase1-foundation`, `v0.2-phase2-shop`, etc.).

---

# CRITICAL DEPENDENCIES MAP

```
Phase 0 → Phase 1 → Phase 2  ┐
                  ↓           ├─→ Phase 5 → Production
                  → Phase 3   ┤
                  → Phase 4 ──┘
```

- Phase 1 is the gate. Nothing user-facing should ship before its DB, types, errors, design system, and auth are in place.
- Phases 2 and 3 are sequential (cart needs products to exist).
- Phase 4 (admin) can run in parallel with Phase 2 & 3 after Phase 1 because it touches the same data layer.
- Phase 5 (launch) requires 2, 3, and 4 to be complete.

# WHAT THIS ROADMAP DELIBERATELY DEFERS

- Native mobile apps → Phase 7I
- Online payments → Phase 7E
- Customer accounts → Phase 7C
- Reviews, wishlists, loyalty → Phase 7
- Multi-currency, multi-warehouse → Phase 8
- Marketing automation, abandoned cart → Phase 7+
- B2B features → Phase 7H

The architecture in `02-architecture/*` is built so each of the above can drop in without re-foundation.
