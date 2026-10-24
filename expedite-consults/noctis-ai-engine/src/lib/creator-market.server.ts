import { getSql } from "@/lib/db";
import type { CreatorKind } from "@/lib/creator-market";

const KINDS = new Set(["course", "lesson", "guide", "research", "tutorial", "video", "tutor", "program"]);

async function ready() {
  const sql = await getSql();
  await sql.query(`create table if not exists creator_work (
    id bigserial primary key,
    user_id text not null,
    kind text not null,
    title text not null,
    body text not null,
    status text not null default 'draft',
    created_at timestamptz not null default now()
  )`);
  return sql;
}

export async function listPublished(): Promise<{ id: number; kind: string; title: string; body: string; author: string }[]> {
  const sql = await ready();
  return sql`
    select w.id, w.kind, w.title, w.body,
      coalesce(nullif(trim(u.name), ''), split_part(u.email, '@', 1), 'Member') as author
    from creator_work w
    left join "user" u on u.id = w.user_id
    where w.status = 'published'
    order by w.created_at desc
    limit 40
  `;
}

export async function listMine(userId: string) {
  const sql = await ready();
  return sql<{ id: number; kind: string; title: string; body: string; status: string }>`
    select id, kind, title, body, status from creator_work
    where user_id = ${userId}
    order by created_at desc
    limit 20
  `;
}

export async function saveDraft(userId: string, kind: string, title: string, body: string) {
  if (!KINDS.has(kind)) throw new Error("That kind is not on the shelf");
  const sql = await ready();
  const rows = await sql<{ id: number }>`
    insert into creator_work (user_id, kind, title, body, status)
    values (${userId}, ${kind}, ${title.slice(0, 140)}, ${body.slice(0, 2000)}, 'draft')
    returning id
  `;
  return rows[0]?.id ?? 0;
}

export async function publishMine(userId: string, id: number) {
  const sql = await ready();
  const rows = await sql<{ id: number }>`
    update creator_work set status = 'published'
    where id = ${id} and user_id = ${userId} and status = 'draft'
    returning id
  `;
  if (!rows.length) throw new Error("That draft is not yours, or it is already published.");
  return true;
}

export function kindOrNull(value: string): CreatorKind | null {
  return KINDS.has(value) ? (value as CreatorKind) : null;
}
