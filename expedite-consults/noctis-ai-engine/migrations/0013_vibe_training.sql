-- Persistent self-training memory and rule store for Vibe.
-- Survives Vercel serverless cold starts on Neon Postgres and runs in PGLite locally.

create table if not exists vibe_training_pair (
  id text primary key,
  question text not null,
  answer text not null,
  domain text not null default 'general',
  model text not null default 'vibe-native',
  hits int not null default 1,
  verified boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vibe_training_pair_updated_idx on vibe_training_pair (updated_at desc);
create index if not exists vibe_training_pair_domain_idx on vibe_training_pair (domain, updated_at desc);
create index if not exists vibe_training_pair_fts_idx on vibe_training_pair using gin (to_tsvector('english', question || ' ' || answer));

create table if not exists vibe_training_rule (
  id text primary key,
  rule text not null,
  domain text not null default 'general',
  created_at timestamptz not null default now()
);

create index if not exists vibe_training_rule_created_idx on vibe_training_rule (created_at desc);
