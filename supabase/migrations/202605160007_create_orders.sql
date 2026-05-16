create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  idempotency_key text unique,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled', 'failed')),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_address jsonb not null,
  subtotal numeric(12, 2) not null,
  shipping_fee numeric(12, 2) not null default 0,
  tax numeric(12, 2) not null default 0,
  total numeric(12, 2) not null,
  currency text not null default 'USD',
  payment_method text not null default 'cod',
  customer_notes text,
  internal_notes text,
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  delivered_at timestamptz
);

create index orders_status_idx on public.orders(status);
create index orders_customer_email_idx on public.orders(customer_email);
create index orders_customer_phone_idx on public.orders(customer_phone);
create index orders_created_at_idx on public.orders(created_at desc);
