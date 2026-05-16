create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger trg_categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger trg_products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();
create trigger trg_orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();
create trigger trg_settings_set_updated_at before update on public.settings
for each row execute function public.set_updated_at();
create trigger trg_feature_flags_set_updated_at before update on public.feature_flags
for each row execute function public.set_updated_at();

create sequence public.orders_seq;

create or replace function public.gen_order_number()
returns trigger
language plpgsql
as $$
begin
  new.order_number = 'ORD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.orders_seq')::text, 6, '0');
  return new;
end;
$$;

create trigger trg_orders_number before insert on public.orders
for each row when (new.order_number is null) execute function public.gen_order_number();

create or replace function public.log_order_status_change()
returns trigger
language plpgsql
as $$
begin
  if old.status is distinct from new.status then
    insert into public.order_status_events(order_id, from_status, to_status)
    values (new.id, old.status, new.status);
  end if;
  return new;
end;
$$;

create trigger trg_order_status_log after update on public.orders
for each row execute function public.log_order_status_change();

create or replace function public.place_order(p_input jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_product public.products%rowtype;
  v_subtotal numeric(12, 2) := 0;
  v_line_total numeric(12, 2);
begin
  insert into public.orders (
    order_number,
    customer_name,
    customer_email,
    customer_phone,
    delivery_address,
    customer_notes,
    idempotency_key,
    locale,
    subtotal,
    total
  )
  values (
    null,
    p_input->>'name',
    p_input->>'email',
    p_input->>'phone',
    p_input->'address',
    p_input->>'notes',
    p_input->>'idempotencyKey',
    coalesce(p_input->>'locale', 'en'),
    0,
    0
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_input->'items') loop
    select * into v_product
    from public.products
    where id = (v_item->>'productId')::uuid
      and deleted_at is null
      and status = 'active'
    for update;

    if not found then
      raise exception 'PRODUCT_NOT_FOUND';
    end if;

    if v_product.stock_quantity < (v_item->>'quantity')::int then
      raise exception 'INSUFFICIENT_STOCK';
    end if;

    v_line_total := v_product.price * (v_item->>'quantity')::int;
    v_subtotal := v_subtotal + v_line_total;

    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      product_sku,
      unit_price,
      quantity,
      line_total
    )
    values (
      v_order_id,
      v_product.id,
      v_product.name,
      v_product.sku,
      v_product.price,
      (v_item->>'quantity')::int,
      v_line_total
    );

    update public.products
    set stock_quantity = stock_quantity - (v_item->>'quantity')::int
    where id = v_product.id;
  end loop;

  update public.orders
  set subtotal = v_subtotal,
      total = v_subtotal
  where id = v_order_id;

  return v_order_id;
end;
$$;
