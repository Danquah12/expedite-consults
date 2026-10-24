import { getRequest } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";

const hits = new Map<string, number[]>();

export function callerKey(userId?: string) {
  const request = getRequest();
  const forwarded = request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return userId || forwarded || "local";
}

/** Slow one bucket. Does not ban the account. */
export async function guardRate(bucket: string, limit: number, windowMs: number) {
  const now = Date.now();
  const prev = (hits.get(bucket) || []).filter((at) => now - at < windowMs);
  if (prev.length >= limit) {
    await noteAlert("rate-limit", bucket.split(":")[0] || "call");
    throw new Error("Too many attempts. Wait a minute and try again.");
  }
  prev.push(now);
  hits.set(bucket, prev);
  if (hits.size > 5000) {
    const oldest = hits.keys().next().value;
    if (oldest) hits.delete(oldest);
  }
}

export async function noteAlert(kind: string, detail: string) {
  try {
    const sql = await getSql();
    await sql.query(`create table if not exists security_alert (
      id bigserial primary key,
      kind text not null,
      detail text,
      created_at timestamptz not null default now()
    )`);
    await sql`
      insert into security_alert (kind, detail)
      values (${kind.slice(0, 40)}, ${detail.replace(/\s+/g, " ").trim().slice(0, 160)})
    `;
  } catch {
    /* a missed alert must not break the action */
  }
}

export type PostureRow = { name: string; state: "On" | "Partial" | "Not running"; line: string };

export async function securityPosture(): Promise<{ rows: PostureRow[]; alerts: { kind: string; detail: string; at: string }[] }> {
  const sql = await getSql();
  const staff = await sql<{ n: number; on: number }>`
    select count(*)::int as n, count(*) filter (where totp_on)::int as on from staff
  `.catch(() => [{ n: 0, on: 0 }]);
  const secret = process.env.BETTER_AUTH_SECRET?.trim() || "";
  const alerts = await sql<{ kind: string; detail: string; at: string }>`
    select kind, detail, created_at::text as at from security_alert order by created_at desc limit 12
  `.catch(() => []);
  const mfa = staff[0]?.n ? `${staff[0].on} of ${staff[0].n} operators have an authenticator` : "No operator is enrolled yet";
  return {
    alerts,
    rows: [
      { name: "MFA", state: staff[0]?.on ? "On" : "Partial", line: `${mfa}. Desk tools refuse a session that has not passed the authenticator.` },
      { name: "Encryption", state: "Partial", line: "Session cookies are marked Secure and HttpOnly. Stored notes are not encrypted field by field." },
      { name: "Secure sessions", state: "On", line: "The desk session is HttpOnly and SameSite. A scripted cross-site call is rejected." },
      { name: "Rate limiting", state: "On", line: "Vibe asks and activity writes are slowed after a burst. The account is not banned." },
      { name: "Bot detection", state: "Partial", line: "A burst from one caller is slowed. A missing browser header is not treated as proof of a bot." },
      { name: "API security", state: "On", line: "Member and desk calls that use the auth middleware require a session and a same-site request." },
      { name: "Audit logging", state: "On", line: "Member actions and staff decisions are written. Passwords are not." },
      {
        name: "Secrets",
        state: secret.length >= 32 ? "On" : "Partial",
        line: secret.length >= 32 ? "BETTER_AUTH_SECRET is set. The value is not shown here." : "BETTER_AUTH_SECRET is not set. Sessions are using the built-in fallback until it is.",
      },
      { name: "Vulnerability scanning", state: "Not running", line: "The app does not scan itself while it is serving. Run npm audit in the project." },
      { name: "Dependency monitoring", state: "Not running", line: "There is no live feed of new package advisories. npm audit is the check." },
      { name: "Security alerts", state: "On", line: "A rate limit writes an alert. The alert names the bucket, not the person's question." },
      { name: "Abuse detection", state: "On", line: "A report can be held for a person. The machine does not hide, ban, or close the case." },
    ],
  };
}
