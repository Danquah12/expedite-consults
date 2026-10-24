import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { deskAuthMiddleware } from "@/lib/auth/middleware";
import { HYMNS } from "@/lib/hymn-desk";
import { CLINIC_DESKS, PULLS_PER_DAY, pullClockLabel } from "@/lib/ingest-sources";

export type StaffRole = "owner" | "editor" | "moderator";

export type DeskState = {
  userId: string;
  name: string | null;
  email: string | null;
  vacant: boolean;
  canJoin: boolean;
  operators: { name: string | null; email: string | null; role: StaffRole }[];
  staff: null | { role: StaffRole; totpOn: boolean; mfaOk: boolean };
  /** Present once. Saved in this browser so Desk stays signed in after Noctis sign-out. */
  holdToken?: string;
};

type StaffRow = {
  user_id: string;
  role: StaffRole;
  name: string | null;
  email: string | null;
  totp_secret: string | null;
  totp_on: boolean;
  mfa_until: string | null;
};

const MFA_MS = 12 * 60 * 60 * 1000;

async function getDb() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

async function totpLib() {
  return import("@/lib/totp.server");
}

const PUBLIC_MAIL = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
]);

function mailDomain(email: string | null | undefined) {
  const d = email?.split("@")[1]?.trim().toLowerCase();
  return d && d.includes(".") ? d : null;
}

function sameOrg(a: string | null | undefined, b: string | null | undefined) {
  const da = mailDomain(a);
  const db = mailDomain(b);
  if (!da || !db || da !== db) return false;
  return !PUBLIC_MAIL.has(da);
}

async function operators() {
  const sql = await getDb();
  return sql<{ name: string | null; email: string | null; role: StaffRole }>`
    select name, email, role from staff order by created_at
  `;
}

function canJoinDesk(email: string | null, crew: { email: string | null; name?: string | null; role: StaffRole }[]) {
  if (!email) return false;
  if (crew.some((row) => row.email && row.email.toLowerCase() === email.toLowerCase())) return true;
  return crew.some((row) => row.role === "owner" && sameOrg(email, row.email));
}

async function deskFor(userId: string): Promise<DeskState> {
  const who = await person(userId);
  const mine = await staffOf(userId);
  const crew = await operators();
  if (who.email || who.name) {
    const { ensurePerson } = await import("@/lib/people.server");
    await ensurePerson({ id: userId, email: who.email, name: who.name }).catch(() => undefined);
    const sql = await getDb();
    await sql`
      insert into campus_here (user_id, room, name, handle, avatar, seen_at)
      values (${userId}, ${"desk"}, ${who.name || who.email || "Operator"}, ${(who.email || userId).split("@")[0]}, ${"/favicon.svg"}, now())
      on conflict (user_id) do update set seen_at = now()
    `.catch(() => undefined);
  }
  return {
    userId,
    name: who.name,
    email: who.email,
    vacant: crew.length === 0,
    canJoin: !mine && canJoinDesk(who.email, crew),
    operators: crew,
    staff: mine
      ? { role: mine.role, totpOn: mine.totp_on, mfaOk: mine.totp_on && mfaLive(mine.mfa_until) }
      : null,
  };
}

function mfaLive(until: string | null) {
  if (!until) return false;
  const t = Date.parse(until);
  return Number.isFinite(t) && t > Date.now();
}

async function person(userId: string) {
  const sql = await getDb();
  const rows = await sql<{ name: string; email: string }>`select name, email from "user" where id = ${userId} limit 1`;
  return rows[0] ?? { name: null as string | null, email: null as string | null };
}

async function staffOf(userId: string) {
  const sql = await getDb();
  const rows = await sql<StaffRow>`select user_id, role, name, email, totp_secret, totp_on, mfa_until from staff where user_id = ${userId} limit 1`;
  return rows[0] ?? null;
}

async function audit(actorId: string, action: string, detail?: string) {
  const sql = await getDb();
  await sql`insert into admin_audit (actor_id, action, detail) values (${actorId}, ${action}, ${detail ?? null})`;
}

