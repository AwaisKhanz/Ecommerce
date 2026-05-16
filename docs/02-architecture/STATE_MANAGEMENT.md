# 02 · STATE MANAGEMENT

## 1. Mental Model

We split state into **four categories**, each with its own home:

| Category | Examples | Owner |
|---|---|---|
| **URL state** | filters, search, pagination, locale | Next.js `searchParams` |
| **Server state** | products, orders, categories | TanStack Query (client) / RSC (server) |
| **Client UI state** | cart, modals, drawers, theme | Zustand |
| **Form state** | inputs, validation | React Hook Form + Zod |

Rule: if state can live in the URL, it **must** live in the URL.

## 2. URL State Pattern

```ts
// src/features/catalog/hooks/use-shop-filters.ts
'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function useShopFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const setFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null) next.delete(key); else next.set(key, value);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return {
    category: params.get('category'),
    sort: params.get('sort') ?? 'newest',
    page: Number(params.get('page') ?? 1),
    setFilter,
  };
}
```

## 3. Server State — Server Components

For RSC, fetch directly. **Never** wrap in TanStack Query:

```ts
// src/app/shop/page.tsx
import { productService } from '@/features/products/server/product.service';

export default async function ShopPage({ searchParams }: { searchParams: { /* ... */ } }) {
  const { items, total } = await productService.list({
    category: searchParams.category,
    sort: searchParams.sort,
    page: Number(searchParams.page ?? 1),
  });
  return <ProductGrid products={items} total={total} />;
}
```

## 4. Server State — Client (Admin Panel)

TanStack Query is the cache and lifecycle manager:

```ts
// src/features/admin/products/hooks/use-products.ts
'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export function useAdminProducts(filters: AdminProductFilters) {
  return useQuery({
    queryKey: ['admin', 'products', filters],
    queryFn: () => apiClient.products.list(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}
```

### Mutations with optimistic updates

```ts
useMutation({
  mutationFn: apiClient.products.update,
  onMutate: async (next) => {
    await qc.cancelQueries({ queryKey: ['admin', 'products'] });
    const prev = qc.getQueryData(['admin', 'product', next.id]);
    qc.setQueryData(['admin', 'product', next.id], next);
    return { prev };
  },
  onError: (_e, next, ctx) => {
    qc.setQueryData(['admin', 'product', next.id], ctx?.prev);
    toast.error('Update failed');
  },
  onSettled: () => qc.invalidateQueries({ queryKey: ['admin', 'products'] }),
});
```

## 5. Client UI State — Zustand

```ts
// src/features/cart/store/cart.store.ts
'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartLine { productId: string; qty: number; price: number; name: string; image: string; slug: string; }
interface CartState {
  lines: CartLine[];
  add: (line: CartLine) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line) => set((s) => {
        const existing = s.lines.find(l => l.productId === line.productId);
        return existing
          ? { lines: s.lines.map(l => l.productId === line.productId ? { ...l, qty: l.qty + line.qty } : l) }
          : { lines: [...s.lines, line] };
      }),
      remove: (id) => set((s) => ({ lines: s.lines.filter(l => l.productId !== id) })),
      setQty: (id, qty) => set((s) => ({ lines: s.lines.map(l => l.productId === id ? { ...l, qty } : l) })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'cart-v1' }
  )
);
```

### Store guidelines
- **One store per feature** (cart, ui, theme).
- **No async logic inside stores** — call services, then update store.
- **Persist only what's safe** (cart yes, modals no).
- **Strictly typed** — no `any`.

## 6. Form State — React Hook Form + Zod

```ts
// src/features/checkout/components/checkout-form.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, CheckoutInput } from '@/features/checkout/schemas';

export function CheckoutForm() {
  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: '', email: '', phone: '', address: { street: '', city: '', postalCode: '' }, notes: '' },
  });
  // ...
}
```

**Single source of truth for validation:** the same `checkoutSchema` is imported by:
- The form (client)
- The Server Action (server)
- API tests

## 7. Caching & Invalidation

| Scope | Tool | Invalidation |
|---|---|---|
| RSC fetch dedup | React `cache()` | per-request only |
| ISR routes | Next.js | `revalidateTag()` after admin mutations |
| Admin client cache | TanStack Query | `invalidateQueries` per mutation |
| Cart | Zustand persist | manual clear on order success |

Each Server Action that mutates products calls:
```ts
revalidateTag('products');
revalidateTag('product:' + slug);
```

## 8. Loading & Empty States

Every data-driven UI must declare four states:
1. **Loading** — skeleton matching final layout
2. **Empty** — illustration + helpful CTA
3. **Error** — friendly message + retry
4. **Success** — the real content

Provided as a single `<DataState />` primitive in the design system.

## 9. Optimistic UI Rules

Use optimistic updates **only** when:
- Mutation is fast (< 500ms typical)
- Rollback is harmless
- User sees immediate impact (e.g., toggle stock, update qty)

Do **not** use optimistic updates for:
- Order placement (must confirm server success)
- Payment-related actions (when added)
- Anything destructive (deletes use confirm dialog instead)

## 10. SSR Hydration Safety

- `Zustand persist` is wrapped in a `<HydrationGate>` to avoid SSR mismatch.
- All client-only components import dynamically with `ssr: false` when needed.
- Cart count badge uses `useHasMounted()` to avoid flicker.
