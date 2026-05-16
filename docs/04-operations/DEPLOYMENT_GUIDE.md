# 04 · DEPLOYMENT GUIDE

## 1. Environments

| Env | Purpose | URL | Branch |
|---|---|---|---|
| **Local** | Developer machines | `http://localhost:3000` | any |
| **Preview** | Per-PR auto-deploys | `https://industrial-shop-pr-<n>.vercel.app` | feature branches |
| **Staging** | Pre-prod testing | `https://staging.industrialshop.com` | `develop` |
| **Production** | Live | `https://industrialshop.com` | `main` |

Each non-local environment has its own Supabase project + Resend key (staging uses sandbox keys).

## 2. Hosting Choice

**Vercel** for the Next.js app:
- Zero-config Next.js builds
- Preview deployments per PR
- Edge network + image optimization
- Built-in cron jobs (Vercel Cron) for Phase 2 outbox
- Generous free tier; Pro for SLA

**Supabase Cloud** for DB / Storage / Auth.

## 3. First-Time Setup

### 3.1 Create Vercel project

1. Connect the GitHub repo to Vercel.
2. Framework: **Next.js** (auto-detected).
3. Build command: `pnpm build`.
4. Install command: `pnpm install --frozen-lockfile`.
5. Node version: 20.x (set in **Project Settings → General**).
6. Region: closest to target customers (e.g., `iad1`, `bom1`).

### 3.2 Configure environment variables

In **Project Settings → Environment Variables**, add every variable from `ENVIRONMENT_VARIABLES.md` for **Production**, **Preview**, and **Development**.

Use Vercel's "secret" tag for service role keys.

### 3.3 Domain setup

1. Add `industrialshop.com` and `www.industrialshop.com` in **Project Settings → Domains**.
2. Configure DNS records as Vercel instructs (typically `A` and `CNAME`).
3. Enable **Auto HTTPS** and **HTTP → HTTPS redirect** and `www` → apex redirect.

### 3.4 Email DNS (Resend)

In your domain DNS:
- `MX` (none needed; Resend is send-only)
- `TXT` SPF: `v=spf1 include:resend.com ~all`
- `TXT` DKIM: provided by Resend
- `TXT` DMARC: `v=DMARC1; p=quarantine; rua=mailto:postmaster@industrialshop.com`

Verify in Resend dashboard.

## 4. Build & Deploy Pipeline

```
PR opened
   │
   ├─► GitHub Actions: lint, typecheck, unit + integration tests
   │
   ├─► Vercel Preview Build → preview URL posted on PR
   │
   └─► Playwright E2E against preview URL
        │
        └─► Lighthouse-CI against preview URL
```

Merging to `main`:
```
main updated
   │
   ├─► GitHub Actions: full CI again
   │
   ├─► Vercel Production Build
   │
   ├─► DB migrations run (manual review-gated; see §6)
   │
   ├─► Sentry release created + sourcemaps uploaded
   │
   └─► Slack notification to #deploys
```

## 5. Vercel Project Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "crons": [
    { "path": "/api/cron/email-outbox-flush", "schedule": "*/5 * * * *" },
    { "path": "/api/cron/purge-temp-uploads", "schedule": "0 3 * * *" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    }
  ]
}
```

CSP is set via `next.config.mjs` with nonces for inline scripts.

## 6. Database Migrations

We use Supabase CLI migrations. They are **not** applied automatically by Vercel.

```
Workflow:
  1. dev: supabase migration new add_xxx
  2. edit SQL
  3. dev: supabase db push (against local)
  4. commit + PR
  5. on PR: review SQL diff manually
  6. on merge to develop: run against staging supabase via CI
  7. on tag release: run against production supabase via manually-triggered GH action
```

```yaml
# .github/workflows/migrate-prod.yml (manually triggered)
name: Migrate Prod DB
on: { workflow_dispatch: }
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase link --project-ref ${{ secrets.SUPABASE_PROD_REF }}
      - run: supabase db push --password "${{ secrets.SUPABASE_DB_PASSWORD }}"
```

Migrations must be **forward-only**, additive when possible. Destructive changes require a 2-phase deploy:
1. Add new column / new behavior; backfill
2. Stop writing old column
3. Drop old column in a later release

## 7. Branching Strategy

- `main` → production
- `develop` → staging
- `feat/*`, `fix/*` → preview deploys

Tags (`v1.0.0`, `v1.0.1`) cut from `main` mark production releases. Tags trigger:
- Sentry release creation
- Changelog generation
- Slack announcement

## 8. Release Process

1. Cut release branch `release/vX.Y.Z` from `develop`
2. Run full QA on staging URL
3. Merge into `main` and tag
4. Vercel auto-deploys to production
5. Trigger DB migration workflow if needed
6. Watch Sentry + Vercel logs for 30 minutes
7. Announce release in Slack

## 9. Rollback Plan

### 9.1 Code rollback
- In Vercel **Deployments** tab → find last good deployment → **Promote to Production**
- Takes < 30 seconds

### 9.2 DB rollback
- Only possible if change was additive (always preferred)
- For destructive changes: restore from point-in-time backup (Supabase Pro)
- Document any destructive change with a rollback script committed beforehand

### 9.3 Feature flag kill switch
- Toggle the relevant flag in `/admin/settings/feature-flags`
- Effect is immediate (cached for at most a few seconds)

## 10. Health Checks

- `GET /api/health` returns `{ ok: true, ts, version }` — used by uptime monitors
- UptimeRobot / Better Stack pings every 60s from 3 regions
- On 2 consecutive failures → email + SMS to on-call

## 11. Monitoring Post-Deploy

After every production deploy:
- Watch Sentry release dashboard for new errors
- Watch Vercel Speed Insights for regressions
- Watch error rate over 30 minutes
- If error rate > 1% above baseline → rollback

## 12. Secrets Management

- Vercel UI for env vars
- GitHub Actions secrets for CI-only values
- Never echo secrets in build logs (`set +x`)
- Rotation: see `ENVIRONMENT_VARIABLES.md §7`

## 13. Cost Awareness

| Service | Free tier | Upgrade trigger |
|---|---|---|
| Vercel | Hobby | First production deploy → Pro |
| Supabase | Free | When DB > 500MB or requests > 50k/day |
| Resend | 100/day | When > 80/day for 3 days |
| Sentry | 5k events/mo | When near limit |
| Upstash | 10k commands/day | When near limit |

Budgets are reviewed quarterly.

## 14. Disaster Recovery

| Scenario | RPO | RTO |
|---|---|---|
| Code regression | 0 | 5 min (Vercel rollback) |
| DB corruption | 1 hour (PITR on Pro) | 30 min |
| Region outage | — | follow Vercel/Supabase incident |
| Domain DNS issue | — | DNS TTL 5 min for fast change |
| Email provider outage | — | failover to backup provider (Phase 2) |

## 15. Production Readiness Checklist

- [ ] All env vars set in Vercel production
- [ ] DNS + HTTPS verified for custom domain
- [ ] Resend domain verified, SPF/DKIM/DMARC green
- [ ] Supabase production project provisioned
- [ ] RLS enabled and tested
- [ ] Migrations applied successfully
- [ ] First admin user created via bootstrap script
- [ ] Sentry receiving events
- [ ] Uptime monitor configured
- [ ] Backups verified (manual download once)
- [ ] Privacy policy + Terms pages live
- [ ] sitemap.xml + robots.txt accessible
- [ ] Lighthouse Performance ≥ 90
- [ ] Accessibility audit passing
- [ ] Post-deploy monitoring runbook shared with team
