import { getSql } from "@/lib/db";

export type StudyCircle = {
  id: string;
  interest: string;
  title: string;
  members: number;
  mine: boolean;
  names: string[];
  live: number;
};

async function ready() {
  const sql = await getSql();
  await sql.query(`create table if not exists study_group (
    id text primary key,
    interest text not null,
    title text not null,
    created_by text not null,
    created_at timestamptz not null default now()
  )`);
  await sql.query(`create table if not exists study_member (
    group_id text not null references study_group (id) on delete cascade,
    user_id text not null,
    name text not null,
    joined_at timestamptz not null default now(),
    primary key (group_id, user_id)
  )`);
  await sql.query(`create table if not exists study_seat (
    group_id text not null,
    user_id text not null,
    name text not null,
    seen_at timestamptz not null default now(),
    primary key (group_id, user_id)
  )`);
  await sql.query(`create table if not exists study_signal (
    id serial primary key,
    group_id text not null,
    from_id text not null,
    to_id text not null,
    kind text not null,
    payload text not null,
    created_at timestamptz not null default now()
  )`);
  await sql.query(`alter table study_member add column if not exists phone text`);
  await sql.query(`create table if not exists study_chat (
    id serial primary key,
    group_id text not null,
    user_id text not null,
    name text not null,
    body text not null,
    created_at timestamptz not null default now()
  )`);
  await sql.query(`alter table study_chat add column if not exists reply_name text`);
  await sql.query(`alter table study_chat add column if not exists reply_body text`);
  await sql.query(`alter table study_chat add column if not exists channel text default 'general'`);
  await sql.query(`alter table study_chat add column if not exists media text`);
  await sql.query(`alter table study_chat add column if not exists media_name text`);
  await sql.query(`alter table study_chat add column if not exists media_kind text`);
  await sql.query(`alter table study_chat add column if not exists edited boolean default false`);
  await sql.query(`alter table study_chat add column if not exists removed boolean default false`);
  await sql.query(`alter table study_group add column if not exists pin_chat integer`);
  await sql.query(`create table if not exists study_block (
    user_id text not null,
    blocked_id text not null,
    primary key (user_id, blocked_id)
  )`);
  await sql.query(`create table if not exists study_report (
    id serial primary key,
    user_id text not null,
    about_id text not null,
    group_id text not null,
    note text not null,
    created_at timestamptz not null default now()
  )`);
  await sql.query(`create table if not exists study_react (
    chat_id integer not null,
    user_id text not null,
    emoji text not null,
    primary key (chat_id, user_id)
  )`);
  await sql.query(`create table if not exists study_ring (
    id serial primary key,
    group_id text not null,
    from_id text not null,
    from_name text not null,
    to_id text not null,
    title text not null,
    created_at timestamptz not null default now()
  )`);
  return sql;
}

async function who(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  const rows = await sql<{ name: string }>`select name from "user" where id = ${userId} limit 1`;
  const name = rows[0]?.name?.trim();
  return name && name.length > 0 ? name.slice(0, 80) : "Member";
}

async function eraseGroup(sql: Awaited<ReturnType<typeof getSql>>, groupId: string) {
  await sql`delete from study_react where chat_id in (select id from study_chat where group_id = ${groupId})`;
  await sql`delete from study_chat where group_id = ${groupId}`;
  await sql`delete from study_signal where group_id = ${groupId}`;
  await sql`delete from study_ring where group_id = ${groupId}`;
  await sql`delete from study_seat where group_id = ${groupId}`;
  await sql`delete from study_member where group_id = ${groupId}`;
  await sql`delete from study_group where id = ${groupId}`;
}

/** Drop meetings that have been empty for hours. A live link stays open so more people can still join. */
async function sweepMeetings(sql: Awaited<ReturnType<typeof getSql>>) {
  const stale = await sql<{ id: string }>`
    select g.id from study_group g
    where g.created_at < now() - interval '8 hours'
    and not exists (
      select 1 from study_seat s
      where s.group_id = g.id and s.seen_at > now() - interval '8 hours'
    )
  `;
  for (const row of stale) await eraseGroup(sql, row.id);
}

