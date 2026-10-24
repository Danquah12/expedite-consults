import { createServerFn } from "@tanstack/react-start";
import { deskAuthMiddleware } from "@/lib/auth/middleware";

const METRIC_KEYS = ["focus", "started", "tapped", "stalled", "sound"] as const;
const TOOL_KEYS = ["play_on_focus", "one_player", "preload_next"] as const;

export type PlaybackToolKey = (typeof TOOL_KEYS)[number];

const TOOLS: { key: PlaybackToolKey; label: string; detail: string }[] = [
  { key: "play_on_focus", label: "Play when in view", detail: "The clip in focus starts as you scroll. The one you leave stops." },
  { key: "one_player", label: "One film at a time", detail: "Every other player is paused and muted." },
  { key: "preload_next", label: "Warm the next clip", detail: "The next film preloads so the handoff is quicker." },
];

async function db() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

async function ready() {
  const sql = await db();
  await sql`create table if not exists playback_stat (
    key text primary key,
    n bigint not null default 0,
    ms bigint not null default 0,
    updated_at timestamptz not null default now()
  )`;
  return sql;
}

async function staffOk(userId: string) {
  const sql = await db();
  const rows = await sql<{ totp_on: boolean; mfa_until: string | null }>`
    select totp_on, mfa_until from staff where user_id = ${userId} limit 1
  `;
  const row = rows[0];
  if (!row?.totp_on) throw new Error("Staff MFA required");
  const t = row.mfa_until ? Date.parse(row.mfa_until) : 0;
  if (!Number.isFinite(t) || t < Date.now()) throw new Error("Staff MFA required");
}

export const readPlaybackTools = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  const rows = await sql<{ key: string; value: string }>`
    select key, value from platform_setting
    where key in ('play_on_focus', 'one_player', 'preload_next')
  `;
  const found = new Map(rows.map((row) => [row.key, row.value]));
  return TOOLS.map((tool) => ({ ...tool, value: found.get(tool.key) === "off" ? "off" : "on" }));
});

export const setPlaybackTool = createServerFn({ method: "POST" })
  .validator((input: { key: string; value: "on" | "off" }) => {
    if (!TOOL_KEYS.includes(input.key as PlaybackToolKey)) throw new Error("Unknown tool");
    if (input.value !== "on" && input.value !== "off") throw new Error("Unknown value");
    return { key: input.key as PlaybackToolKey, value: input.value };
  })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context, data }) => {
    await staffOk(context.userId);
    const sql = await db();
    await sql`insert into platform_setting (key, value) values (${data.key}, ${data.value})
      on conflict (key) do update set value = excluded.value`;
    await sql`insert into admin_audit (actor_id, action, detail) values (${context.userId}, ${"playback"}, ${`${data.key}=${data.value}`})`;
    return { ok: true as const };
  });

export const pushPlayback = createServerFn({ method: "POST" })
  .validator((input: { rows?: { key?: string; n?: number; ms?: number }[] }) => {
    const allow = new Set<string>(METRIC_KEYS);
    const rows = (input.rows ?? [])
      .filter((row) => row.key && allow.has(row.key))
      .slice(0, 8)
      .map((row) => ({
        key: row.key as string,
        n: Math.max(0, Math.min(20, Math.floor(row.n ?? 0))),
        ms: Math.max(0, Math.min(120_000, Math.floor(row.ms ?? 0))),
      }))
      .filter((row) => row.n > 0);
    return { rows };
  })
  .handler(async ({ data }) => {
    if (!data.rows.length) return { ok: true as const };
    const sql = await ready();
    for (const row of data.rows) {
      await sql`insert into playback_stat (key, n, ms) values (${row.key}, ${row.n}, ${row.ms})
        on conflict (key) do update set
          n = playback_stat.n + excluded.n,
          ms = playback_stat.ms + excluded.ms,
          updated_at = now()`;
    }
    return { ok: true as const };
  });

export const playbackReport = createServerFn({ method: "GET" })
  .middleware([deskAuthMiddleware])
  .handler(async ({ context }) => {
    await staffOk(context.userId);
    const sql = await ready();
    const rows = await sql<{ key: string; n: number; ms: number }>`select key, n, ms from playback_stat`;
    const bag = new Map(rows.map((row) => [row.key, { n: Number(row.n) || 0, ms: Number(row.ms) || 0 }]));
    const n = (key: string) => bag.get(key)?.n ?? 0;
    const focus = n("focus");
    const started = n("started");
    const startMs = bag.get("started")?.ms ?? 0;
    return {
      focus,
      started,
      tapped: n("tapped"),
      stalled: n("stalled"),
      sound: n("sound"),
      hit: focus ? Math.round((started / focus) * 100) : 0,
      avgMs: started ? Math.round(startMs / started) : 0,
    };
  });
