# 05 · SEO GUIDELINES

## 1. SEO Stack

| Layer | Tool |
|---|---|
| Rendering | RSC + ISR (server-rendered HTML) |
| Metadata | Next.js `metadata` API |
| Structured data | JSON-LD via `<script type="application/ld+json">` |
| Sitemap | `app/sitemap.ts` |
| Robots | `app/robots.ts` |
| Analytics | Vercel Speed Insights + Search Console |
| Performance | Web Vitals (key ranking factor) |

## 2. Indexability Rules

| Route | Indexable | Sitemap |
|---|---|---|
| `/` | ✅ | ✅ |
| `/shop`, `/shop/category/*` | ✅ | ✅ |
| `/shop/[slug]` (active products) | ✅ | ✅ |
| `/shop/[slug]` (draft/archived) | ❌ (`noindex`) | ❌ |
| `/about`, `/services`, `/contact` | ✅ | ✅ |
| `/cart`, `/checkout`, `/orders/*` | ❌ (`noindex`) | ❌ |
| `/admin/*` | ❌ (`noindex` + auth) | ❌ |
| `/privacy`, `/terms`, `/return-policy` | ✅ | ✅ |

## 3. Per-Page Metadata

```ts
// src/app/(shop)/shop/[slug]/page.tsx
import type { Metadata } from 'next';
import { productService } from '@/features/products/server/product.service';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await productService.getBySlug(params.slug);
  if (!product) return { title: 'Not found' };
  return {
    title: `${product.name} | IndustrialShop`,
    description: product.shortDescription ?? product.name,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [{ url: product.primaryImageUrl, width: 1200, height: 1200, alt: product.name }],
      type: 'website',
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: product.status === 'active', follow: true },
  };
}
```

## 4. Structured Data (JSON-LD)

### 4.1 Organization (on home + about)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "IndustrialShop",
  "url": "https://industrialshop.com",
  "logo": "https://industrialshop.com/branding/logo.png",
  "sameAs": ["https://facebook.com/...", "https://instagram.com/..."],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+92-300-1234567",
    "contactType": "customer service"
  }
}
```

### 4.2 LocalBusiness (on contact + home)
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "IndustrialShop",
  "address": { "@type": "PostalAddress", "streetAddress": "...", "addressLocality": "Lahore", "addressCountry": "PK" },
  "telephone": "+92-...",
  "openingHoursSpecification": [{"@type":"OpeningHoursSpecification","dayOfWeek":["Mo","Tu","We","Th","Fr","Sa"],"opens":"09:00","closes":"18:00"}]
}
```

### 4.3 Product (on product detail)
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Honda EU22i Generator",
  "image": ["https://...jpg"],
  "description": "...",
  "sku": "HND-EU22i",
  "brand": { "@type": "Brand", "name": "Honda" },
  "offers": {
    "@type": "Offer",
    "url": "https://industrialshop.com/shop/honda-eu22i",
    "priceCurrency": "USD",
    "price": "1499.99",
    "availability": "https://schema.org/InStock"
  }
}
```

### 4.4 BreadcrumbList (on category + product)
```json
{
  "@context":"https://schema.org",
  "@type":"BreadcrumbList",
  "itemListElement":[
    {"@type":"ListItem","position":1,"name":"Home","item":"https://industrialshop.com/"},
    {"@type":"ListItem","position":2,"name":"Shop","item":"https://industrialshop.com/shop"},
    {"@type":"ListItem","position":3,"name":"Generators","item":"https://industrialshop.com/shop/category/generators"},
    {"@type":"ListItem","position":4,"name":"Honda EU22i"}
  ]
}
```

### 4.5 ItemList (on shop listing pages)
```json
{
  "@context":"https://schema.org",
  "@type":"ItemList",
  "itemListElement":[
    { "@type":"ListItem","position":1,"url":"https://industrialshop.com/shop/honda-eu22i" }
  ]
}
```

## 5. URL Structure

- Lowercase, kebab-case slugs
- Stable: never change a slug without a 301
- Short and descriptive (≤ 60 chars)
- No tracking params in canonical URLs
- Query params allowed for filters but always include `<link rel="canonical">` pointing to the un-paramed canonical version

```ts
alternates: { canonical: `/shop/category/${slug}` }
```

## 6. Sitemap

```ts
// src/app/sitemap.ts
import { productService } from '@/features/products/server/product.service';
import { categoryService } from '@/features/categories/server/category.service';
import { env } from '@/lib/env';

