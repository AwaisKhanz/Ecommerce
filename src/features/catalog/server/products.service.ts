import 'server-only';

import type { Locale } from '@/config/i18n';
import { defaultLocale } from '@/config/i18n';
import {
  productRepository,
  type ProductListFilters,
  type ProductListResult,
  type ProductRecord,
} from '@/features/catalog/server/products.repository';
import { pickTranslatedFields } from '@/lib/i18n/translations';

const translatedProductFields = [
  'name',
  'short_description',
  'description',
  'seo_title',
  'seo_description',
] as const;

type ProductRepository = Pick<typeof productRepository, 'list' | 'getBySlug' | 'getRelated'>;

export type PublicProduct = ProductRecord & {
  isInStock: boolean;
  isOnSale: boolean;
};

export type PublicProductListResult = Omit<ProductListResult, 'items'> & {
  items: PublicProduct[];
};

function presentProduct(product: ProductRecord, locale: Locale): PublicProduct {
  const localized = pickTranslatedFields(product, locale, translatedProductFields);

  return {
    ...localized,
    isInStock: localized.stock_quantity > 0,
    isOnSale: localized.compare_at_price !== null && localized.compare_at_price > localized.price,
  };
}

export function createProductService(repository: ProductRepository = productRepository) {
  return {
    async list(
      filters: ProductListFilters = {},
      locale: Locale = defaultLocale,
    ): Promise<PublicProductListResult> {
      const result = await repository.list(filters);

      return {
        ...result,
        items: result.items.map((product) => presentProduct(product, locale)),
      };
    },

    async getBySlug(slug: string, locale: Locale = defaultLocale): Promise<PublicProduct | null> {
      const product = await repository.getBySlug(slug);
      return product ? presentProduct(product, locale) : null;
    },

    async getRelated(
      productId: string,
      limit = 4,
      locale: Locale = defaultLocale,
    ): Promise<PublicProduct[]> {
      const products = await repository.getRelated(productId, limit);
      return products.map((product) => presentProduct(product, locale));
    },
  };
}

export const productService = createProductService();
