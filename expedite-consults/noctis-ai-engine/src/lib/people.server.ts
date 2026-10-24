import { getSql } from "@/lib/db";

/** Create the people tables if this process started before the migration file existed. */
export async function ensurePeople() {
  const sql = await getSql();
  await sql.query(`create table if not exists person (
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
  )`);
  await sql.query(`create unique index if not exists person_username_idx on person (lower(username))`);
  await sql.query(`create index if not exists person_email_idx on person (lower(email))`);
  await sql.query(`create index if not exists person_name_idx on person (lower(display_name))`);
  await sql.query(`create index if not exists person_profession_idx on person (lower(profession))`);
  await sql.query(`create index if not exists person_campus_idx on person (lower(campus))`);
  await sql.query(`create index if not exists person_seen_idx on person (last_seen desc nulls last)`);
  await sql.query(`create index if not exists person_joined_idx on person (joined_at desc)`);
  await sql.query(`create table if not exists person_follow (
    follower_id text not null references person (user_id) on delete cascade,
    followee_id text not null references person (user_id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (follower_id, followee_id),
    check (follower_id <> followee_id)
  )`);
  await sql.query(`create index if not exists person_follow_followee_idx on person_follow (followee_id, created_at desc)`);
  try {
    await sql.query(`insert into person (user_id, username, display_name, email, avatar, joined_at, last_seen)
      select u.id,
        lower(regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9]+', '', 'g')) || '.' || left(u.id, 6),
        coalesce(nullif(trim(u.name), ''), split_part(u.email, '@', 1)),
        lower(u.email),
        u.image,
        u."createdAt",
        u."updatedAt"
      from "user" u
      on conflict (user_id) do nothing`);
  } catch {
    /* Existing rows already cover the directory. */
  }
}

/** Write the signed-in account into the people directory. Safe to call on every visit. */
export async function ensurePerson(who: { id: string; email: string | null; name: string | null }) {
  if (!who.id) return;
  try {
    await ensurePeople();
    const sql = await getSql();
    const email = who.email?.trim().toLowerCase() || null;
    const display = who.name?.trim() || email?.split("@")[0] || "Member";
    if (email) {
      try {
        await sql`
          insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
          values (${who.id}, ${display}, ${email}, true, now(), now())
          on conflict (id) do update set
            name = excluded.name,
            email = excluded.email,
            "updatedAt" = now()
        `;
      } catch {
        /* This email is already listed under its first account. */
      }
    }
    const base = (email?.split("@")[0] || "member").toLowerCase().replace(/[^a-z0-9]+/g, "") || "member";
    const username = `${base}.${who.id.slice(0, 6).toLowerCase()}`;
    await sql`
      insert into person (user_id, username, display_name, email, joined_at, last_seen)
      values (${who.id}, ${username}, ${display}, ${email}, now(), now())
      on conflict (user_id) do update set
        display_name = excluded.display_name,
        email = coalesce(excluded.email, person.email),
        last_seen = now(),
        updated_at = now()
    `;
  } catch {
    /* A visit must still sign in if the directory cannot be written. */
  }
}
