# 03 · DESIGN SYSTEM

## 1. Philosophy

- **Tokens, not magic numbers.** Every color, spacing, radius, and shadow is a token.
- **One semantic layer.** Components consume _semantic_ tokens (`bg-surface`), not raw ones (`bg-zinc-100`).
- **Composable.** Primitives over bespoke components.
- **Themeable.** Light, dark, and brand variants via CSS variables.
- **Accessible by default.** Built on Radix primitives.
- **Design-led screens.** The design system governs primitives, but every actual screen must be implemented only after its final screen design is provided and confirmed.

## 2. Token Architecture

```
┌──────────────────────────────────┐
│  Primitive tokens (raw values)   │  ← colors, spacing, radii
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Semantic tokens (meaning)       │  ← surface, fg, accent, danger
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Component tokens (per-component)│  ← button-bg, button-fg
└──────────────────────────────────┘
```

## 3. CSS Variables (`globals.css`)

```css
@layer base {
  :root {
    /* Primitive */
    --c-zinc-50: #fafafa;
    --c-zinc-100: #f4f4f5;
    --c-zinc-900: #18181b;
    --c-brand-50: #f0fdf4;
    --c-brand-500: #16a34a;
    --c-brand-700: #15803d;
    --c-danger-500: #ef4444;
    --c-warn-500: #f59e0b;
    --c-success-500: #22c55e;
    --c-info-500: #3b82f6;

    /* Spacing scale (4-base) */
    --s-1: 0.25rem;
    --s-2: 0.5rem;
    --s-3: 0.75rem;
    --s-4: 1rem;
    --s-6: 1.5rem;
    --s-8: 2rem;
    --s-12: 3rem;
    --s-16: 4rem;

    /* Radii */
    --r-sm: 0.25rem;
    --r-md: 0.5rem;
    --r-lg: 0.75rem;
    --r-xl: 1rem;
    --r-full: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.12);

    /* Semantic — light theme */
    --bg-page: var(--c-zinc-50);
    --bg-surface: #ffffff;
    --bg-muted: var(--c-zinc-100);
    --fg-primary: var(--c-zinc-900);
    --fg-muted: #71717a;
    --border: #e4e4e7;
    --accent: var(--c-brand-500);
    --accent-fg: #ffffff;
    --danger: var(--c-danger-500);
    --warn: var(--c-warn-500);
    --success: var(--c-success-500);
    --info: var(--c-info-500);

    /* Typography */
    --font-sans: 'Inter', system-ui, sans-serif;
    --font-display: 'Space Grotesk', var(--font-sans);
    --font-mono: 'JetBrains Mono', ui-monospace, monospace;

    /* Motion */
    --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
    --d-fast: 150ms;
    --d-base: 220ms;
    --d-slow: 320ms;
  }

  .dark {
    --bg-page: #0a0a0a;
    --bg-surface: #111111;
    --bg-muted: #1a1a1a;
    --fg-primary: #fafafa;
    --fg-muted: #a1a1aa;
    --border: #27272a;
    --accent: #22c55e;
  }
}
```

