import { createServerFn } from "@tanstack/react-start";
import { deskAuthMiddleware, authMiddleware } from "@/lib/auth/middleware";
import { SEED_CASES, type ClinicMember } from "@/lib/command-catalog";

async function getDb() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

async function staffOk(userId: string) {
  const sql = await getDb();
  const rows = await sql<{ user_id: string; totp_on: boolean; mfa_until: string | null }>`
    select user_id, totp_on, mfa_until from staff where user_id = ${userId} limit 1
  `;
  const row = rows[0];
  if (!row?.totp_on) throw new Error("Staff MFA required");
  const t = row.mfa_until ? Date.parse(row.mfa_until) : 0;
  if (!Number.isFinite(t) || t < Date.now()) throw new Error("Staff MFA required");
}

async function writeAudit(actorId: string, action: string, detail?: string) {
  const sql = await getDb();
  await sql`insert into admin_audit (actor_id, action, detail) values (${actorId}, ${action}, ${detail ?? null})`;
}

async function seedCases() {
  const sql = await getDb();
  const n = await sql<{ n: number }>`select count(*)::int as n from safety_case`;
  if ((n[0]?.n ?? 0) > 0) return;
  for (const c of SEED_CASES) {
    await sql`insert into safety_case (case_no, category, priority, status, target_kind, target_id, reason, ai_score, reports, assigned)
      values (${c.caseNo}, ${c.category}, ${c.priority}, ${"open"}, ${c.targetKind}, ${c.targetId}, ${c.reason}, ${c.ai}, ${c.reports}, ${c.assigned})`;
  }
}

export const commandOverview = createServerFn({ method: "GET" })
  .validator((range: "1" | "7" | "30" | "90") => range)
  .middleware([deskAuthMiddleware])
  .handler(async ({ context, data: range }) => {
    await staffOk(context.userId);
    await seedCases();
    const { ensurePeople } = await import("@/lib/people.server");
    await ensurePeople().catch(() => undefined);
    const sql = await getDb();
    const one = async (query: Promise<{ n: number }[]>) => {
      try {
        const rows = await query;
        return rows[0]?.n ?? 0;
      } catch {
        return 0;
      }
    };
    const accounts = await one(sql<{ n: number }>`
      select count(*)::int as n from (
        select id from "user"
        union
        select user_id as id from person
      ) all_accounts
    `);
    const signedIn = await one(sql<{ n: number }>`
      select count(*)::int as n from (
        select "userId" as id from "session" where "expiresAt" > now()
        union
        select user_id as id from desk_hold where expires_at > now()
        union
        select user_id as id from person where last_seen > now() - interval '30 minutes'
        union
        select user_id as id from campus_here where seen_at > now() - interval '12 hours'
      ) live
    `);
    const notes = await one(sql<{ n: number }>`select count(*)::int as n from member_note`);
    const clips = await one(sql<{ n: number }>`select count(*)::int as n from ingest_log`);
    const mods = await one(sql<{ n: number }>`select count(*)::int as n from content_mod`);
    const cases = await one(sql<{ n: number }>`select count(*)::int as n from safety_case where status <> 'closed'`);
    const holds = await one(sql<{ n: number }>`select count(*)::int as n from account_hold where status in ('suspended','locked','disabled')`);
    const operators = await one(sql<{ n: number }>`select count(*)::int as n from staff`);
    let trust: { label: string; n: number }[] = [];
    let halls: { label: string; n: number }[] = [];
    try {
      trust = await sql<{ label: string; n: number }>`select category as label, count(*)::int as n from safety_case group by category order by n desc`;
    } catch {
      trust = [];
    }
    try {
      halls = await sql<{ label: string; n: number }>`select coalesce(desk, 'hall') as label, count(*)::int as n from ingest_log group by 1 order by n desc limit 8`;
    } catch {
      halls = [];
    }
    return { accounts, signedIn, notes, clips, mods, cases, holds, operators, trust, halls, range };
  });

