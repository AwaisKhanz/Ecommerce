# 02 · DATABASE SCHEMA

## 1. Overview

- Engine: **PostgreSQL 15** via Supabase
- All tables in `public` schema unless noted
- All primary keys: `uuid` (default `gen_random_uuid()`)
- All tables have `created_at`, `updated_at` timestamps
- Soft delete via `deleted_at` (nullable timestamp) where appropriate
- Multilingual content stored in `jsonb` `translations` columns
- All FK relationships use `ON DELETE` rules carefully chosen
- RLS is **enabled on every table**

## 2. Entity Relationship Diagram

```
┌─────────────┐        ┌────────────────┐
│  profiles   │1     ∞ │   audit_logs   │
│ (admin only)│────────│                │
└─────────────┘        └────────────────┘
                              ▲
                              │ actor
┌─────────────┐ 1   ∞ ┌────────────────┐ ∞    1 ┌─────────────┐
│ categories  │───────│    products    │───────│ category    │
│             │       │                │       │ (self FK)   │
└─────────────┘       └────────┬───────┘       └─────────────┘
       ▲                       │ 1
       │ parent                ▼ ∞
       │              ┌────────────────┐
       │              │ product_images │
       │              └────────────────┘
       │              ┌────────────────┐
       └──────────────│ product_categories (join)
                      └────────────────┘

┌─────────────┐ 1   ∞ ┌────────────────┐ ∞   1 ┌─────────────┐
│   orders    │───────│  order_items   │───────│  products   │
└──────┬──────┘       └────────────────┘       └─────────────┘
       │ 1
       ▼ ∞
┌─────────────┐
│order_status_│
│   events    │
└─────────────┘

┌──────────────────┐
│  email_outbox    │  (async email queue)
└──────────────────┘

┌──────────────────┐
│ contact_messages │
└──────────────────┘

┌──────────────────┐
│     settings     │  (key-value site config)
└──────────────────┘
```

## 3. Tables

### 3.1 `profiles`
Admin / staff profile. Linked to `auth.users` via `id`.

```sql
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text unique not null,
  full_name    text,
  role         text not null default 'admin'
                check (role in ('super_admin','admin','staff','viewer')),
  avatar_url   text,
  is_active    boolean not null default true,
  last_login_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on profiles(role);
```

### 3.2 `categories`
```sql
create table categories (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  description  text,
  parent_id    uuid references categories(id) on delete set null,
  image_url    text,
  sort_order   integer not null default 0,
  is_active    boolean not null default true,
  seo_title    text,
  seo_description text,
  translations jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
create index on categories(slug);
create index on categories(parent_id);
create index on categories(is_active) where deleted_at is null;
```

### 3.3 `products`
```sql
create table products (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  sku             text unique,
  name            text not null,
  short_description text,
  description     text,
  specifications  jsonb not null default '{}'::jsonb,
  price           numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price >= 0),
  currency        text not null default 'USD',
  stock_quantity  integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 5,
  status          text not null default 'draft'
                  check (status in ('draft','active','archived')),
  brand           text,
  tags            text[] not null default '{}',
  seo_title       text,
  seo_description text,
  translations    jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index on products(slug);
create index on products(status) where deleted_at is null;
create index on products using gin(tags);
create index on products using gin(to_tsvector('english', name || ' ' || coalesce(description,'')));
```

### 3.4 `product_images`
```sql
create table product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  storage_path text not null,
  alt_text    text,
  sort_order  integer not null default 0,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);
create index on product_images(product_id, sort_order);
create unique index one_primary_per_product
  on product_images(product_id) where is_primary;
```

### 3.5 `product_categories` (join)
```sql
create table product_categories (
  product_id   uuid not null references products(id) on delete cascade,
  category_id  uuid not null references categories(id) on delete cascade,
  primary key (product_id, category_id)
);
create index on product_categories(category_id);
```

