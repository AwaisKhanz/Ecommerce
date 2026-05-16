# 05 · INTERNATIONALIZATION (i18n)

## 1. Goals

- **Launch in one language** (English) but be ready to enable additional languages without architectural rework.
- Support **RTL** languages (Arabic, Hebrew, Urdu).
- Localize: UI strings, dates, numbers, currencies, validation messages, email content, SEO metadata, and product/category content.

## 2. Library

**next-intl** — server-component friendly, edge-compatible, simple API.

## 3. Locale Configuration

```ts
// src/config/i18n.ts
export const locales = ['en', 'ar'] as const;        // expand as needed
export const defaultLocale = 'en';
export type Locale = (typeof locales)[number];

export const rtlLocales: ReadonlyArray<Locale> = ['ar'];
export const isRTL = (locale: Locale) => rtlLocales.includes(locale);

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
};
```

Enabled locales are also stored in `settings.enabled_locales` so the client can toggle them without redeploy.

## 4. Routing

- Always-prefix mode: `/en/shop`, `/ar/shop`
- Default locale also prefixed → consistent URLs
- Locale detection: cookie → URL → Accept-Language → default

```ts
// src/middleware.ts (excerpt)
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/config/i18n';

export default createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

export const config = { matcher: ['/((?!api|_next|.*\\..*).*)'] };
```

## 5. Message Files

```
messages/
├── en.json
└── ar.json
```

Hierarchical namespaces:

```json
{
  "common": { "save": "Save", "cancel": "Cancel" },
  "nav":    { "home": "Home", "shop": "Shop" },
  "shop":   { "addToCart": "Add to cart", "outOfStock": "Out of stock" },
  "checkout": { "title": "Checkout", "submit": "Place order" },
  "errors": { "VALIDATION_ERROR": "Please check the form." },
  "emails": { "orderPlaced": { "subject": "Order {orderNumber} received" } }
}
```

## 6. Using Translations

### 6.1 Server Components
```tsx
import { getTranslations } from 'next-intl/server';

export default async function ShopPage() {
  const t = await getTranslations('shop');
  return <h1>{t('title')}</h1>;
}
```

### 6.2 Client Components
```tsx
'use client';
import { useTranslations } from 'next-intl';

export function AddToCartButton() {
  const t = useTranslations('shop');
  return <button>{t('addToCart')}</button>;
}
```

## 7. Number, Date, Currency Formatting

Use `next-intl` formatters or `Intl.*` directly:

```ts
import { useFormatter } from 'next-intl';
const f = useFormatter();
f.number(1234.5, { style: 'currency', currency: 'USD' });
f.dateTime(new Date(), { year: 'numeric', month: 'short', day: 'numeric' });
```

Helpers in `src/lib/utils/money.ts` and `date.ts` accept locale + currency:

```ts
export function formatMoney(amount: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
```

## 8. Pluralization

ICU MessageFormat via next-intl:

```json
{ "cart": { "items": "{count, plural, =0 {No items} =1 {1 item} other {# items}}" } }
```

```tsx
t('items', { count })
```

## 9. RTL Support

- Set `<html dir="rtl">` for RTL locales (root layout reads locale)
- Tailwind logical properties only:
  - `ps-4` (padding-inline-start) not `pl-4`
  - `me-2` (margin-inline-end) not `mr-2`
  - `start-0` not `left-0`
  - `text-start` not `text-left`
- Icons that imply direction (chevron-right, arrow-left, breadcrumb separators) get mirrored:
  ```tsx
  <ChevronRight className="rtl:rotate-180" />
  ```
- Test every page in RTL before release

## 10. Locale Switcher

```tsx
// src/components/layout/locale-switcher.tsx
'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeLabels } from '@/config/i18n';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const path = usePathname();

  return (
    <select value={locale} onChange={(e) => {
      const next = e.target.value;
      const stripped = path.replace(new RegExp(`^/${locale}`), '');
      router.push(`/${next}${stripped}`);
    }}>
      {locales.map(l => <option key={l} value={l}>{localeLabels[l]}</option>)}
    </select>
  );
}
```

## 11. Localized Database Content

Translated fields stored as JSONB:

```ts
// products.translations
{
  "ar": { "name": "...", "description": "...", "short_description": "..." }
}
```

Helper at read time:

```ts
export function pickTranslation<T extends { name: string; translations?: any }>(
  row: T, locale: string, fields: (keyof T)[]
) {
  if (locale === 'en') return row;
  const t = row.translations?.[locale];
  if (!t) return row; // fallback
  return { ...row, ...fields.reduce((acc, f) => ({ ...acc, [f]: t[f as string] ?? row[f] }), {}) };
}
```

Admin product/category forms include a per-locale tab to fill in translations.

## 12. SEO i18n

- `hreflang` on every public page
- Per-locale sitemaps
- Localized OG titles/descriptions
- See `SEO_GUIDELINES.md §9`

## 13. Localized Emails

- `sendEmail` accepts `locale` param
- Each template imports the right messages based on locale
- Subject and body localized
- RTL templates use `dir="rtl"` and right-aligned styles

## 14. Validation Messages

Zod errors get mapped to localized messages:

```ts
import { z } from 'zod';
import { setErrorMap } from 'zod';

setErrorMap((issue, ctx) => {
  // map issue.code → message key
  return { message: t(`validation.${issue.code}`) };
});
```

## 15. Pseudo-Localization (dev mode)

In dev, enable a `?locale=pseudo` mode that wraps every string with `⟪…⟫` and adds 30% length to surface untranslated strings and clipping bugs.

## 16. Translation Workflow

**Phase 1 (single language):**
- All strings in `messages/en.json`
- No translation work needed

**Phase 2 (add Arabic):**
1. Copy `en.json` → `ar.json`
2. Send to translator with context comments
3. Review with native speaker
4. Test in RTL
5. Enable in `settings.enabled_locales`

**Tooling (Phase 2):**
- Consider Crowdin, Locize, or Tolgee for collaboration
- CI check: no missing keys vs `en.json`

## 17. Locale-Sensitive Things to Remember

| Thing | Approach |
|---|---|
| Time zones | Store UTC; display in user/locale TZ |
| Address format | Country-aware (Phase 2) |
| Phone format | E.164 stored; locale-formatted on display |
| Currency | Stored per product; displayed via `Intl.NumberFormat` |
| Names | Don't split first/last; use one `name` field |
| Honorifics | Avoid in UI; opt-in only |

## 18. Common Pitfalls

- ❌ Hard-coding a string in a component — every user-facing string goes through i18n
- ❌ Concatenating translated strings (use parameters)
- ❌ Using `pl-4` instead of `ps-4` for padding
- ❌ Assuming text length stays roughly the same in another language (Arabic is shorter; German is longer)
- ❌ Forgetting to translate validation messages
- ❌ Sending an English email to a non-English customer

## 19. Testing

- Unit-test `pickTranslation` and formatters
- Snapshot tests for key components in both locales
- Playwright E2E in RTL for at least the checkout flow
- Manual RTL review before any release that touches UI
