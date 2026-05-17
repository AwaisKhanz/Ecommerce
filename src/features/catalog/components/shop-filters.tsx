'use client';

import { ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useShopFilters } from '@/features/catalog/hooks/use-shop-filters';

type CountedFilter = {
  count: number;
  label: string;
  value: string;
};

type ShopFiltersCopy = {
  availability: string;
  brand: string;
  category: string;
  filters: string;
  inStockOnly: string;
  priceRange: string;
};

type ShopFiltersProps = {
  brands: CountedFilter[];
  categories: CountedFilter[];
  copy: ShopFiltersCopy;
  maxPrice: number;
};

function ShopFilters({ brands, categories, copy, maxPrice }: ShopFiltersProps): React.JSX.Element {
  const { params, updateFilters } = useShopFilters();
  const activeCategory = params.get('category');
  const activeBrand = params.get('brand');
  const inStock = params.get('inStock') === 'true';
  const minPrice = params.get('minPrice') ?? '0';
  const currentMaxPrice = params.get('maxPrice') ?? String(maxPrice);

  return (
    <aside className="space-y-7 lg:sticky lg:top-6 lg:self-start">
      <h2 className="text-sm font-semibold">{copy.filters}</h2>

      <FilterGroup title={copy.category}>
        {categories.map((category) => (
          <label key={category.value} className="flex items-center justify-between gap-3 text-sm">
            <span className="inline-flex items-center gap-3">
              <input
                type="checkbox"
                checked={activeCategory === category.value}
                onChange={(event) =>
                  updateFilters({ category: event.currentTarget.checked ? category.value : null })
                }
                className="size-4 rounded border-border text-accent"
              />
              {category.label}
            </span>
            <span className="text-fg-muted">{category.count}</span>
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title={copy.priceRange}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <PriceInput
            value={minPrice}
            onCommit={(value) => updateFilters({ minPrice: value === '0' ? null : value })}
          />
          <span className="text-fg-muted">—</span>
          <PriceInput
            value={currentMaxPrice}
            onCommit={(value) =>
              updateFilters({ maxPrice: value === String(maxPrice) ? null : value })
            }
          />
        </div>
        <input
          type="range"
          min={0}
          max={maxPrice}
          value={currentMaxPrice}
          onChange={(event) =>
            updateFilters({
              maxPrice:
                event.currentTarget.value === String(maxPrice) ? null : event.currentTarget.value,
            })
          }
          className="mt-4 w-full accent-emerald-600"
        />
        <div className="mt-2 flex justify-between text-xs text-fg-muted">
          <span>$0</span>
          <span>${maxPrice}+</span>
        </div>
      </FilterGroup>

      <FilterGroup title={copy.availability}>
        <label className="inline-flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={inStock}
            onChange={() => updateFilters({ inStock: inStock ? null : 'true' })}
            className="size-4 rounded border-border text-accent"
          />
          {copy.inStockOnly}
        </label>
      </FilterGroup>

      <FilterGroup title={copy.brand}>
        {brands.map((brand) => (
          <label key={brand.value} className="flex items-center justify-between gap-3 text-sm">
            <span className="inline-flex items-center gap-3">
              <input
                type="checkbox"
                checked={activeBrand === brand.value}
                onChange={(event) =>
                  updateFilters({ brand: event.currentTarget.checked ? brand.value : null })
                }
                className="size-4 rounded border-border text-accent"
              />
              {brand.label}
            </span>
            <span className="text-fg-muted">{brand.count}</span>
          </label>
        ))}
      </FilterGroup>
    </aside>
  );
}

type FilterGroupProps = {
  children: React.ReactNode;
  title: string;
};

function FilterGroup({ children, title }: FilterGroupProps): React.JSX.Element {
  return (
    <section className="border-b border-border pb-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <ChevronUp aria-hidden className="size-4 text-fg-muted" />
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

type PriceInputProps = {
  onCommit: (value: string) => void;
  value: string;
};

function PriceInput({ onCommit, value }: PriceInputProps): React.JSX.Element {
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  return (
    <label className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-fg-muted">$</span>
      <input
        type="number"
        min={0}
        value={draftValue}
        onChange={(event) => setDraftValue(event.currentTarget.value)}
        onBlur={(event) => onCommit(event.currentTarget.value)}
        className="h-10 w-full rounded-md border border-border bg-surface pl-7 pr-3 text-sm outline-none focus:border-accent"
      />
    </label>
  );
}

export { ShopFilters };
export type { CountedFilter, ShopFiltersCopy };