export default async function sitemap() {
  const base = env.NEXT_PUBLIC_APP_URL;
  const staticUrls = ['', '/shop', '/about', '/services', '/contact', '/privacy', '/terms'];
  const products = await productService.listAllActiveSlugs();
  const categories = await categoryService.listAllActiveSlugs();

  return [
    ...staticUrls.map((u) => ({ url: `${base}${u}`, changeFrequency: 'weekly' as const, priority: u === '' ? 1.0 : 0.7 })),
    ...categories.map((c) => ({ url: `${base}/shop/category/${c.slug}`, lastModified: c.updatedAt, priority: 0.6 })),
    ...products.map((p) => ({ url: `${base}/shop/${p.slug}`, lastModified: p.updatedAt, priority: 0.8 })),
  ];
}
```

## 7. Robots

```ts
// src/app/robots.ts
import { env } from '@/lib/env';
export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/cart', '/checkout', '/orders/'] },
    ],
    sitemap: `${env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
    host: env.NEXT_PUBLIC_APP_URL,
  };
}
```

## 8. Open Graph & Social

- Default OG image: `/public/og/default.png` (1200×630)
- Per-product OG image: product primary image with brand watermark (Phase 2)
- Twitter card: `summary_large_image`
- Test with [opengraph.xyz](https://www.opengraph.xyz/) before launch

## 9. Internationalization SEO

When multiple locales launch:
- `hreflang` annotations per page
- `alternates.languages` map in `metadata`
- Locale-prefixed URLs (`/en/shop`, `/ar/shop`)
- Per-locale sitemaps

```ts
alternates: {
  canonical: `/en/shop/${slug}`,
  languages: {
    'en-US': `/en/shop/${slug}`,
    'ar-SA': `/ar/shop/${slug}`,
    'x-default': `/en/shop/${slug}`,
  },
}
```

## 10. Performance (a ranking factor)

See `PERFORMANCE_GUIDELINES.md`. Web Vitals are Core Web Vitals; failing them hurts ranking.

## 11. Mobile

- Mobile-first design from day 1
- Tap targets ≥ 44px
- Readable font sizes (≥ 16px body)
- No horizontal scroll
- Tested in Search Console "Mobile Usability" report

## 12. Content Guidelines

- Unique `<title>` per page (≤ 60 chars typically)
- Unique meta description per page (140–160 chars)
- Heading hierarchy: one `<h1>`, descend without skipping
- Long-form descriptions for products and categories
- Avoid duplicate content (don't use generic placeholder copy across products)
- Use natural language in headings

## 13. Indexation Hygiene

- 404s for removed products (not 200 with empty body)
- 301s for renamed slugs
- Soft-deleted products return 410 Gone (Phase 2)
- Pagination uses `rel="next"`/`rel="prev"` semantics (Google deprecated but other engines use)

## 14. Search Console & GSC Integration

- Verify domain ownership
- Submit sitemap
- Monitor: index coverage, queries, mobile usability, Core Web Vitals
- Alerts on errors via email

## 15. Bing & Yandex (Phase 2)

- Submit to Bing Webmaster Tools
- Yandex Webmaster if relevant market

## 16. Crawl Budget

- Avoid generating infinite query-param URLs
- Robots-disallow filter combinations not worth indexing
- Use `meta robots noindex,follow` on heavily filtered listing combinations

## 17. AI & Modern SEO

- Use JSON-LD richly (helps AI summarizers + Google's SGE)
- Author and publish dates on blog posts (when blog launches in Phase 3)
- Schema for reviews when reviews launch
- `og:image` and structured data make AI overviews more accurate

## 18. SEO Checklist (pre-launch)

- [ ] Unique title + description on every public page
- [ ] Sitemap submitted to GSC
- [ ] Robots.txt allows desired pages, blocks others
- [ ] JSON-LD on home, products, categories, contact
- [ ] OG default image + per-page OG where useful
- [ ] No duplicate canonicals
- [ ] All product/category pages have descriptions ≥ 200 chars
- [ ] Image alt text on all primary images
- [ ] Mobile-friendly verified
- [ ] Core Web Vitals passing
- [ ] HTTPS + www→apex consolidated
- [ ] 404 / 410 / 301 strategy in place
