# 04 · SUPABASE SETUP

## 1. Project Layout

We use **two Supabase projects**:

| Project | Use | Region |
|---|---|---|
| `industrial-shop-staging` | Develop + staging | nearest to team |
| `industrial-shop-prod` | Production | nearest to customers |

Optionally a third local instance via `supabase start` for fully offline dev.

## 2. Initial Project Setup

1. Sign in at supabase.com → **New Project**.
2. Choose org, plan (Free for staging, Pro for prod), region.
3. Database password: 32+ random characters; store in 1Password.
4. Capture all keys from **Project Settings → API**:
   - Project URL
   - `anon` public key
   - `service_role` secret key
5. Capture JWT secret from **Project Settings → API → JWT Settings**.
6. Add the above to `.env` files / Vercel env per `ENVIRONMENT_VARIABLES.md`.

## 3. Local Development Setup

```bash
# Install CLI
brew install supabase/tap/supabase   # macOS
# or use the install script per OS

# In project root
supabase init                         # one time
supabase login
supabase link --project-ref <STAGING_REF>

# Start local stack (Postgres + Studio + Storage + Auth)
supabase start

# Output gives you local URLs/keys — put in .env.local
```

After local start, run migrations and seed:
```bash
supabase db reset    # applies all migrations + runs seed.sql
```

## 4. Schema Migrations Workflow

```
1. Create migration:
   supabase migration new <description>
2. Edit the generated SQL file under supabase/migrations/.
3. Apply locally:
   supabase db push --local
4. Verify in Studio: http://127.0.0.1:54323
5. Commit and PR.
6. Merge → CI runs migration against staging.
7. Tag release → manually trigger prod migration workflow.
```

Migration file naming: `YYYYMMDDHHMMSS_short_description.sql`.

## 5. Required Database Extensions

```sql
create extension if not exists pgcrypto;        -- gen_random_uuid()
create extension if not exists pg_trgm;          -- fuzzy search
create extension if not exists unaccent;         -- accent-insensitive search
-- Future:
-- create extension if not exists vector;        -- pgvector for recs
```

## 6. Tables, RLS, Triggers, RPC

See `DATABASE_SCHEMA.md` for every table, policy, trigger, and stored procedure.

## 7. Storage Buckets

Create via SQL during migrations:

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images',  'product-images',  true,  8388608,
   array['image/jpeg','image/png','image/webp']),
  ('category-images', 'category-images', true,  4194304,
   array['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('site-assets',     'site-assets',     true,  8388608, null),
  ('admin-uploads',   'admin-uploads',   false, 16777216, null),
  ('email-assets',    'email-assets',    true,  2097152, null)
on conflict (id) do nothing;
```

Then attach RLS policies from `STORAGE_ARCHITECTURE.md §9`.

## 8. Auth Configuration (Supabase Dashboard)

**Authentication → Providers:**
- Email: enabled, **Confirm email**: ON
- Disable signups (admin-only): set **Allow new users to sign up** to OFF
- All other providers off (Phase 1)

**Authentication → URL Configuration:**
- Site URL: `https://industrialshop.com`
- Redirect URLs: `https://*.vercel.app/**`, `https://industrialshop.com/**`, `http://localhost:3000/**`

**Authentication → Email Templates:**
- Override default templates with branded ones (HTML + text)
- Subjects translated per locale (or English at launch)
- Include `{{ .ConfirmationURL }}` etc. per Supabase docs

**Authentication → Rate Limits:**
- Sign-ins: 5 / 15min / IP (built-in)
- Email sends: 4 / hour / IP

**MFA (Phase 2):**
- Enable TOTP

## 9. Typed Database Client

After every migration:

```bash
pnpm db:types
# runs: supabase gen types typescript --linked > src/types/db.generated.ts
```

This produces strict types like `Database['public']['Tables']['products']['Row']`.

Wrap in ergonomic aliases:

```ts
// src/types/db.ts
import type { Database } from './db.generated';

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
// ... for every table
```

## 10. Supabase Clients

```ts
// src/lib/supabase/client.ts (browser)
import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/env';
export const createClient = () =>
  createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

```ts
// src/lib/supabase/server.ts (RSC / Route Handlers)
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { env } from '@/lib/env';

export const createClient = () => {
  const cookieStore = cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (n) => cookieStore.get(n)?.value,
      set: (n, v, o) => cookieStore.set({ name: n, value: v, ...o }),
      remove: (n, o) => cookieStore.set({ name: n, value: '', ...o }),
    },
  });
};
```

```ts
// src/lib/supabase/admin.ts (service role; SERVER ONLY)
import { createClient as createSupa } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export const adminSupabase = createSupa(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});
```

⚠ The admin client is **never** imported from a `'use client'` file or a shared component.

## 11. Seeding

`supabase/seed.sql` provides:
- 5 sample categories with images
- ~20 sample products spread across categories
- Default `settings` rows
- Feature flag defaults

Re-run with `supabase db reset` locally; not used in production.

Initial production admin is created via the **bootstrap script**, not seed:
```bash
pnpm run admin:create -- --email owner@example.com --password "<long random>"
```

## 12. Backup & Recovery

- **Free tier:** daily snapshots, 7-day retention
- **Pro tier:** point-in-time recovery (recommended for prod)
- Manual SQL dumps weekly to encrypted S3 (Phase 2)

Test recovery quarterly by restoring into a scratch project.

## 13. Realtime (Phase 2+)

Architecturally enabled. When activated:
- Admin sees new orders appear without refresh
- Stock levels can update in real time on the shop

Wire via:
```ts
supabase.channel('orders').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, handler).subscribe();
```

## 14. Performance Tuning

- Always select only required columns (`.select('id,name,price')`)
- Use indexes per `DATABASE_SCHEMA.md §7`
- Add `EXPLAIN ANALYZE` to slow queries during dev
- Use Supabase Studio → **Database → Query Performance** to find slow queries

## 15. Security Checklist

- [ ] RLS enabled on **every** table
- [ ] Anon role can only read what's intentionally public
- [ ] Service role key never exposed to client code
- [ ] Storage buckets have explicit policies
- [ ] Auth confirm-email enabled
- [ ] Auth sign-up disabled (Phase 1)
- [ ] Strong DB password rotated quarterly
- [ ] JWT secret rotated annually
- [ ] Vercel + Supabase IP allowlist where possible

## 16. Common Pitfalls

- ❌ Forgetting RLS on a new table → public read by default once enabled? No — RLS denies by default. But if you forget to `enable row level security`, the table is unrestricted.
- ❌ Using `service_role` from the browser (full DB access from a client = breach).
- ❌ Importing types from `db.generated.ts` directly instead of `db.ts` aliases.
- ❌ Mutating data inside a migration's "down" comment without testing.
- ❌ Running `supabase db reset` against staging by accident — always confirm the linked project.
