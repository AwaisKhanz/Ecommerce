# 02 · STORAGE ARCHITECTURE

## 1. Overview

All binary assets (product images, category images, admin uploads) are stored in **Supabase Storage** which serves them through a global CDN.

## 2. Buckets

| Bucket | Visibility | Use |
|---|---|---|
| `product-images` | Public read | Product photos, gallery |
| `category-images` | Public read | Category banners/thumbnails |
| `site-assets` | Public read | Logo, hero images, OG images |
| `admin-uploads` | Private | Temp uploads pre-processing; admin-only |
| `email-assets` | Public read | Images embedded in email templates |

## 3. Folder Conventions

```
product-images/
  {product_id}/
    original/
      {uuid}.{ext}
    thumbnail/   (auto-generated 400px)
    medium/      (auto-generated 800px)
    large/       (auto-generated 1600px)

category-images/
  {category_id}/{uuid}.{ext}

site-assets/
  branding/logo.svg
  branding/favicon.ico
  hero/...
  og/default.png

admin-uploads/
  temp/{user_id}/{uuid}.{ext}    (purged after 24h via cron)
```

## 4. Upload Flow (Admin)

```
Admin UI → React Hook Form
        → /api/admin/uploads/sign  (Route Handler)
        → Returns signed upload URL + path
        → Client uploads directly to Supabase Storage
        → On success, save storage path to DB via product/image API
```

Direct-to-storage uploads avoid double-bandwidth through our server and keep route handlers thin.

## 5. URL Strategy

- Public buckets: use `supabase.storage.from(bucket).getPublicUrl(path)` to produce a CDN URL.
- Private buckets: use signed URLs with appropriate TTL (5 minutes typical).
- All public URLs are passed through `next/image` for resizing + WebP conversion at the edge.

## 6. Image Optimization

| Step | Tool |
|---|---|
| Resize on upload | Supabase Image Transformation (`?width=...&quality=...`) |
| Format negotiation | `next/image` (delivers AVIF / WebP / JPEG by browser) |
| Lazy load | `next/image` default |
| LCP image priority | `priority` prop on hero / product detail main image |
| Blur placeholder | `placeholder="blur"` with base64 fallback |

## 7. File Constraints

| Asset | Max size | Allowed types | Min dims |
|---|---|---|---|
| Product image | 8 MB | jpg, png, webp | 800×800 |
| Category image | 4 MB | jpg, png, webp, svg | 600×400 |
| Logo | 1 MB | svg, png | — |

Enforced in three layers:
1. Client (`accept` + JS check)
2. Server (route handler validates `Content-Length` and MIME)
3. Supabase bucket policy (`file_size_limit`, `allowed_mime_types`)

## 8. Security

- **Public buckets:** read-only via anon key; write-only via authenticated admin requests.
- **Private buckets:** all access via signed URL or server fetch with service role.
- File names are server-generated UUIDs — never trust client-supplied names.
- Strip EXIF metadata on upload (Phase 2) to protect customer-uploaded images, if any.
- Virus scanning out of scope at launch (low-risk: only admin uploads).

## 9. Storage RLS Policies

```sql
-- product-images: public read, admin write
create policy "Public can read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images'
              and exists (select 1 from profiles
                          where id = auth.uid() and role in ('super_admin','admin')));

create policy "Admins can delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images'
         and exists (select 1 from profiles
                     where id = auth.uid() and role in ('super_admin','admin')));
```

## 10. CDN & Caching

- Supabase Storage uses a global CDN.
- Cache-Control: 1 year on hashed asset URLs (immutable).
- Cache-Control: 1 day for category/hero banners.
- `next/image` adds its own cache layer at Vercel edge.

## 11. Cleanup Jobs

| Job | Schedule | Action |
|---|---|---|
| Purge `admin-uploads/temp/*` | Daily | Delete files older than 24h |
| Orphan image cleanup | Weekly | Delete storage files whose `product_images` row was deleted |
| Storage usage report | Weekly | Email admin a digest |

## 12. Scalability Notes

- If asset count explodes (>100k files), shard buckets by year/month.
- Consider moving to Cloudflare R2 + Workers for image transforms if egress costs grow.
- Always reference files by `storage_path` in DB, never by full URL — makes migrations painless.
