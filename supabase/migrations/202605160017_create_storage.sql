insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('category-images', 'category-images', true, 4194304, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('site-assets', 'site-assets', true, 8388608, null),
  ('admin-uploads', 'admin-uploads', false, 16777216, null),
  ('email-assets', 'email-assets', true, 2097152, null)
on conflict (id) do nothing;

create policy "Public can read product images bucket" on storage.objects
for select using (bucket_id = 'product-images');
create policy "Public can read category images bucket" on storage.objects
for select using (bucket_id = 'category-images');
create policy "Public can read site assets bucket" on storage.objects
for select using (bucket_id = 'site-assets');
create policy "Public can read email assets bucket" on storage.objects
for select using (bucket_id = 'email-assets');

create policy "Admins can upload managed assets" on storage.objects
for insert to authenticated
with check (
  bucket_id in ('product-images', 'category-images', 'site-assets', 'admin-uploads', 'email-assets')
  and public.is_admin()
);

create policy "Admins can update managed assets" on storage.objects
for update to authenticated
using (
  bucket_id in ('product-images', 'category-images', 'site-assets', 'admin-uploads', 'email-assets')
  and public.is_admin()
)
with check (
  bucket_id in ('product-images', 'category-images', 'site-assets', 'admin-uploads', 'email-assets')
  and public.is_admin()
);

create policy "Admins can delete managed assets" on storage.objects
for delete to authenticated
using (
  bucket_id in ('product-images', 'category-images', 'site-assets', 'admin-uploads', 'email-assets')
  and public.is_admin()
);
