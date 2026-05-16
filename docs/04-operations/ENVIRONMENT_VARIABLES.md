# 04 · ENVIRONMENT VARIABLES

## 1. Philosophy

- Every secret and environment-dependent value lives in env vars
- Never commit secrets to git
- Every env var is typed and validated at boot via Zod
- Boot fails loudly if a required var is missing or malformed
- Public client-side vars must be prefixed with `NEXT_PUBLIC_`

## 2. The Master List

### 2.1 Application

| Name                           | Required | Example                      | Scope         |
| ------------------------------ | -------- | ---------------------------- | ------------- |
| `NODE_ENV`                     | yes      | `production`                 | server        |
| `NEXT_PUBLIC_APP_URL`          | yes      | `https://industrialshop.com` | client/server |
| `NEXT_PUBLIC_APP_NAME`         | yes      | `IndustrialShop`             | client/server |
| `NEXT_PUBLIC_DEFAULT_LOCALE`   | yes      | `en`                         | client/server |
| `NEXT_PUBLIC_ENABLED_LOCALES`  | yes      | `en,ar`                      | client/server |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | yes      | `USD`                        | client/server |

### 2.2 Supabase

| Name                            | Required | Example                   | Scope                        |
| ------------------------------- | -------- | ------------------------- | ---------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | yes      | `https://xxx.supabase.co` | client/server                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes      | `eyJhbGciOi...`           | client/server                |
| `SUPABASE_SERVICE_ROLE_KEY`     | yes      | `eyJhbGciOi...`           | **server only**              |
| `SUPABASE_DB_URL`               | optional | `postgres://...`          | server only — for migrations |

### 2.3 App-owned signing

| Name                                | Required      | Example | Scope       |
| ----------------------------------- | ------------- | ------- | ----------- |
| `ORDER_CONFIRMATION_SIGNING_SECRET` | yes (Phase 3) | `...`   | server only |

### 2.4 Email (Resend)

| Name                    | Required      | Example                     |
| ----------------------- | ------------- | --------------------------- |
| `RESEND_API_KEY`        | yes           | `re_...`                    |
| `RESEND_FROM_EMAIL`     | yes           | `orders@industrialshop.com` |
| `RESEND_FROM_NAME`      | yes           | `IndustrialShop`            |
| `RESEND_WEBHOOK_SECRET` | yes (Phase 2) | `whsec_...`                 |
| `ADMIN_NOTIFY_EMAIL`    | yes           | `owner@industrialshop.com`  |

### 2.5 Analytics & Monitoring

| Name                              | Required   | Example                     |
| --------------------------------- | ---------- | --------------------------- |
| `SENTRY_DSN`                      | yes (prod) | `https://...@sentry.io/...` |
| `SENTRY_AUTH_TOKEN`               | CI only    | `...`                       |
| `SENTRY_ORG`                      | CI only    | `industrialshop`            |
| `SENTRY_PROJECT`                  | CI only    | `web`                       |
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` | optional   | auto-set on Vercel          |

### 2.6 Rate Limiting (Upstash Redis)

| Name                       | Required   | Example                 |
| -------------------------- | ---------- | ----------------------- |
| `UPSTASH_REDIS_REST_URL`   | yes (prod) | `https://...upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | yes (prod) | `...`                   |

Optional in dev; falls back to in-memory limiter.

### 2.7 Admin Bootstrap

| Name                       | Required | Example             |
| -------------------------- | -------- | ------------------- |
| `BOOTSTRAP_ADMIN_EMAIL`    | one-time | `owner@example.com` |
| `BOOTSTRAP_ADMIN_PASSWORD` | one-time | (long random)       |

Used only by the one-off `pnpm run admin:create` script.

### 2.8 Build / Deploy

| Name                    | Set by      |
| ----------------------- | ----------- |
| `VERCEL_ENV`            | Vercel auto |
| `VERCEL_GIT_COMMIT_SHA` | Vercel auto |
| `SENTRY_RELEASE`        | CI          |

## 3. `.env.example`