export async function listCircles(userId: string, interest: string): Promise<StudyCircle[]> {
  const sql = await ready();
  await sweepMeetings(sql);
  const groups = await sql<{ id: string; interest: string; title: string }>`
    select id, interest, title from study_group
    where interest = ${interest}
    order by created_at desc
    limit 24
  `;
  if (!groups.length) return [];
  const members = await sql<{ group_id: string; user_id: string; name: string }>`
    select m.group_id, m.user_id, m.name
    from study_member m
    join study_group g on g.id = m.group_id
    where g.interest = ${interest}
    order by m.joined_at asc
  `;
  const liveRows = await sql<{ group_id: string; n: number }>`
    select group_id, count(*)::int as n from study_seat
    where seen_at > now() - interval '20 seconds'
    group by group_id
  `;
  const liveOf = new Map(liveRows.map((row) => [row.group_id, row.n]));
  return groups.map((group) => {
    const people = members.filter((row) => row.group_id === group.id);
    return {
      id: group.id,
      interest: group.interest,
      title: group.title,
      members: people.length,
      mine: people.some((row) => row.user_id === userId),
      names: people.slice(0, 8).map((row) => row.name),
      live: liveOf.get(group.id) ?? 0,
    };
  });
}

export async function openCall(userId: string, title: string) {
  const sql = await ready();
  const name = await who(sql, userId);
  const id = crypto.randomUUID();
  const label = title.replace(/\s+/g, " ").trim().slice(0, 60) || "Video call";
  const heading = `Call · ${label}`;
  await sql`insert into study_group (id, interest, title, created_by) values (${id}, ${"call"}, ${heading}, ${userId})`;
  await sql`insert into study_member (group_id, user_id, name) values (${id}, ${userId}, ${name})`;
  return { id, title: heading };
}

export async function inviteToCall(userId: string, groupId: string, to: string) {
  const sql = await ready();
  await mustMember(sql, userId, groupId);
  if (to === userId) throw new Error("That is you");
  const found = await sql<{ name: string }>`select name from "user" where id = ${to} limit 1`;
  const person = found[0]?.name?.trim();
  if (!person) throw new Error("They are not on Noctis");
  await sql`
    insert into study_member (group_id, user_id, name) values (${groupId}, ${to}, ${person.slice(0, 80)})
    on conflict (group_id, user_id) do update set name = excluded.name
  `;
  const me = await who(sql, userId);
  const group = await sql<{ title: string }>`select title from study_group where id = ${groupId} limit 1`;
  await sql`
    insert into study_ring (group_id, from_id, from_name, to_id, title)
    values (${groupId}, ${userId}, ${me}, ${to}, ${group[0]?.title ?? "Video call"})
  `;
  return { ok: true as const };
}

export async function openCircle(userId: string, interest: string, title: string) {
  const sql = await ready();
  const name = await who(sql, userId);
  const id = crypto.randomUUID();
  await sql`insert into study_group (id, interest, title, created_by) values (${id}, ${interest}, ${title}, ${userId})`;
  await sql`insert into study_member (group_id, user_id, name) values (${id}, ${userId}, ${name})`;
  return { id };
}

export async function enterCircle(userId: string, groupId: string) {
  const sql = await ready();
  const found = await sql<{ id: string }>`select id from study_group where id = ${groupId} limit 1`;
  if (!found.length) throw new Error("That group is gone");
  const already = await sql`select 1 as ok from study_member where group_id = ${groupId} and user_id = ${userId} limit 1`;
  if (!already.length) {
    const rows = await sql<{ n: number }>`select count(*)::int as n from study_member where group_id = ${groupId}`;
    if (Number(rows[0]?.n) >= 200) throw new Error("This meeting is full. 200 people can join.");
  }
  const name = await who(sql, userId);
  await sql`
    insert into study_member (group_id, user_id, name) values (${groupId}, ${userId}, ${name})
    on conflict (group_id, user_id) do update set name = excluded.name
  `;
  return { ok: true as const };
}

export async function leaveCircle(userId: string, groupId: string) {
  const sql = await ready();
  await sql`delete from study_member where group_id = ${groupId} and user_id = ${userId}`;
  await sql`delete from study_seat where group_id = ${groupId} and user_id = ${userId}`;
  return { ok: true as const };
}

