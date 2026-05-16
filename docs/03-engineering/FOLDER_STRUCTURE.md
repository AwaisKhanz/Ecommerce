# 03 · FOLDER STRUCTURE

## 1. Top-Level Tree

```
industrial-shop/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── .husky/
├── .vscode/
│   ├── settings.json
│   └── extensions.json
├── docs/                            ← this documentation
├── public/
│   ├── images/
│   ├── icons/
│   ├── favicon.ico
│   └── robots.txt
├── scripts/
│   ├── seed.ts
│   ├── create-admin.ts
│   └── purge-uploads.ts
├── supabase/
│   ├── migrations/
│   ├── functions/                   ← edge functions (future)
│   ├── seed.sql
│   └── config.toml
├── messages/                        ← i18n
│   ├── en.json
│   └── ar.json
├── src/
│   ├── app/                         ← routes
│   ├── components/                  ← shared / design system
│   ├── features/                    ← domain modules
│   ├── lib/                         ← infrastructure
│   ├── hooks/                       ← shared hooks
│   ├── types/                       ← shared types
│   ├── config/                      ← constants & feature flags
│   ├── styles/                      ← global styles
│   └── middleware.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 2. `src/app` — Route Tree (App Router)

```
src/app/
├── layout.tsx                       ← root layout (html, providers)
├── error.tsx
├── not-found.tsx
├── global-error.tsx
├── robots.ts
├── sitemap.ts
├── [locale]/
│   ├── layout.tsx
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 ← Home
│   │   ├── about/page.tsx
│   │   ├── services/page.tsx
│   │   ├── contact/page.tsx
│   │   └── (legal)/...
│   ├── (shop)/
│   │   ├── layout.tsx
│   │   ├── shop/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── [slug]/page.tsx
│   │   │   └── category/[slug]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── orders/[id]/confirmation/page.tsx
│   └── admin/
│       ├── layout.tsx
│       ├── login/page.tsx
│       ├── forgot-password/page.tsx
│       ├── reset-password/page.tsx
│       ├── page.tsx                 ← dashboard
│       ├── products/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/page.tsx
│       ├── categories/
│       ├── orders/
│       ├── customers/
│       ├── messages/
│       ├── settings/
│       └── audit/
└── api/
    ├── v1/
    │   ├── products/route.ts
    │   ├── categories/route.ts
    │   └── contact/route.ts
    ├── admin/
    │   ├── products/route.ts
    │   ├── products/[id]/route.ts
    │   ├── categories/route.ts
    │   ├── orders/route.ts
    │   ├── orders/[id]/route.ts
    │   ├── settings/route.ts
    │   └── uploads/sign/route.ts
    ├── webhooks/
    │   └── resend/route.ts
    └── health/route.ts
