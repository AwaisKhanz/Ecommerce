create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'archived', 'spam')),
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index contact_messages_status_created_idx on public.contact_messages(status, created_at desc);
