# 03 · FEATURE FLAGS

## 1. Why Feature Flags

Feature flags let us:
- Ship code to production behind an off switch
- A/B test risky changes
- Gradually roll out features by percentage
- Kill a misbehaving feature instantly without a deploy
- Decouple deploy from release

For a small e-commerce build this is overkill on day 1, but the **infrastructure** must exist from day 1 so we never have to retrofit it.

## 2. Sources of Truth

Two tiers:

| Tier | Source | Use |
|---|---|---|
| **Build-time flags** | `src/config/feature-flags.ts` constants | Permanent toggles bound to the deployed build (e.g., "online_payments_enabled") |
| **Runtime flags** | `feature_flags` table in Postgres | Toggleable without redeploy; supports % rollout and metadata |

Runtime flags **override** build-time defaults.

## 3. Flag Registry

```ts
// src/config/feature-flags.ts
export const FEATURE_FLAGS = {
  ONLINE_PAYMENTS:        { default: false, description: 'Enable Stripe checkout' },
  CUSTOMER_ACCOUNTS:      { default: false, description: 'Enable customer login/signup' },
  REVIEWS:                { default: false, description: 'Enable product reviews' },
  WISHLIST:               { default: false, description: 'Enable wishlist' },
  COUPONS:                { default: false, description: 'Enable discount codes' },
  MULTILANG_AR:           { default: false, description: 'Enable Arabic locale UI' },
  ADMIN_AUDIT_DIFF_VIEW:  { default: true,  description: 'Show before/after diff in audit log' },
  CHAT_WIDGET:            { default: false, description: 'Show live chat widget' },
  MAINTENANCE_MODE:       { default: false, description: 'Show maintenance page to non-admins' },
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;
```

## 4. Reading Flags

### 4.1 Server-side

```ts
// src/lib/flags/index.ts
import { cache } from 'react';
import { adminSupabase } from '@/lib/supabase/admin';
import { FEATURE_FLAGS, type FeatureFlagKey } from '@/config/feature-flags';

export const getFlag = cache(async (key: FeatureFlagKey): Promise<boolean> => {
  const { data } = await adminSupabase
    .from('feature_flags')
    .select('enabled, rollout_pct')
    .eq('key', key)
    .single();

  if (!data) return FEATURE_FLAGS[key].default;
  if (!data.enabled) return false;
  if (data.rollout_pct >= 100) return true;
  if (data.rollout_pct <= 0) return false;
  // For % rollout, hash an identifier (user id, session id, IP) into a 0–99 bucket
  return rolloutBucket() < data.rollout_pct;
});

export const getAllFlags = cache(async (): Promise<Record<FeatureFlagKey, boolean>> => {
  // Single query → object
});
```

### 4.2 Client-side

A `<FlagsProvider />` (RSC) fetches flags once per request and passes them via React context:

```tsx
// src/lib/flags/provider.tsx
import { getAllFlags } from '@/lib/flags';
import { FlagsClientProvider } from './client-provider';

export async function FlagsProvider({ children }: { children: React.ReactNode }) {
  const flags = await getAllFlags();
  return <FlagsClientProvider flags={flags}>{children}</FlagsClientProvider>;
}
```

```tsx
// client hook
'use client';
import { useFlags } from '@/lib/flags/client-provider';

export function ChatWidget() {
  const flags = useFlags();
  if (!flags.CHAT_WIDGET) return null;
  return <RealChatWidget />;
}
```

## 5. Conditional Code Patterns

### 5.1 Wrap components

```tsx
<FlagGate flag="REVIEWS">
  <ProductReviews productId={p.id} />
</FlagGate>
```

### 5.2 Wrap routes

```tsx
// src/app/(shop)/wishlist/page.tsx
import { getFlag } from '@/lib/flags';
import { notFound } from 'next/navigation';

export default async function WishlistPage() {
  if (!(await getFlag('WISHLIST'))) notFound();
  return <Wishlist />;
}
```

### 5.3 Server Action gating

```ts
if (!(await getFlag('COUPONS'))) {
  return fail('FORBIDDEN', 'Coupons are not enabled.');
}
```

## 6. Admin UI for Flags

`/admin/settings/feature-flags`:
- List all flags with current state
- Toggle `enabled`
- Adjust `rollout_pct` (slider 0–100)
- Edit `metadata` JSON
- Last-updated by + at
- Audit logged

## 7. Rollout Strategy

| Stage | Action |
|---|---|
| Code merged | Flag is OFF in `feature_flags` |
| Internal QA | Enable for admin IPs only via metadata `{ allowIps: [...] }` |
| Canary | Set `rollout_pct = 5` |
| Ramp | 5 → 25 → 50 → 100 over a week |
| Stable | Remove `FlagGate` wrappers in a cleanup PR after 30 days |
| Retired | Delete flag row + constant in a follow-up PR |

## 8. Naming Convention

`SCREAMING_SNAKE` keys. Verbs/state in the name:
- `<NOUN>_<STATE>` (e.g., `REVIEWS_ENABLED`)
- Avoid negatives like `DISABLE_X` — confusing inversions.

## 9. Anti-Patterns

❌ Don't use feature flags for permissions (use roles)
❌ Don't use feature flags for config (use settings)
❌ Don't ship a flag with no cleanup ticket
❌ Don't read flags inside hot loops — read once per request

## 10. Testing With Flags

Vitest provides a `withFlags(...)` helper that monkey-patches `getFlag` for the test scope. Playwright sets flags via `/api/admin/settings/feature-flags` before runs and reverts after.

## 11. Future: Third-Party Flag Provider

Architecturally, our `getFlag()` is the abstraction. If we ever switch to Vercel Edge Config, PostHog, or LaunchDarkly, only the implementation behind `getFlag` changes — call sites stay identical.
