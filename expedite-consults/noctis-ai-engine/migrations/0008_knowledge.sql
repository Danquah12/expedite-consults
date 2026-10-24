create table if not exists bible_book (
  ord int primary key,
  name text not null,
  testament text not null,
  chapters int not null
);

create table if not exists bible_verse (
  book_ord int not null references bible_book (ord),
  chapter int not null,
  verse int not null,
  body text not null,
  primary key (book_ord, chapter, verse)
);

create index if not exists bible_verse_fts on bible_verse using gin (to_tsvector('english', body));

create table if not exists source_provider (
  id text primary key,
  label text not null,
  kind text not null,
  href text not null,
  note text not null
);

create table if not exists study_object (
  id text primary key,
  question text not null,
  summary text not null,
  domain text not null,
  confidence text not null,
  evidence jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists study_object_created on study_object (created_at desc);