```

## 3. `src/features/` — Feature Modules

Each feature is **self-contained**: components, hooks, server logic, schemas, and types live together.

```
src/features/
├── catalog/
│   ├── components/
│   │   ├── product-card.tsx
│   │   ├── product-grid.tsx
│   │   ├── product-filters.tsx
│   │   ├── product-gallery.tsx
│   │   └── product-detail.tsx
│   ├── hooks/
│   │   ├── use-shop-filters.ts
│   │   └── use-product-search.ts
│   ├── server/
│   │   ├── product.service.ts       ← business logic
│   │   ├── product.repository.ts    ← DB access
│   │   └── actions.ts               ← server actions if any
│   ├── schemas/
│   │   └── product.schema.ts        ← Zod schemas
│   ├── types.ts                     ← feature types
│   └── index.ts                     ← public API of the feature
│
├── cart/
│   ├── components/
│   │   ├── cart-drawer.tsx
│   │   ├── cart-line.tsx
│   │   └── cart-summary.tsx
│   ├── store/
│   │   └── cart.store.ts
│   ├── hooks/
│   │   └── use-cart.ts
│   └── types.ts
│
├── checkout/
│   ├── components/
│   │   ├── checkout-form.tsx
│   │   └── order-success.tsx
│   ├── server/
│   │   ├── place-order.action.ts
│   │   └── order.service.ts
│   ├── schemas/
│   │   └── checkout.schema.ts
│   └── types.ts
│
├── orders/
│   ├── server/
│   │   ├── order.service.ts
│   │   └── order.repository.ts
│   ├── schemas/
│   ├── components/                  ← shared between admin + (future) customer
│   └── types.ts
│
├── admin-dashboard/
│   ├── components/
│   ├── hooks/
│   └── server/
│
├── admin-products/
│   ├── components/
│   │   ├── product-form.tsx
│   │   ├── product-list.tsx
│   │   ├── image-uploader.tsx
│   │   └── specifications-editor.tsx
│   ├── hooks/
│   ├── server/
│   └── schemas/
│
├── admin-categories/
├── admin-orders/
├── admin-customers/
├── admin-messages/
├── admin-settings/
├── admin-audit/
│
├── contact/
│   ├── components/contact-form.tsx
│   ├── server/contact.service.ts
│   ├── schemas/contact.schema.ts
│
├── home/
│   ├── components/
│   │   ├── hero.tsx
│   │   ├── featured-categories.tsx
│   │   ├── featured-products.tsx
│   │   └── trust-strip.tsx
│
└── marketing-pages/
    └── components/
        ├── about-content.tsx
        ├── services-list.tsx
        └── legal-content.tsx
```

### Feature module rules

- A feature's `index.ts` is its **public API**. Other features only import from there, never deep paths.
- Server code lives under `feature/server/` and is never imported from client components.
- Schemas are shared between client (form) and server (action/route).

## 4. `src/components/` — Design System

```
src/components/
├── ui/                              ← primitive design system (shadcn-style)
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── dialog.tsx
│   ├── drawer.tsx
│   ├── toast.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   ├── alert.tsx
│   ├── form.tsx
│   ├── data-table.tsx
│   ├── pagination.tsx
│   ├── skeleton.tsx
│   ├── empty-state.tsx
│   ├── app-link.tsx
│   └── ...
├── layout/
│   ├── public-header.tsx
│   ├── public-footer.tsx
│   ├── admin-sidebar.tsx
│   ├── admin-topbar.tsx
│   ├── container.tsx
│   └── section.tsx
├── seo/
│   ├── json-ld.tsx
│   └── breadcrumb-schema.tsx
├── theme/
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
└── icons/
    └── index.tsx                    ← lucide re-exports + custom icons
```

## 5. `src/lib/` — Infrastructure

```
src/lib/
├── supabase/
│   ├── client.ts                    ← browser client
│   ├── server.ts                    ← server client (cookies)
│   ├── admin.ts                     ← service-role client
│   └── middleware.ts                ← supabase/ssr helper
├── db/
│   ├── index.ts                     ← typed db utility
│   ├── types.ts                     ← generated types
│   └── transactions.ts              ← helpers for txns / RPC
├── auth/
│   ├── guards.ts
│   └── roles.ts
├── email/
│   ├── client.ts                    ← Resend instance
│   ├── send.ts                      ← high-level sender
│   └── templates/
│       ├── order-placed.tsx
│       ├── order-confirmed.tsx
│       ├── order-delivered.tsx
│       ├── order-cancelled.tsx
│       ├── contact-submission.tsx
│       └── _components.tsx
├── api/
│   ├── client.ts                    ← typed fetch wrapper for admin SPA bits
│   ├── response.ts                  ← apiResponse helpers
│   └── error.ts
├── validators/
│   ├── common.ts                    ← shared Zod schemas (email, phone, url)
│   ├── pagination.ts
│   └── locale.ts
├── i18n/
│   ├── request.ts
│   ├── routing.ts
│   └── format.ts
├── logger/
│   ├── server.ts                    ← pino
│   └── client.ts                    ← thin wrapper
├── analytics/
│   ├── server.ts
│   └── client.ts
├── flags/
│   └── index.ts                     ← feature flag reader
├── rate-limit/
│   ├── upstash.ts
│   └── memory.ts                    ← dev fallback
├── result.ts                        ← ActionResult helper
├── errors.ts                        ← AppError + factory functions
└── utils/
    ├── cn.ts                        ← class merge
    ├── slug.ts
    ├── money.ts
    ├── date.ts
    └── url.ts
