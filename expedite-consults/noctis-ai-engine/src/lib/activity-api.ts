import { createServerFn } from "@tanstack/react-start";
import { authMiddleware, deskAuthMiddleware } from "@/lib/auth/middleware";

const ACTIONS = new Set(["watch", "search", "study", "community", "share", "sign-out", "vibe"]);

async function deskStaff(userId: string) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const staff = await sql<{ totp_on: boolean; mfa_until: string | null }>`
    select totp_on, mfa_until from staff where user_id = ${userId} limit 1
  `;
  const row = staff[0];
  const until = row?.mfa_until ? Date.parse(row.mfa_until) : 0;
  if (!row?.totp_on || !Number.isFinite(until) || until <= Date.now()) throw new Error("MFA required");
}

export const logActivity = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { action?: string; detail?: string; target?: string }) => {
    const action = String(input?.action ?? "").trim().toLowerCase().slice(0, 40);
    if (!ACTIONS.has(action)) throw new Error("That action is not recorded");
    return {
      action,
      detail: String(input?.detail ?? "").replace(/\s+/g, " ").trim().slice(0, 240),
      target: String(input?.target ?? "").trim().slice(0, 120),
    };
  })
  .handler(async ({ context, data }) => {
    const { recordActivity } = await import("@/lib/activity.server");
    const { callerKey, guardRate } = await import("@/lib/security.server");
    await guardRate(`activity:${callerKey(context.userId)}`, 40, 10 * 60 * 1000);
    await recordActivity({
      userId: context.userId,
      action: data.action,
      detail: data.detail,
      target: data.target,
      surface: "clinic",
    });
    return { ok: true as const };
  });

export const listMemberActivity = createServerFn({ method: "GET" })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context }) => {
    await deskStaff(context.userId);
    const { listActivity } = await import("@/lib/activity.server");
    return listActivity();
  });

export const listMemberEvidence = createServerFn({ method: "GET" })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context }) => {
    await deskStaff(context.userId);
    const { listEvidence } = await import("@/lib/activity.server");
    return listEvidence();
  });

export const securityCenter = createServerFn({ method: "GET" })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context }) => {
    await deskStaff(context.userId);
    const { securityPosture } = await import("@/lib/security.server");
    return securityPosture();
  });

export const platformReport = createServerFn({ method: "GET" })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context }) => {
    await deskStaff(context.userId);
    const { platformAnalytics } = await import("@/lib/activity.server");
    return platformAnalytics();
  });

export const recordClipAct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { postId?: string; text?: string; clip?: string }) => {
    const postId = String(input?.postId ?? "").slice(0, 80);
    const text = String(input?.text ?? "").replace(/\s+/g, " ").trim().slice(0, 500);
    if (!postId || !text) throw new Error("Empty note");
    return { postId, text, clip: String(input?.clip ?? "").slice(0, 220) };
  })
  .handler(async ({ context, data }) => {
    const { actionOfNote, recordActivity } = await import("@/lib/activity.server");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const names = await sql<{ name: string | null; email: string | null }>`
      select name, email from "user" where id = ${context.userId} limit 1
    `;
    const author = names[0]?.name?.trim() || names[0]?.email?.split("@")[0] || "Member";
    await recordActivity({
      userId: context.userId,
      action: actionOfNote(data.text),
      detail: data.text,
      target: data.postId,
      surface: "clinic",
    });
    const token = `${data.postId}:${context.userId}:${data.text}`.slice(0, 140);
    await sql.query(`alter table member_note add column if not exists token text`).catch(() => undefined);
    const existing = await sql.query<{ id: number }>(`select id from member_note where token = $1 limit 1`, [token]).catch(() => []);
    if (!existing.length) {
      await sql.query(
        `insert into member_note (post_id, author, body, clip, token) values ($1, $2, $3, $4, $5)`,
        [data.postId, author, data.text, data.clip || null, token],
      ).catch(() => undefined);
    }
    return { ok: true as const };
  });
