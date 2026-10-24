import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { listStaff, listAudit } from "@/lib/admin-api";
import { securityCenter } from "@/lib/activity-api";
import { DeskHead, DeskStat } from "@/components/desk/DeskHead";

export const Route = createFileRoute("/desk/security")({ component: DeskSecurity });

function DeskSecurity() {
  const [staff, setStaff] = useState<Awaited<ReturnType<typeof listStaff>>>([]);
  const [audit, setAudit] = useState<Awaited<ReturnType<typeof listAudit>>>([]);
  const [posture, setPosture] = useState<Awaited<ReturnType<typeof securityCenter>> | null>(null);
  useEffect(() => {
    void listStaff().then(setStaff).catch(() => setStaff([]));
    void listAudit().then(setAudit).catch(() => setAudit([]));
    void securityCenter().then(setPosture).catch(() => setPosture(null));
  }, []);
  const mfaOn = staff.filter((s) => s.totp_on).length;
  const securityEvents = audit.filter((a) => /mfa|hold|claim|staff/.test(a.action));
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <DeskHead
        kicker="Security"
        title="Security center"
        note="Staff MFA, sessions, and account-takeover signals. Member DMs are not readable from this desk."
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <DeskStat label="Operators" value={staff.length} />
        <DeskStat label="MFA on" value={mfaOn} />
        <DeskStat label="Security events" value={securityEvents.length} />
        <DeskStat label="Services" value={posture?.rows.filter((row) => row.state === "On").length ?? "—"} />
      </div>
      <section className="rounded-2xl bg-surface p-4 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Staff authenticators</p>
        <ul className="mt-2 space-y-2">
          {staff.map((s) => (
            <li key={s.user_id} className="flex justify-between gap-3 text-sm">
              <span>{s.name ?? s.email}</span>
              <span className="text-xs text-subtle">{s.totp_on ? "TOTP on" : "MFA pending"} · {s.role}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl bg-surface p-4 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Controls</p>
        <ul className="mt-2 space-y-3 text-sm">
          {(posture?.rows ?? []).map((row) => (
            <li key={row.name}>
              <p><span className="font-semibold">{row.name}</span> · {row.state}</p>
              <p className="text-muted">{row.line}</p>
            </li>
          ))}
          {posture ? null : <li className="text-muted">The control list did not load. MFA is still required for this desk.</li>}
        </ul>
      </section>
      <section className="rounded-2xl bg-surface p-4 shadow-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Alerts</p>
        {posture?.alerts.length ? (
          <ul className="mt-2 space-y-1 text-sm">
            {posture.alerts.map((row) => (
              <li key={`${row.kind}-${row.at}`}>{row.kind} · {row.detail}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">No rate-limit alert yet.</p>
        )}
      </section>
    </div>
  );
}
