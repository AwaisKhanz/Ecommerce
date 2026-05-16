import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProductRecord } from '../../src/features/catalog/server/products.repository';

function product(overrides: Partial<ProductRecord> = {}): ProductRecord {
  return {
    id: 'product-1',
    slug: 'generator-1',
    sku: 'GEN-001',
    name: 'Generator',
    short_description: 'Compact power',
    description: 'Portable generator',
    specifications: {},
    price: 100,
    compare_at_price: 120,
    currency: 'USD',
    stock_quantity: 5,
    low_stock_threshold: 2,
    brand: 'IndustrialShop',
    tags: [],
    seo_title: 'Generator',
    seo_description: 'Portable generator',
    translations: {},
    created_at: '2026-05-17T00:00:00.000Z',
    product_images: [],
    product_categories: [],
    ...overrides,
  };
}

describe('product service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
    vi.stubEnv('NEXT_PUBLIC_APP_NAME', 'IndustrialShop');
    vi.stubEnv('NEXT_PUBLIC_DEFAULT_LOCALE', 'en');
    vi.stubEnv('NEXT_PUBLIC_ENABLED_LOCALES', 'en');
    vi.stubEnv('NEXT_PUBLIC_DEFAULT_CURRENCY', 'USD');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
  });

  it('localizes list items and computes stock and sale flags', async () => {
    const { createProductService } =
      await import('../../src/features/catalog/server/products.service');
    const repository = {
      list: vi.fn().mockResolvedValue({
        items: [
          product({
            translations: {
              ar: {
                name: 'مولد',
                description: 'مولد محمول',
              },
            },
          }),
          product({
            id: 'product-2',
            slug: 'generator-2',
            stock_quantity: 0,
            compare_at_price: null,
          }),
        ],
        page: 2,
        perPage: 10,
        total: 22,
      }),
      getBySlug: vi.fn(),
      getRelated: vi.fn(),
    };
    const service = createProductService(repository);

    await expect(service.list({ page: 2, perPage: 10 }, 'ar')).resolves.toEqual({
      items: [
        expect.objectContaining({
          name: 'مولد',
          description: 'مولد محمول',
          isInStock: true,
          isOnSale: true,
        }),
        expect.objectContaining({
          id: 'product-2',
          isInStock: false,
          isOnSale: false,
        }),
      ],
      page: 2,
      perPage: 10,
      total: 22,
    });
  });

  it('returns null when a product slug does not exist', async () => {
    const { createProductService } =
      await import('../../src/features/catalog/server/products.service');
    const repository = {
      list: vi.fn(),
      getBySlug: vi.fn().mockResolvedValue(null),
      getRelated: vi.fn(),
    };
    const service = createProductService(repository);

    await expect(service.getBySlug('missing')).resolves.toBeNull();
  });

  it('applies presentation logic to related products', async () => {
    const { createProductService } =
      await import('../../src/features/catalog/server/products.service');
    const repository = {
      list: vi.fn(),
      getBySlug: vi.fn(),
      getRelated: vi.fn().mockResolvedValue([product({ stock_quantity: 0 })]),
    };
    const service = createProductService(repository);

    await expect(service.getRelated('product-1', 3)).resolves.toEqual([
      expect.objectContaining({
        id: 'product-1',
        isInStock: false,
        isOnSale: true,
      }),
    ]);
    expect(repository.getRelated).toHaveBeenCalledWith('product-1', 3);
  });
});
