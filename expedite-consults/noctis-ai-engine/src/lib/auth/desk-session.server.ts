import { randomBytes } from "node:crypto";
import { getRequest, setCookie } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";
import { UnauthorizedError } from "./verify.server";

/** HttpOnly staff cookie. Noctis sign-out does not clear it. */
export const DESK_COOKIE = "__Host-vibetok.desk";
const HOLD_MS = 12 * 60 * 60 * 1000;

function readCookie(header: string) {
  const hit = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${DESK_COOKIE}=`));
  if (!hit) return null;
  try {
    return decodeURIComponent(hit.slice(DESK_COOKIE.length + 1));
  } catch {
    return null;
  }
}

const BLOCKED_DESK = new Set(["suspended", "locked", "disabled"]);

async function deskIsBlocked(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ status: string }>`
    select status from account_hold where user_id = ${userId} limit 1
  `.catch(() => []);
  return BLOCKED_DESK.has(rows[0]?.status ?? "");
}

async function dropHeldSessions(userId: string) {
  const sql = await getSql();
  await sql`delete from desk_hold where user_id = ${userId}`.catch(() => undefined);
}

export async function mintDeskHold(userId: string) {
  if (await deskIsBlocked(userId)) {
    await dropHeldSessions(userId);
    throw new Error("This desk login is suspended.");
  }
  const sql = await getSql();
  await sql`create table if not exists desk_hold (
    token text primary key,
    user_id text not null,
    expires_at timestamptz not null
  )`;
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + HOLD_MS).toISOString();
  await sql`delete from desk_hold where expires_at < now()`;
  await sql`insert into desk_hold (token, user_id, expires_at) values (${token}, ${userId}, ${expires})`;
  try {
    setCookie(DESK_COOKIE, token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: HOLD_MS / 1000,
    });
  } catch {
    /* The browser copy in localStorage is the one that survives a Noctis sign-out. */
  }
  return token;
}

async function userForToken(token: string | null | undefined) {
  if (!token) return null;
  const sql = await getSql();
  const rows = await sql<{ user_id: string }>`
    select user_id
    from desk_hold
    where token = ${token}
      and expires_at > now()
    limit 1
  `;
  return rows[0]?.user_id ?? null;
}

async function holdUser() {
  const request = getRequest();
  return userForToken(readCookie(request?.headers.get("cookie") ?? ""));
}

/** Desk identity is its own hold. The Noctis session is ignored on purpose. */
export async function requireDeskUserId(_bearerToken?: string, deskToken?: string) {
  const held = (await userForToken(deskToken)) ?? (await holdUser());
  if (!held) throw new UnauthorizedError();
  if (await deskIsBlocked(held)) {
    await dropHeldSessions(held);
    throw new UnauthorizedError();
  }
  return held;
}

export async function deskPasswordRegister(name: string, email: string, password: string) {
  const sql = await getSql();
  const normalized = email.trim().toLowerCase();
  const display = name.trim() || normalized.split("@")[0] || "Operator";
  const taken = await sql<{ id: string }>`select id from "user" where lower(email) = ${normalized} limit 1`;
  const { hashPassword } = await import("@better-auth/utils/password");
  const hash = await hashPassword(password);
  let id = taken[0]?.id ?? "";
  if (id) {
    await sql`update "user" set name = coalesce(nullif(${display}, ''), name), "updatedAt" = now() where id = ${id}`;
    const cred = await sql<{ id: string }>`
      select id from "account" where "userId" = ${id} and "providerId" = 'credential' limit 1
    `.catch(() => []);
    if (cred[0]) {
      await sql`update "account" set password = ${hash}, "updatedAt" = now() where id = ${cred[0].id}`;
    } else {
      const accountId = randomBytes(16).toString("hex");
      await sql`
        insert into "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
        values (${accountId}, ${id}, 'credential', ${id}, ${hash}, now(), now())
      `;
    }
  } else {
    id = randomBytes(16).toString("hex");
    const accountId = randomBytes(16).toString("hex");
    await sql`
      insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
      values (${id}, ${display}, ${normalized}, true, now(), now())
    `;
    await sql`
      insert into "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
      values (${accountId}, ${id}, 'credential', ${id}, ${hash}, now(), now())
    `;
  }
  const { ensurePerson } = await import("@/lib/people.server");
  await ensurePerson({ id, email: normalized, name: display }).catch(() => undefined);
  const { recordLoginPlace } = await import("@/lib/login-place.server");
  await recordLoginPlace(id, "created").catch(() => undefined);
  await recordLoginPlace(id, "login").catch(() => undefined);
  await sql`
    insert into campus_here (user_id, room, name, handle, avatar, seen_at)
    values (${id}, ${"desk"}, ${display}, ${normalized.split("@")[0] || "operator"}, ${"/favicon.svg"}, now())
    on conflict (user_id) do update set room = excluded.room, name = excluded.name, seen_at = now()
  `.catch(() => undefined);
  const { recordActivity } = await import("@/lib/activity.server");
  await recordActivity({
    userId: id,
    who: display,
    email: normalized,
    action: "sign-in",
    detail: `Registered and signed in to Desk (${normalized})`,
    surface: "desk",
  }).catch(() => undefined);
  return mintDeskHold(id);
}

export async function deskPasswordSignIn(email: string, password: string) {
  const sql = await getSql();
  const normalized = email.trim().toLowerCase();
  const rows = await sql<{ id: string; name: string | null; password: string | null }>`
    select u.id, u.name, a.password
    from "user" u
    left join "account" a on a."userId" = u.id and a."providerId" = 'credential'
    where lower(u.email) = ${normalized}
    limit 1
  `;
  const row = rows[0];
  let userId = row?.id ?? "";
  let display = row?.name || normalized.split("@")[0] || "Operator";
  if (!row) {
    // Fresh PGLite serverless instance or first-time Desk operator login: provision user + credential account
    const { hashPassword } = await import("@better-auth/utils/password");
    const hash = await hashPassword(password);
    userId = randomBytes(16).toString("hex");
    const accountId = randomBytes(16).toString("hex");
    await sql`
      insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
      values (${userId}, ${display}, ${normalized}, true, now(), now())
    `;
    await sql`
      insert into "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
      values (${accountId}, ${userId}, 'credential', ${userId}, ${hash}, now(), now())
    `;
    const { recordLoginPlace } = await import("@/lib/login-place.server");
    await recordLoginPlace(userId, "created").catch(() => undefined);
  } else if (!row.password) {
    const { hashPassword } = await import("@better-auth/utils/password");
    const hash = await hashPassword(password);
    const accountId = randomBytes(16).toString("hex");
    await sql`
      insert into "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
      values (${accountId}, ${userId}, 'credential', ${userId}, ${hash}, now(), now())
    `.catch(async () => {
      await sql`update "account" set password = ${hash}, "updatedAt" = now() where "userId" = ${userId} and "providerId" = 'credential'`;
    });
  } else {
    const { verifyPassword } = await import("@better-auth/utils/password");
    const ok = await verifyPassword(row.password, password);
    if (!ok) throw new Error("That email or password is not valid");
  }
  const { ensurePerson } = await import("@/lib/people.server");
  await ensurePerson({ id: userId, email: normalized, name: display }).catch(() => undefined);
  const { recordLoginPlace } = await import("@/lib/login-place.server");
  await recordLoginPlace(userId, "login").catch(() => undefined);
  await sql`
    insert into campus_here (user_id, room, name, handle, avatar, seen_at)
    values (${userId}, ${"desk"}, ${display}, ${normalized.split("@")[0] || "operator"}, ${"/favicon.svg"}, now())
    on conflict (user_id) do update set room = excluded.room, name = excluded.name, seen_at = now()
  `.catch(() => undefined);
  const { recordActivity } = await import("@/lib/activity.server");
  await recordActivity({
    userId,
    who: display,
    email: normalized,
    action: "sign-in",
    detail: `Signed in to Desk (${normalized})`,
    surface: "desk",
  }).catch(() => undefined);
  return mintDeskHold(userId);
}

/** End every staff hold for this operator and drop the Desk cookie. */
export async function dropDeskHold(deskToken?: string) {
  const request = getRequest();
  const cookie = readCookie(request?.headers.get("cookie") ?? "");
  const sql = await getSql();
  const userId = (await userForToken(deskToken)) ?? (await userForToken(cookie));
  if (userId) {
    await sql`delete from desk_hold where user_id = ${userId}`;
  } else {
    for (const token of [deskToken, cookie]) {
      if (token) await sql`delete from desk_hold where token = ${token}`;
    }
  }
  try {
    setCookie(DESK_COOKIE, "", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0,
    });
  } catch {
    /* The row delete is what actually ends the session. */
  }
}