export const listMembers = createServerFn({ method: "GET" })
  .validator((q: string | undefined) => String(q ?? "").trim().slice(0, 80).toLowerCase())
  .middleware([deskAuthMiddleware])
  .handler(async ({ context, data: q }): Promise<(ClinicMember & {
    status: string;
    live: boolean;
    last?: string;
    signedIn?: { at: string; where: string; from: string };
    created?: { at: string; where: string; from: string };
  })[]> => {
    await staffOk(context.userId);
    const { ensurePeople } = await import("@/lib/people.server");
    await ensurePeople();
    const sql = await getDb();
    const like = `%${q.replace(/[%_\\]/g, "")}%`;
    // Nested tagged templates don't compose. Keep one statement.
    let registered: {
      id: string;
      name: string;
      email: string | null;
      image: string | null;
      username: string | null;
      profession: string | null;
      campus: string | null;
      created_at: string;
      seen: string | null;
      live: boolean;
    }[] = [];
    try {
      registered = await sql`
        select u.id,
          coalesce(p.display_name, u.name) as name,
          coalesce(p.email, u.email) as email,
          coalesce(p.avatar, u.image) as image,
          p.username,
          p.profession,
          p.campus,
          u."createdAt"::text as created_at,
          coalesce(p.last_seen, u."updatedAt")::text as seen,
          (
            exists(select 1 from "session" s where s."userId" = u.id and s."expiresAt" > now())
            or exists(select 1 from desk_hold dh where dh.user_id = u.id and dh.expires_at > now())
            or coalesce(p.last_seen, u."updatedAt") > now() - interval '30 minutes'
            or exists(
              select 1 from login_place lp
              where lp.user_id = u.id and lp.kind = 'login' and lp.at > now() - interval '30 minutes'
            )
            or exists(
              select 1 from campus_here c
              where c.user_id = u.id and c.seen_at > now() - interval '12 hours'
            )
          ) as live
        from "user" u
        left join person p on p.user_id = u.id
        where ${q} = ''
          or lower(coalesce(p.display_name, u.name, '')) like ${like}
          or lower(coalesce(p.email, u.email, '')) like ${like}
          or lower(coalesce(p.username, '')) like ${like}
          or lower(coalesce(p.profession, '')) like ${like}
          or lower(coalesce(p.campus, '')) like ${like}
        order by live desc, coalesce(p.last_seen, u."updatedAt") desc
        limit 200
      `;
    } catch {
      registered = await sql`
        select u.id,
          coalesce(p.display_name, u.name) as name,
          coalesce(p.email, u.email) as email,
          coalesce(p.avatar, u.image) as image,
          p.username,
          p.profession,
          p.campus,
          u."createdAt"::text as created_at,
          coalesce(p.last_seen, u."updatedAt")::text as seen,
          (
            exists(select 1 from "session" s where s."userId" = u.id and s."expiresAt" > now())
            or coalesce(p.last_seen, u."updatedAt") > now() - interval '30 minutes'
          ) as live
        from "user" u
        left join person p on p.user_id = u.id
        where ${q} = ''
          or lower(coalesce(p.display_name, u.name, '')) like ${like}
          or lower(coalesce(p.email, u.email, '')) like ${like}
          or lower(coalesce(p.username, '')) like ${like}
          or lower(coalesce(p.profession, '')) like ${like}
          or lower(coalesce(p.campus, '')) like ${like}
        order by live desc, coalesce(p.last_seen, u."updatedAt") desc
        limit 200
      `;
    }
    const holds = await sql<{ user_id: string; status: string }>`select user_id, status from account_hold`.catch(() => []);
    const holdMap = new Map(holds.map((h) => [h.user_id, h.status]));
    const ids = registered.map((u) => u.id);
    const spots = ids.length
      ? await sql<{
          user_id: string;
          kind: string;
          at: string;
          ip: string | null;
          city: string;
          region: string;
          country: string;
          latitude: number | null;
          longitude: number | null;
        }>`
          select distinct on (user_id, kind)
            user_id, kind, at::text as at, ip, city, region, country, latitude, longitude
          from login_place
          where user_id = any(${ids})
          order by user_id, kind, at desc
        `.catch(() => [])
      : [];
    const { formatPlace } = await import("@/lib/login-place.server");
    const spotFor = (id: string, kind: string) => spots.find((row) => row.user_id === id && row.kind === kind);
    return registered.map((u) => {
      const login = spotFor(u.id, "login");
      const created = spotFor(u.id, "created");
      const loginPlace = login ? formatPlace(login) : null;
      const createdPlace = created ? formatPlace(created) : null;
      const live = u.live === true || String(u.live) === "t" || String(u.live) === "true" || String(u.live) === "1";
      return {
        id: u.id,
        name: u.name || u.email || "Member",
        username: u.username || (u.email || u.id).split("@")[0],
        title: u.profession || (live ? "Signed in" : "Account"),
        campus: u.campus || u.email || "",
        kind: "registered" as const,
        avatar: u.image || "/favicon.svg",
        live,
        status: holdMap.get(u.id) ?? (live ? "signed in" : "registered"),
        last: login?.at || u.seen || u.created_at,
        signedIn: loginPlace ? { at: login!.at, where: loginPlace.where, from: loginPlace.from } : undefined,
        created: { at: created?.at || u.created_at, where: createdPlace?.where || "Place was not recorded", from: createdPlace?.from || "" },
      };
    });
  });

