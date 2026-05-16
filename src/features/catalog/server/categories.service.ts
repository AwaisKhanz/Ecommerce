import 'server-only';

import type { Locale } from '@/config/i18n';
import { defaultLocale } from '@/config/i18n';
import {
  categoryRepository,
  type CategoryRecord,
} from '@/features/catalog/server/categories.repository';
import { pickTranslatedFields } from '@/lib/i18n/translations';

const translatedCategoryFields = ['name', 'description', 'seo_title', 'seo_description'] as const;

type CategoryRepository = Pick<typeof categoryRepository, 'listActive' | 'getBySlug' | 'getTree'>;

export type LocalizedCategory = CategoryRecord;
export type CategoryTreeNode = LocalizedCategory & {
  children: CategoryTreeNode[];
};

function localizeCategory(category: CategoryRecord, locale: Locale): LocalizedCategory {
  return pickTranslatedFields(category, locale, translatedCategoryFields);
}

function buildCategoryTree(categories: LocalizedCategory[]): CategoryTreeNode[] {
  const nodes = new Map<string, CategoryTreeNode>(
    categories.map((category) => [category.id, { ...category, children: [] }]),
  );
  const roots: CategoryTreeNode[] = [];

  for (const category of categories) {
    const node = nodes.get(category.id);
    if (!node) continue;

    const parent = category.parent_id ? nodes.get(category.parent_id) : undefined;

    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function createCategoryService(repository: CategoryRepository = categoryRepository) {
  return {
    async listActive(locale: Locale = defaultLocale): Promise<LocalizedCategory[]> {
      const categories = await repository.listActive();
      return categories.map((category) => localizeCategory(category, locale));
    },

    async getBySlug(
      slug: string,
      locale: Locale = defaultLocale,
    ): Promise<LocalizedCategory | null> {
      const category = await repository.getBySlug(slug);
      return category ? localizeCategory(category, locale) : null;
    },

    async getTree(locale: Locale = defaultLocale): Promise<CategoryTreeNode[]> {
      const categories = await repository.getTree();
      return buildCategoryTree(categories.map((category) => localizeCategory(category, locale)));
    },
  };
}

export const categoryService = createCategoryService();
