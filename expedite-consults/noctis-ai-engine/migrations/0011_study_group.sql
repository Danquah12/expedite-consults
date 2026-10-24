create table if not exists study_group (
  id text primary key,
  interest text not null,
  title text not null,
  created_by text not null,
  created_at timestamptz not null default now()
);
create index if not exists study_group_interest_idx on study_group (interest, created_at desc);

create table if not exists study_member (
  group_id text not null references study_group (id) on delete cascade,
  user_id text not null,
  name text not null,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index if not exists study_member_user_idx on study_member (user_id);

create table if not exists study_seat (
  group_id text not null,
  user_id text not null,
  name text not null,
  seen_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists study_signal (
  id serial primary key,
  group_id text not null,
  from_id text not null,
  to_id text not null,
  kind text not null,
  payload text not null,
  created_at timestamptz not null default now()
);
create index if not exists study_signal_to_idx on study_signal (group_id, to_id, id);

alter table study_member add column if not exists phone text;

create table if not exists study_chat (
  id serial primary key,
  group_id text not null,
  user_id text not null,
  name text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists study_chat_group_idx on study_chat (group_id, id);

create table if not exists study_ring (
  id serial primary key,
  group_id text not null,
  from_id text not null,
  from_name text not null,
  to_id text not null,
  title text not null,
  created_at timestamptz not null default now()
);
create index if not exists study_ring_to_idx on study_ring (to_id, id);