export async function beatLive(userId: string, groupId: string, cursor: number) {
  const sql = await ready();
  const member = await sql<{ name: string }>`
    select name from study_member where group_id = ${groupId} and user_id = ${userId} limit 1
  `;
  if (!member.length) throw new Error("Join the group before going live");
  const name = member[0]!.name;
  await sql`
    insert into study_seat (group_id, user_id, name, seen_at) values (${groupId}, ${userId}, ${name}, now())
    on conflict (group_id, user_id) do update set name = excluded.name, seen_at = now()
  `;
  await sql`delete from study_seat where seen_at < now() - interval '45 seconds'`;
  await sql`delete from study_signal where created_at < now() - interval '3 minutes'`;
  const seats = await sql<{ user_id: string; name: string }>`
    select user_id, name from study_seat
    where group_id = ${groupId} and seen_at > now() - interval '45 seconds'
  `;
  const host = await sql<{ created_by: string }>`select created_by from study_group where id = ${groupId} limit 1`;
  const stage = await sql<{ payload: string }>`
    select payload from study_signal
    where group_id = ${groupId} and kind = 'stage'
    order by id desc
    limit 1
  `;
  const signals = await sql<{ id: number; from_id: string; kind: string; payload: string }>`
    select id, from_id, kind, payload from study_signal
    where group_id = ${groupId} and to_id = ${userId} and id > ${cursor}
    order by id asc
    limit 400
  `;
  const next = signals.length ? Number(signals[signals.length - 1]!.id) : cursor;
  return {
    cursor: next,
    seats: seats.map((row) => ({ userId: row.user_id, name: row.name })),
    hostId: host[0]?.created_by ?? "",
    stage: stage[0]?.payload ?? "",
    signals: signals.map((row) => ({ id: Number(row.id), from: row.from_id, kind: row.kind, payload: row.payload })),
  };
}

export async function pushSignal(userId: string, groupId: string, to: string, kind: string, payload: string) {
  const sql = await ready();
  const member = await sql`select 1 as ok from study_member where group_id = ${groupId} and user_id = ${userId} limit 1`;
  if (!member.length) throw new Error("Join the group before going live");
  await sql`
    insert into study_signal (group_id, from_id, to_id, kind, payload)
    values (${groupId}, ${userId}, ${to}, ${kind}, ${payload})
  `;
  return { ok: true as const };
}

export async function dropLive(userId: string, groupId: string) {
  const sql = await ready();
  await sql`delete from study_seat where group_id = ${groupId} and user_id = ${userId}`;
  return { ok: true as const };
}

async function mustMember(sql: Awaited<ReturnType<typeof getSql>>, userId: string, groupId: string) {
  const member = await sql`select 1 as ok from study_member where group_id = ${groupId} and user_id = ${userId} limit 1`;
  if (!member.length) throw new Error("Join the group first");
}

export async function listRoom(userId: string, groupId: string) {
  const sql = await ready();
  await mustMember(sql, userId, groupId);
  const people = await sql<{ user_id: string; name: string; phone: string | null }>`
    select user_id, name, phone from study_member where group_id = ${groupId} order by joined_at asc
  `;
  const seats = await sql<{ user_id: string }>`
    select user_id from study_seat
    where group_id = ${groupId} and seen_at > now() - interval '20 seconds'
  `;
  const live = new Set(seats.map((row) => row.user_id));
  const mine = people.find((row) => row.user_id === userId);
  return {
    phone: mine?.phone ?? "",
    people: people
      .filter((row) => row.user_id !== userId)
      .map((row) => ({
        userId: row.user_id,
        name: row.name,
        phone: row.phone ?? "",
        live: live.has(row.user_id),
      })),
  };
}

export async function savePhone(userId: string, groupId: string, phone: string) {
  const sql = await ready();
  await mustMember(sql, userId, groupId);
  await sql`update study_member set phone = ${phone || null} where group_id = ${groupId} and user_id = ${userId}`;
  return { ok: true as const };
}

const ROOMS = new Set(["general", "announcements", "study", "videos", "resources"]);

