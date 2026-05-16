# 02 · NAVIGATION ARCHITECTURE

## 1. Route Map

```
/                           Home
/[locale]                   Localized home (en, ar, ...)
/shop                       Catalog with filters
/shop/category/[slug]       Category-filtered catalog
/shop/[slug]                Product detail
/cart                       Cart page (drawer also exists)
/checkout                   Checkout (Server Action)
/orders/[id]/confirmation   Order success page (signed token URL)
/about                      About Us
/services                   Services
/contact                    Contact + form
/privacy                    Privacy policy
/terms                      Terms
/return-policy              Return / refund policy

/admin/login                Admin login
/admin/forgot-password
/admin/reset-password
/admin                      Dashboard (default)
/admin/products             Product list
/admin/products/new         Create product
/admin/products/[id]        Edit product
/admin/categories           Category list / tree
/admin/categories/[id]
/admin/orders               Order list
/admin/orders/[id]          Order detail
/admin/customers            Customer list (derived)
/admin/customers/[email]    Customer detail
/admin/messages             Contact submissions
/admin/settings             Site settings
/admin/audit                Audit log

/api/v1/products            Public read
/api/v1/categories          Public read
/api/v1/contact             Contact form POST
/api/v1/orders              Order POST (Server Action preferred)
/api/admin/products         Admin CRUD (auth required)
/api/admin/orders
/api/admin/categories
/api/admin/uploads/sign
/api/admin/settings
/api/health                 Health check
/api/sitemap.xml
/api/robots.txt
```

## 2. App Router Structure

```
src/app/
├── (marketing)/              ← public pages with shared layout
│   ├── layout.tsx
│   ├── page.tsx              ← Home
│   ├── about/page.tsx
│   ├── services/page.tsx
│   ├── contact/page.tsx
│   └── (legal)/
│       ├── privacy/page.tsx
│       ├── terms/page.tsx
│       └── return-policy/page.tsx
│
├── (shop)/                   ← shop pages share filters layout
│   ├── layout.tsx
│   ├── shop/
│   │   ├── page.tsx          ← Listing
│   │   ├── [slug]/page.tsx   ← Product detail
│   │   └── category/[slug]/page.tsx
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   └── orders/[id]/confirmation/page.tsx
│
├── admin/                    ← protected
│   ├── layout.tsx            ← admin shell (sidebar, topbar)
│   ├── login/page.tsx        ← outside the protected shell
│   ├── page.tsx              ← dashboard
│   ├── products/
│   ├── categories/
│   ├── orders/
│   ├── customers/
│   ├── messages/
│   ├── settings/
│   └── audit/
│
├── api/
│   ├── v1/...
│   ├── admin/...
│   └── webhooks/...
│
├── [locale]/                 ← i18n root (or via middleware-only rewrites)
├── not-found.tsx
├── error.tsx
├── global-error.tsx
├── layout.tsx                ← root layout
└── robots.txt / sitemap.ts
```

## 3. Internationalized Routing

Using `next-intl` with **middleware-based locale prefixes**:

- Default locale (`en`) does not require prefix; alternates do (`/ar/shop`).
- Or: always-prefix mode for clarity (`/en/shop`, `/ar/shop`).
- Decision: **always-prefix** — clearer for SEO and hreflang.

```ts
// src/middleware.ts (i18n + auth combined)
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/config/i18n';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export async function middleware(req: NextRequest) {
  // 1. Run intl middleware first
  const intlResponse = intlMiddleware(req);
  // 2. Then run auth checks on /admin paths
  if (req.nextUrl.pathname.includes('/admin') && !req.nextUrl.pathname.endsWith('/login')) {
    // auth check (see AUTH_FLOW.md)
  }
  return intlResponse;
}
```

## 4. Layouts

| Layout | Scope | Contents |
|---|---|---|
| Root | All routes | `<html>`, providers (theme, query, i18n) |
| Marketing | Marketing pages | header (public nav), footer |
| Shop | Shop + checkout | header, shop nav, footer, cart drawer |
| Admin | `/admin/*` (except login) | sidebar, topbar, auth gate |
| Auth | `/admin/login`, etc. | minimal centered layout |

## 5. Navigation Components

### 5.1 Public Header
- Logo (left)
- Primary nav: Home, Shop, Services, About, Contact
- Search icon → opens search dialog
- Language switcher
- Cart icon with badge (line count, not total qty)
- Mobile: hamburger drawer with same items

### 5.2 Footer
- Brand block (logo + tagline)
- Link columns: Shop categories, Company, Support, Legal
- Contact block (address, phone, email, hours)
- Social icons
- Payment methods icon ("Cash on Delivery")
- Copyright + locale switcher

### 5.3 Admin Sidebar
- Logo at top
- Sections: Dashboard, Products, Categories, Orders, Customers, Messages, Settings, Audit
- Collapsible on desktop, drawer on mobile
- Active route highlight
- User menu at bottom (avatar, name, role, sign out)

### 5.4 Breadcrumbs
- Generated from route segments and i18n keys
- Used on: product detail, category page, admin detail pages
- Schema.org BreadcrumbList JSON-LD on public pages

## 6. Link Component

Always use `<Link>` from `next/link`. Custom wrapper `<AppLink>` adds:
- locale awareness
- prefetch control
- analytics event firing (`nav.click`)

```ts
import { AppLink } from '@/components/ui/app-link';
<AppLink href="/shop" event="nav.shop">Shop</AppLink>
```

## 7. Active State & Highlight

- Active state determined via `usePathname()` comparison
- `aria-current="page"` for accessibility
- Visual: underline + bold for desktop, filled background for mobile drawer

## 8. Loading States Between Routes

- Each route group has a `loading.tsx` matching the page skeleton
- Top-progress bar (`next-nprogress-bar` or similar) for cross-route transitions
- Streaming for slow data: `<Suspense fallback={<ProductGridSkeleton />}>`

## 9. Error Boundaries

- `error.tsx` in each route group
- `global-error.tsx` for app-shell-level errors
- `not-found.tsx` for 404 (per group + global)

## 10. Deep Linking & Shareability

- All filter state is URL-driven → links are shareable
- Cart cannot be shared (Zustand local)
- Order confirmation uses signed URL: `/orders/{id}/confirmation?t={signed_token}` valid for 7 days

## 11. SEO-Critical Routes

These routes must:
- Be statically renderable
- Have unique `metadata`
- Emit JSON-LD
- Be in the sitemap

| Route | Notes |
|---|---|
| `/` | Organization JSON-LD |
| `/shop` | ItemList JSON-LD |
| `/shop/[slug]` | Product JSON-LD |
| `/shop/category/[slug]` | CollectionPage JSON-LD |
| `/about`, `/services`, `/contact` | Organization, LocalBusiness |

## 12. Future Routes (Reserved)

- `/account/...` — customer accounts (Phase 2)
- `/orders/track` — order tracking by email + order # (Phase 2)
- `/blog/...` — content marketing (Phase 3)
