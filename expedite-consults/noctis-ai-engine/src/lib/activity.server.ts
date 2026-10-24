import { getSql } from "@/lib/db";

export type ActivityRow = {
  id: number;
  user_id: string;
  action: string;
  target: string | null;
  detail: string | null;
  surface: string | null;
  created_at: string;
  who: string;
  email: string | null;
};

export type Evidence = {
  id: string;
  action: string;
  who: string;
  email: string | null;
  detail: string;
  at: string;
};

let ready: Promise<void> | null = null;

function ensureActivity() {
  ready ??= (async () => {
    const sql = await getSql();
    await sql.query(`create table if not exists activity_log (
      id bigserial primary key,
      user_id text not null,
      action text not null,
      target text,
      detail text,
      surface text,
      created_at timestamptz not null default now()
    )`);
    await sql.query(`create index if not exists activity_log_created_idx on activity_log (created_at desc)`);
    await sql.query(`create index if not exists activity_log_user_idx on activity_log (user_id, created_at desc)`);
    await sql.query(`create index if not exists activity_log_action_idx on activity_log (action, created_at desc)`);
  })().catch((err) => {
    ready = null;
    throw err;
  });
  return ready;
}

function clip(value: string | null | undefined, max: number) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text ? text.slice(0, max) : null;
}

/** Write one evidence row. Same person, action, target, and detail inside 45 seconds is skipped. Never throws. */
export async function recordActivity(input: {
  userId: string;
  action: string;
  detail?: string | null;
  target?: string | null;
  surface?: string | null;
}) {
  const userId = clip(input.userId, 80);
  const action = clip(input.action, 40)?.toLowerCase();
  if (!userId || !action) return;
  const detail = clip(input.detail, 240);
  const target = clip(input.target, 120);
  const surface = clip(input.surface, 40);
  try {
    await ensureActivity();
    const sql = await getSql();
    const recent = await sql<{ id: number }>`
      select id from activity_log
      where user_id = ${userId}
        and action = ${action}
        and coalesce(target, '') = ${target ?? ""}
        and coalesce(detail, '') = ${detail ?? ""}
        and created_at > now() - interval '45 seconds'
      limit 1
    `;
    if (recent.length) return;
    await sql`
      insert into activity_log (user_id, action, target, detail, surface)
      values (${userId}, ${action}, ${target}, ${detail}, ${surface})
    `;
  } catch {
    /* the action itself still succeeds */
  }
}

export async function listActivity(limit = 200): Promise<ActivityRow[]> {
  await ensureActivity();
  const sql = await getSql();
  const cap = Math.max(1, Math.min(200, limit));
  return sql<ActivityRow>`
    select a.id, a.user_id, a.action, a.target, a.detail, a.surface, a.created_at::text as created_at,
      coalesce(nullif(trim(p.display_name), ''), nullif(trim(u.name), ''), split_part(u.email, '@', 1), a.user_id) as who,
      coalesce(p.email, u.email) as email
    from activity_log a
    left join person p on p.user_id = a.user_id
    left join "user" u on u.id = a.user_id
    order by a.created_at desc
    limit ${cap}
  `;
}

/** Map a filed clip note onto a short action name. */
export function actionOfNote(text: string) {
  const t = text.trim().toLowerCase();
  if (t.startsWith("removed like")) return "unlike";
  if (t.startsWith("liked")) return "like";
  if (t.startsWith("saved")) return "save";
  if (t.startsWith("followed")) return "follow";
  if (t.startsWith("subscribed")) return "subscribe";
  if (t.startsWith("reposted")) return "repost";
  if (t.startsWith("sent")) return "send";
  if (t.includes("comment")) return "comment";
  return "note";
}

async function safeRows<T>(run: () => Promise<T[]>): Promise<T[]> {
  try {
    return await run();
  } catch {
    return [];
  }
}

function near(a: string, b: string) {
  const left = Date.parse(a);
  const right = Date.parse(b);
  return Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) < 2 * 60 * 1000;
}