function roomOf(channel: string) {
  return ROOMS.has(channel) ? channel : "general";
}

export async function listChat(userId: string, groupId: string, after: number, channel = "general") {
  const sql = await ready();
  await mustMember(sql, userId, groupId);
  const room = roomOf(channel);
  type Row = {
    id: number;
    user_id: string;
    name: string;
    body: string;
    created_at: string;
    reply_name: string | null;
    reply_body: string | null;
    media: string | null;
    media_name: string | null;
    media_kind: string | null;
    edited: boolean | null;
    removed: boolean | null;
  };
  const rows = after > 0
    ? await sql<Row>`
        select id, user_id, name, body, created_at, reply_name, reply_body, media, media_name, media_kind, edited, removed from study_chat
        where group_id = ${groupId} and id > ${after} and coalesce(channel, 'general') = ${room}
        order by id asc
        limit 40
      `
    : (
        await sql<Row>`
          select id, user_id, name, body, created_at, reply_name, reply_body, media, media_name, media_kind, edited, removed from study_chat
          where group_id = ${groupId} and coalesce(channel, 'general') = ${room}
          order by id desc
          limit 40
        `
      ).reverse();
  const ids = rows.map((row) => Number(row.id));
  const marks = ids.length
    ? await sql.query<{ chat_id: number; emoji: string; n: number }>(
        `select chat_id, emoji, count(*)::int as n from study_react where chat_id in (${ids.map((_, i) => `$${i + 1}`).join(",")}) group by chat_id, emoji`,
        ids,
      )
    : [];
  const blocked = await sql<{ blocked_id: string }>`select blocked_id from study_block where user_id = ${userId}`;
  const hide = new Set(blocked.map((row) => row.blocked_id));
  const pinRow = await sql<{ pin_chat: number | null }>`select pin_chat from study_group where id = ${groupId} limit 1`;
  const pin = Number(pinRow[0]?.pin_chat) || 0;
  return rows.filter((row) => !hide.has(row.user_id) || row.user_id === userId).map((row) => {
    const removed = Boolean(row.removed);
    return {
      id: Number(row.id),
      mine: row.user_id === userId,
      userId: row.user_id,
      name: row.name,
      body: removed ? "This message was removed." : row.body,
      time: new Date(row.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      replyName: row.reply_name ?? "",
      replyBody: row.reply_body ?? "",
      reactions: marks.filter((mark) => Number(mark.chat_id) === Number(row.id)).map((mark) => ({ emoji: mark.emoji, n: Number(mark.n) })),
      media: removed ? "" : row.media ?? "",
      mediaName: removed ? "" : row.media_name ?? "",
      mediaKind: removed ? "" : row.media_kind ?? "",
      edited: Boolean(row.edited),
      removed,
      pinned: Number(row.id) === pin,
    };
  });
}

const MEDIA = /^data:(image\/(png|jpeg|jpg|webp)|audio\/[a-z0-9.+-]+|application\/pdf|text\/plain)[;,]/i;

export async function sendChat(
  userId: string,
  groupId: string,
  body: string,
  reply?: { name: string; body: string },
  channel = "general",
  media?: { data: string; name: string; kind: string },
) {
  const sql = await ready();
  await mustMember(sql, userId, groupId);
  const name = await who(sql, userId);
  const replyName = reply?.name?.slice(0, 80) || null;
  const replyBody = reply?.body?.slice(0, 180) || null;
  const room = roomOf(channel);
  const data = media?.data ?? "";
  if (data && (data.length > 750_000 || !MEDIA.test(data))) throw new Error("That file is too large or not allowed");
  const kind = data ? (media?.kind === "image" || media?.kind === "voice" || media?.kind === "file" ? media.kind : "file") : null;
  const label = body || (kind === "image" ? "Photo" : kind === "voice" ? "Voice note" : media?.name || "");
  if (!label) throw new Error("Write a message");
  await sql`
    insert into study_chat (group_id, user_id, name, body, reply_name, reply_body, channel, media, media_name, media_kind)
    values (${groupId}, ${userId}, ${name}, ${label.slice(0, 500)}, ${replyName}, ${replyBody}, ${room}, ${data || null}, ${media?.name?.slice(0, 80) || null}, ${kind})
  `;
  return { ok: true as const };
}

export async function editChat(userId: string, groupId: string, chatId: number, body: string) {
  const sql = await ready();
  await mustMember(sql, userId, groupId);
  const text = body.replace(/\s+/g, " ").trim().slice(0, 500);
  if (!text) throw new Error("Write a message");
  const own = await sql<{ user_id: string; removed: boolean | null }>`select user_id, removed from study_chat where id = ${chatId} and group_id = ${groupId} limit 1`;
  if (own[0]?.user_id !== userId || own[0]?.removed) throw new Error("You can only edit your own message");
  await sql`update study_chat set body = ${text}, edited = true where id = ${chatId}`;
  return { ok: true as const };
}

export async function hideChat(userId: string, groupId: string, chatId: number) {
  const sql = await ready();
  await mustMember(sql, userId, groupId);
  const own = await sql<{ user_id: string }>`select user_id from study_chat where id = ${chatId} and group_id = ${groupId} limit 1`;
  if (own[0]?.user_id !== userId) throw new Error("You can only remove your own message");
  await sql`update study_chat set removed = true, media = null, body = ${"This message was removed."} where id = ${chatId}`;
  await sql`update study_group set pin_chat = null where id = ${groupId} and pin_chat = ${chatId}`;
  return { ok: true as const };
}

export async function pinChat(userId: string, groupId: string, chatId: number) {
  const sql = await ready();
  await mustMember(sql, userId, groupId);
  const own = await sql<{ id: number }>`select id from study_chat where id = ${chatId} and group_id = ${groupId} and coalesce(removed, false) = false limit 1`;
  if (!own.length) throw new Error("That message is gone");
  const current = await sql<{ pin_chat: number | null }>`select pin_chat from study_group where id = ${groupId} limit 1`;
  const next = Number(current[0]?.pin_chat) === chatId ? null : chatId;
  await sql`update study_group set pin_chat = ${next} where id = ${groupId}`;
  return { ok: true as const };
}

export async function blockPerson(userId: string, groupId: string, aboutId: string) {
  const sql = await ready();
  await mustMember(sql, userId, groupId);
  if (!aboutId || aboutId === userId) throw new Error("Pick another person");
  await sql`
    insert into study_block (user_id, blocked_id) values (${userId}, ${aboutId})
    on conflict (user_id, blocked_id) do nothing
  `;
  return { ok: true as const };
}

export async function reportPerson(userId: string, groupId: string, aboutId: string, note: string) {
  const sql = await ready();
  await mustMember(sql, userId, groupId);
  if (!aboutId || aboutId === userId) throw new Error("Pick another person");
  await sql`
    insert into study_report (user_id, about_id, group_id, note)
    values (${userId}, ${aboutId}, ${groupId}, ${note.slice(0, 240) || "Reported from chat"})
  `;
  return { ok: true as const };
}

export async function reactChat(userId: string, groupId: string, chatId: number, emoji: string) {
  const sql = await ready();
  await mustMember(sql, userId, groupId);
  const mark = emoji === "❤️" || emoji === "🙏" ? emoji : "👍";
  const own = await sql<{ id: number }>`select id from study_chat where id = ${chatId} and group_id = ${groupId} limit 1`;
  if (!own.length) throw new Error("That message is gone");
  const had = await sql<{ emoji: string }>`select emoji from study_react where chat_id = ${chatId} and user_id = ${userId} limit 1`;
  if (had[0]?.emoji === mark) {
    await sql`delete from study_react where chat_id = ${chatId} and user_id = ${userId}`;
  } else {
    await sql`
      insert into study_react (chat_id, user_id, emoji) values (${chatId}, ${userId}, ${mark})
      on conflict (chat_id, user_id) do update set emoji = ${mark}
    `;
  }
  return { ok: true as const };
}

export async function briefChat(userId: string, groupId: string) {
  const sql = await ready();
  await mustMember(sql, userId, groupId);
  const rows = await sql<{ name: string; body: string }>`
    select name, body from study_chat where group_id = ${groupId} order by id desc limit 40
  `;
  rows.reverse();
  if (!rows.length) return { summary: "No messages yet.", decisions: [] as string[], open: [] as string[], next: [] as string[] };
  const transcript = rows.map((row) => `${row.name}: ${row.body}`).join("\n").slice(0, 6000);
  try {
    const { modelChat } = await import("@/lib/video-mind.server");
    const result = await modelChat(
      [
        {
          role: "system",
          content:
            "Summarize a study-group chat. Use only what was said. Return JSON with summary (2 sentences), decisions (array), open (unanswered questions), next (next steps). Empty arrays if none.",
        },
        { role: "user", content: transcript },
      ],
      { temperature: 0.2, maxTokens: 700, json: true },
    );
    if (!("error" in result)) {
      const parsed = JSON.parse(result.text || "{}") as {
        summary?: string;
        decisions?: string[];
        open?: string[];
        next?: string[];
      };
        const list = (value: unknown) => (Array.isArray(value) ? value.filter((item) => typeof item === "string").slice(0, 5) : []);
        if (parsed.summary) return { summary: parsed.summary, decisions: list(parsed.decisions), open: list(parsed.open), next: list(parsed.next) };
    }
  } catch {
    /* fall through to the local brief */
  }
  const last = rows.slice(-4).map((row) => `${row.name} said “${row.body.slice(0, 120)}”`);
  return {
    summary: last.join(" "),
    decisions: [] as string[],
    open: [] as string[],
    next: ["Ask NoctisAI again after more of the conversation is in the chat."],
  };
}

export async function ringPerson(userId: string, groupId: string, to: string) {
  const sql = await ready();
  await mustMember(sql, userId, groupId);
  if (to === userId) throw new Error("That is you");
  const target = await sql`select 1 as ok from study_member where group_id = ${groupId} and user_id = ${to} limit 1`;
  if (!target.length) throw new Error("They are not in this group");
  const name = await who(sql, userId);
  const group = await sql<{ title: string }>`select title from study_group where id = ${groupId} limit 1`;
  await sql`
    insert into study_ring (group_id, from_id, from_name, to_id, title)
    values (${groupId}, ${userId}, ${name}, ${to}, ${group[0]?.title ?? "Study"})
  `;
  return { ok: true as const };
}

export async function listRings(userId: string) {
  const sql = await ready();
  await sql`delete from study_ring where created_at < now() - interval '3 minutes'`;
  const rows = await sql<{ id: number; group_id: string; from_name: string; title: string; interest: string }>`
    select r.id, r.group_id, r.from_name, r.title, g.interest
    from study_ring r
    join study_group g on g.id = r.group_id
    where r.to_id = ${userId} and r.created_at > now() - interval '90 seconds'
    order by r.id desc
    limit 3
  `;
  return rows.map((row) => ({
    id: Number(row.id),
    groupId: row.group_id,
    from: row.from_name,
    title: row.title,
    interest: row.interest,
  }));
}

export async function listJoined(userId: string) {
  const sql = await ready();
  await sweepMeetings(sql);
  const rows = await sql<{ id: string; interest: string; title: string; members: number; last_body: string | null; last_name: string | null; live: number }>`
    select g.id, g.interest, g.title,
      (select count(*)::int from study_member m2 where m2.group_id = g.id) as members,
      (select c.body from study_chat c where c.group_id = g.id order by c.id desc limit 1) as last_body,
      (select c.name from study_chat c where c.group_id = g.id order by c.id desc limit 1) as last_name,
      (select count(*)::int from study_seat s where s.group_id = g.id and s.seen_at > now() - interval '20 seconds') as live
    from study_group g
    join study_member m on m.group_id = g.id and m.user_id = ${userId}
    order by g.created_at desc
    limit 30
  `;
  return rows.map((row) => ({
    id: row.id,
    interest: row.interest,
    title: row.title,
    members: Number(row.members) || 0,
    last: row.last_body ? `${row.last_name ?? "Someone"}: ${row.last_body}` : "No messages yet",
    live: Number(row.live) || 0,
  }));
}

export async function clearRing(userId: string, id: number) {
  const sql = await ready();
  await sql`delete from study_ring where id = ${id} and to_id = ${userId}`;
  return { ok: true as const };
}

