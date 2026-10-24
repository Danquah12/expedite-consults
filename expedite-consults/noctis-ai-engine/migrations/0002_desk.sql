-- Admin desk, MFA, moderation, durable ledger. Per-user rows use TEXT user_id.

create table if not exists staff (
  user_id text primary key,
  role text not null check (role in ('owner', 'editor', 'moderator')),
  name text,
  email text,
  totp_secret text,
  totp_on boolean not null default false,
  mfa_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists user_mfa (
  user_id text primary key,
  totp_secret text,
  totp_on boolean not null default false,
  mfa_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists content_mod (
  id serial primary key,
  post_id text not null,
  youtube_id text,
  status text not null check (status in ('pin', 'hide', 'feature')),
  note text,
  actor_id text not null,
  created_at timestamptz not null default now()
);
create index if not exists content_mod_post_idx on content_mod (post_id);
create index if not exists content_mod_status_idx on content_mod (status);

create table if not exists admin_audit (
  id serial primary key,
  actor_id text not null,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);
create index if not exists admin_audit_created_idx on admin_audit (created_at desc);

create table if not exists ingest_log (
  id serial primary key,
  slot int not null,
  post_id text not null,
  youtube_id text not null,
  title text not null,
  house text,
  desk text,
  pulled_at timestamptz not null default now()
);
create index if not exists ingest_log_pulled_idx on ingest_log (pulled_at desc);
create index if not exists ingest_log_slot_idx on ingest_log (slot);