async function requireStaff(userId: string, roles?: StaffRole[]) {
  const row = await staffOf(userId);
  if (!row) throw new Error("Not desk staff");
  if (roles && !roles.includes(row.role)) throw new Error("Not permitted");
  if (!row.totp_on || !mfaLive(row.mfa_until)) throw new Error("MFA required");
  return row;
}

export const deskRegister = createServerFn({ method: "POST" })
  .validator((input: { name: string; email: string; password: string }) => ({
    name: String(input?.name ?? "").trim().slice(0, 80),
    email: String(input?.email ?? "").trim().toLowerCase(),
    password: String(input?.password ?? ""),
  }))
  .handler(async ({ data }) => {
    if (!data.email.includes("@") || data.password.length < 8) throw new Error("Use a real email and a password of at least 8 characters");
    const { deskPasswordRegister } = await import("@/lib/auth/desk-session.server");
    const token = await deskPasswordRegister(data.name, data.email, data.password);
    return { token };
  });

export const deskSignIn = createServerFn({ method: "POST" })
  .validator((input: { email: string; password: string }) => ({
    email: String(input?.email ?? "").trim().toLowerCase(),
    password: String(input?.password ?? ""),
  }))
  .handler(async ({ data }) => {
    if (!data.email || data.password.length < 8) {
      const { recordFailedSignIn } = await import("@/lib/login-place.server");
      await recordFailedSignIn({ email: data.email || "(blank)", door: "desk", reason: "Email or password was not valid" }).catch(() => undefined);
      throw new Error("That email or password is not valid");
    }
    const { deskPasswordSignIn } = await import("@/lib/auth/desk-session.server");
    try {
      const token = await deskPasswordSignIn(data.email, data.password);
      return { token };
    } catch (err) {
      const { recordFailedSignIn } = await import("@/lib/login-place.server");
      const reason = err instanceof Error ? err.message : "Email or password was not valid";
      await recordFailedSignIn({ email: data.email, door: "desk", reason }).catch(() => undefined);
      throw err;
    }
  });

export const deskSignOut = createServerFn({ method: "POST" })
  .validator((input: { token?: string } | undefined) => ({
    token: String(input?.token ?? ""),
  }))
  .handler(async ({ data }) => {
    const { dropDeskHold } = await import("@/lib/auth/desk-session.server");
    await dropDeskHold(data.token || undefined);
    return { ok: true };
  });

export const getDesk = createServerFn({ method: "GET" })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context }): Promise<DeskState> => {
    const state = await deskFor(context.userId);
    try {
      const { mintDeskHold } = await import("@/lib/auth/desk-session.server");
      state.holdToken = await mintDeskHold(context.userId);
    } catch {
      /* Desk still opens if the separate sign-in cannot be saved. */
    }
    return state;
  });

export const claimDesk = createServerFn({ method: "POST" })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context }): Promise<DeskState> => {
    const sql = await getDb();
    const n = await sql<{ n: number }>`select count(*)::int as n from staff`;
    if ((n[0]?.n ?? 0) > 0) throw new Error("Desk already claimed");
    const who = await person(context.userId);
    await sql`insert into staff (user_id, role, name, email) values (${context.userId}, ${"owner"}, ${who.name}, ${who.email})`;
    await audit(context.userId, "claim", "First operator");
    return deskFor(context.userId);
  });