```

## 6. `src/hooks/` — Shared Hooks

```
src/hooks/
├── use-debounce.ts
├── use-media-query.ts
├── use-has-mounted.ts
├── use-disclosure.ts
├── use-clipboard.ts
├── use-keyboard-shortcut.ts
├── use-on-click-outside.ts
└── use-pagination.ts
```

Feature-specific hooks live inside the feature, not here.

## 7. `src/types/` — Shared Types

```
src/types/
├── db.generated.ts                  ← from supabase gen types
├── api.ts                           ← API envelope, AppError, ActionResult
├── common.ts                        ← Locale, Currency, etc.
└── env.d.ts                         ← typed process.env
```

## 8. `src/config/` — Constants & Config

```
src/config/
├── site.ts                          ← name, url, default OG
├── nav.ts                           ← nav links arrays
├── i18n.ts                          ← locales, default
├── theme.ts                         ← tokens (semantic mapping)
├── feature-flags.ts                 ← flag defaults
├── shipping.ts                      ← shipping zones/fees defaults
└── seo.ts                           ← default metadata
```

## 9. `src/styles/`

```
src/styles/
├── globals.css                      ← Tailwind layers + CSS variables
└── fonts.ts                         ← next/font definitions
```

## 10. Import Aliases

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/app/*": ["./src/app/*"],
      "@/features/*": ["./src/features/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/config/*": ["./src/config/*"],
      "@/styles/*": ["./src/styles/*"],
    },
  },
}
```

## 11. Import Boundary Rules (enforced via ESLint)

| Layer         | May import from                                                            |
| ------------- | -------------------------------------------------------------------------- |
| `app/`        | `features`, `components`, `lib`, `hooks`, `config`, `types`                |
| `features/X`  | `components`, `lib`, `hooks`, `config`, `types`, _its own subfolders only_ |
| `components/` | `components`, `lib`, `hooks`, `config`, `types` (no `features/*`)          |
| `lib/`        | `config`, `types`, other `lib/*` modules                                   |
| `hooks/`      | `lib`, `types`, `config`                                                   |

A feature **must not** import from another feature. If shared, lift to `lib` or `components`.

## 12. File & Folder Naming

| Type                  | Convention                   | Example                 |
| --------------------- | ---------------------------- | ----------------------- |
| React component file  | `kebab-case.tsx`             | `product-card.tsx`      |
| Component export name | `PascalCase`                 | `ProductCard`           |
| Hook file             | `use-xxx.ts`                 | `use-cart.ts`           |
| Hook name             | `useXxx`                     | `useCart`               |
| Service file          | `xxx.service.ts`             | `order.service.ts`      |
| Repository file       | `xxx.repository.ts`          | `product.repository.ts` |
| Schema file           | `xxx.schema.ts`              | `checkout.schema.ts`    |
| Action file           | `xxx.action.ts`              | `place-order.action.ts` |
| Type file             | `types.ts` or `xxx.types.ts` | `product.types.ts`      |
| Const file            | `xxx.ts` (in `config/`)      | `nav.ts`                |

## 13. Index Files

- Every feature folder has a barrel `index.ts` exporting its public API.
- `components/ui/index.ts` re-exports primitives for ergonomic imports.
- Avoid barrels in `lib/` to keep tree-shaking effective.

## 14. Tests Co-location

Unit tests sit next to the unit:

```
product.service.ts
product.service.test.ts
```

End-to-end and integration tests live under `/tests`.
