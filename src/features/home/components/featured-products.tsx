import { ArrowRight, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

import { AppLink } from '@/components/ui/app-link';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { getProductImage } from '@/features/home/home-assets';
import { formatMoney } from '@/lib/i18n/format';

type FeaturedProduct = {
  brand: string | null;
  currency: string;
  id: string;
  isInStock: boolean;
  isOnSale: boolean;
  low_stock_threshold: number;
  name: string;
  price: number;
  sku: string | null;
  slug: string;
  stock_quantity: number;
};

type FeaturedProductsProps = {
  copy: {
    eyebrow: string;
    title: string;
    description: string;
    link: string;
    inStock: string;
    lowStock: string;
    sale: string;
  };
  locale: string;
  products: FeaturedProduct[];
};

function FeaturedProducts({ copy, locale, products }: FeaturedProductsProps): React.JSX.Element {
  return (
    <Section className="bg-page">
      <Container size="2xl">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
              {copy.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold">{copy.title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-fg-muted">{copy.description}</p>
          </div>
          <AppLink href="/shop" event="home.products.view_all" className="text-sm text-emerald-600">
            {copy.link}
            <ArrowRight aria-hidden className="ml-1 inline size-4" />
          </AppLink>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => {
            const lowStock =
              product.isInStock && product.stock_quantity <= product.low_stock_threshold;

            return (
              <article
                key={product.id}
                className="overflow-hidden rounded-lg border border-border bg-surface"
              >
                <AppLink href={`/shop/${product.slug}`} event="home.product.open" className="block">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      alt=""
                      src={getProductImage(index)}
                      fill
                      className="object-cover transition duration-300 hover:scale-105"
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    />
                    {product.isOnSale ? (
                      <span className="absolute left-3 top-3 rounded bg-rose-500 px-2 py-1 text-[11px] font-semibold text-white">
                        {copy.sale}
                      </span>
                    ) : null}
                  </div>
                </AppLink>
                <div className="p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-fg-muted">
                    {product.brand ?? product.sku}
                  </p>
                  <h3 className="mt-2 line-clamp-1 text-sm font-medium">{product.name}</h3>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-semibold">
                        {formatMoney(product.price, product.currency, locale)}
                      </p>
                      <p
                        className={lowStock ? 'text-xs text-amber-600' : 'text-xs text-emerald-600'}
                      >
                        {lowStock ? copy.lowStock : copy.inStock}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Add ${product.name} to cart`}
                      className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-page text-fg-muted"
                    >
                      <ShoppingCart aria-hidden className="size-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

export { FeaturedProducts };
export type { FeaturedProduct };