### 3.6 `orders`
```sql
create table orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text unique not null,             -- human-friendly: ORD-2026-000123
  idempotency_key text unique,                       -- prevents double-submission
  status          text not null default 'pending'
                  check (status in ('pending','confirmed','processing','out_for_delivery','delivered','cancelled','failed')),
  customer_name   text not null,
  customer_email  text not null,
  customer_phone  text not null,
  delivery_address jsonb not null,                   -- {street, city, region, postal, country, notes}
  subtotal        numeric(12,2) not null,
  shipping_fee    numeric(12,2) not null default 0,
  tax             numeric(12,2) not null default 0,
  total           numeric(12,2) not null,
  currency        text not null default 'USD',
  payment_method  text not null default 'cod',
  customer_notes  text,
  internal_notes  text,                              -- admin-only
  locale          text not null default 'en',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  cancelled_at    timestamptz,
  delivered_at    timestamptz
);
create index on orders(status);
create index on orders(customer_email);
create index on orders(customer_phone);
create index on orders(created_at desc);
```

### 3.7 `order_items`
```sql
create table order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references orders(id) on delete cascade,
  product_id      uuid references products(id) on delete restrict,
  -- Snapshot fields so historical orders never break if product changes:
  product_name    text not null,
  product_sku     text,
  product_image   text,
  unit_price      numeric(12,2) not null,
  quantity        integer not null check (quantity > 0),
  line_total      numeric(12,2) not null,
  created_at      timestamptz not null default now()
);
create index on order_items(order_id);
create index on order_items(product_id);
```

### 3.8 `order_status_events`
Audit trail of every status change.
```sql
create table order_status_events (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  from_status text,
  to_status   text not null,
  note        text,
  changed_by  uuid references profiles(id),
  created_at  timestamptz not null default now()
);
create index on order_status_events(order_id, created_at desc);
```

### 3.9 `email_outbox`
Async email queue (used from Phase 2 onward, but exists from Phase 1 for forward-compatibility).
```sql
create table email_outbox (
  id           uuid primary key default gen_random_uuid(),
  to_email     text not null,
  template     text not null,             -- 'order_placed', 'order_confirmed', ...
  payload      jsonb not null,
  locale       text not null default 'en',
  status       text not null default 'pending'
               check (status in ('pending','sent','failed')),
  attempts     integer not null default 0,
  last_error   text,
  sent_at      timestamptz,
  created_at   timestamptz not null default now()
);
create index on email_outbox(status, created_at);
```

### 3.10 `contact_messages`
```sql
create table contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text,
  message     text not null,
  status      text not null default 'new'
              check (status in ('new','read','archived','spam')),
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index on contact_messages(status, created_at desc);
```

### 3.11 `settings`
Key-value store for site configuration.
```sql
create table settings (
  key         text primary key,
  value       jsonb not null,
  updated_by  uuid references profiles(id),
  updated_at  timestamptz not null default now()
);
```

Seed keys:
- `business_info` (name, address, phone, email, hours)
- `enabled_locales` (`["en"]` at launch)
- `shipping_config` (zones, fees)
- `tax_config` (rate)
- `maintenance_mode` (bool)
- `low_stock_threshold_default`

### 3.12 `audit_logs`
```sql
create table audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references profiles(id),
  action      text not null,             -- 'product.created', 'order.status_changed'
  resource    text not null,             -- 'product', 'order'
  resource_id uuid,
  diff        jsonb,
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index on audit_logs(resource, resource_id);
create index on audit_logs(actor_id, created_at desc);
```

### 3.13 `feature_flags`
```sql
create table feature_flags (
  key         text primary key,
  enabled     boolean not null default false,
  rollout_pct integer not null default 0 check (rollout_pct between 0 and 100),
  metadata    jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
```

## 4. Triggers

### 4.1 `updated_at` auto-update
```sql
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- Apply to every table with updated_at:
create trigger trg_set_updated_at before update on products
for each row execute function set_updated_at();
-- Repeat for: categories, orders, profiles, settings, etc.
```

### 4.2 Order number generation
```sql
create sequence orders_seq;
create or replace function gen_order_number()
returns trigger language plpgsql as $$
begin
  new.order_number = 'ORD-' || to_char(now(),'YYYY') || '-' || lpad(nextval('orders_seq')::text, 6, '0');
  return new;
end $$;
create trigger trg_orders_number before insert on orders
for each row when (new.order_number is null) execute function gen_order_number();
```

