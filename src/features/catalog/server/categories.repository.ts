import 'server-only';

import { publicSupabase } from '@/lib/supabase/public';
import type { Category } from '@/types/db';

const publicCategorySelect = `
  id,
  slug,
  name,
  description,
  parent_id,
  image_url,
  sort_order,
  seo_title,
  seo_description,
  translations
`;

export type CategoryRecord = Pick<
  Category,
  | 'id'
  | 'slug'
  | 'name'
  | 'description'
  | 'parent_id'
  | 'image_url'
  | 'sort_order'
  | 'seo_title'
  | 'seo_description'
  | 'translations'
>;

async function listActive(): Promise<CategoryRecord[]> {
  const { data, error } = await publicSupabase
    .from('categories')
    .select(publicCategorySelect)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

async function getBySlug(slug: string): Promise<CategoryRecord | null> {
  const { data, error } = await publicSupabase
    .from('categories')
    .select(publicCategorySelect)
    .eq('slug', slug)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getTree(): Promise<CategoryRecord[]> {
  return listActive();
}

export const categoryRepository = {
  listActive,
  getBySlug,
  getTree,
};