export const joinDesk = createServerFn({ method: "POST" })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context }): Promise<DeskState> => {
    const who = await person(context.userId);
    const mine = await staffOf(context.userId);
    if (mine) return deskFor(context.userId);
    const crew = await operators();
    if (!crew.length) throw new Error("Claim the desk first");
    const sql = await getDb();
    const twin = crew.find((row) => row.email && who.email && row.email.toLowerCase() === who.email.toLowerCase());
    if (twin) {
      await sql`update staff set user_id = ${context.userId}, name = ${who.name} where lower(email) = ${who.email!.toLowerCase()}`;
      await audit(context.userId, "staff-relink", who.email ?? "");
      return deskFor(context.userId);
    }
    if (!canJoinDesk(who.email, crew)) throw new Error("This account is not on the operator list");
    await sql`insert into staff (user_id, role, name, email) values (${context.userId}, ${"editor"}, ${who.name}, ${who.email})
      on conflict (user_id) do update set name = excluded.name, email = excluded.email`;
    await audit(context.userId, "staff-join", who.email ?? "");
    return deskFor(context.userId);
  });

export const beginMfa = createServerFn({ method: "POST" })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context }) => {
    const mine = await staffOf(context.userId);
    if (!mine) throw new Error("Not desk staff");
    const who = await person(context.userId);
    const totp = await totpLib();
    const secret = totp.totpSecret();
    const sql = await getDb();
    await sql`update staff set totp_secret = ${secret}, totp_on = false, mfa_until = null where user_id = ${context.userId}`;
    const account = who.email || who.name || context.userId;
    const uri = totp.totpUri(secret, account);
    return { secret, uri, qr: totp.totpQr(uri) };
  });

export const confirmMfa = createServerFn({ method: "POST" })
  .validator((code: string) => String(code ?? "").trim())
  .middleware([deskAuthMiddleware])
  .handler(async ({ context, data: code }) => {
    const mine = await staffOf(context.userId);
    if (!mine?.totp_secret) throw new Error("Start MFA first");
    const totp = await totpLib();
    if (!totp.totpOk(mine.totp_secret, code)) throw new Error("That code is not current");
    const until = new Date(Date.now() + MFA_MS).toISOString();
    const sql = await getDb();
    await sql`update staff set totp_on = true, mfa_until = ${until} where user_id = ${context.userId}`;
    await audit(context.userId, "mfa-on");
    const { mintDeskHold } = await import("@/lib/auth/desk-session.server");
    await mintDeskHold(context.userId);
    return { ok: true as const };
  });

export const verifyMfa = createServerFn({ method: "POST" })
  .validator((code: string) => String(code ?? "").trim())
  .middleware([deskAuthMiddleware])
  .handler(async ({ context, data: code }) => {
    const mine = await staffOf(context.userId);
    if (!mine?.totp_on || !mine.totp_secret) throw new Error("Enroll MFA first");
    const totp = await totpLib();
    if (!totp.totpOk(mine.totp_secret, code)) throw new Error("That code is not current");
    const until = new Date(Date.now() + MFA_MS).toISOString();
    const sql = await getDb();
    await sql`update staff set mfa_until = ${until} where user_id = ${context.userId}`;
    await audit(context.userId, "mfa-ok");
    const { mintDeskHold } = await import("@/lib/auth/desk-session.server");
    await mintDeskHold(context.userId);
    return { ok: true as const };
  });

export const deskOverview = createServerFn({ method: "GET" })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context }) => {
    await requireStaff(context.userId);
    const sql = await getDb();
    const clips = await sql<{ n: number }>`select count(*)::int as n from ingest_log`;
    const mods = await sql<{ n: number }>`select count(*)::int as n from content_mod`;
    const crew = await sql<{ n: number }>`select count(*)::int as n from staff`;
    const latest = await sql<{ pulled_at: string }>`select pulled_at from ingest_log order by pulled_at desc limit 1`;
    return {
      halls: CLINIC_DESKS.length,
      hymns: HYMNS.length,
      clips: clips[0]?.n ?? 0,
      mods: mods[0]?.n ?? 0,
      crew: crew[0]?.n ?? 0,
      lastPull: latest[0]?.pulled_at ?? null,
      pulls: PULLS_PER_DAY,
      clock: pullClockLabel(),
    };
  });

