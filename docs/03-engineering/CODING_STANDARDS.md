# 03 · CODING STANDARDS

## 1. TypeScript Rules

### 1.1 `tsconfig.json` (mandatory flags)

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "incremental": true,
  },
}
```

### 1.2 Forbidden patterns

| ❌                                           | ✅                                                          |
| -------------------------------------------- | ----------------------------------------------------------- |
| `any`                                        | Use `unknown` + narrow, or define the type                  |
| `as Foo` casts                               | Use `z.parse` / guards                                      |
| `// @ts-ignore`                              | Use `// @ts-expect-error: <reason>` only with reason        |
| `enum`                                       | Use `as const` objects or literal unions                    |
| `namespace`                                  | Use modules                                                 |
| `function () {}` declarations for components | Use arrow components OR named function exports consistently |
| Default exports for components               | Named exports (helps refactors & search)                    |

### 1.3 Required patterns

- All public functions have **explicit return types**.
- All async functions return `Promise<...>` typed explicitly.
- All API/service inputs are validated with **Zod** before use.
- All errors are `AppError` instances (see `lib/errors.ts`), never raw `Error`.

## 2. Naming Conventions

### 2.1 Variables

- `camelCase` for variables and functions
- `PascalCase` for types, interfaces, classes, components
- `UPPER_SNAKE` for module-level constants
- Boolean variables prefixed with `is`, `has`, `can`, `should`

### 2.2 Files and folders

See `FOLDER_STRUCTURE.md §12`.

### 2.3 Database & SQL

- Tables: `snake_case`, plural (`products`, `order_items`)
- Columns: `snake_case` (`created_at`)
- Foreign keys: `xxx_id` (`product_id`)
- Bools: `is_xxx` / `has_xxx`

### 2.4 Types vs Interfaces

- Prefer `type` for unions, intersections, primitives, and props
- Use `interface` only when extending a class-like shape

### 2.5 Generated types

- Supabase types live in `src/types/db.generated.ts` and are **never** edited manually.
- Re-export named aliases from `src/types/db.ts` for ergonomic imports.

## 3. React / Next.js Rules

### 3.1 Server vs Client components

- Default to **Server Components**. Add `'use client'` only when needed for:
  - State / refs
  - Event handlers
  - Browser-only APIs
  - Animations / motion
- Keep client components small; push state down, not up.

### 3.2 Component structure

```tsx
// 1. 'use client' if needed
'use client';

// 2. External imports (alphabetized)
import { useState } from 'react';
import { z } from 'zod';

// 3. Internal absolute imports (grouped by area)
import { Button } from '@/components/ui/button';
import { useCart } from '@/features/cart/store/cart.store';

// 4. Relative imports
import { CartLineItem } from './cart-line-item';

// 5. Types
type Props = { productId: string; initialQty?: number };

// 6. Constants (component-scoped)
const MAX_QTY = 99;

// 7. Component
export function AddToCartButton({ productId, initialQty = 1 }: Props) {
  // ...
}
```

### 3.3 Hooks

- Names start with `use`
- One hook per file
- Hooks compose other hooks freely but never call services or fetches directly when the hook will be reused in an RSC context — use Server Components or Server Actions instead
- Always memoize returned functions/objects when used in dependency arrays

### 3.4 Props

- Always type props explicitly (no inline `(props: { ... })`)
- Provide sensible defaults
- Use discriminated unions when a component has multiple modes

### 3.5 Conditional rendering

- Avoid nested ternaries; use `if`/`return` or early returns
- Use `&&` only when the left side is strictly boolean (avoid `0 && ...` footgun)

### 3.6 Lists

- Always provide stable `key` (never index unless list is truly static)
- Extract repeated row markup into a sub-component

### 3.7 Forms

- React Hook Form + Zod resolver
- Submit handler awaits Server Action and shows toast feedback
- Disable submit while pending
- Show field-level errors via `<FormMessage />`

## 4. Server Code Rules

### 4.1 Server Actions

- File: `xxx.action.ts`
- Start with `'use server'`
- Always return `ActionResult<T>` envelope
- Always validate input with Zod first
- Never throw to client; map errors to `ActionResult.error()`

### 4.2 Route Handlers

- File: `route.ts` under `/api/...`
- Use named exports: `GET`, `POST`, `PATCH`, etc.
- Always call guards (`requireAdmin()`, etc.) first
- Always wrap with `try/catch` and return through `apiResponse` helpers

### 4.3 Services

- Pure business logic
- Accept already-validated DTOs
- Return domain types or throw `AppError`
- No HTTP types, no React types
- Unit-testable

