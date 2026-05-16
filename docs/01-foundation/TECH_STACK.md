# 01 · TECH STACK

## 1. Stack Summary

| Layer | Technology | Version (target) |
|---|---|---|
| Framework | **Next.js** (App Router) | 15.x |
| Language | **TypeScript** (strict) | 5.x |
| Styling | **Tailwind CSS** | 3.4.x |
| UI Primitives | **shadcn/ui** + Radix | latest |
| Database | **Supabase Postgres** | 15.x |
| Auth | **Supabase Auth** | latest |
| Storage | **Supabase Storage** | latest |
| Email | **Resend** | latest |
| Hosting | **Vercel** | — |
| State (server) | **TanStack Query** | 5.x |
| State (client) | **Zustand** | 4.x |
| Forms | **React Hook Form** + **Zod** | latest |
| Animations | **Framer Motion** | 11.x |
| i18n | **next-intl** | latest |
| Icons | **Lucide React** | latest |
| Date | **date-fns** | 3.x |
| Logging | **Pino** (server) + custom client wrapper | latest |
| Analytics | **Vercel Analytics** + custom event layer | — |
| Error tracking | **Sentry** | latest |
| Testing | **Vitest** + **Playwright** | latest |
| Linting | **ESLint** + **Prettier** | latest |
| Git hooks | **Husky** + **lint-staged** | latest |

## 2. Rationale Per Choice

### 2.1 Next.js (App Router)
- SSR + RSC out of the box → great SEO for an e-commerce site
- File-based routing matches our feature folder layout
- Server Actions reduce API boilerplate while keeping server logic server-side
- Edge runtime support for fast global response times
- First-class Vercel integration

### 2.2 TypeScript (strict mode)
- Catches bugs at compile time
- Self-documenting code
- Required for production-grade apps
- All shared types live in `/types` and `/lib/validators`

### 2.3 Tailwind CSS
- Utility-first → no orphaned CSS files
- Pairs perfectly with shadcn/ui
- Design tokens via `tailwind.config.ts` → centralized theming
- Built-in dark mode
- RTL-friendly with logical properties

### 2.4 shadcn/ui
- Copy-in, not a dependency → full code ownership
- Built on Radix → accessible primitives
- Themeable via CSS variables → integrates with our design tokens

### 2.5 Supabase (Postgres + Auth + Storage)
- Single platform for DB, auth, files, realtime → reduces ops
- Row-Level Security (RLS) → defense in depth
- Postgres is the right database for relational data (orders, products, categories)
- Generous free tier; predictable pricing as we scale
- SQL = portability if we ever migrate

### 2.6 Resend
- Modern transactional email API
- Excellent deliverability
- React Email templates (typed, reusable)
- Webhook support for delivery status

### 2.7 TanStack Query
- Server state caching, retries, invalidation built-in
- Optimistic updates with rollback
- Pairs perfectly with React Server Components for client islands

### 2.8 Zustand
- Tiny, ergonomic global client state
- For cart, UI state (drawers, modals), filters
- No boilerplate, fully typed

### 2.9 React Hook Form + Zod
- Performant uncontrolled forms
- Shared Zod schemas: client form validation + server API validation = single source of truth

### 2.10 Vercel
- Zero-config Next.js deployment
- Preview deployments per PR
- Edge network + image optimization
- Analytics + Speed Insights included

## 3. Dev Tooling

```
package.json scripts (recommended)
─────────────────────────────────────
"dev"            → next dev
"build"          → next build
"start"          → next start
"lint"           → next lint
"format"         → prettier --write .
"typecheck"      → tsc --noEmit
"test"           → vitest
"test:e2e"       → playwright test
"db:types"       → supabase gen types typescript
"db:migrate"     → supabase migration up
"db:seed"        → tsx scripts/seed.ts
"email:dev"      → email dev (react-email preview)
```

## 4. Explicit Exclusions (with reasoning)

| Excluded | Why |
|---|---|
| Redux | Overkill for this scope; Zustand is sufficient |
| Prisma | Supabase provides typed client; Prisma adds a layer without benefit here |
| GraphQL | REST + RSC is simpler; we don't have polyglot clients |
| Stripe | Out of scope (Phase 1 is COD) — but architecture leaves room |
| MongoDB / NoSQL | Order data is highly relational → Postgres is correct |
| Custom CSS frameworks | Tailwind covers it |

## 5. Version Locking Policy

- All deps pinned to **exact versions** in `package.json` (no `^` or `~` for prod)
- Renovate / Dependabot configured for weekly PRs
- Lockfile (`pnpm-lock.yaml`) committed
- Use **pnpm** as the package manager (faster, disk-efficient, strict)

## 6. Node & Runtime

- Node 20 LTS minimum
- pnpm 9.x
- Use `.nvmrc` and `engines` field in `package.json`

## 7. Future Stack Considerations (Architectural Headroom)

| Future need | Stack-ready answer |
|---|---|
| Online payments | Stripe / local payment gateway (Razorpay, PayMob, etc.) |
| Mobile app | React Native + Expo; shares Supabase backend |
| Realtime order tracking | Supabase Realtime subscriptions |
| Search at scale | Algolia / Typesense / Meilisearch |
| Recommendations | Postgres + embeddings via pgvector (already in Supabase) |
| Multi-currency | Add `currency` column + price conversion service |
| Full-text search | Postgres `tsvector` initially; Meilisearch when needed |
