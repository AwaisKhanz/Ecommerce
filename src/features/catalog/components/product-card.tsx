import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';

import { AppLink } from '@/components/ui/app-link';
import { getCatalogImage } from '@/features/catalog/components/catalog-assets';
import { formatMoney } from '@/lib/i18n/format';
import { cn } from '@/lib/utils';

type ProductCardProduct = {
  brand: string | null;
  compare_at_price: number | null;
  currency: string;
  description: string | null;
  id: string;
  isInStock: boolean;
  isOnSale: boolean;
  low_stock_threshold: number;
  name: string;
  price: number;
  short_description: string | null;
  slug: string;
  stock_quantity: number;
};

type ProductCardCopy = {
  addToCart: string;
  bestSeller: string;
  inStock: string;
  lowStock: string;
  new: string;
  outOfStock: string;
  sale: string;
};

type ProductCardProps = {
  copy: ProductCardCopy;
  imageIndex: number;
  locale: string;
  product: ProductCardProduct;
  view?: 'grid' | 'list';
};

function ProductCard({
  copy,
  imageIndex,
  locale,
  product,
  view = 'grid',
}: ProductCardProps): React.JSX.Element {
  const lowStock = product.isInStock && product.stock_quantity <= product.low_stock_threshold;
  const badge =
    imageIndex === 0
      ? copy.bestSeller
      : product.isOnSale
        ? copy.sale
        : imageIndex === 4
          ? copy.new
          : undefined;

  return (
    <article
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-surface',
        view === 'list' && 'md:flex',
      )}
    >
      <AppLink
        href={`/shop/${product.slug}`}
        event="shop.product.open"
        className={cn('block hover:text-fg', view === 'list' && 'md:w-72 md:shrink-0')}
      >
        <div
          className={cn(
            'relative aspect-[1.18/1] overflow-hidden bg-muted',
            view === 'list' && 'md:aspect-auto md:h-full',
          )}
        >
          <Image
            alt=""
            src={getCatalogImage(imageIndex)}
            fill
            className={cn(
              'object-cover transition duration-300 hover:scale-105',
              !product.isInStock && 'opacity-35 grayscale',
            )}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
          />
          {badge ? (
            <span
              className={cn(
                'absolute left-3 top-3 rounded px-2 py-1 text-[11px] font-semibold text-white',
                badge === copy.sale
                  ? 'bg-rose-500'
                  : badge === copy.new
                    ? 'bg-blue-500'
                    : 'bg-emerald-600',
              )}
            >
              {badge}
            </span>
          ) : null}
          {!product.isInStock ? (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white">
              {copy.outOfStock}
            </span>
          ) : null}
        </div>
      </AppLink>

      <div
        className={cn('p-4', view === 'list' && 'md:flex md:flex-1 md:flex-col md:justify-between')}
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-fg-muted">
          {product.brand ?? 'IndustrialShop'}
        </p>
        <h2 className="mt-2 line-clamp-1 text-sm font-medium">{product.name}</h2>
        <p className="mt-2 line-clamp-1 text-sm text-fg-muted">
          {product.short_description ?? product.description}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display text-xl font-semibold">
                {formatMoney(product.price, product.currency, locale)}
              </p>
              {product.isOnSale && product.compare_at_price ? (
                <p className="text-sm text-fg-muted line-through">
                  {formatMoney(product.compare_at_price, product.currency, locale)}
                </p>
              ) : null}
            </div>
            <p
              className={cn(
                'mt-2 inline-flex rounded-sm px-2 py-1 text-xs font-medium',
                !product.isInStock
                  ? 'bg-zinc-100 text-zinc-600'
                  : lowStock
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-emerald-50 text-emerald-700',
              )}
            >
              {product.isInStock ? (lowStock ? copy.lowStock : copy.inStock) : copy.outOfStock}
            </p>
          </div>
          <button
            type="button"
            aria-label={`${copy.addToCart}: ${product.name}`}
            className="inline-flex size-9 items-center justify-center rounded-md bg-page text-fg-muted"
          >
            <ShoppingCart aria-hidden className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export { ProductCard };
export type { ProductCardCopy, ProductCardProduct };
