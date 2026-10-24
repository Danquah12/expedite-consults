import { randomBytes } from "node:crypto";
import { getSql } from "@/lib/db";

const HOLD_MS = 30 * 60 * 1000;

export async function startPasswordReset(email: string) {
  const sql = await getSql();
  const rows = await sql<{ id: string }>`
    select u.id
    from "user" u
    join "account" a on a."userId" = u.id
    where lower(u.email) = ${email}
      and a."providerId" = 'credential'
    limit 1
  `;
  if (!rows[0]) throw new Error("No Noctis password is saved for that email");
  const token = randomBytes(32).toString("base64url");
  const id = randomBytes(16).toString("hex");
  const expires = new Date(Date.now() + HOLD_MS).toISOString();
  await sql`delete from "verification" where identifier = ${`reset:${email}`}`;
  await sql`
    insert into "verification" (id, identifier, value, "expiresAt", "createdAt", "updatedAt")
    values (${id}, ${`reset:${email}`}, ${token}, ${expires}, now(), now())
  `;
  return token;
}

export async function finishPasswordReset(token: string, password: string) {
  const sql = await getSql();
  const rows = await sql<{ id: string; identifier: string }>`
    select id, identifier
    from "verification"
    where value = ${token}
      and identifier like 'reset:%'
      and "expiresAt" > now()
    limit 1
  `;
  const hit = rows[0];
  if (!hit) throw new Error("Reset expired. Start again.");
  const email = hit.identifier.slice("reset:".length);
  const users = await sql<{ id: string }>`
    select id from "user" where lower(email) = ${email} limit 1
  `;
  const user = users[0];
  if (!user) throw new Error("Reset expired. Start again.");
  const { hashPassword } = await import("@better-auth/utils/password");
  const hash = await hashPassword(password);
  await sql`
    update "account"
    set password = ${hash}, "updatedAt" = now()
    where "userId" = ${user.id} and "providerId" = 'credential'
  `;
  await sql`delete from "session" where "userId" = ${user.id}`;
  await sql`delete from "verification" where id = ${hit.id}`;
  return email;
}

export async function startDeskPasswordReset(email: string) {
  const sql = await getSql();
  const normalized = email.trim().toLowerCase();
  const rows = await sql<{ id: string }>`
    select id from "user" where lower(email) = ${normalized} limit 1
  `;
  if (!rows[0]) {
    const uid = randomBytes(16).toString("hex");
    const display = normalized.split("@")[0] || "Operator";
    await sql`
      insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
      values (${uid}, ${display}, ${normalized}, true, now(), now())
    `.catch(() => undefined);
    const { ensurePerson } = await import("@/lib/people.server");
    await ensurePerson({ id: uid, email: normalized, name: display }).catch(() => undefined);
  }
  const token = randomBytes(32).toString("base64url");
  const id = randomBytes(16).toString("hex");
  const expires = new Date(Date.now() + HOLD_MS).toISOString();
  await sql`delete from "verification" where identifier = ${`desk-reset:${normalized}`}`;
  await sql`
    insert into "verification" (id, identifier, value, "expiresAt", "createdAt", "updatedAt")
    values (${id}, ${`desk-reset:${normalized}`}, ${token}, ${expires}, now(), now())
  `;
  return token;
}

export async function finishDeskPasswordReset(token: string, password: string) {
  const sql = await getSql();
  const rows = await sql<{ id: string; identifier: string }>`
    select id, identifier
    from "verification"
    where value = ${token}
      and identifier like 'desk-reset:%'
      and "expiresAt" > now()
    limit 1
  `;
  const hit = rows[0];
  if (!hit) throw new Error("Reset expired. Start again.");
  const email = hit.identifier.slice("desk-reset:".length);
  const users = await sql<{ id: string; name: string | null }>`
    select id, name from "user" where lower(email) = ${email} limit 1
  `;
  const user = users[0];
  if (!user) throw new Error("Reset expired. Start again.");
  const { hashPassword } = await import("@better-auth/utils/password");
  const hash = await hashPassword(password);
  const existing = await sql<{ id: string }>`
    select id from "account" where "userId" = ${user.id} and "providerId" = 'credential' limit 1
  `;
  if (existing[0]) {
    await sql`
      update "account"
      set password = ${hash}, "updatedAt" = now()
      where "userId" = ${user.id} and "providerId" = 'credential'
    `;
  } else {
    const accountId = randomBytes(16).toString("hex");
    await sql`
      insert into "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
      values (${accountId}, ${user.id}, 'credential', ${user.id}, ${hash}, now(), now())
    `;
  }
  await sql`delete from "verification" where id = ${hit.id}`;
  const display = user.name || email.split("@")[0] || "Operator";
  const { ensurePerson } = await import("@/lib/people.server");
  await ensurePerson({ id: user.id, email, name: display }).catch(() => undefined);
  const { recordLoginPlace } = await import("@/lib/login-place.server");
  await recordLoginPlace(user.id, "login").catch(() => undefined);
  const { recordActivity } = await import("@/lib/activity.server");
  await recordActivity({
    userId: user.id,
    who: display,
    email,
    action: "sign-in",
    detail: `Reset Desk password and signed in (${email})`,
    surface: "desk",
  }).catch(() => undefined);
  const { mintDeskHold } = await import("./desk-session.server");
  const hold = await mintDeskHold(user.id);
  return { email, token: hold };
}