## 4. Tailwind Config

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}', './messages/**/*.json'],
  theme: {
    extend: {
      colors: {
        page: 'var(--bg-page)',
        surface: 'var(--bg-surface)',
        muted: 'var(--bg-muted)',
        fg: { DEFAULT: 'var(--fg-primary)', muted: 'var(--fg-muted)' },
        border: 'var(--border)',
        accent: { DEFAULT: 'var(--accent)', fg: 'var(--accent-fg)' },
        danger: 'var(--danger)',
        warn: 'var(--warn)',
        success: 'var(--success)',
        info: 'var(--info)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      transitionDuration: {
        fast: 'var(--d-fast)',
        base: 'var(--d-base)',
        slow: 'var(--d-slow)',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;
```

## 5. Component Primitives

`/components/ui/` includes:

| Primitive                                                     | Notes                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `Button`                                                      | variants: primary, secondary, ghost, destructive, link; sizes: sm, md, lg |
| `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`  | shadcn-style                                                              |
| `Dialog`, `Drawer`, `Popover`, `Tooltip`                      | Radix                                                                     |
| `Toast`                                                       | sonner                                                                    |
| `Tabs`, `Accordion`, `DropdownMenu`                           | Radix                                                                     |
| `Card`, `Badge`, `Alert`, `Avatar`                            | atomic                                                                    |
| `Form`, `Label`, `FormMessage`, `FormDescription`             | RHF wrappers                                                              |
| `DataTable`, `Pagination`                                     | TanStack Table                                                            |
| `Skeleton`, `EmptyState`, `Loader`, `ErrorState`, `DataState` | state primitives                                                          |
| `Container`, `Section`, `Grid`, `Stack`                       | layout                                                                    |
| `AppLink`                                                     | next/link wrapper with locale + analytics                                 |

## 6. Variants Strategy

Use `cva` (class-variance-authority) for component variants:

```ts
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-fg hover:opacity-90',
        secondary: 'bg-muted text-fg hover:bg-border',
        ghost: 'hover:bg-muted',
        destructive: 'bg-danger text-white hover:opacity-90',
        link: 'underline-offset-4 hover:underline text-accent',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-md',
        md: 'h-10 px-4 text-sm rounded-md',
        lg: 'h-12 px-6 text-base rounded-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonProps = VariantProps<typeof buttonVariants> &
  ButtonHTMLAttributes<HTMLButtonElement>;
```

## 7. Typography Scale

| Token       | Mobile | Desktop | Use             |
| ----------- | ------ | ------- | --------------- |
| `text-xs`   | 12     | 12      | tiny labels     |
| `text-sm`   | 14     | 14      | secondary text  |
| `text-base` | 16     | 16      | body            |
| `text-lg`   | 18     | 18      | emphasized body |
| `text-xl`   | 20     | 20      | small headings  |
| `text-2xl`  | 22     | 24      | h3              |
| `text-3xl`  | 26     | 30      | h2              |
| `text-4xl`  | 32     | 40      | h1              |
| `text-5xl`  | 40     | 56      | hero            |

Headings use `font-display`, body uses `font-sans`, and IDs/SKUs/code use `font-mono`.

## 8. Spacing & Layout

- 4px base unit
- Container max-widths: `sm:640 md:768 lg:1024 xl:1200 2xl:1400`
- Section vertical padding: `py-12 lg:py-20`
- Card padding: `p-4 lg:p-6`
- Form field gap: `space-y-4`

## 9. Iconography

- **Lucide React** as the single icon set
- Default size: 20 (matches md text)
- Stroke width: 1.75
- All custom SVGs live in `src/components/icons/custom/` and are exported through `@/components/icons`

## 10. Imagery

- Use `next/image` everywhere
- Product images aspect ratios: square (1:1) and 4:3 — pick **square** as default
- Hero ratio: 16:9 desktop, 4:5 mobile
- Avif/WebP via Next defaults

## 11. Motion

- Use Framer Motion only for non-trivial animations (drawer, modals, page transitions).
- Use Tailwind `transition-*` classes for everyday hover/focus changes.
- Respect `prefers-reduced-motion`:

```tsx
const shouldReduceMotion = useReducedMotion();
const variants = shouldReduceMotion ? {} : motionVariants;
```

## 12. Dark Mode

- `class`-based via `<html class="dark">`
- Toggle persisted in localStorage
- Defaults to system preference
- All semantic tokens reference both themes
- No hard-coded colors anywhere — only `var(--xxx)` or Tailwind semantic classes

## 13. RTL Support

- Use **logical properties**: `ps-4` not `pl-4`, `me-2` not `mr-2`
- Set `dir="rtl"` on `<html>` for Arabic/Hebrew locales
- Test major flows in RTL before each release
- Icons that imply direction (chevrons, arrows) are flipped in RTL via CSS

## 14. Component Examples

### 14.1 Button

```tsx
<Button variant="primary" size="lg" onClick={...}>
  Place Order
</Button>
```

### 14.2 Card

```tsx
<Card className="p-6">
  <CardHeader>
    <CardTitle>Recent Orders</CardTitle>
    <CardDescription>Last 7 days</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### 14.3 Empty State

```tsx
<EmptyState
  icon={<PackageOpen />}
  title="No products yet"
  description="Add your first product to start selling."
  action={
    <Button asChild>
      <Link href="/admin/products/new">Add product</Link>
    </Button>
  }
/>
```

## 15. Branding Hooks (Client Customization)

The brand color, logo, and font can be customized via `src/config/theme.ts` without touching components:

```ts
export const brandConfig = {
  name: 'IndustrialShop',
  logo: { light: '/branding/logo.svg', dark: '/branding/logo-dark.svg' },
  primaryColor: 'var(--c-brand-500)',
  fontDisplay: 'Space Grotesk',
} as const;
```

## 16. Storybook (Recommended, Phase 2)

When component count crosses ~30, add Storybook for:

- Visual regression
- Documentation
- Designer handoff
- A11y testing via `@storybook/addon-a11y`

## 17. Design Tokens Source of Truth

Tokens are defined once in `globals.css` and referenced via Tailwind config. **Never** introduce a new color, radius, or shadow without:

1. Adding the primitive to `globals.css`
2. Mapping it to a semantic token if needed
3. Updating `tailwind.config.ts`
4. Documenting it here
