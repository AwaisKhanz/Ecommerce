import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CategoryRecord } from '../../src/features/catalog/server/categories.repository';

function category(overrides: Partial<CategoryRecord> = {}): CategoryRecord {
  return {
    id: 'category-1',
    slug: 'generators',
    name: 'Generators',
    description: 'Portable power',
    parent_id: null,
    image_url: null,
    sort_order: 1,
    seo_title: 'Generators',
    seo_description: 'Portable generators',
    translations: {},
    ...overrides,
  };
}

describe('category service', () => {
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

  it('applies translated category fields and falls back field-by-field', async () => {
    const { createCategoryService } =
      await import('../../src/features/catalog/server/categories.service');
    const repository = {
      listActive: vi.fn().mockResolvedValue([
        category({
          translations: {
            ar: {
              name: 'مولدات',
              description: 'طاقة محمولة',
            },
          },
        }),
      ]),
      getBySlug: vi.fn(),
      getTree: vi.fn(),
    };
    const service = createCategoryService(repository);

    await expect(service.listActive('ar')).resolves.toEqual([
      expect.objectContaining({
        name: 'مولدات',
        description: 'طاقة محمولة',
        seo_title: 'Generators',
      }),
    ]);
  });

  it('returns null when a category slug does not exist', async () => {
    const { createCategoryService } =
      await import('../../src/features/catalog/server/categories.service');
    const repository = {
      listActive: vi.fn(),
      getBySlug: vi.fn().mockResolvedValue(null),
      getTree: vi.fn(),
    };
    const service = createCategoryService(repository);

    await expect(service.getBySlug('missing')).resolves.toBeNull();
  });

  it('builds an ordered tree and keeps orphaned categories reachable', async () => {
    const { createCategoryService } =
      await import('../../src/features/catalog/server/categories.service');
    const repository = {
      listActive: vi.fn(),
      getBySlug: vi.fn(),
      getTree: vi.fn().mockResolvedValue([
        category({ id: 'root', slug: 'root', name: 'Root' }),
        category({
          id: 'child',
          slug: 'child',
          name: 'Child',
          parent_id: 'root',
          sort_order: 2,
        }),
        category({
          id: 'orphan',
          slug: 'orphan',
          name: 'Orphan',
          parent_id: 'missing',
          sort_order: 3,
        }),
      ]),
    };
    const service = createCategoryService(repository);

    await expect(service.getTree()).resolves.toEqual([
      expect.objectContaining({
        id: 'root',
        children: [expect.objectContaining({ id: 'child', children: [] })],
      }),
      expect.objectContaining({ id: 'orphan', children: [] }),
    ]);
  });
});