export const listIngestLog = createServerFn({ method: "GET" })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context }) => {
    await requireStaff(context.userId);
    const sql = await getDb();
    return sql<{
      id: number;
      slot: number;
      post_id: string;
      youtube_id: string;
      title: string;
      house: string | null;
      desk: string | null;
      pulled_at: string;
    }>`select id, slot, post_id, youtube_id, title, house, desk, pulled_at from ingest_log order by pulled_at desc limit 80`;
  });

export const listMods = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getDb();
  return sql<{ id: number; post_id: string; youtube_id: string | null; status: string }>`
    select id, post_id, youtube_id, status from content_mod order by created_at desc limit 200
  `;
});

const MOD_STATUS = new Set(["pin", "hide", "feature"]);

export const setMod = createServerFn({ method: "POST" })
  .validator((input: { postId: string; youtubeId?: string; status: "pin" | "hide" | "feature"; note?: string }) => ({
    postId: String(input?.postId ?? "").slice(0, 120),
    youtubeId: input?.youtubeId ? String(input.youtubeId).slice(0, 32) : undefined,
    status: input?.status,
    note: String(input?.note ?? "").slice(0, 500),
  }))
  .middleware([deskAuthMiddleware])
  .handler(async ({ context, data }) => {
    await requireStaff(context.userId, ["owner", "editor", "moderator"]);
    if (!data.postId || !MOD_STATUS.has(data.status)) throw new Error("Bad moderation row");
    const sql = await getDb();
    await sql`insert into content_mod (post_id, youtube_id, status, note, actor_id) values (${data.postId}, ${data.youtubeId ?? null}, ${data.status}, ${data.note || null}, ${context.userId})`;
    await audit(context.userId, `mod-${data.status}`, data.postId);
    return { ok: true as const };
  });

async function ensureNotes() {
  const sql = await getDb();
  await sql.query(`create table if not exists member_note (
    id serial primary key,
    post_id text not null,
    author text not null,
    body text not null,
    clip text,
    token text,
    status text not null default 'new' check (status in ('new', 'keep', 'done', 'drop')),
    revise text,
    created_at timestamptz not null default now()
  )`);
  await sql.query(`alter table member_note add column if not exists token text`);
  await sql.query(`create unique index if not exists member_note_token_idx on member_note (token)`);
}

const noteWho = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => next({ context: { bearerToken: context.bearerToken as string | undefined } }));

async function signedAccount(bearerToken?: string) {
  try {
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const who = await getSessionUser(bearerToken);
    if (!who) return null;
    const sql = await getDb();
    const rows = await sql<{ name: string | null; email: string | null }>`
      select name, email from "user" where id = ${who.id} limit 1
    `;
    const row = rows[0];
    const name = row?.name?.trim() || who.name?.trim() || row?.email?.split("@")[0] || who.email?.split("@")[0] || "";
    return { id: who.id, name: name || "Member" };
  } catch {
    return null;
  }
}

async function signedName(bearerToken?: string) {
  const who = await signedAccount(bearerToken);
  return who?.name ?? null;
}

export const fileNote = createServerFn({ method: "POST" })
  .middleware([noteWho])
  .validator((input: { postId: string; author: string; text: string; clip?: string; token?: string }) => ({
    postId: String(input?.postId ?? "").slice(0, 80),
    author: String(input?.author ?? "Member").slice(0, 80),
    text: String(input?.text ?? "").trim().slice(0, 2000),
    clip: String(input?.clip ?? "").slice(0, 220),
    token: String(input?.token ?? "").slice(0, 140),
  }))
  .handler(async ({ data, context }) => {
    if (!data.postId || data.text.length < 1) return { ok: false as const, error: "Empty note" };
    const author = (await signedName(context.bearerToken)) || "Guest";
    const token = `${data.postId}:${author}:${data.text}`.slice(0, 140);
    try {
      const sql = await getDb();
      await ensureNotes();
      const existing = await sql.query<{ id: number }>(`select id from member_note where token = $1 limit 1`, [token]);
      if (!existing.length) {
        await sql.query(
          `insert into member_note (post_id, author, body, clip, token) values ($1, $2, $3, $4, $5)`,
          [data.postId, author, data.text, data.clip || null, token],
        );
        const who = await signedAccount(context.bearerToken);
        if (who) {
          const { actionOfNote, recordActivity } = await import("@/lib/activity.server");
          await recordActivity({
            userId: who.id,
            action: actionOfNote(data.text),
            detail: data.text,
            target: data.postId,
            surface: "clinic",
          });
        }
      }
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "Could not save" };
    }
  });

