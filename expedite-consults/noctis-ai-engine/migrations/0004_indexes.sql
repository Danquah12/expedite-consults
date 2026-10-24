-- Indexes for the lookups the desk, ledger, and sign-in path actually run.

create index if not exists account_provider_idx on "account" ("providerId", "accountId");
create index if not exists session_expires_idx on "session" ("expiresAt");
create index if not exists user_created_idx on "user" ("createdAt" desc);

create index if not exists staff_email_idx on staff (lower(email));
create index if not exists staff_created_idx on staff (created_at);

create index if not exists content_mod_created_idx on content_mod (created_at desc);
create index if not exists content_mod_youtube_idx on content_mod (youtube_id);

create index if not exists ingest_log_youtube_idx on ingest_log (youtube_id);
create index if not exists ingest_log_post_idx on ingest_log (post_id);

create index if not exists safety_case_created_idx on safety_case (created_at desc);
create index if not exists safety_case_open_idx on safety_case (created_at desc) where status <> 'closed';
create index if not exists safety_case_target_idx on safety_case (target_kind, target_id);

create index if not exists account_hold_status_idx on account_hold (status);
