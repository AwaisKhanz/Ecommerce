'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { usePathname, useRouter } from '@/lib/i18n/navigation';

type ShopFilterKey =
  | 'brand'
  | 'category'
  | 'inStock'
  | 'maxPrice'
  | 'minPrice'
  | 'page'
  | 'q'
  | 'sort'
  | 'view';

function useShopFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = useCallback(
    (updates: Partial<Record<ShopFilterKey, string | null>>) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (!value) {
          nextParams.delete(key);
        } else {
          nextParams.set(key, value);
        }
      }

      if (!('page' in updates)) {
        nextParams.delete('page');
      }

      const query = Object.fromEntries(nextParams.entries());
      router.push(Object.keys(query).length > 0 ? { pathname, query } : pathname);
    },
    [pathname, router, searchParams],
  );

  return {
    pathname,
    params: searchParams,
    updateFilters,
  };
}

export { useShopFilters };
