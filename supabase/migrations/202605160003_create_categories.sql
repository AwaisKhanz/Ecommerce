create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  parent_id uuid references public.categories(id) on delete set null,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  translations jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index categories_slug_idx on public.categories(slug);
create index categories_parent_id_idx on public.categories(parent_id);
create index categories_active_idx on public.categories(is_active) where deleted_at is null;
