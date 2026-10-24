-- Staff session for Desk. Survives a VibeTok member sign-out.

create table if not exists desk_hold (
  token text primary key,
  user_id text not null,
  expires_at timestamptz not null
);

create index if not exists desk_hold_user_idx on desk_hold (user_id);
