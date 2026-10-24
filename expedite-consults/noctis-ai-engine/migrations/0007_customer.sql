-- Customer clinic. Every row hangs off the signed-in account.

create table if not exists member_diet (
  user_id text primary key references "user" (id) on delete cascade,
  learn int not null default 55,
  play int not null default 32,
  local int not null default 13,
  xp int not null default 0,
  sparks int not null default 0,
  echoes int not null default 0,
  goal text,
  updated_at timestamptz not null default now()
);

create table if not exists member_stamp (
  user_id text not null references "user" (id) on delete cascade,
  name text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, name)
);
create index if not exists member_stamp_earned_idx on member_stamp (user_id, earned_at desc);

create table if not exists member_drill (
  user_id text not null references "user" (id) on delete cascade,
  post_id text not null,
  passed_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists member_strand (
  user_id text not null references "user" (id) on delete cascade,
  strand text not null,
  pct int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, strand)
);

create table if not exists member_crew (
  user_id text not null references "user" (id) on delete cascade,
  crew_id text not null,
  joined_at timestamptz not null default now(),
  primary key (user_id, crew_id)
);

create table if not exists hall_wire (
  id bigserial primary key,
  user_id text references "user" (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists hall_wire_created_idx on hall_wire (created_at desc);

create table if not exists campus_here (
  user_id text primary key references "user" (id) on delete cascade,
  place text not null default 'Clinic',
  seen_at timestamptz not null default now()
);
create index if not exists campus_here_seen_idx on campus_here (seen_at desc);

create table if not exists open_drop (
  id text primary key,
  host_id text references "user" (id) on delete set null,
  title text not null,
  listeners int not null default 0,
  live boolean not null default false,
  started_at timestamptz not null default now()
);
create index if not exists open_drop_live_idx on open_drop (live, started_at desc);
