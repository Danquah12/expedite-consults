-- Where an account was created, and where each sign-in came from.
-- City and coordinates come from the network address, or from the device
-- when the browser shares a position. This is not a street address.

create table if not exists login_place (
  id text primary key,
  user_id text not null,
  kind text not null,
  at timestamptz not null default now(),
  ip text,
  city text,
  region text,
  country text,
  latitude double precision,
  longitude double precision,
  source text
);

create index if not exists login_place_user_idx on login_place (user_id, kind, at desc);
