-- Append-only record of what a signed-in member did. Operators read it from Desk.
-- No passwords, tokens, or phone numbers.

create table if not exists activity_log (
  id bigserial primary key,
  user_id text not null,
  action text not null,
  target text,
  detail text,
  surface text,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_created_idx on activity_log (created_at desc);
create index if not exists activity_log_user_idx on activity_log (user_id, created_at desc);
create index if not exists activity_log_action_idx on activity_log (action, created_at desc);