### 4.3 Order status event log
```sql
create or replace function log_order_status_change()
returns trigger language plpgsql as $$
begin
  if (old.status is distinct from new.status) then
    insert into order_status_events(order_id, from_status, to_status)
    values (new.id, old.status, new.status);
  end if;
  return new;
end $$;
create trigger trg_order_status_log after update on orders
for each row execute function log_order_status_change();
```

## 5. Stored Procedure: Atomic Order Placement

```sql
create or replace function place_order(p_input jsonb)
returns uuid
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_product products%rowtype;
  v_subtotal numeric(12,2) := 0;
  v_line_total numeric(12,2);
begin
  -- Insert order with placeholder totals
  insert into orders (customer_name, customer_email, customer_phone, delivery_address,
                      customer_notes, idempotency_key, locale, subtotal, total)
  values (p_input->>'name', p_input->>'email', p_input->>'phone',
          p_input->'address', p_input->>'notes',
          p_input->>'idempotencyKey', coalesce(p_input->>'locale','en'),
          0, 0)
  returning id into v_order_id;

  -- Process each item with row lock
  for v_item in select * from jsonb_array_elements(p_input->'items') loop
    select * into v_product from products
      where id = (v_item->>'productId')::uuid
      for update;

    if not found then raise exception 'PRODUCT_NOT_FOUND'; end if;
    if v_product.stock_quantity < (v_item->>'quantity')::int then
      raise exception 'INSUFFICIENT_STOCK';
    end if;

    v_line_total := v_product.price * (v_item->>'quantity')::int;
    v_subtotal := v_subtotal + v_line_total;

    insert into order_items (order_id, product_id, product_name, product_sku,
                              unit_price, quantity, line_total)
    values (v_order_id, v_product.id, v_product.name, v_product.sku,
            v_product.price, (v_item->>'quantity')::int, v_line_total);

    update products set stock_quantity = stock_quantity - (v_item->>'quantity')::int
      where id = v_product.id;
  end loop;

  update orders set subtotal = v_subtotal, total = v_subtotal where id = v_order_id;
  return v_order_id;
end $$;
```

## 6. Row-Level Security (RLS) Policies

### 6.1 Public read for active products + categories
```sql
alter table products enable row level security;
create policy "Public can read active products" on products
  for select using (status = 'active' and deleted_at is null);

alter table categories enable row level security;
create policy "Public can read active categories" on categories
  for select using (is_active and deleted_at is null);

alter table product_images enable row level security;
create policy "Public can read product images" on product_images
  for select using (true);
```

### 6.2 Orders — only owner-via-service-role write, never publicly readable
```sql
alter table orders enable row level security;
-- No public policies. Only the service role (via Server Action / RPC) writes/reads.
```

### 6.3 Admin access
Admin endpoints use the **service role key** (server-side only) which bypasses RLS. For consistency, also create admin policies in case we ever use the anon key with an authenticated admin session:

```sql
create policy "Admins can do everything on products" on products
  for all to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role in ('super_admin','admin')))
  with check (exists (select 1 from profiles where id = auth.uid() and role in ('super_admin','admin')));
-- Repeat for orders, categories, etc.
```

## 7. Indexes Summary

| Table | Indexes |
|---|---|
| products | slug, status (partial), tags (gin), full-text (gin) |
| categories | slug, parent_id, is_active (partial) |
| orders | status, customer_email, customer_phone, created_at desc |
| order_items | order_id, product_id |
| order_status_events | order_id + created_at |
| email_outbox | status + created_at |
| audit_logs | resource + resource_id, actor_id + created_at |

## 8. Migration Workflow

- Migrations live in `supabase/migrations/`
- Naming: `YYYYMMDDHHMMSS_description.sql`
- Always reversible where possible (write a `down` migration in a comment)
- Apply via `supabase db push` or CI pipeline
- Never edit a migration once merged; create a new one instead

## 9. Seed Data

`supabase/seed.sql` provides:
- 5 sample categories
- 20 sample products
- Default `settings` rows
- 1 super_admin profile (linked to env-provided email)

## 10. Backup Policy

- Supabase daily backups enabled
- Point-in-time recovery on Pro plan
- Manual SQL dump weekly into encrypted S3 (Phase 2)
