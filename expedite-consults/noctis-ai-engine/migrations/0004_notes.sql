create table if not exists member_note (
  id serial primary key,
  post_id text not null,
  author text not null,
  body text not null,
  clip text,
  status text not null default 'new' check (status in ('new', 'keep', 'done', 'drop')),
  revise text,
  created_at timestamptz not null default now()
);
create index if not exists member_note_status_idx on member_note (status, created_at desc);