/** Create a clinic account in the same database Desk lists. */
export const registerClinicMember = createServerFn({ method: "POST" })
  .validator((input: { name?: string; email?: string; password?: string; allowExisting?: boolean }) => {
    const email = String(input?.email ?? "").trim().toLowerCase().slice(0, 180);
    const password = String(input?.password ?? "");
    const name = String(input?.name ?? "").trim().slice(0, 80);
    if (!email.includes("@")) throw new Error("Enter a valid email.");
    if (password.length < 4) throw new Error("Use at least 4 characters.");
    return { email, password, name, allowExisting: Boolean(input?.allowExisting) };
  })
  .handler(async ({ data }) => {
    const sql = await getDb();
    const taken = await sql<{ id: string; email: string }>`
      select id, email from "user" where lower(email) = ${data.email} limit 1
    `;
    if (taken[0]) {
      if (!data.allowExisting) throw new Error("That email is already registered. Sign in instead.");
      const cred = await sql<{ id: string; password: string | null }>`
        select id, password from "account" where "userId" = ${taken[0].id} and "providerId" = 'credential' limit 1
      `.catch(() => []);
      if (!cred[0]?.password) {
        const { hashPassword } = await import("@better-auth/utils/password");
        const hash = await hashPassword(data.password);
        if (cred[0]) {
          await sql`update "account" set password = ${hash}, "updatedAt" = now() where id = ${cred[0].id}`;
        } else {
          const accountId = crypto.randomUUID();
          await sql`
            insert into "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
            values (${accountId}, ${taken[0].id}, 'credential', ${taken[0].id}, ${hash}, now(), now())
          `;
        }
      }
      const { ensurePerson } = await import("@/lib/people.server");
      await ensurePerson({ id: taken[0].id, email: taken[0].email, name: data.name || null });
      const { recordLoginPlace } = await import("@/lib/login-place.server");
      await recordLoginPlace(taken[0].id, "login").catch(() => undefined);
      await sql`
        insert into campus_here (user_id, room, name, handle, avatar, seen_at)
        values (${taken[0].id}, ${"clinic"}, ${data.name || taken[0].email.split("@")[0] || "Member"}, ${taken[0].email.split("@")[0] || "member"}, ${"/favicon.svg"}, now())
        on conflict (user_id) do update set room = excluded.room, seen_at = now()
      `.catch(() => undefined);
      return { email: taken[0].email, name: data.name, created: false };
    }
    const display = data.name || data.email.split("@")[0] || "Member";
    let origin = "https://noctis.social";
    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      origin = new URL(getRequest().url).origin;
    } catch {
      /* The published origin is the fallback when this call has no request. */
    }
    try {
      const { auth } = await import("@/lib/auth/server");
      await auth.api.signUpEmail({
        body: { name: display, email: data.email, password: data.password },
        headers: new Headers({ origin, cookie: "" }),
      });
    } catch {
      /* The row below is what Desk reads when the auth sign-up does not land. */
    }
    const after = await sql<{ id: string }>`select id from "user" where lower(email) = ${data.email} limit 1`;
    if (!after[0]) {
      const { hashPassword } = await import("@better-auth/utils/password");
      const hash = await hashPassword(data.password);
      const id = crypto.randomUUID();
      const accountId = crypto.randomUUID();
      await sql`
        insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
        values (${id}, ${display}, ${data.email}, true, now(), now())
      `;
      await sql`
        insert into "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
        values (${accountId}, ${id}, 'credential', ${id}, ${hash}, now(), now())
      `;
      const { ensurePerson } = await import("@/lib/people.server");
      await ensurePerson({ id, email: data.email, name: display });
    }
    const saved = await sql<{ id: string; email: string; name: string | null }>`
      select id, email, name from "user" where lower(email) = ${data.email} limit 1
    `;
    if (!saved[0]) throw new Error("That email did not save in the member list.");
    if (data.name) {
      await sql`update "user" set name = ${data.name}, "updatedAt" = now() where id = ${saved[0].id}`;
    }
    const { ensurePerson } = await import("@/lib/people.server");
    await ensurePerson({ id: saved[0].id, email: saved[0].email, name: display });
    const { recordLoginPlace } = await import("@/lib/login-place.server");
    await recordLoginPlace(saved[0].id, "created").catch(() => undefined);
    await recordLoginPlace(saved[0].id, "login").catch(() => undefined);
    await sql`
      insert into campus_here (user_id, room, name, handle, avatar, seen_at)
      values (${saved[0].id}, ${"clinic"}, ${display}, ${saved[0].email.split("@")[0] || "member"}, ${"/favicon.svg"}, now())
      on conflict (user_id) do update set room = excluded.room, name = excluded.name, seen_at = now()
    `.catch(() => undefined);
    const { recordActivity } = await import("@/lib/activity.server");
    await recordActivity({
      userId: saved[0].id,
      who: display,
      email: saved[0].email,
      action: "account",
      detail: `Created account (${saved[0].email})`,
      surface: "clinic",
    }).catch(() => undefined);
    return { email: saved[0].email, name: display, created: true };
  });

