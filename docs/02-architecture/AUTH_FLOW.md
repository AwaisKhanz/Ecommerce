# 02 · AUTHENTICATION FLOW

## 1. Scope

Authentication in Phase 1 is **admin-only**. Customers are guests and do not log in. The architecture is built so that **customer accounts can be added later without any breaking change**.

## 2. Components

- **Identity provider:** Supabase Auth (email + password)
- **Session storage:** HTTP-only, Secure, SameSite=Lax cookies
- **Client:** `@supabase/ssr` for Next.js App Router cookie syncing
- **MFA:** TOTP-ready (Supabase supports it natively) — enabled in Phase 2

## 3. Roles & Permissions

```
super_admin  → everything
admin        → everything except managing other admins
staff        → orders only (view + status updates)
viewer       → read-only on orders and products
```

`role` lives in the `profiles` table and is the single source of truth.

## 4. Admin Login Flow

```
1. User visits /admin/login
2. Submits email + password
3. Server Action calls supabase.auth.signInWithPassword(...)
4. On success:
   - Supabase sets sb-access-token + sb-refresh-token cookies
   - Server fetches profile row; if missing → create with role='admin' (first-run bootstrap)
   - Updates last_login_at
   - Redirects to /admin/dashboard
5. On failure:
   - Increment failed attempts counter (Redis or DB)
   - Return localized error
```

## 5. Session Management

- Access token TTL: 1 hour
- Refresh token TTL: 7 days, rotating
- Middleware refreshes tokens automatically via `@supabase/ssr`
- Logout clears cookies and revokes refresh token

## 6. Middleware Pattern

```ts
// src/middleware.ts
import { createServerClient } from '@/lib/supabase/middleware';

export async function middleware(req: NextRequest) {
  const { supabase, response } = createServerClient(req);
  const { data: { user } } = await supabase.auth.getUser();

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = req.nextUrl.pathname === '/admin/login';

  if (isAdminRoute && !isLoginRoute && !user) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
```

## 7. Server Guards

```ts
// src/lib/auth/guards.ts
import { createServerClient } from '@/lib/supabase/server';
import { unauthorized, forbidden } from '@/lib/errors';

export async function requireUser() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw unauthorized();
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  const supabase = createServerClient();
  const { data: profile } = await supabase
    .from('profiles').select('role,is_active').eq('id', user.id).single();

  if (!profile?.is_active) throw forbidden();
  if (!['super_admin', 'admin'].includes(profile.role)) throw forbidden();
  return { user, profile };
}

export async function requireRole(roles: readonly string[]) {
  const user = await requireUser();
  const supabase = createServerClient();
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !roles.includes(profile.role)) throw forbidden();
  return { user, profile };
}
```

## 8. Password Policy

- Minimum 10 characters
- Must include 3 of: uppercase, lowercase, digit, symbol
- Checked against haveibeenpwned (Phase 2)
- Server-side validation via Zod schema
- Stored hashed by Supabase (bcrypt)

## 9. Password Reset Flow

```
/admin/forgot-password
  → enter email
  → supabase.auth.resetPasswordForEmail(email, { redirectTo: '/admin/reset-password' })
  → Resend sends localized email with link
  → user clicks → /admin/reset-password
  → enters new password → supabase.auth.updateUser({ password })
  → redirect to /admin/login
```

The reset email is sent by Supabase but uses a **custom template** configured in the Supabase dashboard, branded with our logo.

## 10. First-Run Bootstrap

The very first admin is created via:

```bash
pnpm run admin:create -- --email owner@example.com --password "..."
```

This script:
1. Creates auth user via Supabase admin API
2. Inserts profile row with `role='super_admin'`
3. Sends welcome email

In production this script is run **once** during initial deployment and removed from CI thereafter.

## 11. Brute-Force Protection

- 5 failed login attempts per IP per 15 minutes → 429
- 10 failed attempts on the same account → account temporarily locked for 30 minutes
- All login attempts logged to `audit_logs`

## 12. Audit Logging

Every authentication event is logged:
- `auth.login.success`
- `auth.login.failure`
- `auth.logout`
- `auth.password_reset.requested`
- `auth.password_reset.completed`
- `auth.role.changed`
- `auth.account.locked`

## 13. CSRF

Server Actions are CSRF-protected by Next.js by default (origin checking + encrypted payloads). For our Route Handlers under `/api/admin/*`:
- Require `Origin` header match
- All state-changing requests require auth cookie (SameSite=Lax already blocks cross-site form posts)

## 14. Future: Customer Accounts (Phase 2)

When customer accounts are added:
- Reuse Supabase Auth, but use the **anon role** (not `admin`)
- Add `customers` table (separate from `profiles`) linked via `auth.users.id`
- Add policies: `Customers can read their own orders`
- No code rewrite needed; only new routes + policies
