import { cache } from 'react';

import { FEATURE_FLAGS, type FeatureFlagKey } from '@/config/feature-flags';
import { adminSupabase } from '@/lib/supabase/admin';

export const getFlag = cache(async (key: FeatureFlagKey): Promise<boolean> => {
  const { data } = await adminSupabase
    .from('feature_flags')
    .select('enabled, rollout_pct')
    .eq('key', key)
    .maybeSingle();

  if (!data) return FEATURE_FLAGS[key].default;
  if (!data.enabled) return false;
  return data.rollout_pct >= 100;
});

export const getAllFlags = cache(async (): Promise<Record<FeatureFlagKey, boolean>> => {
  const entries = await Promise.all(
    (Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]).map(async (key) => [key, await getFlag(key)]),
  );

  return Object.fromEntries(entries) as Record<FeatureFlagKey, boolean>;
});
