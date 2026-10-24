-- Sign-in attempts that did not open a session. The password is never stored.

create table if not exists login_fail (
  id text primary key,
  email text not null,
  door text not null,
  reason text not null,
  user_id text,
  at timestamptz not null default now(),
  ip text,
  city text,
  region text,
  country text,
  latitude double precision,
  longitude double precision
);

create index if not exists login_fail_at_idx on login_fail (at desc);
create index if not exists login_fail_email_idx on login_fail (lower(email), at desc);