/** Copy the live session into the member list and return the email that was actually saved. */
export const rememberSignedInAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { name?: string } | undefined) => ({
    name: String(input?.name ?? "").replace(/\s+/g, " ").trim().slice(0, 80),
  }))
  .handler(async ({ data }) => {
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const who = await getSessionUser();
    if (!who?.email) throw new Error("Sign-in did not stick.");
    const name = data.name || who.name || who.email.split("@")[0] || "Member";
    const { ensurePerson } = await import("@/lib/people.server");
    await ensurePerson({ id: who.id, email: who.email, name });
    const { recordLoginPlace } = await import("@/lib/login-place.server");
    await recordLoginPlace(who.id, "login").catch(() => undefined);
    const sql = await getDb();
    await sql`
      insert into campus_here (user_id, room, name, handle, avatar, seen_at)
      values (${who.id}, ${"clinic"}, ${name}, ${who.email.split("@")[0] || "member"}, ${"/favicon.svg"}, now())
      on conflict (user_id) do update set room = excluded.room, name = excluded.name, seen_at = now()
    `.catch(() => undefined);
    const { recordActivity } = await import("@/lib/activity.server");
    await recordActivity({
      userId: who.id,
      who: name,
      email: who.email,
      action: "sign-in",
      detail: `Signed in (${who.email})`,
      surface: "clinic",
    }).catch(() => undefined);
    try {
      const { setCookie } = await import("@tanstack/react-start/server");
      const { MEMBER_COOKIE, signMemberCookie } = await import("@/lib/auth/member-cookie.server");
      const val = signMemberCookie({ id: who.id, email: who.email, name });
      setCookie(MEMBER_COOKIE, val, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
    } catch {
      /* Cookie header optional if response already committed */
    }
    return { email: who.email.trim().toLowerCase(), name };
  });

/** Stamp the open clinic so Desk can list who is signed in right now. */
export const touchPresence = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getDb();
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const sess = await getSessionUser().catch(() => null);
    const rows = await sql<{ id: string; email: string | null; name: string | null }>`
      select id, email, name from "user" where id = ${context.userId} limit 1
    `;
    const who = rows[0] ?? (sess ? { id: sess.id, email: sess.email, name: sess.name } : null);
    if (!who) return { ok: false as const };
    const { ensurePerson } = await import("@/lib/people.server");
    await ensurePerson(who);
    await sql`
      insert into campus_here (user_id, room, name, handle, avatar, seen_at)
      values (${who.id}, ${"clinic"}, ${who.name || who.email || "Member"}, ${(who.email || who.id).split("@")[0]}, ${"/favicon.svg"}, now())
      on conflict (user_id) do update set seen_at = now()
    `.catch(() => undefined);
    return { ok: true as const, email: who.email };
  });

export const listFailedSignIns = createServerFn({ method: "GET" })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context }) => {
    await staffOk(context.userId);
    const sql = await getDb();
    const rows = await sql<{
      id: string;
      email: string;
      door: string;
      reason: string;
      at: string;
      ip: string | null;
      city: string;
      region: string;
      country: string;
      latitude: number | null;
      longitude: number | null;
    }>`
      select id, email, door, reason, at::text as at, ip, city, region, country, latitude, longitude
      from login_fail
      order by at desc
      limit 80
    `.catch(() => []);
    const { formatPlace } = await import("@/lib/login-place.server");
    return rows.map((row) => {
      const place = formatPlace(row);
      return {
        id: row.id,
        email: row.email,
        door: row.door,
        reason: row.reason,
        at: row.at,
        where: place.where,
        from: place.from,
      };
    });
  });

