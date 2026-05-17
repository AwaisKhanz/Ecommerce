import 'server-only';

import { publicSupabase } from '@/lib/supabase/public';
import type { Category, Product, ProductImage } from '@/types/db';

const publicProductSelect = `
  id,
  slug,
  sku,
  name,
  short_description,
  description,
  specifications,
  price,
  compare_at_price,
  currency,
  stock_quantity,
  low_stock_threshold,
  brand,
  tags,
  seo_title,
  seo_description,
  translations,
  created_at,
  product_images (
    id,
    storage_path,
    alt_text,
    sort_order,
    is_primary
  ),
  product_categories (
    category_id,
    categories (
      id,
      slug,
      name
    )
  )
`;

const filteredProductSelect = publicProductSelect
  .replace('product_categories (', 'product_categories!inner (')
  .replace('categories (', 'categories!inner (');

export type ProductImageRecord = Pick<
  ProductImage,
  'id' | 'storage_path' | 'alt_text' | 'sort_order' | 'is_primary'
>;

export type ProductCategoryRecord = {
  category_id: string;
  categories: Pick<Category, 'id' | 'slug' | 'name'> | null;
};

export type ProductRecord = Pick<
  Product,
  | 'id'
  | 'slug'
  | 'sku'
  | 'name'
  | 'short_description'
  | 'description'
  | 'specifications'
  | 'price'
  | 'compare_at_price'
  | 'currency'
  | 'stock_quantity'
  | 'low_stock_threshold'
  | 'brand'
  | 'tags'
  | 'seo_title'
  | 'seo_description'
  | 'translations'
  | 'created_at'
> & {
  product_images: ProductImageRecord[];
  product_categories: ProductCategoryRecord[];
};

export type ProductSort = 'newest' | 'price-asc' | 'price-desc';

export type ProductListFilters = {
  brand?: string;
  categorySlug?: string;
  inStock?: boolean;
  maxPrice?: number;
  minPrice?: number;
  page?: number;
  perPage?: number;
  search?: string;
  sort?: ProductSort;
  tag?: string;
};

export type ProductListResult = {
  items: ProductRecord[];
  page: number;
  perPage: number;
  total: number;
};

function normalizeSearchTerm(search: string): string {
  return search
    .replace(/[(),.%]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function list(filters: ProductListFilters = {}): Promise<ProductListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.max(1, filters.perPage ?? 20);
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const select = filters.categorySlug ? filteredProductSelect : publicProductSelect;

  let query = publicSupabase
    .from('products')
    .select(select, { count: 'exact' })
    .eq('status', 'active')
    .is('deleted_at', null);

  if (filters.categorySlug) {
    query = query.eq('product_categories.categories.slug', filters.categorySlug);
  }
  if (filters.brand) {
    query = query.eq('brand', filters.brand);
  }
  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }
  if (filters.inStock) {
    query = query.gt('stock_quantity', 0);
  }
  if (filters.tag) {
    query = query.contains('tags', [filters.tag]);
  }
  const search = filters.search ? normalizeSearchTerm(filters.search) : '';
  if (search) {
    query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
  }

  switch (filters.sort ?? 'newest') {
    case 'price-asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return {
    items: data as unknown as ProductRecord[],
    page,
    perPage,
    total: count ?? 0,
  };
}

async function getBySlug(slug: string): Promise<ProductRecord | null> {
  const { data, error } = await publicSupabase
    .from('products')
    .select(publicProductSelect)
    .eq('slug', slug)
    .eq('status', 'active')
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return data as ProductRecord | null;
}

async function getRelated(productId: string, limit = 4): Promise<ProductRecord[]> {
  const { data: categoryRows, error: categoryError } = await publicSupabase
    .from('product_categories')
    .select('category_id')
    .eq('product_id', productId);

  if (categoryError) throw categoryError;

  const categoryIds = categoryRows.map((row) => row.category_id);
  if (categoryIds.length === 0) return [];

  const { data, error } = await publicSupabase
    .from('products')
    .select(filteredProductSelect)
    .eq('status', 'active')
    .is('deleted_at', null)
    .neq('id', productId)
    .in('product_categories.category_id', categoryIds)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as unknown as ProductRecord[];
}

export const productRepository = {
  list,
  getBySlug,
  getRelated,
};