### 4.4 Repositories

- Only DB calls live here
- Wrap Supabase queries; return typed rows
- No business logic

## 5. Error Handling

```ts
// src/lib/errors.ts
export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'STOCK_INSUFFICIENT'
  | 'INTERNAL';

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown,
    public httpStatus = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const unauthorized = (m = 'Authentication required') =>
  new AppError('UNAUTHORIZED', m, undefined, 401);
export const forbidden = (m = 'Forbidden') => new AppError('FORBIDDEN', m, undefined, 403);
export const notFound = (m = 'Not found') => new AppError('NOT_FOUND', m, undefined, 404);
export const conflict = (m: string) => new AppError('CONFLICT', m, undefined, 409);
export const stockInsufficient = (productId: string) =>
  new AppError('STOCK_INSUFFICIENT', 'Not enough stock', { productId }, 409);
```

## 6. Logging

- Server: `logger.info({ orderId }, 'order_placed')` (Pino-style)
- Client: `clientLogger.warn(...)`
- Never log secrets, full tokens, full PII

## 7. Comments & Docs

- Use comments for **why**, not **what**
- JSDoc on every exported function in `lib/` and `features/*/server/`
- TODOs must include owner + JIRA/ticket reference: `// TODO(@alice, ISSUE-123): ...`

## 8. ESLint (highlights)

```jsonc
// .eslintrc.cjs
{
  "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/strict", "prettier"],
  "rules": {
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "import/order": [
      "error",
      {
        /* groups + alphabetize */
      },
    ],
    "import/no-default-export": ["error", { "allow": [] }],
    "react/jsx-key": "error",
    "react-hooks/exhaustive-deps": "error",
  },
}
```

Plus `eslint-plugin-boundaries` to enforce the import rules in `FOLDER_STRUCTURE.md §11`.

## 9. Prettier

```jsonc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "plugins": ["prettier-plugin-tailwindcss"],
}
```

## 10. Git Workflow

### 10.1 Branches

- `main` — production
- `develop` — integration
- `feat/<slug>` — new features
- `fix/<slug>` — bug fixes
- `chore/<slug>` — tooling
- `docs/<slug>` — docs only

### 10.2 Commits — Conventional Commits

```
feat(catalog): add product image gallery
fix(checkout): handle out-of-stock at submit
docs(readme): clarify env setup
chore(deps): bump next to 15.0.3
```

### 10.3 PRs

- Small (< 400 LOC diff) when possible
- Linked to ticket
- Description: what / why / screenshots / test plan
- CI must pass: lint, typecheck, unit tests, build
- 1 reviewer minimum

### 10.4 Pre-commit hooks (Husky + lint-staged)

```
*.{ts,tsx} → eslint --fix && prettier --write
*.{json,md,css} → prettier --write
```

## 11. Accessibility (built into standards)

- Every interactive element is keyboard accessible
- Every form input has an associated label
- Color contrast ≥ 4.5:1 for text
- All images have `alt` text (empty `alt=""` for decorative)
- Focus rings never removed without replacement

## 12. Performance Standards

- No imports of heavy libs in shared components (charts, rich text editor must be dynamic)
- Use `next/image` always (never bare `<img>` except for SVG sprites)
- Use `next/font` (no external font CDN)
- No client-side fetch loops on mount; batch + paginate
- Bundle analyzer run on every release; flag > 5% growth

## 13. Security Standards

- Never use `dangerouslySetInnerHTML` without DOMPurify + lint allowlist
- Never log full PII (mask phone/email partially in logs)
- Never read `request.headers.get('cookie')` directly; use Supabase client
- Use `crypto.randomUUID()` for any IDs that aren't from DB
- Validate all redirects against an allowlist

## 14. Testing Standards

- Unit-test all services and pure functions
- Integration-test all Server Actions + route handlers (with test DB)
- E2E happy-path: browse → add to cart → checkout → admin sees order
- Coverage target: 70% lines for `lib/` and `features/*/server/`

## 15. Code Review Checklist

- [ ] Types: no `any`, no unsafe casts
- [ ] Validation: all inputs go through Zod
- [ ] Errors: thrown as `AppError`, never silent
- [ ] Auth/RLS: privileged paths protected
- [ ] i18n: no hard-coded user-facing strings
- [ ] Design tokens: no hard-coded colors / spacing
- [ ] Performance: heavy imports dynamic, lists virtualized if needed
- [ ] Accessibility: keyboard, labels, contrast
- [ ] Tests: added or updated
- [ ] Docs: updated if architecture changed