export const setHold = createServerFn({ method: "POST" })
  .validator((input: { userId: string; status: "active" | "verified" | "suspended" | "locked" | "disabled"; reason: string; duration?: string }) => {
    const status = input?.status;
    const allow = new Set(["active", "verified", "suspended", "locked", "disabled"]);
    return {
      userId: String(input?.userId ?? "").slice(0, 80),
      status: allow.has(status) ? status : "suspended",
      reason: String(input?.reason ?? "").slice(0, 500),
      duration: input?.duration ? String(input.duration).slice(0, 40) : undefined,
    };
  })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context, data }) => {
    await staffOk(context.userId);
    if (!data.reason.trim()) throw new Error("Reason required");
    const sql = await getDb();
    await sql`insert into account_hold (user_id, status, reason, duration, actor_id)
      values (${data.userId}, ${data.status}, ${data.reason}, ${data.duration ?? null}, ${context.userId})
      on conflict (user_id) do update set status = excluded.status, reason = excluded.reason, duration = excluded.duration, actor_id = excluded.actor_id, created_at = now()`;
    if (data.status === "suspended" || data.status === "locked" || data.status === "disabled") {
      await sql`delete from desk_hold where user_id = ${data.userId}`.catch(() => undefined);
    }
    await writeAudit(context.userId, `hold-${data.status}`, `${data.userId}: ${data.reason}`);
    return { ok: true as const };
  });

export const listCases = createServerFn({ method: "GET" })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context }) => {
    await staffOk(context.userId);
    await seedCases();
    const sql = await getDb();
    return sql<{
      id: number;
      case_no: string;
      category: string;
      priority: string;
      status: string;
      target_kind: string;
      target_id: string;
      reason: string;
      ai_score: number | null;
      reports: number;
      assigned: string | null;
      created_at: string;
    }>`select id, case_no, category, priority, status, target_kind, target_id, reason, ai_score, reports, assigned, created_at::text as created_at from safety_case order by created_at desc limit 80`;
  });

export const decideCase = createServerFn({ method: "POST" })
  .validator((input: { id: number; status: "review" | "actioned" | "appeal" | "closed"; note: string }) => input)
  .middleware([deskAuthMiddleware])
  .handler(async ({ context, data }) => {
    await staffOk(context.userId);
    if (!data.note.trim()) throw new Error("Decision note required");
    const sql = await getDb();
    await sql`update safety_case set status = ${data.status}, actor_id = ${context.userId}, evidence = ${data.note} where id = ${data.id}`;
    await writeAudit(context.userId, `case-${data.status}`, `${data.id}: ${data.note}`);
    return { ok: true as const };
  });

export const listFlags = createServerFn({ method: "GET" })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context }) => {
    await staffOk(context.userId);
    const sql = await getDb();
    return sql<{ key: string; label: string; state: string; pct: number }>`select key, label, state, pct from feature_flag order by label`;
  });

export const setFlag = createServerFn({ method: "POST" })
  .validator((input: { key: string; state: "on" | "off" | "beta"; pct?: number }) => {
    const state = input?.state;
    const allow = new Set(["on", "off", "beta"]);
    const pct = Number(input?.pct ?? 100);
    return {
      key: String(input?.key ?? "").slice(0, 80),
      state: (allow.has(state) ? state : "off") as "on" | "off" | "beta",
      pct: Number.isFinite(pct) ? Math.max(0, Math.min(100, Math.round(pct))) : 100,
    };
  })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context, data }) => {
    await staffOk(context.userId);
    const sql = await getDb();
    await sql`update feature_flag set state = ${data.state}, pct = ${data.pct ?? 100} where key = ${data.key}`;
    await writeAudit(context.userId, "flag", `${data.key}=${data.state}`);
    return { ok: true as const };
  });

export const listSettings = createServerFn({ method: "GET" })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context }) => {
    await staffOk(context.userId);
    const sql = await getDb();
    return sql<{ key: string; value: string }>`select key, value from platform_setting order by key`;
  });

export const setSetting = createServerFn({ method: "POST" })
  .validator((input: { key: string; value: string }) => ({
    key: String(input?.key ?? "").slice(0, 80).replace(/[^\w.-]/g, ""),
    value: String(input?.value ?? "").slice(0, 500),
  }))
  .middleware([deskAuthMiddleware])
  .handler(async ({ context, data }) => {
    await staffOk(context.userId);
    const sql = await getDb();
    await sql`insert into platform_setting (key, value) values (${data.key}, ${data.value})
      on conflict (key) do update set value = excluded.value`;
    await writeAudit(context.userId, "config", `${data.key}=${data.value}`);
    return { ok: true as const };
  });