/** The new trail, plus sign-ins, notes, study messages, and stamps already stored. */
export async function listEvidence(): Promise<Evidence[]> {
  await ensureActivity();
  const sql = await getSql();
  const out: Evidence[] = [];

  const activity = await listActivity(200).catch(() => []);
  for (const row of activity) {
    out.push({
      id: `a-${row.id}`,
      action: row.action,
      who: row.who,
      email: row.email,
      detail: row.detail || row.action,
      at: row.created_at,
    });
  }

  const notes = await safeRows(() =>
    sql<{ id: number; author: string; body: string; at: string }>`
      select id, author, body, created_at::text as at from member_note order by created_at desc limit 200
    `,
  );
  for (const row of notes) {
    if (out.some((item) => item.detail === row.body && near(item.at, row.at))) continue;
    out.push({
      id: `n-${row.id}`,
      action: actionOfNote(row.body),
      who: row.author,
      email: null,
      detail: row.body,
      at: row.at,
    });
  }

  const places = await safeRows(() =>
    sql<{ id: string; kind: string; at: string; city: string; country: string; who: string; email: string | null }>`
      select l.id, l.kind, l.at::text as at, l.city, l.country,
        coalesce(nullif(trim(p.display_name), ''), nullif(trim(u.name), ''), split_part(u.email, '@', 1), l.user_id) as who,
        coalesce(p.email, u.email) as email
      from login_place l
      left join person p on p.user_id = l.user_id
      left join "user" u on u.id = l.user_id
      order by l.at desc
      limit 200
    `,
  );
  for (const row of places) {
    const action = row.kind === "created" ? "account" : "sign-in";
    if (out.some((item) => item.who === row.who && (item.action === action || item.action === "sign-in") && near(item.at, row.at))) continue;
    const where = [row.city, row.country].filter(Boolean).join(", ");
    out.push({
      id: `p-${row.id}`,
      action,
      who: row.who,
      email: row.email,
      detail: action === "account" ? "Created an account" : where ? `Signed in · ${where}` : "Signed in",
      at: row.at,
    });
  }

  const chats = await safeRows(() =>
    sql<{ id: number; name: string; body: string; at: string }>`
      select id, name, body, created_at::text as at from study_chat order by created_at desc limit 100
    `,
  );
  for (const row of chats) {
    if (out.some((item) => item.action === "study-chat" && item.detail === row.body && near(item.at, row.at))) continue;
    out.push({
      id: `c-${row.id}`,
      action: "study-chat",
      who: row.name,
      email: null,
      detail: row.body,
      at: row.at,
    });
  }

  const stamps = await safeRows(() =>
    sql<{ user_id: string; name: string; who: string; email: string | null; at: string }>`
      select s.user_id, s.name, s.earned_at::text as at,
        coalesce(nullif(trim(p.display_name), ''), nullif(trim(u.name), ''), split_part(u.email, '@', 1), s.user_id) as who,
        coalesce(p.email, u.email) as email
      from member_stamp s
      left join person p on p.user_id = s.user_id
      left join "user" u on u.id = s.user_id
      order by s.earned_at desc
      limit 100
    `,
  );
  for (const row of stamps) {
    if (out.some((item) => item.action === "stamp" && item.who === row.who && item.detail.includes(row.name))) continue;
    out.push({
      id: `s-${row.user_id}-${row.name}`,
      action: "stamp",
      who: row.who,
      email: row.email,
      detail: `Earned ${row.name}`,
      at: row.at,
    });
  }

  const people = await safeRows(() =>
    sql<{ user_id: string; who: string; email: string | null; at: string }>`
      select p.user_id,
        coalesce(nullif(trim(p.display_name), ''), split_part(p.email, '@', 1), p.user_id) as who,
        p.email,
        p.joined_at::text as at
      from person p
      order by p.joined_at desc
      limit 100
    `,
  );
  for (const row of people) {
    if (out.some((item) => item.who === row.who && (item.action === "account" || item.action === "sign-in"))) continue;
    out.push({
      id: `u-${row.user_id}`,
      action: "account",
      who: row.who,
      email: row.email,
      detail: "Has an account",
      at: row.at,
    });
  }

  return out
    .filter((row) => row.at)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 200);
}

const FLOOR = 5;

export type AnalyticsCell = { label: string; people: number; events: number };

