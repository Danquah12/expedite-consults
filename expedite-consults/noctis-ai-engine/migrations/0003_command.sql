-- VibeTok Desk command center: holds, cases, flags. Staff actions stay audited.

create table if not exists account_hold (
  user_id text primary key,
  status text not null check (status in ('active', 'verified', 'suspended', 'locked', 'disabled')),
  reason text,
  duration text,
  evidence text,
  actor_id text,
  created_at timestamptz not null default now()
);

create table if not exists safety_case (
  id serial primary key,
  case_no text not null unique,
  category text not null,
  priority text not null check (priority in ('urgent', 'high', 'normal', 'low')),
  status text not null check (status in ('open', 'review', 'actioned', 'appeal', 'closed')),
  target_kind text not null check (target_kind in ('user', 'post', 'listing', 'job', 'message')),
  target_id text not null,
  reason text not null,
  ai_score int,
  reports int not null default 1,
  assigned text,
  evidence text,
  actor_id text,
  created_at timestamptz not null default now()
);
create index if not exists safety_case_status_idx on safety_case (status);
create index if not exists safety_case_category_idx on safety_case (category);

create table if not exists feature_flag (
  key text primary key,
  label text not null,
  state text not null check (state in ('on', 'off', 'beta')),
  pct int not null default 100
);

insert into feature_flag (key, label, state, pct) values
  ('reels', 'Reels', 'on', 100),
  ('music', 'Music hall', 'on', 100),
  ('jobs', 'Openings / jobs', 'on', 100),
  ('ledger', 'Hall ledger ingest', 'on', 100),
  ('tutor', 'AI tutor', 'on', 100),
  ('live', 'Live streaming', 'off', 0),
  ('verify', 'Professional verify', 'beta', 25),
  ('ads', 'Advertising', 'off', 0),
  ('bazaar', 'Bazaar marketplace', 'off', 0),
  ('eats', 'Bazaar Eats', 'off', 0)
on conflict (key) do nothing;

create table if not exists platform_setting (
  key text primary key,
  value text not null
);

insert into platform_setting (key, value) values
  ('registration', 'open'),
  ('mfa_members', 'optional'),
  ('mfa_staff', 'required'),
  ('upload_mb', '250'),
  ('comment_hold', 'off')
on conflict (key) do nothing;
