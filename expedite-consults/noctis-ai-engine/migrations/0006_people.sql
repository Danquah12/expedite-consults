-- People directory. One row per signed-in member, plus the follow graph.
-- Production is Neon Postgres (DATABASE_URL). The same SQL runs on the
-- in-memory preview database. Lookups stay on indexes, not a full table scan.

create table if not exists person (
  user_id text primary key references "user" (id) on delete cascade,
  username text not null,
  display_name text not null,
  email text,
  avatar text,
  bio text,
  profession text,
  campus text,
  location text,
  kind text not null default 'member',
  status text not null default 'active',
  joined_at timestamptz not null default now(),
  last_seen timestamptz,
  updated_at timestamptz not null default now()
);

create unique index if not exists person_username_idx on person (lower(username));
create index if not exists person_email_idx on person (lower(email));
create index if not exists person_name_idx on person (lower(display_name));
create index if not exists person_profession_idx on person (lower(profession));
create index if not exists person_campus_idx on person (lower(campus));
create index if not exists person_seen_idx on person (last_seen desc nulls last);
create index if not exists person_joined_idx on person (joined_at desc);

create table if not exists person_follow (
  follower_id text not null references person (user_id) on delete cascade,
  followee_id text not null references person (user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create index if not exists person_follow_followee_idx on person_follow (followee_id, created_at desc);

insert into person (user_id, username, display_name, email, avatar, joined_at, last_seen)
select
  u.id,
  lower(regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9]+', '', 'g')) || '.' || left(u.id, 6),
  coalesce(nullif(trim(u.name), ''), split_part(u.email, '@', 1)),
  lower(u.email),
  u.image,
  u."createdAt",
  u."updatedAt"
from "user" u
on conflict (user_id) do nothing;
