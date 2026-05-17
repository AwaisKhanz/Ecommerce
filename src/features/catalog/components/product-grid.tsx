import { cn } from '@/lib/utils';

import { ProductCard, type ProductCardCopy, type ProductCardProduct } from './product-card';

type ProductGridProps = {
  copy: ProductCardCopy;
  locale: string;
  products: ProductCardProduct[];
  view?: 'grid' | 'list';
};

function ProductGrid({
  copy,
  locale,
  products,
  view = 'grid',
}: ProductGridProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'mt-5 grid gap-4',
        view === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1',
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          imageIndex={index}
          locale={locale}
          view={view}
          copy={copy}
        />
      ))}
    </div>
  );
}

export { ProductGrid };
