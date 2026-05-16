create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_active
      and role in ('super_admin', 'admin')
  );
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_categories enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_events enable row level security;
alter table public.email_outbox enable row level security;
alter table public.contact_messages enable row level security;
alter table public.settings enable row level security;
alter table public.audit_logs enable row level security;
alter table public.feature_flags enable row level security;

create policy "Public can read active categories" on public.categories
for select using (is_active and deleted_at is null);
create policy "Public can read active products" on public.products
for select using (status = 'active' and deleted_at is null);
create policy "Public can read product images" on public.product_images
for select using (true);
create policy "Public can read product categories" on public.product_categories
for select using (
  exists (
    select 1
    from public.products
    where products.id = product_categories.product_id
      and products.status = 'active'
      and products.deleted_at is null
  )
);

create policy "Admins can manage profiles" on public.profiles
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage categories" on public.categories
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage products" on public.products
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage product images" on public.product_images
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage product categories" on public.product_categories
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage orders" on public.orders
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage order items" on public.order_items
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage order status events" on public.order_status_events
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage email outbox" on public.email_outbox
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage contact messages" on public.contact_messages
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage settings" on public.settings
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage audit logs" on public.audit_logs
for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage feature flags" on public.feature_flags
for all to authenticated using (public.is_admin()) with check (public.is_admin());
