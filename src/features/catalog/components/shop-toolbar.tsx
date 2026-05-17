'use client';

import { Grid2X2, List, Search } from 'lucide-react';

import { AppLink } from '@/components/ui/app-link';
import { useShopFilters } from '@/features/catalog/hooks/use-shop-filters';
import { cn } from '@/lib/utils';

type ShopToolbarCopy = {
  gridView: string;
  listView: string;
  searchPlaceholder: string;
  sortLabel: string;
  newest: string;
  priceAsc: string;
  priceDesc: string;
};

type ShopToolbarProps = {
  copy: ShopToolbarCopy;
  view: 'grid' | 'list';
};

function ShopToolbar({ copy, view }: ShopToolbarProps): React.JSX.Element {
  const { params, pathname, updateFilters } = useShopFilters();
  const gridHref = viewHref(params, 'grid');
  const listHref = viewHref(params, 'list');
  const preservedParams = [...params.entries()].filter(([key]) => key !== 'q' && key !== 'page');

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <form action={pathname} method="get" className="relative flex-1">
        {preservedParams.map(([key, value]) => (
          <input key={`${key}-${value}`} type="hidden" name={key} value={value} />
        ))}
        <Search
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
        />
        <input
          key={params.get('q') ?? ''}
          name="q"
          defaultValue={params.get('q') ?? ''}
          placeholder={copy.searchPlaceholder}
          className="h-12 w-full rounded-md border border-border bg-surface pl-11 pr-4 text-sm outline-none placeholder:text-fg-muted focus:border-accent"
        />
      </form>

      <label className="inline-flex items-center gap-3 text-sm text-fg-muted">
        {copy.sortLabel}
        <select
          value={params.get('sort') ?? 'newest'}
          onChange={(event) =>
            updateFilters({
              sort: event.currentTarget.value === 'newest' ? null : event.currentTarget.value,
            })
          }
          className="h-12 rounded-md border border-border bg-surface px-4 text-fg outline-none focus:border-accent"
        >
          <option value="newest">{copy.newest}</option>
          <option value="price-asc">{copy.priceAsc}</option>
          <option value="price-desc">{copy.priceDesc}</option>
        </select>
      </label>

      <div className="inline-flex h-12 rounded-md border border-border bg-surface p-1">
        <AppLink
          href={gridHref}
          aria-label={copy.gridView}
          aria-pressed={view === 'grid'}
          className={cn(
            'inline-flex size-10 items-center justify-center rounded text-fg-muted',
            view === 'grid' && 'bg-page text-fg',
          )}
        >
          <Grid2X2 aria-hidden className="size-4" />
        </AppLink>
        <AppLink
          href={listHref}
          aria-label={copy.listView}
          aria-pressed={view === 'list'}
          className={cn(
            'inline-flex size-10 items-center justify-center rounded text-fg-muted',
            view === 'list' && 'bg-page text-fg',
          )}
        >
          <List aria-hidden className="size-4" />
        </AppLink>
      </div>
    </div>
  );
}

function viewHref(params: URLSearchParams, view: 'grid' | 'list'): string {
  const nextParams = new URLSearchParams(params.toString());
  nextParams.delete('page');

  if (view === 'grid') {
    nextParams.delete('view');
  } else {
    nextParams.set('view', view);
  }

  const query = nextParams.toString();
  return query ? `/shop?${query}` : '/shop';
}

export { ShopToolbar };
export type { ShopToolbarCopy };
