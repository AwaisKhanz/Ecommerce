create table public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  rollout_pct integer not null default 0 check (rollout_pct between 0 and 100),
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
