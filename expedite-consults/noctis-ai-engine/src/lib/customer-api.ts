import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { ClinicRow } from "@/lib/customer.server";

function clean(input: ClinicRow): ClinicRow {
  return {
    learn: Number(input?.learn) || 0,
    play: Number(input?.play) || 0,
    local: Number(input?.local) || 0,
    xp: Number(input?.xp) || 0,
    sparks: Number(input?.sparks) || 0,
    echoes: Number(input?.echoes) || 0,
    goal: String(input?.goal ?? "").slice(0, 40),
    stamps: Array.isArray(input?.stamps) ? input.stamps.map((s) => String(s).slice(0, 80)).slice(0, 40) : [],
    drills: Array.isArray(input?.drills) ? input.drills.map((s) => String(s).slice(0, 80)).slice(0, 200) : [],
    strands: Array.isArray(input?.strands)
      ? input.strands.slice(0, 24).map((s) => ({ name: String(s?.name ?? "").slice(0, 40), pct: Number(s?.pct) || 0 }))
      : [],
    crews: Array.isArray(input?.crews) ? input.crews.map((s) => String(s).slice(0, 40)).slice(0, 20) : [],
    wire: [],
    concepts: Array.isArray(input?.concepts)
      ? input.concepts.slice(0, 24).map((row) => ({
          name: String(row?.name ?? "").slice(0, 60),
          house: String(row?.house ?? "").slice(0, 40),
          passed: Number(row?.passed) || 0,
          missed: Number(row?.missed) || 0,
        }))
      : [],
  };
}

export const loadClinicState = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { loadClinic } = await import("@/lib/customer.server");
    return loadClinic(context.userId);
  });

export const saveClinicState = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: ClinicRow) => clean(input))
  .handler(async ({ context, data }) => {
    const { saveClinic } = await import("@/lib/customer.server");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ name: string | null }>`select name from "user" where id = ${context.userId} limit 1`;
    await saveClinic(context.userId, rows[0]?.name?.trim() || "A member", data);
    return { ok: true as const };
  });

export const listRoster = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { listRoster: load } = await import("@/lib/customer.server");
    return load();
  });

export const listKnowledgeGaps = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { rollupGaps } = await import("@/lib/customer.server");
    return rollupGaps();
  });

export const seatKnowledgeGap = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { name?: string; house?: string }) => ({
    name: String(input?.name ?? "").slice(0, 60),
    house: String(input?.house ?? "").slice(0, 40),
  }))
  .handler(async ({ data }) => {
    const { seatGap } = await import("@/lib/customer.server");
    await seatGap(data.name, data.house);
    return { ok: true as const };
  });

export const listCommunityHealth = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { communityHealth } = await import("@/lib/customer.server");
    return communityHealth();
  });

export const passKnowledgeGap = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { name?: string }) => ({ name: String(input?.name ?? "").slice(0, 60) }))
  .handler(async ({ context, data }) => {
    const { passGap } = await import("@/lib/customer.server");
    await passGap(context.userId, data.name);
    const { recordActivity } = await import("@/lib/activity.server");
    await recordActivity({
      userId: context.userId,
      action: "check",
      detail: data.name ? `Passed a check · ${data.name}` : "Passed a check",
      target: data.name,
      surface: "study",
    });
    return { ok: true as const };
  });

export const loadCommunityBrief = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { crewId?: string }) => ({ crewId: String(input?.crewId ?? "").slice(0, 40) }))
  .handler(async ({ data }) => {
    const { communityBrief } = await import("@/lib/customer.server");
    return communityBrief(data.crewId);
  });