Committed file. Lists every variable with example values and inline comments. Developers copy to `.env.local`.

```bash
# === App ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=IndustrialShop
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_ENABLED_LOCALES=en
NEXT_PUBLIC_DEFAULT_CURRENCY=USD

# === Supabase ===
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ORDER_CONFIRMATION_SIGNING_SECRET=
SUPABASE_DB_URL=

# === Resend ===
RESEND_API_KEY=
RESEND_FROM_EMAIL=orders@example.com
RESEND_FROM_NAME=IndustrialShop
ADMIN_NOTIFY_EMAIL=owner@example.com

# === Sentry ===
SENTRY_DSN=

# === Upstash Redis ===
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## 4. Typed & Validated Env (`src/lib/env.ts`)

```ts
import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ORDER_CONFIRMATION_SIGNING_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
  RESEND_FROM_NAME: z.string().min(1),
  ADMIN_NOTIFY_EMAIL: z.string().email(),
  SENTRY_DSN: z.string().url().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().min(2),
  NEXT_PUBLIC_ENABLED_LOCALES: z.string().min(2),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().length(3),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const processEnv = typeof window === 'undefined' ? process.env : (window as any).__ENV__;

const parsedClient = clientSchema.safeParse(processEnv);
if (!parsedClient.success) {
  console.error('❌ Invalid public env:', parsedClient.error.flatten().fieldErrors);
  throw new Error('Invalid public env');
}

let parsedServer: z.infer<typeof serverSchema> | undefined;
if (typeof window === 'undefined') {
  const r = serverSchema.safeParse(processEnv);
  if (!r.success) {
    console.error('❌ Invalid server env:', r.error.flatten().fieldErrors);
    throw new Error('Invalid server env');
  }
  parsedServer = r.data;
}

export const env = { ...parsedClient.data, ...(parsedServer ?? {}) } as z.infer<
  typeof clientSchema
> &
  Partial<z.infer<typeof serverSchema>>;
```

## 5. Environment Files

| File               | Purpose                      | Committed?             |
| ------------------ | ---------------------------- | ---------------------- |
| `.env.example`     | Reference; placeholders only | ✅                     |
| `.env.local`       | Local dev secrets            | ❌ (gitignored)        |
| `.env.test`        | Test env                     | ❌                     |
| `.env.production`  | Production                   | ❌ (managed by Vercel) |
| Vercel Project Env | Production & preview         | UI only                |

## 6. Per-Environment Values

| Var                   | Local                   | Preview                | Production                   |
| --------------------- | ----------------------- | ---------------------- | ---------------------------- |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://*.vercel.app` | `https://industrialshop.com` |
| `NODE_ENV`            | development             | production             | production                   |
| Supabase              | local project           | staging project        | production project           |
| Resend                | sandbox key             | sandbox key            | live key                     |
| Sentry                | disabled                | enabled (separate env) | enabled                      |

## 7. Secret Rotation Policy

| Secret                            | Rotation                      |
| --------------------------------- | ----------------------------- |
| Supabase service role key         | Quarterly + on suspected leak |
| Order confirmation signing secret | Annually + on suspected leak  |
| Resend API key                    | Quarterly                     |
| Admin passwords                   | Quarterly                     |
| Sentry DSN                        | Annually                      |

After rotation, update Vercel env, redeploy, and revoke old key.

## 8. Common Pitfalls

- ❌ Importing `process.env.X` directly — always use `env.X`
- ❌ Using `NEXT_PUBLIC_` prefix for a secret (it gets bundled to client!)
- ❌ Forgetting to add a new var to `.env.example` and Vercel
- ❌ Using different names in `.env.example` vs code

## 9. Onboarding Checklist for New Developer

- [ ] Copy `.env.example` → `.env.local`
- [ ] Get Supabase URL + anon key from team lead
- [ ] Get a personal Resend sandbox API key
- [ ] Run `pnpm install`
- [ ] Run `pnpm db:types` (regenerate types)
- [ ] Run `pnpm dev` — boot will throw if env is missing