export const listNotes = createServerFn({ method: "GET" })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context }) => {
    await requireStaff(context.userId);
    await ensureNotes();
    const sql = await getDb();
    return sql<{
      id: number;
      post_id: string;
      author: string;
      body: string;
      clip: string | null;
      token: string | null;
      status: string;
      revise: string | null;
      created_at: string;
    }>`select id, post_id, author, body, clip, token, status, revise, created_at from member_note order by created_at desc limit 120`;
  });

export const reviseNote = createServerFn({ method: "POST" })
  .validator((input: { id: number; status: "new" | "keep" | "done" | "drop"; revise?: string }) => ({
    id: Number(input?.id),
    status: input?.status,
    revise: String(input?.revise ?? "").slice(0, 500),
  }))
  .middleware([deskAuthMiddleware])
  .handler(async ({ context, data }) => {
    await requireStaff(context.userId, ["owner", "editor", "moderator"]);
    if (!["new", "keep", "done", "drop"].includes(data.status) || !Number.isFinite(data.id)) throw new Error("Bad note");
    const sql = await getDb();
    await sql`update member_note set status = ${data.status}, revise = ${data.revise || null} where id = ${data.id}`;
    await audit(context.userId, `note-${data.status}`, String(data.id));
    return { ok: true as const };
  });

export const clearMod = createServerFn({ method: "POST" })
  .validator((id: number) => id)
  .middleware([deskAuthMiddleware])
  .handler(async ({ context, data: id }) => {
    await requireStaff(context.userId, ["owner", "editor"]);
    const sql = await getDb();
    await sql`delete from content_mod where id = ${id}`;
    await audit(context.userId, "mod-clear", String(id));
    return { ok: true as const };
  });

export const listStaff = createServerFn({ method: "GET" })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context }) => {
    await requireStaff(context.userId);
    const sql = await getDb();
    return sql<{ user_id: string; role: StaffRole; name: string | null; email: string | null; totp_on: boolean }>`
      select user_id, role, name, email, totp_on from staff order by created_at
    `;
  });

export const addStaff = createServerFn({ method: "POST" })
  .validator((input: { email: string; role: StaffRole }) => ({
    email: input.email.trim().toLowerCase(),
    role: input.role === "moderator" ? "moderator" : "editor",
  }))
  .middleware([deskAuthMiddleware])
  .handler(async ({ context, data }) => {
    await requireStaff(context.userId, ["owner"]);
    if (!data.email) throw new Error("Email required");
    const sql = await getDb();
    const found = await sql<{ id: string; name: string; email: string }>`
      select id, name, email from "user" where lower(email) = ${data.email} limit 1
    `;
    const u = found[0];
    if (!u) throw new Error("That person must sign in to Noctis first");
    await sql`
      insert into staff (user_id, role, name, email)
      values (${u.id}, ${data.role}, ${u.name}, ${u.email})
      on conflict (user_id) do update set role = excluded.role, name = excluded.name, email = excluded.email
    `;
    await audit(context.userId, "staff-add", `${u.email} ${data.role}`);
    return { ok: true as const };
  });

export const listAudit = createServerFn({ method: "GET" })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context }) => {
    await requireStaff(context.userId);
    const sql = await getDb();
    return sql<{ id: number; actor_id: string; action: string; detail: string | null; created_at: string }>`
      select id, actor_id, action, detail, created_at::text as created_at from admin_audit order by created_at desc limit 40
    `;
  });
