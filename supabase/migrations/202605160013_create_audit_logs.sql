create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  resource text not null,
  resource_id uuid,
  diff jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index audit_logs_resource_idx on public.audit_logs(resource, resource_id);
create index audit_logs_actor_created_idx on public.audit_logs(actor_id, created_at desc);
