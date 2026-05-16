create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  sku text unique,
  name text not null,
  short_description text,
  description text,
  specifications jsonb not null default '{}'::jsonb,
  price numeric(12, 2) not null check (price >= 0),
  compare_at_price numeric(12, 2) check (compare_at_price >= 0),
  currency text not null default 'USD',
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 5,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  brand text,
  tags text[] not null default '{}',
  seo_title text,
  seo_description text,
  translations jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index products_slug_idx on public.products(slug);
create index products_status_idx on public.products(status) where deleted_at is null;
create index products_tags_idx on public.products using gin(tags);
create index products_search_idx on public.products using gin(to_tsvector('english', name || ' ' || coalesce(description, '')));