export type PlatformAnalytics = {
  floor: number;
  studied: AnalyticsCell[];
  difficult: AnalyticsCell[];
  dropoff: number | null;
  gaps: AnalyticsCell[];
  topics: AnalyticsCell[];
  progression: number | null;
  quality: string;
  searches: AnalyticsCell[];
  engagement: AnalyticsCell[];
  completion: number | null;
  note: string;
};

function shown(rows: AnalyticsCell[]) {
  return rows.filter((row) => row.people >= FLOOR).sort((a, b) => b.people - a.people || a.label.localeCompare(b.label));
}

function countOf(value: number | undefined) {
  return typeof value === "number" && value >= FLOOR ? value : null;
}

const SUBJECT = `
  case
    when coalesce(detail, '') ~* 'bible|psalm|gospel|scripture|ephesian' then 'Bible'
    when coalesce(detail, '') ~* 'cyber|cve|malware|phish|privilege' then 'Cyber'
    when coalesce(detail, '') ~* 'circuit|ohm|engineer|voltage|vector' then 'Engineering'
    when coalesce(detail, '') ~* 'algebra|equation|mathematic' then 'Mathematics'
    when coalesce(detail, '') ~* 'physics|chemist|science|newton' then 'Science'
    else null
  end
`;

async function subjectCounts(where: string) {
  const sql = await getSql();
  return sql.query<AnalyticsCell>(
    `select subject as label, count(distinct user_id)::int as people, count(*)::int as events
     from (
       select user_id, ${SUBJECT} as subject
       from activity_log
       where ${where}
     ) tagged
     where subject is not null
     group by subject`,
  );
}

/** Counts only. A subject or action with fewer than 5 people is omitted. Raw questions and names are not returned. */
export async function platformAnalytics(): Promise<PlatformAnalytics> {
  await ensureActivity();
  const sql = await getSql();
  const studied = shown(await subjectCounts(`action in ('study', 'check', 'vibe')`).catch(() => []));
  const topics = shown(await subjectCounts(`action in ('study', 'check', 'vibe', 'search', 'watch')`).catch(() => []));
  const searches = shown(await subjectCounts(`action = 'search'`).catch(() => []));
  const engagement = shown(
    await sql<AnalyticsCell>`
      select action as label, count(distinct user_id)::int as people, count(*)::int as events
      from activity_log
      group by action
    `.catch(() => []),
  );
  const dropRow = await sql<{ people: number }>`
    select count(*)::int as people from (
      select user_id from activity_log where action = 'study'
      except
      select user_id from activity_log where action = 'check'
    ) left_off
  `.catch(() => [{ people: 0 }]);
  const moved = await sql<{ people: number }>`
    select count(*)::int as people from (
      select s.user_id
      from activity_log s
      join activity_log c on c.user_id = s.user_id and c.action = 'check' and c.created_at > s.created_at
      where s.action = 'study'
      group by s.user_id
    ) progressed
  `.catch(() => [{ people: 0 }]);
  const started = await sql<{ people: number }>`
    select count(distinct user_id)::int as people from activity_log where action = 'study'
  `.catch(() => [{ people: 0 }]);
  const finished = await sql<{ people: number }>`
    select count(distinct user_id)::int as people from activity_log where action = 'check'
  `.catch(() => [{ people: 0 }]);
  const hard = shown(
    await sql<AnalyticsCell>`
      select concept as label, count(distinct user_id)::int as people, sum(missed)::int as events
      from member_concept
      where missed > passed
      group by concept
    `.catch(() => []),
  );
  const startN = started[0]?.people ?? 0;
  const finishN = finished[0]?.people ?? 0;
  return {
    floor: FLOOR,
    studied,
    difficult: hard,
    dropoff: countOf(dropRow[0]?.people),
    gaps: hard,
    topics,
    progression: countOf(moved[0]?.people),
    quality: "Not measured. No quality score is stored, so none is shown.",
    searches,
    engagement,
    completion: startN >= FLOOR && finishN >= FLOOR ? Math.round((finishN / startN) * 100) : null,
    note: `A count is shown only when at least ${FLOOR} people are in that group. Smaller groups are left out. Names, accounts, and the words people searched or asked are not on this page.`,
  };
}

