import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AppLink } from '@/components/ui/app-link';
import { Container } from '@/components/ui/container';
import type { Locale } from '@/config/i18n';
import { siteConfig } from '@/config/site';
import { ProductGrid } from '@/features/catalog/components/product-grid';
import { categoryService } from '@/features/catalog/server/categories.service';
import { productService } from '@/features/catalog/server/products.service';
import { ShopEmptyState } from '@/features/catalog/components/shop-empty-state';
import { ShopFilters } from '@/features/catalog/components/shop-filters';
import { ShopPagination } from '@/features/catalog/components/shop-pagination';
import { ShopToolbar } from '@/features/catalog/components/shop-toolbar';

type ShopPageProps = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = 'force-dynamic';

function stringParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function numberParam(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function sortParam(value: string | undefined): 'newest' | 'price-asc' | 'price-desc' | undefined {
  return value === 'price-asc' || value === 'price-desc' || value === 'newest' ? value : undefined;
}

function viewParam(value: string | undefined): 'grid' | 'list' {
  return value === 'list' ? value : 'grid';
}

export async function generateMetadata({
  params,
}: Pick<ShopPageProps, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'shopListing.meta' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ShopPage({
  params,
  searchParams,
}: ShopPageProps): Promise<React.JSX.Element> {
  const [{ locale }, rawSearchParams] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'shopListing' });
  const category = stringParam(rawSearchParams['category']);
  const brand = stringParam(rawSearchParams['brand']);
  const search = stringParam(rawSearchParams['q']);
  const page = numberParam(stringParam(rawSearchParams['page'])) ?? 1;
  const minPrice = numberParam(stringParam(rawSearchParams['minPrice']));
  const maxPrice = numberParam(stringParam(rawSearchParams['maxPrice']));
  const inStock = stringParam(rawSearchParams['inStock']) === 'true';
  const sort = sortParam(stringParam(rawSearchParams['sort']));
  const view = viewParam(stringParam(rawSearchParams['view']));

  const [result, allProducts, categories] = await Promise.all([
    productService.list(
      {
        brand,
        categorySlug: category,
        inStock,
        maxPrice,
        minPrice,
        page,
        perPage: 12,
        search,
        sort,
      },
      locale,
    ),
    productService.list({ perPage: 100 }, locale),
    categoryService.listActive(locale),
  ]);

  const categoryCounts = new Map<string, number>();
  const brandCounts = new Map<string, number>();

  for (const product of allProducts.items) {
    if (product.brand) {
      brandCounts.set(product.brand, (brandCounts.get(product.brand) ?? 0) + 1);
    }
    for (const relation of product.product_categories) {
      if (relation.categories) {
        categoryCounts.set(
          relation.categories.slug,
          (categoryCounts.get(relation.categories.slug) ?? 0) + 1,
        );
      }
    }
  }

  const maximumPrice = Math.max(0, ...allProducts.items.map((product) => product.price));
  const pageCount = Math.max(1, Math.ceil(result.total / result.perPage));
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: result.total,
    itemListElement: result.items.map((product, index) => ({
      '@type': 'ListItem',
      position: (result.page - 1) * result.perPage + index + 1,
      name: product.name,
      url: `${siteConfig.url}/shop/${product.slug}`,
    })),
  };
  const cleanSearchParams = Object.fromEntries(
    Object.entries(rawSearchParams).map(([key, value]) => [key, stringParam(value)]),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Container size="2xl" className="py-8 lg:py-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-5 text-sm text-fg-muted">
          <AppLink href="/" event="shop.breadcrumb.home">
            {t('breadcrumbHome')}
          </AppLink>
          <span className="font-medium text-fg">{t('breadcrumbShop')}</span>
        </nav>

        <div className="mt-6">
          <h1 className="font-display text-4xl font-semibold">{t('title')}</h1>
          <p className="mt-3 text-sm text-fg-muted">{t('description')}</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
          <ShopFilters
            categories={categories.map((item) => ({
              count: categoryCounts.get(item.slug) ?? 0,
              label: item.name,
              value: item.slug,
            }))}
            brands={[...brandCounts.entries()].map(([label, count]) => ({
              count,
              label,
              value: label,
            }))}
            maxPrice={Math.ceil(maximumPrice / 100) * 100}
            copy={{
              filters: t('filters'),
              category: t('category'),
              priceRange: t('priceRange'),
              availability: t('availability'),
              inStockOnly: t('inStockOnly'),
              brand: t('brand'),
            }}
          />

          <section>
            <ShopToolbar
              view={view}
              copy={{
                searchPlaceholder: t('searchPlaceholder'),
                sortLabel: t('sortLabel'),
                newest: t('newest'),
                priceAsc: t('priceAsc'),
                priceDesc: t('priceDesc'),
                gridView: t('gridView'),
                listView: t('listView'),
              }}
            />

            <div className="mt-5 flex items-center justify-between text-sm text-fg-muted">
              <p>
                {t.rich('showing', {
                  strong: (chunks) => <strong className="font-semibold text-fg">{chunks}</strong>,
                  count: result.items.length,
                  total: result.total,
                })}
              </p>
              <p className="hidden sm:block">
                {t('urlLabel')}: <span className="ml-2 font-mono text-xs">/shop</span>
              </p>
            </div>

            {result.items.length === 0 ? (
              <div className="mt-5">
                <ShopEmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
              </div>
            ) : (
              <>
                <ProductGrid
                  products={result.items}
                  locale={locale}
                  view={view}
                  copy={{
                    addToCart: t('addToCart'),
                    bestSeller: t('bestSeller'),
                    sale: t('sale'),
                    new: t('new'),
                    inStock: t('inStock'),
                    lowStock: t('lowStock'),
                    outOfStock: t('outOfStock'),
                  }}
                />
                <ShopPagination
                  currentPage={result.page}
                  pageCount={pageCount}
                  searchParams={cleanSearchParams}
                />
              </>
            )}
          </section>
        </div>
      </Container>
    </>
  );
}
