import { cache } from 'react';

import { FEATURE_FLAGS, type FeatureFlagKey } from '@/config/feature-flags';
import { adminSupabase } from '@/lib/supabase/admin';

export type FeatureFlags = Record<FeatureFlagKey, boolean>;

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

export const getAllFlags = cache(async (): Promise<FeatureFlags> => {
  const keys = Object.keys(FEATURE_FLAGS) as FeatureFlagKey[];
  const { data } = await adminSupabase
    .from('feature_flags')
    .select('key, enabled, rollout_pct')
    .in('key', keys);

  const runtimeFlags = new Map(
    (data ?? []).map((flag) => [
      flag.key as FeatureFlagKey,
      flag.enabled && flag.rollout_pct >= 100,
    ]),
  );
  const entries = keys.map((key) => [key, runtimeFlags.get(key) ?? FEATURE_FLAGS[key].default]);

  return Object.fromEntries(entries) as FeatureFlags;
});
