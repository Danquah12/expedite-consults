create table if not exists playback_stat (
  key text primary key,
  n bigint not null default 0,
  ms bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into platform_setting (key, value) values
  ('play_on_focus', 'on'),
  ('one_player', 'on'),
  ('preload_next', 'on')
on conflict (key) do nothing;
